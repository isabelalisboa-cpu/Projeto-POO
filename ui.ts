// Primitivas de interface desenhadas no canvas (sem imagens).
export const FAMILIA = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

export const CORES = {
  painel: '#fbf7ea',
  painelEscuro: '#232c4a',
  borda: '#27375a',
  texto: '#1f2a44',
  textoClaro: '#f4f1e6',
  fraco: '#6f7890',
  desabilitado: '#a9afbf',
  selecao: '#ffe08a',
  destaque: '#e8552d',
  dinheiro: '#2e8b57',
  vidaAlta: '#3fae5a',
  vidaMedia: '#e0b020',
  vidaBaixa: '#d9463d',
  xp: '#4a90e2',
  trilho: '#3a4560',
};

export function fonte(tamanho: number, negrito = true): string {
  return `${negrito ? '700 ' : ''}${tamanho}px ${FAMILIA}`;
}

export function retArredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const raio = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.arcTo(x + w, y, x + w, y + h, raio);
  ctx.arcTo(x + w, y + h, x, y + h, raio);
  ctx.arcTo(x, y + h, x, y, raio);
  ctx.arcTo(x, y, x + w, y, raio);
  ctx.closePath();
}

export function painel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor = CORES.painel): void {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  retArredondado(ctx, x + 3, y + 4, w, h, 10); ctx.fill();
  ctx.fillStyle = CORES.borda;
  retArredondado(ctx, x, y, w, h, 10); ctx.fill();
  ctx.fillStyle = cor;
  retArredondado(ctx, x + 3, y + 3, w - 6, h - 6, 7); ctx.fill();
}

export interface OpcoesTexto {
  tamanho?: number;
  cor?: string;
  alinhar?: CanvasTextAlign;
  negrito?: boolean;
  larguraMax?: number;
}

/** Texto com origem no canto superior (textBaseline = top). */
export function texto(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: OpcoesTexto = {}): void {
  ctx.font = fonte(o.tamanho ?? 20, o.negrito ?? true);
  ctx.fillStyle = o.cor ?? CORES.texto;
  ctx.textAlign = o.alinhar ?? 'left';
  ctx.textBaseline = 'top';
  if (o.larguraMax) ctx.fillText(s, x, y, o.larguraMax);
  else ctx.fillText(s, x, y);
}

/** Quebra o texto em linhas que cabem em larguraMax. */
export function quebrar(ctx: CanvasRenderingContext2D, s: string, larguraMax: number, tamanho: number, negrito = true): string[] {
  ctx.font = fonte(tamanho, negrito);
  const linhas: string[] = [];
  for (const paragrafo of s.split('\n')) {
    let atual = '';
    for (const palavra of paragrafo.split(' ')) {
      const teste = atual ? `${atual} ${palavra}` : palavra;
      if (atual && ctx.measureText(teste).width > larguraMax) { linhas.push(atual); atual = palavra; }
      else atual = teste;
    }
    linhas.push(atual);
  }
  return linhas;
}

export function corVida(fracao: number): string {
  return fracao > 0.5 ? CORES.vidaAlta : fracao > 0.2 ? CORES.vidaMedia : CORES.vidaBaixa;
}

export function barra(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fracao: number, cor: string): void {
  ctx.fillStyle = CORES.trilho;
  retArredondado(ctx, x, y, w, h, h / 2); ctx.fill();
  const f = Math.max(0, Math.min(1, fracao));
  if (f > 0) {
    ctx.fillStyle = cor;
    retArredondado(ctx, x + 2, y + 2, Math.max(h - 4, (w - 4) * f), h - 4, (h - 4) / 2); ctx.fill();
  }
}

/** Etiqueta colorida (elemento, estado). Devolve a largura desenhada. */
export function etiqueta(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, cor: string, tamanho = 13): number {
  ctx.font = fonte(tamanho);
  const w = ctx.measureText(s).width + 14;
  ctx.fillStyle = cor;
  retArredondado(ctx, x, y, w, tamanho + 8, 6); ctx.fill();
  texto(ctx, s, x + 7, y + 4, { tamanho, cor: '#fff' });
  return w;
}
