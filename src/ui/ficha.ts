// Ficha de um chumment: sprite, nível, vida, XP, atributos e ataques.
import type { Monstrinho } from '../chuments';
import { CORES_ELEMENTO, CORES_ESTADO, xpParaProximoNivel } from '../jogo/catalogo';
import { desenharChumment } from '../jogo/spritesChumments';
import { barra, CORES, corVida, etiqueta, painel, texto } from './ui';

export function desenharFicha(ctx: CanvasRenderingContext2D, m: Monstrinho, x: number, y: number, w = 470, h = 400): void {
  painel(ctx, x, y, w, h);
  const cor = CORES_ELEMENTO[m.getElementoInerente()];

  // Sprite sobre um disco da cor do elemento
  ctx.fillStyle = cor + '33';
  ctx.beginPath(); ctx.ellipse(x + 92, y + 150, 66, 18, 0, 0, Math.PI * 2); ctx.fill();
  desenharChumment(ctx, m, x + 92, y + 156, 130, { alfa: m.getVida() > 0 ? 1 : 0.45 });

  // Cabeçalho
  const cx = x + 180;
  texto(ctx, m.nome, cx, y + 20, { tamanho: 24 });
  let ex = cx;
  ex += etiqueta(ctx, m.getElementoInerente(), ex, y + 52, cor) + 6;
  ex += etiqueta(ctx, `Nv ${m.getNivel()}`, ex, y + 52, CORES.borda) + 6;
  for (const estado of m.getEstados()) ex += etiqueta(ctx, estado, ex, y + 52, CORES_ESTADO[estado]) + 6;
  if (m.getVida() <= 0) etiqueta(ctx, 'Desmaiado', ex, y + 52, CORES.vidaBaixa);

  // Vida e experiência
  const larguraBarra = w - (cx - x) - 24;
  const fv = m.getVida() / m.getVidaMaxima();
  texto(ctx, 'Vida', cx, y + 86, { tamanho: 14, cor: CORES.fraco });
  texto(ctx, `${m.getVida()} / ${m.getVidaMaxima()}`, cx + larguraBarra, y + 86, { tamanho: 14, alinhar: 'right' });
  barra(ctx, cx, y + 104, larguraBarra, 14, fv, corVida(fv));
  const maximo = m.getNivel() >= 30;
  texto(ctx, 'Experiência', cx, y + 126, { tamanho: 14, cor: CORES.fraco });
  texto(ctx, maximo ? 'Nível máximo' : `${m.getExperiencia()} / ${xpParaProximoNivel(m)}`, cx + larguraBarra, y + 126, { tamanho: 14, alinhar: 'right' });
  barra(ctx, cx, y + 144, larguraBarra, 10, maximo ? 1 : m.getExperiencia() / xpParaProximoNivel(m), CORES.xp);

  // Atributos
  const atributos: [string, number][] = [
    ['Ataque', m.getAtaque()], ['Defesa', m.getDefesa()],
    ['Velocidade', m.getVelocidade()], ['Precisão', m.getPrecisao()],
  ];
  const ay = y + 180;
  const coluna = (w - 48) / 4;
  atributos.forEach(([nome, valor], i) => {
    const ax = x + 24 + i * coluna;
    texto(ctx, nome, ax, ay, { tamanho: 13, cor: CORES.fraco });
    texto(ctx, String(valor), ax, ay + 16, { tamanho: 22 });
  });

  // Ataques
  ctx.fillStyle = 'rgba(39,55,90,0.18)';
  ctx.fillRect(x + 20, ay + 54, w - 40, 2);
  texto(ctx, 'Ataques', x + 24, ay + 64, { tamanho: 14, cor: CORES.fraco });
  m.getAtaques().forEach((a, i) => {
    const ly = ay + 86 + i * 28;
    ctx.fillStyle = CORES_ELEMENTO[a.getElemento()];
    ctx.beginPath(); ctx.arc(x + 32, ly + 10, 6, 0, Math.PI * 2); ctx.fill();
    texto(ctx, a.getNome() + (a.isMultiTargetAtaque() ? '  (todos)' : ''), x + 46, ly, { tamanho: 17, larguraMax: w - 250 });
    texto(ctx, `Poder ${a.getPoderBase()}`, x + w - 120, ly + 2, { tamanho: 14, cor: CORES.fraco, alinhar: 'right' });
    texto(ctx, `PP ${a.getPPAtual()}/${a.getPPMaximo()}`, x + w - 24, ly + 2, { tamanho: 14, cor: a.temPP() ? CORES.texto : CORES.vidaBaixa, alinhar: 'right' });
  });
}
