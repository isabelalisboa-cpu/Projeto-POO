// Diálogos e menus genéricos. As funções falar()/escolher() devolvem Promises,
// então os roteiros do jogo podem ser escritos em sequência com async/await.
import { jogo } from '../jogo/jogo';
import type { Cena } from '../motor/cena';
import { ALTURA, LARGURA } from '../motor/tela';
import { CORES, painel, quebrar, texto } from './ui';

// ---------------------------------------------------------------------
// Caixa de diálogo
// ---------------------------------------------------------------------
const CAIXA = { x: 24, y: ALTURA - 158, w: LARGURA - 48, h: 140 };
const LINHAS_POR_PAGINA = 3;

class CenaDialogo implements Cena {
  readonly opaca = false;
  private paginas: string[][] | null = null;
  private pagina = 0;
  private visiveis = 0;
  private tempo = 0;

  constructor(private falas: string[], private nome: string | undefined, private aoTerminar: () => void) {}

  private total(): number { return this.paginas![this.pagina].join('').length; }

  atualizar(dt: number): void {
    this.tempo += dt;
    if (!this.paginas) return;
    this.visiveis += dt * 60;
    if (!jogo.entrada.pressionou('confirmar') && !jogo.entrada.pressionou('cancelar')) return;
    if (this.visiveis < this.total()) { this.visiveis = this.total(); return; }
    this.pagina++;
    this.visiveis = 0;
    if (this.pagina >= this.paginas.length) {
      jogo.cenas.remover(this);
      this.aoTerminar();
    }
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    if (!this.paginas) {
      // A quebra de linhas depende de medir o texto, então é feita no primeiro desenho.
      this.paginas = [];
      for (const fala of this.falas) {
        const linhas = quebrar(ctx, fala, CAIXA.w - 56, 22);
        for (let i = 0; i < linhas.length; i += LINHAS_POR_PAGINA) this.paginas.push(linhas.slice(i, i + LINHAS_POR_PAGINA));
      }
      if (this.paginas.length === 0) this.paginas.push(['']);
    }
    painel(ctx, CAIXA.x, CAIXA.y, CAIXA.w, CAIXA.h);
    if (this.nome) {
      ctx.font = '700 17px "Trebuchet MS", Verdana, sans-serif';
      const w = ctx.measureText(this.nome).width + 28;
      painel(ctx, CAIXA.x + 18, CAIXA.y - 24, w, 34, CORES.painelEscuro);
      texto(ctx, this.nome, CAIXA.x + 32, CAIXA.y - 16, { tamanho: 17, cor: CORES.textoClaro });
    }
    let restante = Math.floor(this.visiveis);
    const linhas = this.paginas[Math.min(this.pagina, this.paginas.length - 1)];
    linhas.forEach((linha, i) => {
      const parte = linha.slice(0, Math.max(0, restante));
      restante -= linha.length;
      texto(ctx, parte, CAIXA.x + 28, CAIXA.y + 26 + i * 32, { tamanho: 22 });
    });
    if (this.visiveis >= this.total() && Math.floor(this.tempo * 2.5) % 2 === 0) {
      texto(ctx, '▼', CAIXA.x + CAIXA.w - 40, CAIXA.y + CAIXA.h - 34, { tamanho: 16, cor: CORES.destaque });
    }
  }
}

/** Mostra uma ou mais falas e espera o jogador confirmar cada uma. */
export function falar(falas: string | string[], nome?: string): Promise<void> {
  const lista = Array.isArray(falas) ? falas : [falas];
  return new Promise((resolver) => jogo.cenas.empilhar(new CenaDialogo(lista, nome, resolver)));
}

// ---------------------------------------------------------------------
// Menu de opções
// ---------------------------------------------------------------------
export interface OpcaoMenu<T> {
  rotulo: string;
  valor: T;
  /** Texto à direita (preço, PP, quantidade...). */
  detalhe?: string;
  /** Explicação mostrada no rodapé do menu quando a opção está selecionada. */
  descricao?: string;
  desabilitada?: boolean;
}

export interface ConfigMenu<T> {
  titulo?: string;
  opcoes: OpcaoMenu<T>[];
  x?: number;
  /** Topo do menu. Alternativa: "base" (o menu cresce para cima a partir dela). */
  y?: number;
  base?: number;
  largura?: number;
  linhasVisiveis?: number;
  indiceInicial?: number;
  /** Padrão: true. Com false, Esc não fecha o menu. */
  cancelavel?: boolean;
  /** Escurece a cena de trás. */
  escurecer?: boolean;
  /** Chamado quando a seleção muda (undefined ao fechar). */
  aoMudar?: (valor: T | undefined) => void;
  /** Desenho extra ao lado do menu (ex.: ficha do chumment selecionado). */
  painelExtra?: (ctx: CanvasRenderingContext2D, valor: T | undefined) => void;
}

const M = { margem: 14, linha: 32, titulo: 34, descricao: 50 };

class CenaMenu<T> implements Cena {
  readonly opaca = false;
  private indice = 0;
  private topo = 0;
  private tempo = 0;

  constructor(private cfg: ConfigMenu<T>, private resolver: (v: T | null) => void) {
    const n = cfg.opcoes.length;
    this.indice = Math.max(0, Math.min(n - 1, cfg.indiceInicial ?? 0));
    if (n > 0 && cfg.opcoes[this.indice].desabilitada && cfg.indiceInicial === undefined) {
      const primeira = cfg.opcoes.findIndex((o) => !o.desabilitada);
      if (primeira !== -1) this.indice = primeira;
    }
    this.ajustarRolagem();
    cfg.aoMudar?.(this.atual()?.valor);
  }

  private visiveis(): number { return Math.min(this.cfg.linhasVisiveis ?? 8, Math.max(1, this.cfg.opcoes.length)); }
  private atual(): OpcaoMenu<T> | undefined { return this.cfg.opcoes[this.indice]; }

  private ajustarRolagem(): void {
    const v = this.visiveis();
    if (this.indice < this.topo) this.topo = this.indice;
    if (this.indice >= this.topo + v) this.topo = this.indice - v + 1;
  }

  private mover(delta: number): void {
    const n = this.cfg.opcoes.length;
    if (n === 0) return;
    this.indice = (this.indice + delta + n) % n;
    this.ajustarRolagem();
    this.cfg.aoMudar?.(this.atual()?.valor);
  }

  private fechar(valor: T | null): void {
    jogo.cenas.remover(this);
    this.cfg.aoMudar?.(undefined);
    this.resolver(valor);
  }

  atualizar(dt: number): void {
    this.tempo += dt;
    const e = jogo.entrada;
    if (e.pressionou('baixo')) this.mover(1);
    if (e.pressionou('cima')) this.mover(-1);
    if (e.pressionou('confirmar')) {
      const o = this.atual();
      if (o && !o.desabilitada) this.fechar(o.valor);
    } else if (e.pressionou('cancelar') && this.cfg.cancelavel !== false) {
      this.fechar(null);
    }
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    const { cfg } = this;
    if (cfg.escurecer) { ctx.fillStyle = 'rgba(10,14,30,0.55)'; ctx.fillRect(0, 0, LARGURA, ALTURA); }

    const temDescricao = cfg.opcoes.some((o) => o.descricao);
    const v = this.visiveis();
    const w = cfg.largura ?? 320;
    const h = M.margem * 2 + (cfg.titulo ? M.titulo : 0) + v * M.linha + (temDescricao ? M.descricao : 0);
    const x = cfg.x ?? (LARGURA - w) / 2;
    const y = cfg.base !== undefined ? cfg.base - h : cfg.y ?? (ALTURA - h) / 2;

    cfg.painelExtra?.(ctx, this.atual()?.valor);
    painel(ctx, x, y, w, h);

    let cy = y + M.margem;
    if (cfg.titulo) {
      texto(ctx, cfg.titulo, x + M.margem + 4, cy + 2, { tamanho: 17, cor: CORES.fraco, larguraMax: w - M.margem * 2 - 8 });
      ctx.fillStyle = 'rgba(39,55,90,0.18)';
      ctx.fillRect(x + M.margem, cy + M.titulo - 8, w - M.margem * 2, 2);
      cy += M.titulo;
    }

    for (let i = this.topo; i < Math.min(cfg.opcoes.length, this.topo + v); i++) {
      const o = cfg.opcoes[i];
      const selecionada = i === this.indice;
      if (selecionada) {
        ctx.fillStyle = CORES.selecao;
        ctx.fillRect(x + 8, cy, w - 16, M.linha - 2);
        texto(ctx, '▶', x + 14, cy + 7, { tamanho: 14, cor: CORES.destaque });
      }
      const cor = o.desabilitada ? CORES.desabilitado : CORES.texto;
      ctx.font = '700 16px "Trebuchet MS", Verdana, sans-serif';
      const larguraDetalhe = o.detalhe ? ctx.measureText(o.detalhe).width + 12 : 0;
      texto(ctx, o.rotulo, x + 34, cy + 5, { tamanho: 19, cor, larguraMax: w - 50 - larguraDetalhe });
      if (o.detalhe) texto(ctx, o.detalhe, x + w - 16, cy + 7, { tamanho: 16, cor: o.desabilitada ? CORES.desabilitado : CORES.fraco, alinhar: 'right' });
      cy += M.linha;
    }

    if (cfg.opcoes.length > v) {
      if (this.topo > 0) texto(ctx, '▲', x + w - 22, y + 4, { tamanho: 11, cor: CORES.fraco });
      if (this.topo + v < cfg.opcoes.length) texto(ctx, '▼', x + w - 22, cy - 6, { tamanho: 11, cor: CORES.fraco });
    }

    if (temDescricao) {
      ctx.fillStyle = 'rgba(39,55,90,0.18)';
      ctx.fillRect(x + M.margem, cy + 4, w - M.margem * 2, 2);
      const linhas = quebrar(ctx, this.atual()?.descricao ?? '', w - M.margem * 2 - 8, 15, false).slice(0, 2);
      linhas.forEach((l, i) => texto(ctx, l, x + M.margem + 4, cy + 11 + i * 18, { tamanho: 15, cor: CORES.fraco, negrito: false }));
    }
  }
}

/** Abre um menu e devolve o valor escolhido (ou null se o jogador cancelou). */
export function escolher<T>(cfg: ConfigMenu<T>): Promise<T | null> {
  return new Promise((resolver) => jogo.cenas.empilhar(new CenaMenu(cfg, resolver)));
}

/** Pergunta de sim/não. */
export async function confirmar(pergunta: string, padraoSim = true): Promise<boolean> {
  const r = await escolher<boolean>({
    titulo: pergunta,
    opcoes: [{ rotulo: 'Sim', valor: true }, { rotulo: 'Não', valor: false }],
    indiceInicial: padraoSim ? 0 : 1,
    largura: Math.max(260, Math.min(700, pergunta.length * 10 + 60)),
  });
  return r === true;
}

/** Espera um tempo (em segundos) sem travar o jogo. */
export function esperar(segundos: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, segundos * 1000));
}
