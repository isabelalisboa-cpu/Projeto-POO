// Personagens desenhados por código (jogador e NPCs sem imagem própria).
// Grade de 16 x 24 "pixels"; (x, y) = pés do personagem; altura = tamanho final.
import type { Aparencia, Direcao } from '../mapas/tipos';

const CONTORNO = '#1d2540';
const SAPATO = '#2b2f45';
const OLHO = '#1d2540';

export const APARENCIA_JOGADOR: Record<string, Aparencia> = {
  Masculino: { cabelo: '#4a3222', pele: '#f0c39a', roupa: '#1f9d8b', calca: '#34406b' },
  Feminino: { cabelo: '#7a3b2e', pele: '#f3cba6', roupa: '#d9566b', calca: '#34406b', cabeloLongo: true },
};

export function aparenciaJogador(sexo: string): Aparencia {
  return APARENCIA_JOGADOR[sexo] ?? APARENCIA_JOGADOR.Masculino;
}

type Bloco = [x: number, y: number, w: number, h: number, cor: string];

function montar(direcao: Direcao, passo: number, ap: Aparencia): Bloco[] {
  const b: Bloco[] = [];
  const lateral = direcao === 'esquerda' || direcao === 'direita';
  // passo: 0 parado, 1 e 2 alternam as pernas
  const esq = passo === 1 ? -1 : 0;
  const dir = passo === 2 ? -1 : 0;

  // Pernas e sapatos
  if (lateral) {
    const frente = passo === 1 ? 2 : passo === 2 ? -1 : 0;
    const tras = passo === 1 ? -1 : passo === 2 ? 2 : 0;
    b.push([6 + tras, 18, 3, 4, ap.calca], [6 + tras, 22, 3, 2, SAPATO]);
    b.push([7 + frente, 18, 3, 4, ap.calca], [7 + frente, 22, 3, 2, SAPATO]);
  } else {
    b.push([5, 18, 3, 4 + esq, ap.calca], [5, 22 + esq, 3, 2, SAPATO]);
    b.push([8, 18, 3, 4 + dir, ap.calca], [8, 22 + dir, 3, 2, SAPATO]);
  }

  // Tronco e braços
  if (lateral) {
    b.push([5, 11, 6, 7, ap.roupa]);
    const balanco = passo === 1 ? 1 : passo === 2 ? -1 : 0;
    b.push([7 + balanco, 12, 2, 4, ap.roupa], [7 + balanco, 16, 2, 1, ap.pele]);
  } else {
    b.push([4, 11, 8, 7, ap.roupa]);
    b.push([3, 11, 1, 5 + dir, ap.roupa], [3, 16 + dir, 1, 1, ap.pele]);
    b.push([12, 11, 1, 5 + esq, ap.roupa], [12, 16 + esq, 1, 1, ap.pele]);
  }

  // Cabeça
  b.push([4, 3, 8, 8, ap.pele]);
  if (direcao === 'baixo') {
    b.push([3, 1, 10, 4, ap.cabelo], [3, 5, 1, 3, ap.cabelo], [12, 5, 1, 3, ap.cabelo]);
    b.push([6, 7, 1, 2, OLHO], [9, 7, 1, 2, OLHO]);
    if (ap.cabeloLongo) b.push([3, 8, 1, 5, ap.cabelo], [12, 8, 1, 5, ap.cabelo]);
  } else if (direcao === 'cima') {
    b.push([3, 1, 10, 9, ap.cabelo]);
    if (ap.cabeloLongo) b.push([3, 10, 10, 4, ap.cabelo]);
  } else {
    // desenhado olhando para a esquerda; "direita" é espelhado em desenharPersonagem
    b.push([3, 1, 10, 4, ap.cabelo], [7, 5, 6, 5, ap.cabelo]);
    b.push([5, 7, 1, 2, OLHO]);
    if (ap.cabeloLongo) b.push([9, 10, 4, 4, ap.cabelo]);
  }
  return b;
}

export function desenharPersonagem(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, altura: number,
  direcao: Direcao, passo: number, ap: Aparencia,
): void {
  const u = altura / 24;
  const blocos = montar(direcao, passo, ap);

  ctx.save();
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x, y - u * 0.6, u * 5.5, u * 1.8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(x, y - altura);
  if (direcao === 'direita') { ctx.scale(-1, 1); ctx.translate(-8 * u, 0); }
  else ctx.translate(-8 * u, 0);

  const m = u * 0.7;
  ctx.fillStyle = CONTORNO;
  for (const [bx, by, bw, bh] of blocos) ctx.fillRect(bx * u - m, by * u - m, bw * u + m * 2, bh * u + m * 2);
  for (const [bx, by, bw, bh, cor] of blocos) {
    ctx.fillStyle = cor;
    ctx.fillRect(bx * u, by * u, bw * u + 0.5, bh * u + 0.5);
  }
  ctx.restore();
}
