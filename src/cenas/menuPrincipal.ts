// Menu principal e criação de um jogo novo. Tudo desenhado por código (sem imagens).
import { Elemento, Treinador } from '../chuments';
import { CONFIG } from '../config';
import { CORES_ELEMENTO, criarEspecie, emSilencio, infoItem } from '../jogo/catalogo';
import { jogo } from '../jogo/jogo';
import { aparenciaJogador, desenharPersonagem } from '../jogo/personagens';
import { carregarJogo, lerSave } from '../jogo/persistencia';
import { obterMapa } from '../mapas/registro';
import type { Cena } from '../motor/cena';
import { ALTURA, LARGURA } from '../motor/tela';
import { confirmar, escolher, falar } from '../ui/dialogos';
import { desenharFicha } from '../ui/ficha';
import { CORES, painel, retArredondado, texto } from '../ui/ui';
import { CenaMundo } from './mundo';

const CONTROLES = [
  'Setas ou W A S D: andar e navegar nos menus.',
  'Enter ou Espaço: confirmar, conversar e interagir. Esc (ou X): voltar. Esc no mapa abre o menu, onde você salva o jogo.',
  'F2 mostra as áreas de colisão e as coordenadas do mapa (para quem está criando mapas).',
];

/** Abre o menu principal, descartando a partida em memória. */
export function abrirMenuPrincipal(): void {
  jogo.estado = null;
  const cena = new CenaMenuPrincipal();
  jogo.cenas.substituirTudo(cena);
  cena.iniciar();
}

class CenaMenuPrincipal implements Cena {
  readonly opaca = true;
  private tempo = 0;
  private mostrarTitulo = true;
  private bolhas = Object.values(Elemento).map((elemento, i) => ({
    cor: CORES_ELEMENTO[elemento],
    x: 60 + ((i * 197) % (LARGURA - 120)),
    y: 40 + ((i * 131) % (ALTURA - 80)),
    raio: 26 + ((i * 17) % 40),
    fase: i * 1.7,
  }));

  iniciar(): void {
    this.rodar().catch((erro) => console.error(erro));
  }

  private async rodar(): Promise<void> {
    while (true) {
      this.mostrarTitulo = true;
      const save = lerSave();
      const opcao = await escolher<'continuar' | 'novo' | 'controles'>({
        x: 320, y: 372, largura: 320, cancelavel: false,
        opcoes: [
          ...(save ? [{ rotulo: 'Continuar', valor: 'continuar' as const, detalhe: `${save.nome} · ${save.equipe.length} chumment${save.equipe.length === 1 ? '' : 's'}` }] : []),
          { rotulo: 'Novo jogo', valor: 'novo' as const },
          { rotulo: 'Controles', valor: 'controles' as const },
        ],
      });

      if (opcao === 'controles') { await falar(CONTROLES); continue; }

      if (opcao === 'continuar') {
        const estado = carregarJogo();
        if (!estado) { await falar('Não foi possível carregar o jogo salvo.'); continue; }
        jogo.estado = estado;
        jogo.cenas.substituirTudo(new CenaMundo());
        return;
      }

      if (save && !(await confirmar('Já existe um jogo salvo. Começar outro por cima dele?', false))) continue;
      if (await this.novoJogo()) return;
    }
  }

  private async novoJogo(): Promise<boolean> {
    this.mostrarTitulo = false;

    const nome = await new Promise<string | null>((fim) => jogo.cenas.empilhar(new CenaNome(fim)));
    if (!nome) return false;

    const sexo = await escolher<string>({
      titulo: `${nome}, como é o seu personagem?`, x: 250, y: 200, largura: 300,
      opcoes: [{ rotulo: 'Menino', valor: 'Masculino' }, { rotulo: 'Menina', valor: 'Feminino' }],
      painelExtra: (ctx, valor) => {
        painel(ctx, 570, 200, 140, 170);
        desenharPersonagem(ctx, 640, 345, 110, 'baixo', 0, aparenciaJogador(valor ?? 'Masculino'));
      },
    });
    if (!sexo) return false;

    const amostras = new Map(CONFIG.iniciais.map((n) => [n, emSilencio(() => criarEspecie(n))]));
    const inicial = await escolher<string>({
      titulo: 'Escolha o seu primeiro chumment', x: 24, y: 60, largura: 420,
      opcoes: CONFIG.iniciais.map((n) => ({ rotulo: n, valor: n, detalhe: amostras.get(n)!.getElementoInerente() })),
      painelExtra: (ctx, n) => { if (n) desenharFicha(ctx, amostras.get(n)!, 462, 60, 474, 400); },
    });
    if (!inicial) return false;

    const treinador = new Treinador(nome, [amostras.get(inicial)!]);
    treinador.sexo = sexo;
    treinador.dinheiro = CONFIG.dinheiroInicial;
    for (const [item, quantidade] of Object.entries(CONFIG.itensIniciais)) {
      const info = infoItem(item);
      if (!info) { console.warn(`[config] item inicial desconhecido: ${item}`); continue; }
      for (let i = 0; i < quantidade; i++) treinador.adicionarItem(info.item);
    }

    const entrada = obterMapa(CONFIG.mapaInicial).entradas[CONFIG.entradaInicial];
    jogo.estado = {
      treinador, mapa: CONFIG.mapaInicial,
      x: entrada.x, y: entrada.y, direcao: entrada.direcao,
      npcsDerrotados: new Set(),
    };
    jogo.cenas.substituirTudo(new CenaMundo());
    await falar([
      `Bom dia, ${nome}! ${inicial} já está pronto para a primeira aventura.`,
      'Ande com as setas ou W A S D. Enter ou Espaço conversa e interage. Esc abre o menu (equipe, mochila e salvar).',
      'A cama recupera a sua equipe e o computador guarda chumments. Ao norte da vila, na grama alta da Rota 1, vivem chumments selvagens!',
    ]);
    return true;
  }

  atualizar(): void { /* o menu de opções é uma sobreposição; aqui só há o fundo */ }

  desenhar(ctx: CanvasRenderingContext2D): void {
    this.tempo += 1 / 60; // o fundo continua animado enquanto um menu está por cima
    const fundo = ctx.createLinearGradient(0, 0, 0, ALTURA);
    fundo.addColorStop(0, '#1b2447');
    fundo.addColorStop(1, '#2f4a7a');
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    for (const b of this.bolhas) {
      const y = b.y + Math.sin(this.tempo * 0.6 + b.fase) * 16;
      const x = b.x + Math.cos(this.tempo * 0.4 + b.fase) * 10;
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = b.cor;
      ctx.beginPath(); ctx.arc(x, y, b.raio, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(x, y, b.raio * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!this.mostrarTitulo) return;
    const y = 150 + Math.sin(this.tempo * 1.5) * 5;
    texto(ctx, CONFIG.titulo, LARGURA / 2 + 5, y + 6, { tamanho: 104, cor: '#0f1630', alinhar: 'center' });
    texto(ctx, CONFIG.titulo, LARGURA / 2, y, { tamanho: 104, cor: CORES.selecao, alinhar: 'center' });
    texto(ctx, CONFIG.subtitulo, LARGURA / 2, 278, { tamanho: 24, cor: CORES.textoClaro, alinhar: 'center' });
    texto(ctx, 'Setas / WASD: mover   ·   Enter / Espaço: confirmar   ·   Esc: voltar', LARGURA / 2, ALTURA - 40, {
      tamanho: 15, cor: 'rgba(244,241,230,0.7)', alinhar: 'center', negrito: false,
    });
  }
}

/** Campo de texto para o nome do jogador. */
class CenaNome implements Cena {
  readonly opaca = false;
  private nome = '';
  private tempo = 0;

  constructor(private fim: (nome: string | null) => void) {
    jogo.entrada.modoTexto = true;
  }

  private fechar(valor: string | null): void {
    jogo.entrada.modoTexto = false;
    jogo.cenas.remover(this);
    this.fim(valor);
  }

  atualizar(dt: number): void {
    this.tempo += dt;
    const e = jogo.entrada;
    for (const c of e.textoDigitado()) {
      if (c === '\b') this.nome = this.nome.slice(0, -1);
      else if (this.nome.length < 12 && (c !== ' ' || this.nome.length > 0)) this.nome += c;
    }
    if (e.pressionou('confirmar') && this.nome.trim()) this.fechar(this.nome.trim());
    else if (e.pressionou('cancelar')) this.fechar(null);
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    const w = 520, h = 190, x = (LARGURA - w) / 2, y = 200;
    painel(ctx, x, y, w, h);
    texto(ctx, 'Qual é o seu nome?', x + 30, y + 26, { tamanho: 24 });
    ctx.fillStyle = CORES.borda;
    retArredondado(ctx, x + 30, y + 72, w - 60, 52, 8); ctx.fill();
    ctx.fillStyle = '#fff';
    retArredondado(ctx, x + 33, y + 75, w - 66, 46, 6); ctx.fill();
    const cursor = Math.floor(this.tempo * 2) % 2 === 0 ? '|' : '';
    texto(ctx, this.nome + cursor, x + 46, y + 85, { tamanho: 26 });
    texto(ctx, 'Digite e pressione Enter   ·   Esc volta', x + 30, y + 144, { tamanho: 15, cor: CORES.fraco, negrito: false });
  }
}
