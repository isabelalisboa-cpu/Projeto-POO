// =====================================================================
// MUNDO: movimento do jogador, colisões, troca de mapas, NPCs,
// interações e encontros na grama alta.
// =====================================================================
import { criarNPCs, Treinador } from '../chuments';
import { CONFIG } from '../config';
import { criarSelvagem, definirAtivos, recuperarEquipe, vivos } from '../jogo/catalogo';
import { estado, jogo } from '../jogo/jogo';
import { aparenciaJogador, desenharPersonagem } from '../jogo/personagens';
import { salvarJogo } from '../jogo/persistencia';
import { obterMapa } from '../mapas/registro';
import type { DefinicaoMapa, Direcao, Interacao, NPC, NPCTreinador } from '../mapas/tipos';
import type { Cena } from '../motor/cena';
import { contemPonto, expandir, intersecta, type Ret } from '../motor/geometria';
import { carregarImagem, imagemPronta, urlRecurso } from '../motor/recursos';
import { ALTURA, LARGURA } from '../motor/tela';
import { falar } from '../ui/dialogos';
import { CORES, painel, retArredondado, texto } from '../ui/ui';
import { iniciarBatalha, type ResultadoBatalha } from './batalha';
import { abrirLoja, abrirMenuPausa, abrirPC } from './menus';

type AlvoInteracao = { npc: NPC } | { objeto: Interacao };

const DURACAO_ESCURECER = 0.22;

export class CenaMundo implements Cena {
  readonly opaca = true;

  private mapa!: DefinicaoMapa;
  private url = '';
  private falhaImagem = false;
  private andando = false;
  private tempoPasso = 0;
  private tempo = 0;
  private tempoFaixa = 0;

  /** 0 = visível, 1 = tela preta. */
  private escuro = 1;
  private transicao: { fase: 'saindo' | 'entrando'; noMeio?: () => void } | null = { fase: 'entrando' };

  /** true enquanto um roteiro (diálogo, loja, batalha) está em andamento. */
  private ocupado = false;
  /** Evita voltar pelo portal em que o jogador acabou de chegar. */
  private ignorarPortais = true;
  private distanciaNaGrama = 0;
  private direcaoNPC = new Map<string, Direcao>();
  private arraste: { x: number; y: number } | null = null;

  constructor() {
    this.carregarMapa();
    const e = estado();
    if (!this.podeFicar(e.x, e.y)) this.posicionar(e.mapa, Object.keys(this.mapa.entradas)[0]);
  }

  // -------------------------------------------------------------------
  // Mapas
  // -------------------------------------------------------------------
  private carregarMapa(): void {
    this.mapa = obterMapa(estado().mapa);
    this.url = urlRecurso('assets/mapas/' + this.mapa.imagem);
    this.falhaImagem = false;
    const url = this.url;
    carregarImagem(url).catch((erro: Error) => {
      console.warn(`[mapas] ${erro.message}`);
      if (url === this.url) this.falhaImagem = true;
    });
    this.ignorarPortais = true;
    this.distanciaNaGrama = 0;
    this.tempoFaixa = 2.4;
    this.direcaoNPC.clear();
  }

  private posicionar(idMapa: string, nomeEntrada: string): void {
    const destino = obterMapa(idMapa);
    const entrada = destino.entradas[nomeEntrada] ?? Object.values(destino.entradas)[0];
    const e = estado();
    e.mapa = idMapa;
    e.x = entrada.x;
    e.y = entrada.y;
    e.direcao = entrada.direcao;
  }

  /** Troca de mapa escurecendo a tela (portas e bordas). */
  irPara(idMapa: string, nomeEntrada: string): void {
    this.andando = false;
    this.transicao = {
      fase: 'saindo',
      noMeio: () => {
        this.posicionar(idMapa, nomeEntrada);
        this.carregarMapa();
        if (CONFIG.autoSalvar) salvarJogo(estado());
      },
    };
  }

  /** Troca de mapa imediata, já com a tela escura (usado após uma derrota). */
  teleportar(idMapa: string, nomeEntrada: string): void {
    this.posicionar(idMapa, nomeEntrada);
    this.carregarMapa();
    this.clarear();
  }

  /** Reaparece a partir da tela preta. */
  clarear(): void {
    this.escuro = 1;
    this.transicao = { fase: 'entrando' };
  }

  private dimensoes(): { w: number; h: number; img?: HTMLImageElement } {
    const img = imagemPronta(this.url);
    return img ? { w: img.naturalWidth, h: img.naturalHeight, img } : { w: 1536, h: 1024 };
  }

  // -------------------------------------------------------------------
  // Colisão
  // -------------------------------------------------------------------
  /** Caixa dos pés: é ela que colide, toca portais e pisa na grama. */
  private caixaPes(x: number, y: number): Ret {
    const t = this.mapa.tamanhoPersonagem;
    const w = t * 0.45, h = t * 0.22;
    return { x: x - w / 2, y: y - h, w, h };
  }

  private caixaNPC(npc: NPC): Ret {
    const t = this.mapa.tamanhoPersonagem;
    const w = t * 0.5, h = t * 0.25;
    return { x: npc.x - w / 2, y: npc.y - h, w, h };
  }

  private podeFicar(x: number, y: number): boolean {
    const pes = this.caixaPes(x, y);
    const { w, h } = this.dimensoes();
    if (pes.x < 0 || pes.y < 0 || pes.x + pes.w > w || pes.y + pes.h > h) return false;

    const areas = this.mapa.areasAndaveis;
    if (areas) {
      const pontos: [number, number][] = [
        [pes.x, pes.y], [pes.x + pes.w, pes.y], [pes.x, pes.y + pes.h], [pes.x + pes.w, pes.y + pes.h],
        [pes.x + pes.w / 2, pes.y + pes.h / 2],
      ];
      for (const [px, py] of pontos) if (!areas.some((a) => contemPonto(a, px, py))) return false;
    }
    if (this.mapa.colisoes.some((c) => intersecta(c, pes))) return false;
    for (const npc of this.mapa.npcs ?? []) {
      if (npc.aparencia && intersecta(this.caixaNPC(npc), pes)) return false;
    }
    return true;
  }

  // -------------------------------------------------------------------
  // Atualização
  // -------------------------------------------------------------------
  atualizar(dt: number): void {
    this.tempo += dt;
    this.tempoFaixa = Math.max(0, this.tempoFaixa - dt);
    this.depurarArraste();

    if (this.transicao) { this.atualizarTransicao(dt); return; }
    if (this.ocupado) return;

    const entrada = jogo.entrada;
    if (entrada.pressionou('menu')) { this.rodar(() => abrirMenuPausa()); return; }

    this.mover(dt);

    if (entrada.pressionou('confirmar')) {
      const alvo = this.alvoInteracao();
      if (alvo) { this.rodar(() => this.interagir(alvo)); return; }
    }
    this.verificarPortais();
  }

  private atualizarTransicao(dt: number): void {
    const tr = this.transicao!;
    if (tr.fase === 'saindo') {
      this.escuro = Math.min(1, this.escuro + dt / DURACAO_ESCURECER);
      if (this.escuro >= 1) {
        tr.noMeio?.();
        this.transicao = { fase: 'entrando' };
      }
    } else {
      // Espera a imagem do novo mapa antes de clarear.
      if (!imagemPronta(this.url) && !this.falhaImagem) return;
      this.escuro = Math.max(0, this.escuro - dt / DURACAO_ESCURECER);
      if (this.escuro <= 0) this.transicao = null;
    }
  }

  /** Executa um roteiro assíncrono travando o controle do jogador até ele terminar. */
  private rodar(roteiro: () => Promise<void>): void {
    this.ocupado = true;
    this.andando = false;
    roteiro()
      .catch((erro) => console.error(erro))
      .finally(() => { this.ocupado = false; });
  }

  private mover(dt: number): void {
    const entrada = jogo.entrada;
    const e = estado();
    let dx = (entrada.segurando('direita') ? 1 : 0) - (entrada.segurando('esquerda') ? 1 : 0);
    let dy = (entrada.segurando('baixo') ? 1 : 0) - (entrada.segurando('cima') ? 1 : 0);
    if (dx === 0 && dy === 0) { this.andando = false; this.tempoPasso = 0; return; }

    e.direcao = dx !== 0 ? (dx > 0 ? 'direita' : 'esquerda') : (dy > 0 ? 'baixo' : 'cima');
    const norma = Math.hypot(dx, dy);
    const passo = CONFIG.velocidadeJogador * this.mapa.tamanhoPersonagem * dt;
    dx = (dx / norma) * passo;
    dy = (dy / norma) * passo;

    const x0 = e.x, y0 = e.y;
    if (dx !== 0 && this.podeFicar(e.x + dx, e.y)) e.x += dx;
    if (dy !== 0 && this.podeFicar(e.x, e.y + dy)) e.y += dy;
    const andou = Math.hypot(e.x - x0, e.y - y0);
    this.andando = andou > 0.01;
    if (this.andando) this.tempoPasso += dt;
    else this.tempoPasso = 0;

    this.verificarGrama(andou);
  }

  private verificarPortais(): void {
    const e = estado();
    const pes = this.caixaPes(e.x, e.y);
    const portal = this.mapa.portais.find((p) => intersecta(p.area, pes));
    if (!portal) { this.ignorarPortais = false; return; }
    if (this.ignorarPortais) return;
    this.irPara(portal.destino, portal.entrada);
  }

  // -------------------------------------------------------------------
  // Grama alta
  // -------------------------------------------------------------------
  private verificarGrama(distancia: number): void {
    const encontros = this.mapa.encontros;
    if (!encontros || distancia <= 0) return;
    const e = estado();
    const pes = this.caixaPes(e.x, e.y);
    const naGrama = encontros.zonas.some((z) => contemPonto(z, pes.x + pes.w / 2, pes.y + pes.h / 2));
    if (!naGrama) { this.distanciaNaGrama = 0; return; }

    this.distanciaNaGrama += distancia;
    const passo = this.mapa.tamanhoPersonagem;
    if (this.distanciaNaGrama < passo) return;
    this.distanciaNaGrama -= passo;
    if (Math.random() < encontros.chancePorPasso && vivos(e.treinador.equipe).length > 0) {
      this.rodar(() => this.batalhaSelvagem(encontros.niveis));
    }
  }

  private async batalhaSelvagem(niveis: [number, number]): Promise<void> {
    const jogador = estado().treinador;
    // Batalha em dupla: dois selvagens quando o jogador tem dois chumments de pé.
    const quantidade = Math.min(2, vivos(jogador.equipe).length);
    const selvagens = Array.from({ length: quantidade }, () => criarSelvagem(niveis));
    const selvagem = new Treinador('Selvagem', selvagens);
    selvagem.isSelvagem = true;
    const resultado = await iniciarBatalha({ jogador, oponente: selvagem, selvagem: true });
    await this.aposBatalha(resultado);
  }

  /** Chamado ao fim de qualquer batalha. */
  async aposBatalha(resultado: ResultadoBatalha): Promise<void> {
    const e = estado();
    if (resultado === 'derrota') {
      recuperarEquipe(e.treinador);
      this.teleportar(CONFIG.mapaRecuperacao, CONFIG.entradaRecuperacao);
      await falar([
        'Você correu até o Centro de Cuidados com seus chumments desmaiados...',
        'A enfermeira cuidou de todos. Sua equipe está recuperada!',
      ]);
    }
    definirAtivos(e.treinador);
    if (CONFIG.autoSalvar) salvarJogo(e);
  }

  // -------------------------------------------------------------------
  // Interações (Enter / Espaço)
  // -------------------------------------------------------------------
  private alvoInteracao(): AlvoInteracao | null {
    const e = estado();
    const t = this.mapa.tamanhoPersonagem;
    const pes = this.caixaPes(e.x, e.y);
    for (const npc of this.mapa.npcs ?? []) {
      const perto = npc.areaInteracao
        ? intersecta(npc.areaInteracao, pes)
        : Math.hypot(npc.x - e.x, npc.y - e.y) < t * 1.05;
      if (perto) return { npc };
    }
    for (const objeto of this.mapa.interacoes ?? []) {
      if (intersecta(expandir(objeto.area, t * 0.3), pes)) return { objeto };
    }
    return null;
  }

  private async interagir(alvo: AlvoInteracao): Promise<void> {
    if ('npc' in alvo) {
      const npc = alvo.npc;
      if (npc.aparencia) this.direcaoNPC.set(npc.id, this.direcaoPara(npc));
      if (npc.tipo === 'loja') await abrirLoja(npc);
      else if (npc.tipo === 'fala') await falar(npc.falas, npc.nome);
      else await this.desafiar(npc);
      return;
    }
    const objeto = alvo.objeto;
    if (objeto.tipo === 'mensagem') await falar(objeto.texto);
    else if (objeto.tipo === 'pc') await abrirPC();
    else {
      const e = estado();
      recuperarEquipe(e.treinador);
      this.escuro = 1;
      await falar('Você descansou um pouco...');
      this.clarear();
      await falar('Seus chumments recuperaram toda a vida e o PP!');
      if (CONFIG.autoSalvar) salvarJogo(e);
    }
  }

  /** Direção em que o NPC deve olhar para encarar o jogador. */
  private direcaoPara(npc: NPC): Direcao {
    const e = estado();
    const dx = e.x - npc.x, dy = e.y - npc.y;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'direita' : 'esquerda') : (dy > 0 ? 'baixo' : 'cima');
  }

  private async desafiar(npc: NPCTreinador): Promise<void> {
    const e = estado();
    if (e.npcsDerrotados.has(npc.idTreinador)) { await falar(npc.falaDerrotado, npc.nome); return; }

    const dados = criarNPCs().find((d) => d.id === npc.idTreinador);
    if (!dados) {
      console.warn(`[npc] "${npc.idTreinador}" não existe em criarNPCs() do chuments.ts.`);
      await falar('...', npc.nome);
      return;
    }
    if (vivos(e.treinador.equipe).length === 0) {
      await falar('Seus chumments precisam descansar antes de batalhar.', dados.nome);
      return;
    }
    await falar(dados.textoVitoria, dados.nome);
    const resultado = await iniciarBatalha({
      jogador: e.treinador,
      oponente: new Treinador(dados.nome, dados.equipe),
      selvagem: false,
      premio: dados.dinheiroPremio,
    });
    if (resultado === 'vitoria') e.npcsDerrotados.add(dados.id);
    await this.aposBatalha(resultado);
    if (resultado === 'vitoria') await falar(npc.falaDerrotado, npc.nome);
  }

  // -------------------------------------------------------------------
  // Desenho
  // -------------------------------------------------------------------
  private transformacao(): { escala: number; ox: number; oy: number } {
    const { w, h } = this.dimensoes();
    const escala = Math.min(LARGURA / w, ALTURA / h);
    return { escala, ox: (LARGURA - w * escala) / 2, oy: (ALTURA - h * escala) / 2 };
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    const e = estado();
    const { w, h, img } = this.dimensoes();
    const { escala, ox, oy } = this.transformacao();
    const t = this.mapa.tamanhoPersonagem;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(escala, escala);

    if (img) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0);
    } else if (this.falhaImagem) {
      ctx.fillStyle = '#39445f';
      ctx.fillRect(0, 0, w, h);
      texto(ctx, `Imagem não encontrada: public/assets/mapas/${this.mapa.imagem}`, w / 2, h / 2 - 20, { tamanho: 34, cor: '#fff', alinhar: 'center' });
    }

    // Personagens em ordem de profundidade (quem está mais abaixo fica na frente).
    const passo = this.andando ? [1, 0, 2, 0][Math.floor(this.tempoPasso * 9) % 4] : 0;
    const figuras: { y: number; desenhar: () => void }[] = [
      { y: e.y, desenhar: () => desenharPersonagem(ctx, e.x, e.y, t, e.direcao, passo, aparenciaJogador(e.treinador.sexo)) },
    ];
    for (const npc of this.mapa.npcs ?? []) {
      const ap = npc.aparencia;
      if (!ap) continue;
      figuras.push({ y: npc.y, desenhar: () => desenharPersonagem(ctx, npc.x, npc.y, t, this.direcaoNPC.get(npc.id) ?? npc.direcao ?? 'baixo', 0, ap) });
    }
    figuras.sort((a, b) => a.y - b.y).forEach((f) => f.desenhar());

    if (jogo.depurar) this.desenharDepuracao(ctx);
    ctx.restore();

    // Aviso de interação sobre a cabeça do jogador
    const alvo = !this.ocupado && !this.transicao ? this.alvoInteracao() : null;
    if (alvo) {
      // Sobre o NPC, quando ele é desenhado pelo jogo; senão, sobre o jogador.
      const ancora = 'npc' in alvo && alvo.npc.aparencia ? alvo.npc : e;
      const bx = ox + ancora.x * escala;
      const by = oy + (ancora.y - t) * escala - 30 + Math.sin(this.tempo * 6) * 2;
      ctx.fillStyle = CORES.borda;
      retArredondado(ctx, bx - 31, by - 2, 62, 26, 8); ctx.fill();
      ctx.fillStyle = CORES.selecao;
      retArredondado(ctx, bx - 29, by, 58, 22, 6); ctx.fill();
      texto(ctx, 'Enter', bx, by + 4, { tamanho: 14, alinhar: 'center' });
    }

    // Nome do mapa ao entrar
    if (this.tempoFaixa > 0 && !this.ocupado) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.tempoFaixa / 0.5);
      ctx.font = '700 20px "Trebuchet MS", Verdana, sans-serif';
      const largura = ctx.measureText(this.mapa.nome).width + 44;
      painel(ctx, 16, 14, largura, 46);
      texto(ctx, this.mapa.nome, 38, 27, { tamanho: 20 });
      ctx.restore();
    }

    if (jogo.depurar) this.desenharInfoDepuracao(ctx);

    if (this.escuro > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.escuro})`;
      ctx.fillRect(0, 0, LARGURA, ALTURA);
    }
  }

  // -------------------------------------------------------------------
  // Depuração (F2): ajuda a montar mapas novos
  // -------------------------------------------------------------------
  private mouseNoMapa(): { x: number; y: number } {
    const { escala, ox, oy } = this.transformacao();
    const m = jogo.tela.mouse;
    return { x: Math.round((m.x - ox) / escala), y: Math.round((m.y - oy) / escala) };
  }

  private retArraste(): Ret | null {
    if (!this.arraste) return null;
    const m = this.mouseNoMapa();
    return {
      x: Math.min(this.arraste.x, m.x), y: Math.min(this.arraste.y, m.y),
      w: Math.abs(m.x - this.arraste.x), h: Math.abs(m.y - this.arraste.y),
    };
  }

  /** Com F2 ligado: arraste o mouse sobre o mapa e o retângulo sai no console, pronto para colar. */
  private depurarArraste(): void {
    if (!jogo.depurar) { this.arraste = null; return; }
    const pressionado = jogo.tela.mouse.pressionado;
    if (pressionado && !this.arraste) this.arraste = this.mouseNoMapa();
    if (!pressionado && this.arraste) {
      const r = this.retArraste()!;
      if (r.w > 3 && r.h > 3) console.log(`{ x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} },`);
      else console.log(`{ x: ${r.x}, y: ${r.y} }`);
      this.arraste = null;
    }
  }

  private desenharDepuracao(ctx: CanvasRenderingContext2D): void {
    const e = estado();
    const ret = (r: Ret, preenchimento: string, traco: string) => {
      ctx.fillStyle = preenchimento; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = traco; ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h);
    };
    for (const a of this.mapa.areasAndaveis ?? []) ret(a, 'rgba(60,220,120,0.10)', 'rgba(60,220,120,0.9)');
    for (const z of this.mapa.encontros?.zonas ?? []) ret(z, 'rgba(250,220,40,0.25)', 'rgba(250,220,40,0.9)');
    for (const c of this.mapa.colisoes) ret(c, 'rgba(230,50,50,0.35)', 'rgba(230,50,50,0.95)');
    for (const i of this.mapa.interacoes ?? []) ret(i.area, 'rgba(190,80,230,0.30)', 'rgba(190,80,230,0.95)');
    for (const n of this.mapa.npcs ?? []) {
      if (n.areaInteracao) ret(n.areaInteracao, 'rgba(255,140,30,0.30)', 'rgba(255,140,30,0.95)');
      if (n.aparencia) ret(this.caixaNPC(n), 'rgba(255,140,30,0.45)', 'rgba(255,140,30,1)');
    }
    for (const p of this.mapa.portais) ret(p.area, 'rgba(40,120,255,0.45)', 'rgba(40,120,255,1)');
    for (const [nome, en] of Object.entries(this.mapa.entradas)) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(en.x - 12, en.y); ctx.lineTo(en.x + 12, en.y); ctx.moveTo(en.x, en.y - 12); ctx.lineTo(en.x, en.y + 12); ctx.stroke();
      texto(ctx, nome, en.x + 14, en.y - 26, { tamanho: 20, cor: '#fff' });
    }
    ret(this.caixaPes(e.x, e.y), 'rgba(255,255,255,0.5)', '#fff');
    const arraste = this.retArraste();
    if (arraste) ret(arraste, 'rgba(255,255,255,0.25)', '#fff');
  }

  private desenharInfoDepuracao(ctx: CanvasRenderingContext2D): void {
    const e = estado();
    const m = this.mouseNoMapa();
    const linhas = [
      `DEPURAÇÃO (F2) — mapa "${this.mapa.id}"`,
      `mouse: x ${m.x}, y ${m.y}   jogador: x ${Math.round(e.x)}, y ${Math.round(e.y)}`,
      'vermelho colisão · azul portal · amarelo grama · roxo interação · verde área andável',
      'arraste o mouse para medir um retângulo (sai no console)',
    ];
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, ALTURA - 84, LARGURA, 84);
    linhas.forEach((l, i) => texto(ctx, l, 12, ALTURA - 78 + i * 19, { tamanho: 14, cor: '#fff', negrito: i === 0 }));
  }
}
