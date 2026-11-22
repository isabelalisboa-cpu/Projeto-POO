// =====================================================================
// TREINADORES
// Os treinadores (nome, equipe, prêmio, fala e dificuldade) são os de
// criarNPCs() do chuments.ts. Este arquivo só ajuda o jogo a encontrá-los.
// Um NPC do mapa aponta para um deles pelo "idTreinador".
// =====================================================================
import { criarNPCs, type DadosNPC, Dificuldade } from '../chuments';

/** Dados novos do treinador (a equipe vem sempre inteira, pronta para uma nova batalha). */
export function obterTreinador(id: string): DadosNPC | undefined {
  return criarNPCs().find((n) => n.id === id);
}

export function existeTreinador(id: string): boolean {
  return IDS.includes(id);
}

export function idsPorDificuldade(dificuldade: Dificuldade): string[] {
  return criarNPCs().filter((n) => n.dificuldade === dificuldade).map((n) => n.id);
}

/** Ids de todos os treinadores do chuments.ts. */
export const IDS: string[] = criarNPCs().map((n) => n.id);

/** Os quatro líderes (dificuldade Média): a mãe só aparece na Arena depois que todos forem vencidos. */
export const LIDERES: string[] = idsPorDificuldade(Dificuldade.MEDIO);
