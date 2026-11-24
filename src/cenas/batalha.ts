// =====================================================================
// BATALHA EM DUPLA (2 x 2)
// Toda a regra vem do chuments.ts (Batalha, Acao*, Treinador, itens...).
// Esta cena só conduz o turno: coleta os comandos, ordena as ações,
// chama a Batalha e mostra o resultado.
// =====================================================================
import {
  type Acao, AcaoAtacar, AcaoCapturar, AcaoItem, AcaoTrocar, type Ataque, type Batalha, Estado,
  type ItemCaptura, Monstrinho, StatusBatalha, type Treinador,
} from '../chuments';
import { CONFIG } from '../config';
import {
  contarMochila, CORES_ELEMENTO, CORES_ESTADO, criarEsforco, efetividade,
  type InfoItem, vivos, xpParaProximoNivel,
} from '../jogo/catalogo';
import { jogo } from '../jogo/jogo';
import { desenharChumment } from '../jogo/spritesChumments';
import type { Cena } from '../motor/cena';
import { ALTURA, LARGURA } from '../motor/tela';
import { escolher } from '../ui/dialogos';
import { barra, CORES, corVida, etiqueta, painel, quebrar, texto } from '../ui/ui';
import { escolherAlvoDeItem, escolherChumment } from './menus';

export type ResultadoBatalha = 'vitoria' | 'derrota' | 'fuga';

export interface OpcoesBatalha {
  /**
   * Batalha do chuments.ts já criada: treinador1 = jogador, treinador2 = oponente.
   * É ela que decide o formato: 1 contra 1 no mato (oponente selvagem), 2 contra 2 contra treinadores.
   */
  batalha: Batalha;
  /** Dinheiro ganho ao vencer um treinador. */
  premio?: number;
}

/** Faz a animação de abertura, roda a batalha inteira e devolve o resultado. */
export async function iniciarBatalha(opcoes: OpcoesBatalha): Promise<ResultadoBatalha> {
  await new Promise<void>((fim) => jogo.cenas.empilhar(new CenaAbertura(fim)));
  return new Promise((fim) => {
    const cena = new CenaBatalha(opcoes, fim);
    jogo.cenas.empilhar(cena);
    cena.iniciar();
  });
}

// ---------------------------------------------------------------------
// Abertura: piscadas e faixas fechando a tela
// ---------------------------------------------------------------------
class CenaAbertura implements Cena {
  readonly opaca = false;
  private t = 0;
  constructor(private fim: () => void) {}

  atualizar(dt: number): void {
    this.t += dt;
    if (this.t >= 0.95) { jogo.cenas.remover(this); this.fim(); }
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    if (this.t < 0.4) {
      ctx.fillStyle = `rgba(255,255,255,${0.7 * Math.abs(Math.sin(this.t * Math.PI * 5))})`;
      ctx.fillRect(0, 0, LARGURA, ALTURA);
      return;
    }
    const f = Math.min(1, (this.t - 0.4) / 0.45);
    const faixas = 8, altura = ALTURA / faixas;
    ctx.fillStyle = '#000';
    for (let i = 0; i < faixas; i++) {
      const w = LARGURA * f;
      ctx.fillRect(i % 2 === 0 ? 0 : LARGURA - w, i * altura, w, altura + 1);
    }
  }
}

// ---------------------------------------------------------------------
// Posições na tela
// ---------------------------------------------------------------------
const CAIXA = { x: 16, y: 486, w: 928, h: 140 };
const CAMPO_JOGADOR = [{ x: 185, y: 458 }, { x: 375, y: 428 }];
const CAMPO_OPONENTE = [{ x: 640, y: 252 }, { x: 812, y: 286 }];
const TAMANHO_JOGADOR = 160;
const TAMANHO_OPONENTE = 130;
const PAINEL_OPONENTE = [{ x: 18, y: 14 }, { x: 18, y: 94 }];
const PAINEL_JOGADOR = [{ x: 640, y: 308 }, { x: 640, y: 390 }];
const PAINEL = { w: 304, h: 78 };

type Efeito = { tipo: 'avanco' | 'tremor'; t: number };

class CenaBatalha implements Cena {
  readonly opaca = true;

  private readonly batalha: Batalha;
  private readonly jogador: Treinador;
  private readonly oponente: Treinador;
  /** true = chumments selvagens (pode capturar e fugir). */
  private readonly selvagem: boolean;
  /** Chumments em campo por lado. */
  private readonly porLado: number;
  /** Última formação em campo (ver emCampo). */
  private campo = { jogador: [] as Monstrinho[], oponente: [] as Monstrinho[] };

  private vidaExibida = new Map<Monstrinho, number>();
  private efeitos = new Map<Monstrinho, Efeito>();
  /** Desmaios já anunciados (o chumment some do campo). */
  private anunciados = new Set<Monstrinho>();
  /** Trocas feitas neste turno: quem saiu -> quem entrou (para redirecionar golpes). */
  private substitutos = new Map<Monstrinho, Monstrinho>();
  private capturadosNoTurno = new Set<Monstrinho>();
  private dinheiroSelvagem = 0;

  private texto = '';
  private letras = 0;
  private continuar: (() => void) | null = null;
  private destaque: Monstrinho | null = null;
  private tempo = 0;
  private ultimoDesenho = performance.now();

  constructor(private readonly o: OpcoesBatalha, private readonly resolver: (r: ResultadoBatalha) => void) {
    this.batalha = o.batalha;
    this.jogador = o.batalha.treinador1;
    this.oponente = o.batalha.treinador2;
    this.selvagem = this.oponente.isSelvagem;
    this.porLado = this.selvagem ? 1 : 2; // mesma regra do construtor de Batalha
    this.fotografar();
    // Quem já entrou desmaiado não deve ser anunciado de novo.
    for (const m of [...this.jogador.equipe, ...this.oponente.equipe]) if (m.getVida() <= 0) this.anunciados.add(m);
  }

  iniciar(): void {
    this.roteiro().catch((erro) => {
      console.error(erro);
      this.abandonar();
      this.encerrar('fuga');
    });
  }

  /** Sai de uma batalha que não chegou ao fim (fuga): limpa estados e devolve o limite de 2 ativos. */
  private abandonar(): void {
    this.jogador.equipe.forEach((m) => m.resetarAposBatalha());
    this.jogador.definirLimiteAtivos(2);
  }

  private fotografar(): void {
    this.campo = { jogador: [...this.jogador.ativos], oponente: [...this.oponente.ativos] };
  }

  /**
   * Quem está em campo. Quando a batalha termina, a Batalha devolve o limite de ativos para 2
   * e refaz "ativos"; para a tela e a experiência valerem só para quem lutou, a cena guarda
   * a última formação antes do fim.
   */
  private emCampo(lado: Treinador): Monstrinho[] {
    if (!this.acabou()) this.fotografar();
    const lista = lado === this.jogador ? this.campo.jogador : this.campo.oponente;
    return lista.filter((m) => lado.equipe.includes(m));
  }

  private encerrar(resultado: ResultadoBatalha): void {
    jogo.cenas.remover(this);
    this.resolver(resultado);
  }

  private acabou(): boolean {
    return this.batalha.getEstado() === StatusBatalha.FINALIZADA;
  }

  // -------------------------------------------------------------------
  // Roteiro geral
  // -------------------------------------------------------------------
  private async roteiro(): Promise<void> {
    const { jogador, oponente } = this;
    const nomes = (lista: Monstrinho[]) => lista.map((m) => m.nome).join(' e ');

    if (this.selvagem) {
      await this.msg(`${nomes(oponente.ativos)} ${oponente.ativos.length > 1 ? 'selvagens apareceram' : 'selvagem apareceu'}!`);
    } else {
      await this.msg(`${oponente.nome} quer batalhar e enviou ${nomes(oponente.ativos)}!`);
    }
    await this.msg(`Vai, ${nomes(jogador.ativos)}!`);

    while (!this.acabou()) {
      const comandos = await this.comandosDoJogador();
      if (comandos === 'fuga') {
        await this.msg('Você fugiu em segurança!');
        this.abandonar();
        this.encerrar('fuga');
        return;
      }
      await this.resolverTurno([...comandos, ...this.comandosDoOponente()]);
      if (this.acabou()) break;
      await this.reporDesmaiados();
    }
    await this.conclusao();
  }

  // -------------------------------------------------------------------
  // Comandos do jogador
  // -------------------------------------------------------------------
  private async comandosDoJogador(): Promise<Acao[] | 'fuga'> {
    const ativos = vivos(this.jogador.ativos);
    const acoes: Acao[] = [];
    while (acoes.length < ativos.length) {
      const resposta = await this.comandoDe(ativos[acoes.length], acoes);
      if (resposta === 'fuga') return 'fuga';
      if (resposta === 'voltar') acoes.pop();
      else acoes.push(resposta);
    }
    this.destaque = null;
    return acoes;
  }

  private async comandoDe(m: Monstrinho, anteriores: Acao[]): Promise<Acao | 'voltar' | 'fuga'> {
    let indice = 0;
    while (true) {
      this.destaque = m;
      this.fixar(`O que ${m.nome} deve fazer?`);
      const preso = m.temEstado(Estado.LAMA);
      const opcao = await escolher<'atacar' | 'mochila' | 'trocar' | 'fugir'>({
        x: 668, base: CAIXA.y + CAIXA.h, largura: 276, indiceInicial: indice,
        opcoes: [
          { rotulo: 'Atacar', valor: 'atacar' },
          { rotulo: 'Mochila', valor: 'mochila', detalhe: `${this.jogador.mochila.length}` },
          { rotulo: 'Trocar', valor: 'trocar', detalhe: preso ? 'Preso na lama' : undefined, desabilitada: preso },
          { rotulo: 'Fugir', valor: 'fugir', detalhe: this.selvagem ? undefined : 'Não dá!', desabilitada: !this.selvagem },
        ],
      });
      if (opcao === null) return 'voltar';
      if (opcao === 'fugir') return 'fuga';

      let acao: Acao | null = null;
      if (opcao === 'atacar') { indice = 0; acao = await this.escolherAtaque(m); }
      else if (opcao === 'mochila') { indice = 1; acao = await this.escolherItem(anteriores); }
      else { indice = 2; acao = await this.escolherTroca(m, anteriores); }
      if (acao) return acao;
    }
  }

  private async escolherAtaque(m: Monstrinho): Promise<Acao | null> {
    const ataques = m.getAtaques();
    if (!ataques.some((a) => a.temPP())) {
      // Sem PP em nenhum ataque: usa o golpe de emergência.
      const esforco = criarEsforco(m);
      const alvo = await this.escolherInimigo(`Sem PP! ${m.nome} vai usar Esforço em quem?`, esforco);
      return alvo ? new AcaoAtacar(m, alvo, esforco) : null;
    }
    let indice = 0;
    while (true) {
      this.fixar(`${m.nome}: qual ataque?`);
      const ataque = await escolher<Ataque>({
        x: 440, base: CAIXA.y + CAIXA.h, largura: 504, indiceInicial: indice,
        opcoes: ataques.map((a) => ({
          rotulo: a.getNome(), valor: a,
          detalhe: `PP ${a.getPPAtual()}/${a.getPPMaximo()}`,
          descricao: `${a.getElemento()} · Poder ${a.getPoderBase()} · Precisão ${a.getPrecisao()}%${a.isMultiTargetAtaque() ? ' · Atinge todos os oponentes' : ''}`,
          desabilitada: !a.temPP(),
        })),
      });
      if (!ataque) return null;
      indice = ataques.indexOf(ataque);
      const alvo = await this.escolherInimigo(`${ataque.getNome()}: em quem?`, ataque);
      if (alvo) return new AcaoAtacar(m, alvo, ataque);
      if (ataque.isMultiTargetAtaque() || vivos(this.oponente.ativos).length <= 1) return null;
    }
  }

  /** Escolhe um oponente em campo. Com um só (ou golpe em área) nem pergunta. */
  private async escolherInimigo(titulo: string, ataque?: Ataque): Promise<Monstrinho | null> {
    const inimigos = vivos(this.oponente.ativos);
    if (inimigos.length === 0) return null;
    if (inimigos.length === 1 || ataque?.isMultiTargetAtaque()) return inimigos[0];
    const anterior = this.destaque;
    this.fixar(titulo);
    const alvo = await escolher<Monstrinho>({
      x: 560, base: CAIXA.y + CAIXA.h, largura: 384,
      opcoes: inimigos.map((i) => {
        const mult = ataque ? efetividade(ataque.getElemento(), i.getElementoInerente()) : 1;
        return {
          rotulo: i.nome, valor: i,
          detalhe: mult > 1 ? 'Super efetivo' : mult < 1 ? 'Pouco efetivo' : `Nv ${i.getNivel()}`,
        };
      }),
      aoMudar: (i) => { this.destaque = i ?? anterior; },
    });
    this.destaque = anterior;
    return alvo;
  }

  private async escolherItem(anteriores: Acao[]): Promise<Acao | null> {
    // Itens já prometidos a outra ação deste turno não podem ser usados duas vezes.
    const disponiveis = [...this.jogador.mochila];
    for (const a of anteriores) {
      const usado = a instanceof AcaoItem ? a.item : a instanceof AcaoCapturar ? a.capturador : null;
      const i = usado ? disponiveis.indexOf(usado) : -1;
      if (i !== -1) disponiveis.splice(i, 1);
    }
    const grupos = contarMochila(disponiveis);
    if (grupos.length === 0) { await this.msg('Não há itens disponíveis na mochila.'); return null; }

    let indice = 0;
    while (true) {
      this.fixar('Usar qual item?');
      const info = await escolher<InfoItem>({
        titulo: 'MOCHILA', x: 420, base: CAIXA.y + CAIXA.h, largura: 524, linhasVisiveis: 6, indiceInicial: indice,
        opcoes: grupos.map((g) => {
          const bloqueado = g.info.uso === 'captura' && !this.selvagem;
          return {
            rotulo: g.info.item.nome, valor: g.info, detalhe: `x${g.quantidade}`,
            descricao: bloqueado ? 'Não é possível capturar o chumment de outro treinador.' : g.info.descricao,
            desabilitada: bloqueado,
          };
        }),
      });
      if (!info) return null;
      indice = grupos.findIndex((g) => g.info === info);

      if (info.uso === 'captura') {
        const alvo = await this.escolherInimigo(`${info.item.nome}: capturar quem?`);
        if (alvo) return new AcaoCapturar(this.jogador, alvo, info.item as ItemCaptura);
        if (vivos(this.oponente.ativos).length <= 1) return null;
      } else {
        const escolha = await escolherAlvoDeItem(this.jogador, info);
        if (escolha) return new AcaoItem(this.jogador, info.item, escolha.alvo, escolha.ataque);
      }
    }
  }

  private async escolherTroca(m: Monstrinho, anteriores: Acao[]): Promise<Acao | null> {
    const jaVaoEntrar = anteriores.flatMap((a) => (a instanceof AcaoTrocar ? [a.novoMonstrinho] : []));
    const banco = this.jogador.equipe.filter((x) => !this.jogador.ativos.includes(x));
    if (banco.length === 0) { await this.msg('Não há outros chumments na equipe.'); return null; }
    const novo = await escolherChumment(`Trocar ${m.nome} por quem?`, banco, {
      permitido: (x) => (x.getVida() <= 0 ? 'Desmaiado' : jaVaoEntrar.includes(x) ? 'Já vai entrar' : true),
    });
    return novo ? new AcaoTrocar(this.jogador, m, novo) : null;
  }

  // -------------------------------------------------------------------
  // Comandos do oponente (IA simples)
  // -------------------------------------------------------------------
  private comandosDoOponente(): Acao[] {
    const alvos = vivos(this.jogador.ativos);
    if (alvos.length === 0) return [];
    return vivos(this.oponente.ativos).map((m) => {
      const comPP = m.getAtaques().filter((a) => a.temPP());
      const ataques = comPP.length > 0 ? comPP : [criarEsforco(m)];
      const pares = ataques.flatMap((ataque) => alvos.map((alvo) => ({
        ataque, alvo,
        valor: ataque.getPoderBase() * efetividade(ataque.getElemento(), alvo.getElementoInerente()),
      })));
      const melhor = pares.reduce((a, b) => (b.valor > a.valor ? b : a));
      const escolhido = Math.random() < CONFIG.chanceIAEsperta ? melhor : pares[Math.floor(Math.random() * pares.length)];
      return new AcaoAtacar(m, escolhido.alvo, escolhido.ataque);
    });
  }

  // -------------------------------------------------------------------
  // Resolução do turno
  // -------------------------------------------------------------------
  private async resolverTurno(acoes: Acao[]): Promise<void> {
    this.destaque = null;
    // Ordem: prioridade da ação (trocar 3 > item/captura 2 > atacar 1) e, entre ataques, velocidade.
    const velocidade = (a: Acao) => (a.usuario instanceof Monstrinho ? a.usuario.getVelocidade() : Infinity);
    const ordem = acoes
      .map((acao) => ({ acao, desempate: Math.random() }))
      .sort((a, b) =>
        b.acao.prioridade - a.acao.prioridade
        || velocidade(b.acao) - velocidade(a.acao)
        || a.desempate - b.desempate);

    for (const { acao } of ordem) {
      if (this.acabou()) break;
      this.fotografar();
      await this.executar(acao);
      await this.anunciarDesmaios();
    }
    if (!this.acabou()) {
      // Queimadura e sangramento
      this.fotografar();
      for (const log of this.batalha.processarEfeitosFimDeTurno()) await this.msg(log);
      await this.anunciarDesmaios();
    }
    this.substitutos.clear();
    this.capturadosNoTurno.clear();
  }

  private executar(acao: Acao): Promise<void> {
    if (acao instanceof AcaoAtacar) return this.executarAtaque(acao);
    if (acao instanceof AcaoCapturar) return this.executarCaptura(acao);
    if (acao instanceof AcaoItem) return this.executarItem(acao);
    if (acao instanceof AcaoTrocar) return this.executarTroca(acao);
    acao.executar(this.batalha);
    return Promise.resolve();
  }

  private async executarAtaque(acao: AcaoAtacar): Promise<void> {
    const usuario = acao.usuario;
    if (this.capturadosNoTurno.has(usuario)) return;
    const lado = this.jogador.equipe.includes(usuario) ? this.jogador : this.oponente;
    const inimigo = lado === this.jogador ? this.oponente : this.jogador;
    if (usuario.getVida() <= 0 || !lado.ativos.includes(usuario)) return;

    const emCampo = vivos(inimigo.ativos);
    let alvos: Monstrinho[];
    if (acao.ataque.isMultiTargetAtaque()) alvos = emCampo;
    else {
      let alvo = acao.alvo;
      while (this.substitutos.has(alvo)) alvo = this.substitutos.get(alvo)!;
      alvos = emCampo.includes(alvo) ? [alvo] : emCampo.slice(0, 1);
    }
    if (alvos.length === 0) return;

    let agiu = false;
    for (const alvo of alvos) {
      if (this.acabou()) break;
      const vidaAntes = alvo.getVida();
      const vidaUsuario = usuario.getVida();
      // A Batalha calcula estados (congelado, dormindo, confuso), precisão, dano, crítico e reações.
      const { log: resultado, detalhes } = this.processarAtaque(usuario, alvo, acao.ataque);
      if (!resultado) continue;
      let log = resultado;
      // "⚔️ ..." (acertou) ou "❌ ..." (errou): o chumment agiu. Qualquer outra mensagem é um estado que o impediu.
      const tentou = log.startsWith('⚔️') || log.startsWith('❌');
      if (tentou && !agiu) this.efeitos.set(usuario, { tipo: 'avanco', t: 0 });
      agiu ||= tentou;
      if (usuario.getVida() < vidaUsuario) this.efeitos.set(usuario, { tipo: 'tremor', t: 0 }); // confuso: machucou a si mesmo
      if (alvo.getVida() < vidaAntes) {
        this.efeitos.set(alvo, { tipo: 'tremor', t: 0 });
        const mult = efetividade(acao.ataque.getElemento(), alvo.getElementoInerente());
        if (mult > 1) log += ' É super efetivo!';
        else if (mult < 1) log += ' Não é muito efetivo...';
      }
      await this.msg(log);
      // Efeitos das reações (Vinhas, Condutividade, Redemoinho...) que o chuments.ts só escreve no console.
      for (const detalhe of detalhes) await this.msg(detalhe);
      if (!tentou) break;
    }
    // O PP é gasto depois: processarAtaque() recusa o golpe se o PP já estiver em zero.
    if (agiu) acao.ataque.consumirPP();
  }

  /**
   * Chama Batalha.processarAtaque() e recolhe as linhas "-> ..." que o GerenciadorDeReacoes
   * escreve no console, para mostrá-las ao jogador.
   */
  private processarAtaque(usuario: Monstrinho, alvo: Monstrinho, ataque: Ataque): { log: string; detalhes: string[] } {
    const detalhes: string[] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      const linha = args.map(String).join(' ');
      if (/^\s*->/.test(linha)) detalhes.push(linha.replace(/^\s*->\s*/, ''));
      original(...args);
    };
    try {
      return { log: this.batalha.processarAtaque(usuario, alvo, ataque), detalhes };
    } finally {
      console.log = original;
    }
  }

  private async executarItem(acao: AcaoItem): Promise<void> {
    const { alvo, item, ataqueAlvo } = acao;
    const vidaAntes = alvo.getVida();
    await this.msg(`${this.jogador.nome} usou ${item.nome} em ${alvo.nome}!`);
    acao.executar(this.batalha);
    if (alvo.getVida() > vidaAntes) await this.msg(`${alvo.nome} recuperou ${alvo.getVida() - vidaAntes} de vida.`);
    else if (ataqueAlvo) await this.msg(`O PP de ${ataqueAlvo.getNome()} foi restaurado.`);
  }

  private async executarTroca(acao: AcaoTrocar): Promise<void> {
    const { antigoMonstrinho: antigo, novoMonstrinho: novo } = acao;
    if (antigo.getVida() <= 0 || !this.jogador.ativos.includes(antigo)) return;
    acao.executar(this.batalha);
    if (this.jogador.ativos.includes(novo)) {
      this.substitutos.set(antigo, novo);
      await this.msg(`${antigo.nome}, volte! Vai, ${novo.nome}!`);
    } else {
      await this.msg(`${antigo.nome} não conseguiu sair do campo!`);
    }
  }

  private async executarCaptura(acao: AcaoCapturar): Promise<void> {
    const { alvo, capturador } = acao;
    if (alvo.getVida() <= 0 || !this.oponente.ativos.includes(alvo)) {
      await this.msg(`${alvo.nome} não está mais em campo. O ${capturador.nome} foi guardado.`);
      return;
    }
    await this.msg(`${this.jogador.nome} lançou um ${capturador.nome} em ${alvo.nome}!`);
    await this.msg(this.batalha.processarCaptura(this.jogador, alvo, capturador));
    if (this.jogador.armazenamento.includes(alvo)) {
      this.capturadosNoTurno.add(alvo);
      await this.msg(`A equipe está cheia: ${alvo.nome} foi enviado ao armazenamento (computador do quarto).`);
    } else if (this.jogador.equipe.includes(alvo)) {
      this.capturadosNoTurno.add(alvo);
      await this.msg(`${alvo.nome} entrou para a sua equipe!`);
    }
  }

  // -------------------------------------------------------------------
  // Desmaios, experiência e substituições
  // -------------------------------------------------------------------
  private async anunciarDesmaios(): Promise<void> {
    for (const lado of [this.oponente, this.jogador]) {
      for (const m of [...lado.equipe]) {
        if (m.getVida() > 0 || this.anunciados.has(m)) continue;
        this.anunciados.add(m);
        await this.msg(`${m.nome} desmaiou!`);
        if (lado === this.oponente) await this.premiarDerrota(m);
      }
    }
  }

  private async premiarDerrota(inimigo: Monstrinho): Promise<void> {
    if (this.selvagem) this.dinheiroSelvagem += CONFIG.dinheiroPorSelvagem(inimigo.getNivel());
    const recebem = vivos(this.emCampo(this.jogador)).filter((m) => m.getNivel() < 30);
    if (recebem.length === 0) return;

    const xp = Math.max(1, Math.ceil(CONFIG.xpPorDerrota(inimigo.getNivel()) / recebem.length));
    const antes = recebem.map((m) => ({ nivel: m.getNivel(), ataques: [...m.getAtaques()] }));
    for (const m of recebem) m.ganharExperiencia(xp);
    const nomes = recebem.map((m) => m.nome).join(' e ');
    await this.msg(`${nomes} ${recebem.length > 1 ? 'ganharam' : 'ganhou'} ${xp} de experiência${recebem.length > 1 ? ' cada' : ''}!`);

    for (let i = 0; i < recebem.length; i++) {
      const m = recebem[i];
      if (m.getNivel() === antes[i].nivel) continue;
      await this.msg(`${m.nome} subiu para o nível ${m.getNivel()}!`);
      for (const a of m.getAtaques()) {
        if (!antes[i].ataques.includes(a)) await this.msg(`${m.nome} aprendeu ${a.getNome()}!`);
      }
      await this.resolverAtaquePendente(m);
    }
  }

  /** Quando já há 4 ataques, pergunta qual esquecer (usa a própria lógica do Monstrinho). */
  private async resolverAtaquePendente(m: Monstrinho): Promise<void> {
    const novo = m.getAtaquePendente();
    if (!novo) return;
    await this.msg(`${m.nome} quer aprender ${novo.getNome()}, mas já conhece 4 ataques.`);
    this.fixar(`Esquecer qual ataque para aprender ${novo.getNome()}?`);
    const indice = await escolher<number>({
      titulo: `NOVO: ${novo.getNome()} — Poder ${novo.getPoderBase()}, PP ${novo.getPPMaximo()}${novo.isMultiTargetAtaque() ? ', atinge todos' : ''}`,
      x: 360, base: CAIXA.y + CAIXA.h, largura: 584, cancelavel: false,
      opcoes: [
        ...m.getAtaques().map((a, i) => ({
          rotulo: `Esquecer ${a.getNome()}`, valor: i,
          detalhe: `Poder ${a.getPoderBase()} · PP ${a.getPPAtual()}/${a.getPPMaximo()}`,
        })),
        { rotulo: `Não aprender ${novo.getNome()}`, valor: -1 },
      ],
    });
    if (indice === null || indice < 0) {
      m.cancelarAtaquePendente();
      await this.msg(`${m.nome} não aprendeu ${novo.getNome()}.`);
    } else {
      const esquecido = m.getAtaques()[indice].getNome();
      m.resolverAtaquePendente(indice);
      await this.msg(`${m.nome} esqueceu ${esquecido} e aprendeu ${novo.getNome()}!`);
    }
  }

  private async reporDesmaiados(): Promise<void> {
    // Oponente: as reservas entram sozinhas (Treinador.reporAtivosDesmaiados).
    for (const m of this.oponente.reporAtivosDesmaiados()) {
      await this.msg(`${this.oponente.nome} enviou ${m.nome} para a batalha!`);
    }
    // Jogador: escolhe quem entra.
    this.jogador.ativos = vivos(this.jogador.ativos);
    while (this.jogador.ativos.length < this.porLado) {
      const banco = vivos(this.jogador.equipe).filter((m) => !this.jogador.ativos.includes(m));
      if (banco.length === 0) break;
      this.fixar('Escolha quem entra em campo.');
      const novo = banco.length === 1
        ? banco[0]
        : (await escolherChumment('Quem entra em campo?', banco, { cancelavel: false })) ?? banco[0];
      this.jogador.ativos.push(novo);
      await this.msg(`Vai, ${novo.nome}!`);
    }
  }

  // -------------------------------------------------------------------
  // Fim da batalha
  // -------------------------------------------------------------------
  private async conclusao(): Promise<void> {
    const { jogador, oponente } = this;
    this.destaque = null;

    if (jogador.todosDesmaiaram()) {
      await this.msg('Todos os seus chumments desmaiaram...');
      this.encerrar('derrota');
      return;
    }

    if (!this.selvagem) {
      await this.msg(`Você venceu ${oponente.nome}!`);
      if (this.o.premio) {
        jogador.adicionarDinheiro(this.o.premio);
        await this.msg(`Você recebeu $${this.o.premio} pela vitória.`);
      }
    } else if (this.dinheiroSelvagem > 0) {
      jogador.adicionarDinheiro(this.dinheiroSelvagem);
      await this.msg(`Você encontrou $${this.dinheiroSelvagem} depois da batalha.`);
    }

    // Evoluções (Treinador.verificarEvolucoes troca o chumment pela forma evoluída).
    const antes = [...jogador.equipe];
    jogador.verificarEvolucoes();
    for (let i = 0; i < antes.length; i++) {
      const novo = jogador.equipe[i];
      if (novo === antes[i]) continue;
      // restaurarEstado() copia a vida antiga sem limitar ao novo máximo.
      const excesso = novo.getVida() - novo.getVidaMaxima();
      if (excesso > 0) novo.receberDano(excesso);
      await this.msg(`O quê? ${antes[i].nome} está evoluindo!`);
      await this.msg(`${antes[i].nome} evoluiu para ${novo.nome}!`);
    }
    this.encerrar('vitoria');
  }

  // -------------------------------------------------------------------
  // Mensagens
  // -------------------------------------------------------------------
  /** Mostra uma mensagem e espera o jogador confirmar. */
  private msg(mensagem: string): Promise<void> {
    this.texto = mensagem;
    this.letras = 0;
    return new Promise((resolver) => { this.continuar = resolver; });
  }

  /** Texto fixo na caixa enquanto um menu está aberto. */
  private fixar(mensagem: string): void {
    this.texto = mensagem;
    this.letras = mensagem.length;
    this.continuar = null;
  }

  atualizar(dt: number): void {
    if (!this.continuar) return;
    this.letras += dt * 75;
    if (!jogo.entrada.pressionou('confirmar') && !jogo.entrada.pressionou('cancelar')) return;
    if (this.letras < this.texto.length) { this.letras = this.texto.length; return; }
    const seguir = this.continuar;
    this.continuar = null;
    seguir();
  }

  // -------------------------------------------------------------------
  // Desenho
  // -------------------------------------------------------------------
  desenhar(ctx: CanvasRenderingContext2D): void {
    // O tempo das animações é medido aqui porque, com um menu aberto, atualizar() não roda.
    const agora = performance.now();
    const dt = Math.min(0.05, (agora - this.ultimoDesenho) / 1000);
    this.ultimoDesenho = agora;
    this.tempo += dt;

    this.desenharFundo(ctx);
    const aliados = this.emCampo(this.jogador), rivais = this.emCampo(this.oponente);
    rivais.forEach((m, i) => this.desenharEmCampo(ctx, m, CAMPO_OPONENTE[i] ?? CAMPO_OPONENTE[1], TAMANHO_OPONENTE, false, dt));
    aliados.forEach((m, i) => this.desenharEmCampo(ctx, m, CAMPO_JOGADOR[i] ?? CAMPO_JOGADOR[1], TAMANHO_JOGADOR, true, dt));
    rivais.forEach((m, i) => this.desenharPainel(ctx, m, PAINEL_OPONENTE[i] ?? PAINEL_OPONENTE[1], false, dt));
    aliados.forEach((m, i) => this.desenharPainel(ctx, m, PAINEL_JOGADOR[i] ?? PAINEL_JOGADOR[1], true, dt));

    // Caixa de mensagens
    painel(ctx, CAIXA.x, CAIXA.y, CAIXA.w, CAIXA.h);
    const linhas = quebrar(ctx, this.texto, this.continuar ? CAIXA.w - 60 : 390, 21);
    let restante = Math.floor(this.letras);
    linhas.slice(0, 4).forEach((linha, i) => {
      texto(ctx, linha.slice(0, Math.max(0, restante)), CAIXA.x + 26, CAIXA.y + 22 + i * 28, { tamanho: 21 });
      restante -= linha.length;
    });
    if (this.continuar && this.letras >= this.texto.length && Math.floor(this.tempo * 2.5) % 2 === 0) {
      texto(ctx, '▼', CAIXA.x + CAIXA.w - 40, CAIXA.y + CAIXA.h - 34, { tamanho: 16, cor: CORES.destaque });
    }
  }

  private desenharFundo(ctx: CanvasRenderingContext2D): void {
    const ceu = ctx.createLinearGradient(0, 0, 0, 300);
    ceu.addColorStop(0, '#8fd0f2');
    ceu.addColorStop(1, '#d8f1f7');
    ctx.fillStyle = ceu;
    ctx.fillRect(0, 0, LARGURA, 300);
    const chao = ctx.createLinearGradient(0, 230, 0, ALTURA);
    chao.addColorStop(0, '#a8d98a');
    chao.addColorStop(1, '#5fae62');
    ctx.fillStyle = chao;
    ctx.fillRect(0, 230, LARGURA, ALTURA - 230);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (const [x, y, r] of [[130, 70, 46], [190, 84, 34], [520, 52, 38], [575, 64, 28]]) {
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Plataformas
    const plataforma = (x: number, y: number, rx: number) => {
      ctx.fillStyle = 'rgba(40,90,50,0.35)';
      ctx.beginPath(); ctx.ellipse(x, y + 4, rx, rx * 0.26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9e7a9';
      ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    };
    CAMPO_OPONENTE.slice(0, Math.max(1, this.emCampo(this.oponente).length)).forEach((p) => plataforma(p.x, p.y - 6, 84));
    CAMPO_JOGADOR.slice(0, Math.max(1, this.emCampo(this.jogador).length)).forEach((p) => plataforma(p.x, p.y - 8, 104));
  }

  private desenharEmCampo(ctx: CanvasRenderingContext2D, m: Monstrinho, pos: { x: number; y: number }, tamanho: number, aliado: boolean, dt: number): void {
    if (this.anunciados.has(m)) return;
    let dx = 0, alfa = 1;
    const efeito = this.efeitos.get(m);
    if (efeito) {
      efeito.t += dt;
      if (efeito.tipo === 'avanco') {
        const f = Math.min(1, efeito.t / 0.28);
        dx = Math.sin(f * Math.PI) * 34 * (aliado ? 1 : -1);
        if (f >= 1) this.efeitos.delete(m);
      } else {
        dx = Math.sin(efeito.t * 70) * 7;
        alfa = Math.floor(efeito.t * 16) % 2 === 0 ? 0.35 : 1;
        if (efeito.t >= 0.4) this.efeitos.delete(m);
      }
    }
    const flutuar = Math.sin(this.tempo * 2 + pos.x) * 2;
    desenharChumment(ctx, m, pos.x + dx, pos.y + flutuar, tamanho, { espelhar: aliado && CONFIG.espelharAliados, alfa });

    if (this.destaque === m) {
      const y = pos.y - tamanho - 26 + Math.sin(this.tempo * 7) * 4;
      ctx.fillStyle = CORES.borda;
      ctx.beginPath(); ctx.moveTo(pos.x - 15, y - 2); ctx.lineTo(pos.x + 15, y - 2); ctx.lineTo(pos.x, y + 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = CORES.selecao;
      ctx.beginPath(); ctx.moveTo(pos.x - 10, y + 1); ctx.lineTo(pos.x + 10, y + 1); ctx.lineTo(pos.x, y + 15); ctx.closePath(); ctx.fill();
    }
  }

  private desenharPainel(ctx: CanvasRenderingContext2D, m: Monstrinho, pos: { x: number; y: number }, aliado: boolean, dt: number): void {
    // A barra de vida desliza até o valor real.
    const real = m.getVida();
    let exibida = this.vidaExibida.get(m) ?? real;
    const passo = Math.max(10, m.getVidaMaxima() * 1.4) * dt;
    exibida = exibida > real ? Math.max(real, exibida - passo) : Math.min(real, exibida + passo);
    this.vidaExibida.set(m, exibida);

    const { x, y } = pos;
    painel(ctx, x, y, PAINEL.w, PAINEL.h, this.destaque === m ? '#fff3c9' : CORES.painel);
    ctx.fillStyle = CORES_ELEMENTO[m.getElementoInerente()];
    ctx.beginPath(); ctx.arc(x + 20, y + 21, 7, 0, Math.PI * 2); ctx.fill();
    texto(ctx, m.nome, x + 34, y + 10, { tamanho: 18, larguraMax: PAINEL.w - 110 });
    texto(ctx, `Nv ${m.getNivel()}`, x + PAINEL.w - 14, y + 12, { tamanho: 15, cor: CORES.fraco, alinhar: 'right' });

    const fracao = exibida / m.getVidaMaxima();
    barra(ctx, x + 14, y + 34, PAINEL.w - 28, 13, fracao, corVida(fracao));
    if (aliado && m.getNivel() < 30) {
      ctx.fillStyle = CORES.xp;
      ctx.fillRect(x + 16, y + 47, (PAINEL.w - 32) * Math.min(1, m.getExperiencia() / xpParaProximoNivel(m)), 2);
    }

    // Elemento aplicado (base das reações) e estados
    let ex = x + 14;
    for (const elemento of m.getElementosAplicados()) ex += etiqueta(ctx, `◆ ${elemento}`, ex, y + 53, CORES_ELEMENTO[elemento], 11) + 4;
    for (const estado of m.getEstados()) ex += etiqueta(ctx, estado, ex, y + 53, CORES_ESTADO[estado], 11) + 4;
    if (aliado) {
      texto(ctx, `${Math.round(exibida)}/${m.getVidaMaxima()}`, x + PAINEL.w - 14, y + 54, { tamanho: 14, alinhar: 'right' });
    }
  }
}
