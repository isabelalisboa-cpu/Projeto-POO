// =====================================================================
// SPRITES DOS CHUMMENTS
// Cada chumment é associado a um PNG pelo seu NOME (campo "nome"):
//     public/assets/chumments/<nome>.png      ex.: Frilizard.png
// Enquanto o PNG não existir, o jogo desenha um substituto colorido
// pelo elemento. Basta soltar os arquivos na pasta: não há código a mudar.
// =====================================================================
import type { Elemento } from '../chuments';
import { CONFIG } from '../config';
import { urlRecurso } from '../motor/recursos';
import { CORES_ELEMENTO } from './catalogo';

interface Registro { imagem: HTMLImageElement | null; estado: 'carregando' | 'pronto' | 'ausente' }
const cache = new Map<string, Registro>();

/**
 * Nomes de arquivo aceitos para um chumment, em ordem de tentativa.
 * "Fizzy Jr." -> "Fizzy Jr..png", "Fizzy Jr.png", "FizzyJr.png", e as versões em minúsculas.
 */
export function arquivosPossiveis(nome: string): string[] {
  const semPontoFinal = nome.replace(/\.+$/, '');
  const compacto = nome.replace(/[\s.]+/g, '');
  const lista = [
    CONFIG.arquivosSprites[nome],
    `${nome}.png`, `${semPontoFinal}.png`, `${compacto}.png`,
    `${nome.toLowerCase()}.png`, `${semPontoFinal.toLowerCase()}.png`, `${compacto.toLowerCase()}.png`,
  ].filter((a): a is string => !!a);
  return [...new Set(lista)];
}

function carregar(nome: string): Registro {
  const registro: Registro = { imagem: null, estado: 'carregando' };
  cache.set(nome, registro);
  const candidatos = arquivosPossiveis(nome);
  const tentar = (i: number): void => {
    if (i >= candidatos.length) { registro.estado = 'ausente'; return; }
    const img = new Image();
    img.onload = () => { registro.imagem = img; registro.estado = 'pronto'; };
    img.onerror = () => tentar(i + 1);
    img.src = urlRecurso(CONFIG.pastaSprites + encodeURIComponent(candidatos[i]));
  };
  tentar(0);
  return registro;
}

/** PNG do chumment, ou null se ainda não carregou / não existe. */
export function spriteDe(nome: string): HTMLImageElement | null {
  return (cache.get(nome) ?? carregar(nome)).imagem;
}

export interface OpcoesSprite { espelhar?: boolean; alfa?: number }

/**
 * Desenha o chumment com a base em (cx, base) dentro de um quadrado de lado "tamanho".
 * Aceita um Monstrinho ou qualquer objeto com nome + elemento.
 */
export function desenharChumment(
  ctx: CanvasRenderingContext2D,
  chumment: { nome: string; getElementoInerente(): Elemento },
  cx: number, base: number, tamanho: number, opcoes: OpcoesSprite = {},
): void {
  const img = spriteDe(chumment.nome);
  ctx.save();
  ctx.globalAlpha *= opcoes.alfa ?? 1;
  ctx.translate(cx, base);
  if (opcoes.espelhar) ctx.scale(-1, 1);

  if (img) {
    const escala = Math.min(tamanho / img.width, tamanho / img.height);
    const w = img.width * escala, h = img.height * escala;
    ctx.imageSmoothingEnabled = escala < 1; // pixel art ampliada fica nítida
    ctx.drawImage(img, -w / 2, -h, w, h);
  } else {
    desenharSubstituto(ctx, chumment.nome, CORES_ELEMENTO[chumment.getElementoInerente()], tamanho, !!opcoes.espelhar);
  }
  ctx.restore();
}

/** Bichinho genérico usado enquanto o PNG do chumment não foi adicionado. */
function desenharSubstituto(ctx: CanvasRenderingContext2D, nome: string, cor: string, t: number, espelhado: boolean): void {
  const r = t * 0.36;
  ctx.fillStyle = '#1d2540';
  ctx.beginPath(); ctx.ellipse(0, -r * 0.95, r * 1.08, r * 1.02, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.ellipse(0, -r * 0.95, r, r * 0.94, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 1.4, r * 0.38, r * 0.22, -0.5, 0, Math.PI * 2); ctx.fill();
  // olhos
  for (const lado of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(lado * r * 0.36, -r * 0.98, r * 0.2, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d2540';
    ctx.beginPath(); ctx.ellipse(lado * r * 0.36 + r * 0.06, -r * 0.95, r * 0.1, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  }
  // inicial do nome
  ctx.save();
  if (espelhado) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `700 ${Math.round(r * 0.5)}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(nome.charAt(0).toUpperCase(), 0, -r * 0.42);
  ctx.restore();
}
