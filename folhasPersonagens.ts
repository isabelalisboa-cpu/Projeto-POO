// =====================================================================
// FOLHAS DE SPRITES DOS PERSONAGENS (jogador e NPCs)
// Cada PNG fica em public/assets/personagens/ e segue um formato fixo:
//   - cada LINHA é uma direção (na ordem informada em "linhas");
//   - a COLUNA 0 é a pose parada; as colunas 1, 2, 3... são os quadros andando;
//   - todos os quadros têm o mesmo tamanho, com a figura apoiada na base.
// Para um personagem novo: salve o PNG na pasta, registre-o aqui e use a
// chave em "sprite" no NPC do mapa (ou em config.ts -> spritesJogador).
// =====================================================================
import type { Direcao } from '../mapas/tipos';

export interface FolhaPersonagem {
  arquivo: string;
  larguraQuadro: number;
  alturaQuadro: number;
  /** Direção de cada linha, de cima para baixo. Pode ter só algumas (ex.: esquerda e direita). */
  linhas: Direcao[];
  /** Quantos quadros de caminhada cada direção tem (colunas 1..n). Vazio = personagem parado. */
  andando: Partial<Record<Direcao, number>>;
}

const QUATRO: Direcao[] = ['baixo', 'esquerda', 'direita', 'cima'];
const LADOS: Direcao[] = ['esquerda', 'direita'];
const FRENTE: Direcao[] = ['baixo'];

export const FOLHAS: Record<string, FolhaPersonagem> = {
  // Protagonistas (TreinadorPrincipal.png e TreinadoraPrincipal.png)
  jovem: { arquivo: 'jovem.png', larguraQuadro: 130, alturaQuadro: 180, linhas: QUATRO, andando: { baixo: 3, esquerda: 3, direita: 3, cima: 3 } },
  treinadora: { arquivo: 'treinadora.png', larguraQuadro: 148, alturaQuadro: 178, linhas: QUATRO, andando: { baixo: 4, esquerda: 3, direita: 3, cima: 4 } },

  // A mãe do protagonista (MaeDoMC.png) e os quatro líderes (GrandeQuatro.png): só de frente
  mae: { arquivo: 'mae.png', larguraQuadro: 107, alturaQuadro: 178, linhas: FRENTE, andando: {} },
  lider_marina: { arquivo: 'lider_marina.png', larguraQuadro: 118, alturaQuadro: 178, linhas: FRENTE, andando: {} },
  lider_rogerio: { arquivo: 'lider_rogerio.png', larguraQuadro: 124, alturaQuadro: 178, linhas: FRENTE, andando: {} },
  lider_kaito: { arquivo: 'lider_kaito.png', larguraQuadro: 94, alturaQuadro: 178, linhas: FRENTE, andando: {} },
  lider_selene: { arquivo: 'lider_selene.png', larguraQuadro: 120, alturaQuadro: 178, linhas: FRENTE, andando: {} },

  // Treinadores da rota (TreinadoresRetro.png): quatro visuais, só de perfil
  treinador_vermelho: { arquivo: 'treinador_vermelho.png', larguraQuadro: 127, alturaQuadro: 178, linhas: LADOS, andando: {} },
  treinadora_rosa: { arquivo: 'treinadora_rosa.png', larguraQuadro: 146, alturaQuadro: 178, linhas: LADOS, andando: {} },
  treinador_azul: { arquivo: 'treinador_azul.png', larguraQuadro: 123, alturaQuadro: 178, linhas: LADOS, andando: {} },
  treinadora_verde: { arquivo: 'treinadora_verde.png', larguraQuadro: 127, alturaQuadro: 178, linhas: LADOS, andando: {} },
};
