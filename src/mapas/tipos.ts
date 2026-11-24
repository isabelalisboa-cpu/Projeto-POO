import type { Ret } from '../motor/geometria';
export type { Ret };

export type Direcao = 'cima' | 'baixo' | 'esquerda' | 'direita';

/** Ponto onde o jogador aparece ao chegar no mapa. (x, y) = pés do personagem. */
export interface Entrada { x: number; y: number; direcao: Direcao }

/** Área que, ao ser tocada, leva o jogador para outro mapa. */
export interface Portal {
  area: Ret;
  /** id do mapa de destino. */
  destino: string;
  /** nome da entrada (em "entradas" do mapa de destino). */
  entrada: string;
}

/** Cores do personagem desenhado pelo jogo (sem imagem). */
export interface Aparencia {
  cabelo: string;
  pele: string;
  roupa: string;
  calca: string;
  cabeloLongo?: boolean;
}

interface NPCBase {
  id: string;
  nome: string;
  /** Pés do NPC, em pixels da imagem do mapa. */
  x: number;
  y: number;
  direcao?: Direcao;
  /**
    * Folha de sprites do NPC: chave em jogo/folhasPersonagens.ts (ex.: 'treinador_azul').
    * Sem "sprite" e sem "aparencia", o NPC já faz parte da imagem do mapa
    * (ex.: atendente atrás do balcão) e "areaInteracao" é obrigatória.
   */
  sprite?: string;
  /** Alternativa sem imagem: personagem desenhado por código com estas cores. */
  aparencia?: Aparencia;
  /** Tamanho em relação aos outros personagens do mapa (padrão 1). Ex.: 1.15 para um adulto. */
    escala?: number;
  /** O NPC só aparece depois que todos estes treinadores (ids) forem vencidos. */
  requer?: string[];
  /** O NPC deixa de aparecer depois que todos estes treinadores (ids) forem vencidos. */
  someApos?: string[];
  /** Onde o jogador precisa estar para conversar. Padrão: perto do NPC. */
  areaInteracao?: Ret;
}

/** Vende itens. "itens" são os nomes dos itens do chuments.ts. */
export interface NPCLoja extends NPCBase {
  tipo: 'loja';
  itens: string[];
  saudacao: string[];
  despedida: string[];
  /** true = também cura a equipe de graça (classe Hospital do chuments.ts). */
  cura?: boolean;
}

/** Treinador que batalha. "idTreinador" é o id em criarNPCs() do chuments.ts. */
export interface NPCTreinador extends NPCBase {
  tipo: 'treinador';
  idTreinador: string;
  falaDerrotado: string[];
  /** true = chefe final: vencê-lo mostra a tela de parabéns. */
  chefeFinal?: boolean;
}

export interface NPCFala extends NPCBase {
  tipo: 'fala';
  falas: string[];
}

export type NPC = NPCLoja | NPCTreinador | NPCFala;

/** Objeto do cenário com que o jogador interage (Enter/Espaço). */
export type Interacao = { area: Ret } & (
  | { tipo: 'mensagem'; texto: string[] }
  /** Recupera vida e PP de toda a equipe. */
  | { tipo: 'descansar' }
  /** Abre o armazenamento de chumments. */
  | { tipo: 'pc' }
);

export interface Encontros {
  /** Áreas de grama alta. */
  zonas: Ret[];
  /** Chance de encontro a cada "passo" (uma altura de personagem) dentro da grama. */
  chancePorPasso: number;
  /** Nível mínimo e máximo dos chumments selvagens. */
  niveis: [number, number];
}

export interface DefinicaoMapa {
  id: string;
  /** Nome exibido ao entrar. */
  nome: string;
  /** Arquivo dentro de public/assets/mapas/. */
  imagem: string;
  /** Altura do personagem neste mapa, em pixels da imagem (cada arte tem um "zoom"). */
  tamanhoPersonagem: number;
  entradas: Record<string, Entrada>;
  portais: Portal[];
  /**
   * Opcional: se informado, o jogador SÓ anda dentro destes retângulos
   * (prático para interiores e praças). Sem isso, anda na imagem toda.
   */
  areasAndaveis?: Ret[];
  /** Retângulos bloqueados (móveis, casas, cercas, árvores). */
  colisoes: Ret[];
  npcs?: NPC[];
  interacoes?: Interacao[];
  encontros?: Encontros;
}
