import type { Treinador } from '../chuments';
import type { Direcao } from '../mapas/tipos';
import { PilhaCenas } from '../motor/cena';
import type { Entrada } from '../motor/entrada';
import type { Tela } from '../motor/tela';

/** Tudo o que define uma partida em andamento (é isto que o save guarda). */
export interface EstadoJogo {
  treinador: Treinador;
  mapa: string;
  x: number;
  y: number;
  direcao: Direcao;
  /** ids (DadosNPC.id) dos treinadores já vencidos. */
  npcsDerrotados: Set<string>;
}

/** Contexto global do jogo. */
export const jogo = {
  tela: null as unknown as Tela,
  entrada: null as unknown as Entrada,
  cenas: new PilhaCenas(),
  estado: null as EstadoJogo | null,
  /** F2 liga/desliga: mostra colisões, portais e coordenadas do mouse. */
  depurar: false,
};

export function estado(): EstadoJogo {
  if (!jogo.estado) throw new Error('Nenhuma partida carregada.');
  return jogo.estado;
}
