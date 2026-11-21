// =====================================================================
// SALVAMENTO (localStorage)
// Guarda: jogador (nome, dinheiro, posição), itens da mochila, chumments
// da equipe e do armazenamento com TODOS os atributos atuais, e os
// treinadores já vencidos.
// =====================================================================
import { Ataque, Elemento, Monstrinho, Treinador } from '../chuments';
import { CONFIG } from '../config';
import type { Direcao } from '../mapas/tipos';
import { MAPAS } from '../mapas/registro';
import { contarMochila, criarEspecie, definirAtivos, emSilencio, infoItem } from './catalogo';
import type { EstadoJogo } from './jogo';

interface AtaqueSalvo {
  nome: string; poder: number; precisao: number; ppMaximo: number; pp: number;
  elemento: Elemento; multi: boolean;
}

interface ChummentSalvo {
  especie: string;
  nivel: number; experiencia: number;
  vida: number; vidaMaxima: number;
  ataque: number; defesa: number; velocidade: number; precisao: number;
  ataques: AtaqueSalvo[];
  pendente: AtaqueSalvo | null;
}

export interface Save {
  versao: 1;
  salvoEm: string;
  nome: string; sexo: string; dinheiro: number;
  mapa: string; x: number; y: number; direcao: Direcao;
  mochila: Record<string, number>;
  equipe: ChummentSalvo[];
  armazenamento: ChummentSalvo[];
  npcsDerrotados: string[];
}

/**
 * Os atributos-base de Monstrinho são "protected" e não têm setter público.
 * Para não alterar o chuments.ts, o acesso a eles fica isolado nesta interface,
 * usada apenas aqui (ler para salvar, escrever para carregar).
 */
interface CamposInternos {
  vidaMaxima: number; ataque: number; defesa: number; velocidade: number; precisao: number;
  nivel: number; ataques: Ataque[]; ataquePendente: Ataque | null;
}
const interno = (m: Monstrinho) => m as unknown as CamposInternos;

// --- Converter para dados simples ------------------------------------
function salvarAtaque(a: Ataque): AtaqueSalvo {
  return {
    nome: a.getNome(), poder: a.getPoderBase(), precisao: a.getPrecisao(),
    ppMaximo: a.getPPMaximo(), pp: a.getPPAtual(), elemento: a.getElemento(),
    multi: a.isMultiTargetAtaque(),
  };
}

function salvarChumment(m: Monstrinho): ChummentSalvo {
  const i = interno(m);
  return {
    especie: m.nome,
    nivel: m.getNivel(), experiencia: m.getExperiencia(),
    vida: m.getVida(), vidaMaxima: i.vidaMaxima,
    ataque: i.ataque, defesa: i.defesa, velocidade: i.velocidade, precisao: i.precisao,
    ataques: m.getAtaques().map(salvarAtaque),
    pendente: m.getAtaquePendente() ? salvarAtaque(m.getAtaquePendente()!) : null,
  };
}

export function gerarSave(e: EstadoJogo): Save {
  const t = e.treinador;
  const mochila: Record<string, number> = {};
  for (const g of contarMochila(t.mochila)) mochila[g.info.item.nome] = g.quantidade;
  return {
    versao: 1,
    salvoEm: new Date().toISOString(),
    nome: t.nome, sexo: t.sexo, dinheiro: t.dinheiro,
    mapa: e.mapa, x: Math.round(e.x), y: Math.round(e.y), direcao: e.direcao,
    mochila,
    equipe: t.equipe.map(salvarChumment),
    armazenamento: t.armazenamento.map(salvarChumment),
    npcsDerrotados: [...e.npcsDerrotados],
  };
}

// --- Reconstruir os objetos do chuments.ts ---------------------------
function restaurarAtaque(d: AtaqueSalvo): Ataque {
  const a = new Ataque(d.nome, d.poder, d.precisao, d.ppMaximo, d.elemento, d.multi);
  for (let gasto = d.ppMaximo - d.pp; gasto > 0; gasto--) a.consumirPP();
  return a;
}

function restaurarChumment(d: ChummentSalvo): Monstrinho {
  const m = emSilencio(() => criarEspecie(d.especie, d.nivel));
  const i = interno(m);
  i.nivel = d.nivel;
  i.vidaMaxima = d.vidaMaxima;
  i.ataque = d.ataque;
  i.defesa = d.defesa;
  i.velocidade = d.velocidade;
  i.precisao = d.precisao;
  i.ataques = d.ataques.map(restaurarAtaque);
  i.ataquePendente = d.pendente ? restaurarAtaque(d.pendente) : null;
  m.restaurarEstado(Math.max(0, Math.min(d.vida, d.vidaMaxima)), d.experiencia);
  return m;
}

export function restaurarSave(s: Save): EstadoJogo {
  const treinador = new Treinador(s.nome, s.equipe.map(restaurarChumment));
  treinador.sexo = s.sexo;
  treinador.dinheiro = s.dinheiro;
  treinador.armazenamento = s.armazenamento.map(restaurarChumment);
  for (const [nome, quantidade] of Object.entries(s.mochila)) {
    const info = infoItem(nome);
    if (!info) { console.warn(`[save] item desconhecido ignorado: ${nome}`); continue; }
    for (let i = 0; i < quantidade; i++) treinador.adicionarItem(info.item);
  }
  definirAtivos(treinador);

  // Se o mapa salvo não existir mais (foi renomeado/removido), volta ao mapa inicial.
  let { mapa, x, y, direcao } = s;
  if (!MAPAS[mapa]) {
    mapa = CONFIG.mapaInicial;
    const entrada = MAPAS[mapa].entradas[CONFIG.entradaInicial];
    x = entrada.x; y = entrada.y; direcao = entrada.direcao;
  }
  return { treinador, mapa, x, y, direcao, npcsDerrotados: new Set(s.npcsDerrotados) };
}

// --- localStorage ------------------------------------------------------
export function salvarJogo(e: EstadoJogo): boolean {
  try {
    localStorage.setItem(CONFIG.chaveSave, JSON.stringify(gerarSave(e)));
    return true;
  } catch (erro) {
    console.error('[save] falha ao salvar:', erro);
    return false;
  }
}

export function lerSave(): Save | null {
  try {
    const bruto = localStorage.getItem(CONFIG.chaveSave);
    if (!bruto) return null;
    const s = JSON.parse(bruto) as Save;
    if (s.versao !== 1 || !Array.isArray(s.equipe)) return null;
    return s;
  } catch {
    return null;
  }
}

export function carregarJogo(): EstadoJogo | null {
  const s = lerSave();
  if (!s) return null;
  try {
    return restaurarSave(s);
  } catch (erro) {
    console.error('[save] save incompatível:', erro);
    return null;
  }
}

export function apagarSave(): void {
  try { localStorage.removeItem(CONFIG.chaveSave); } catch { /* sem armazenamento disponível */ }
}
