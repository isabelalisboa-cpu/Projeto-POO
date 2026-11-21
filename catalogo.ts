// =====================================================================
// CATÁLOGO: liga os NOMES usados pelo jogo (saves, mapas, config) aos
// objetos e classes do chuments.ts.
// Ao criar um chumment ou item novo no chuments.ts, registre-o aqui.
// =====================================================================
import {
  Amperell, Ataque, CapturadorAvancado, CapturadorComum, CapturadorSupremo, Celestina,
  Electrusa, Elemento, Estado, Fizzarolly, FizzyJr, Flareperor, Frilizard, Glaceow, Glacielle,
  GramaAlta, Hurrihawk, Item, ItemCaptura, Jellerinna, Katanlisk, Lithoscorp, Lumi, Lumiel,
  Monstrinho, Ocelly, PocaoAvancada, PocaoInicial, PocaoIntermediaria, Rockpion, Shadenight,
  TabelaEfetividade, Treinador, Verdalisk, Vitalizador, VitalizadorSupremo, Zephyling,
} from '../chuments';
import { inteiroAleatorio } from '../motor/geometria';

// --- Espécies ---------------------------------------------------------
/** nome do chumment -> como criar um (o nível é opcional). */
export const ESPECIES: Record<string, (nivel?: number) => Monstrinho> = {
  'Frilizard': (n) => new Frilizard(n), 'Flareperor': (n) => new Flareperor(n),
  'Ocelly': (n) => new Ocelly(n), 'Jellerinna': (n) => new Jellerinna(n),
  'Verdalisk': (n) => new Verdalisk(n), 'Katanlisk': (n) => new Katanlisk(n),
  'Lithoscorp': (n) => new Lithoscorp(n), 'Rockpion': (n) => new Rockpion(n),
  'Amperell': (n) => new Amperell(n), 'Electrusa': (n) => new Electrusa(n),
  'Zephyling': (n) => new Zephyling(n), 'Hurrihawk': (n) => new Hurrihawk(n),
  'Glaceow': (n) => new Glaceow(n), 'Glacielle': (n) => new Glacielle(n),
  'Fizzy Jr.': (n) => new FizzyJr(n), 'Fizzarolly': (n) => new Fizzarolly(n),
  'Lumi': (n) => new Lumi(n), 'Celestina': (n) => new Celestina(n),
  'Lumiel': (n) => new Lumiel(n), 'Shadenight': (n) => new Shadenight(n),
};

export function criarEspecie(nome: string, nivel?: number): Monstrinho {
  const fabrica = ESPECIES[nome];
  if (!fabrica) throw new Error(`Chumment desconhecido: "${nome}". Registre-o em jogo/catalogo.ts.`);
  return fabrica(nivel);
}

// --- Elementos e estados ---------------------------------------------
export const CORES_ELEMENTO: Record<Elemento, string> = {
  [Elemento.FOGO]: '#e8552d', [Elemento.AGUA]: '#3d8bea', [Elemento.PLANTA]: '#4cab4a',
  [Elemento.PEDRA]: '#9a8468', [Elemento.ELETRICO]: '#e6b91e', [Elemento.GELO]: '#5fc3de',
  [Elemento.VENTO]: '#6fc7a6', [Elemento.MISTICO]: '#b05fd6', [Elemento.LUZ]: '#d9bd45',
  [Elemento.ESCURIDAO]: '#5a4a7e',
};

export const CORES_ESTADO: Record<Estado, string> = {
  [Estado.NORMAL]: '#8a93a8', [Estado.CONGELADO]: '#5fc3de', [Estado.DORMINDO]: '#7c86b8',
  [Estado.CONFUSO]: '#c56fd0', [Estado.LAMA]: '#8a6a45', [Estado.QUEIMADO]: '#e8552d',
  [Estado.SANGRANDO]: '#c2334a',
};

export function efetividade(ataque: Elemento, defensor: Elemento): number {
  return TabelaEfetividade[ataque]?.[defensor] ?? 1;
}

/** Mesma conta de Monstrinho.ganharExperiencia(): XP para sair do nível atual. */
export function xpParaProximoNivel(m: Monstrinho): number {
  return 5 * (m.getNivel() + 1);
}

// --- Itens ------------------------------------------------------------
export type UsoItem =
  | 'cura'        // escolhe um chumment vivo e ferido
  | 'pp-ataque'   // escolhe um chumment e depois um ataque
  | 'pp-todos'    // escolhe um chumment
  | 'captura';    // só em batalha, contra selvagens

export interface InfoItem { item: Item; uso: UsoItem; descricao: string }

/** A ordem desta lista é a ordem em que os itens aparecem na mochila. */
export const ITENS: InfoItem[] = [
  { item: PocaoInicial, uso: 'cura', descricao: 'Recupera 10 de vida de um chumment.' },
  { item: PocaoIntermediaria, uso: 'cura', descricao: 'Recupera 20 de vida de um chumment.' },
  { item: PocaoAvancada, uso: 'cura', descricao: 'Recupera 40 de vida de um chumment.' },
  { item: Vitalizador, uso: 'pp-ataque', descricao: 'Restaura todo o PP de um ataque.' },
  { item: VitalizadorSupremo, uso: 'pp-todos', descricao: 'Restaura o PP de todos os ataques de um chumment.' },
  { item: CapturadorComum, uso: 'captura', descricao: 'Captura chumments selvagens. Bônus x1,0.' },
  { item: CapturadorAvancado, uso: 'captura', descricao: 'Captura chumments selvagens. Bônus x1,5.' },
  { item: CapturadorSupremo, uso: 'captura', descricao: 'Captura chumments selvagens. Bônus x2,0.' },
];

export function infoItem(nome: string): InfoItem | undefined {
  return ITENS.find((i) => i.item.nome === nome);
}

/** Agrupa a mochila (lista solta de itens) em "item x quantidade". */
export function contarMochila(mochila: Item[]): { info: InfoItem; quantidade: number }[] {
  return ITENS
    .map((info) => ({ info, quantidade: mochila.filter((i) => i === info.item).length }))
    .filter((g) => g.quantidade > 0);
}

export function ehCapturador(item: Item): item is ItemCaptura {
  return item instanceof ItemCaptura;
}

// --- Utilidades sobre a equipe ---------------------------------------
export function vivos(lista: Monstrinho[]): Monstrinho[] {
  return lista.filter((m) => m.getVida() > 0);
}

/** Os dois primeiros chumments de pé são os que entram em campo. */
export function definirAtivos(t: Treinador): void {
  t.ativos = vivos(t.equipe).slice(0, 2);
}

/** Recupera vida, PP e limpa estados de toda a equipe. */
export function recuperarEquipe(t: Treinador): void {
  for (const m of t.equipe) {
    m.resetarAposBatalha();
    m.curar(m.getVidaMaxima());
    m.restaurarTodosPP();
  }
  definirAtivos(t);
}

/** Executa algo sem que os console.log do chuments.ts apareçam (ex.: preparar selvagens). */
export function emSilencio<T>(fn: () => T): T {
  const original = console.log;
  console.log = () => {};
  try { return fn(); } finally { console.log = original; }
}

// --- Chumments selvagens ---------------------------------------------
const grama = new GramaAlta();

/**
 * Sorteia um selvagem com GramaAlta.explorar() (sempre nível 1) e o leva até o
 * nível desejado usando o próprio ganharExperiencia(), para que atributos e
 * ataques cresçam exatamente como os de um chumment do jogador.
 */
export function criarSelvagem(niveis: [number, number]): Monstrinho {
  const m = grama.explorar();
  const alvo = inteiroAleatorio(Math.min(...niveis), Math.max(...niveis));
  emSilencio(() => {
    while (m.getNivel() < alvo && m.getNivel() < 30) {
      m.ganharExperiencia(Math.max(1, xpParaProximoNivel(m) - m.getExperiencia()));
      if (m.getAtaquePendente()) {
        if (Math.random() < 0.6) m.resolverAtaquePendente(inteiroAleatorio(0, m.getAtaques().length - 1));
        else m.cancelarAtaquePendente();
      }
    }
  });
  return m;
}

/** Golpe de emergência quando nenhum ataque tem PP. */
export function criarEsforco(m: Monstrinho): Ataque {
  return new Ataque('Esforço', 30, 100, 1, m.getElementoInerente());
}
