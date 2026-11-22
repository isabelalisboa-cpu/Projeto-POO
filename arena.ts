import type { DefinicaoMapa } from '../tipos';
import { LIDERES } from '../../jogo/treinadores';

const arena: DefinicaoMapa = {
  id: 'arena',
  nome: 'Liga — Arena',
  imagem: 'arena.jpg',
  tamanhoPersonagem: 105,

  entradas: {
    sul: { x: 768, y: 965, direcao: 'cima' },
  },

  portais: [
    { area: { x: 655, y: 1004, w: 225, h: 20 }, destino: 'recepcao', entrada: 'arena' },
  ],

  // As arquibancadas são inclinadas: os corredores laterais são aproximados em degraus.
  areasAndaveis: [
    { x: 655, y: 790, w: 225, h: 234 },    // tapete de entrada
    { x: 170, y: 750, w: 1200, h: 100 },   // piso entre a grade e o palco
    { x: 640, y: 660, w: 255, h: 135 },    // escada do palco
    { x: 390, y: 350, w: 760, h: 320 },    // palco
    { x: 302, y: 255, w: 932, h: 72 },     // faixa atrás do palco
    // corredor esquerdo
    { x: 302, y: 255, w: 62, h: 150 },
    { x: 252, y: 400, w: 93, h: 105 },
    { x: 216, y: 500, w: 108, h: 105 },
    { x: 180, y: 600, w: 122, h: 155 },
    // corredor direito
    { x: 1170, y: 255, w: 64, h: 150 },
    { x: 1192, y: 400, w: 93, h: 105 },
    { x: 1213, y: 500, w: 108, h: 105 },
    { x: 1236, y: 600, w: 122, h: 155 },
  ],

  colisoes: [],

  npcs: [
    // Os quatro líderes (dificuldade Média em criarNPCs) ficam nos cantos do palco
    // e podem ser desafiados em qualquer ordem. Sprites: GrandeQuatro.png.
    { tipo: 'treinador', id: 'arena_marina', idTreinador: 'npc_marina', nome: 'Nadadora Marina',
      x: 500, y: 470, sprite: 'lider_marina',
      falaDerrotado: ['Você nadou contra a corrente... e venceu. Boa batalha!'] },
    { tipo: 'treinador', id: 'arena_rogerio', idTreinador: 'npc_rogerio', nome: 'Montanhista Rogério',
      x: 1040, y: 470, sprite: 'lider_rogerio',
      falaDerrotado: ['Essa foi a montanha mais alta que já enfrentei.'] },
    { tipo: 'treinador', id: 'arena_kaito', idTreinador: 'npc_kaito', nome: 'Ninja Kaito',
      x: 500, y: 640, sprite: 'lider_kaito',
      falaDerrotado: ['...Você me viu chegando. Impressionante.'] },
    { tipo: 'treinador', id: 'arena_selene', idTreinador: 'npc_selene', nome: 'Mística Selene',
      x: 1040, y: 640, sprite: 'lider_selene',
      falaDerrotado: ['As estrelas erraram desta vez. Ou talvez tenham acertado...'] },

    // A campeã (a mãe do protagonista) só aparece depois dos quatro líderes.
    // É a chefe final: vencê-la mostra a tela de parabéns. Sprite: MaeDoMC.png.
    { tipo: 'treinador', id: 'arena_mae', idTreinador: 'npc_mae', nome: 'Mamãe',
      x: 768, y: 430, sprite: 'mae', escala: 1.12,
      requer: LIDERES, chefeFinal: true,
      falaDerrotado: ['Que batalha, {nome}! A mamãe não tem mais nada a te ensinar. Tenho muito orgulho de você!'] },
  ],

  interacoes: [
    { area: { x: 640, y: 240, w: 255, h: 20 }, tipo: 'mensagem', texto: ['A escada leva ao salão dos campeões. Só a campeã tem a chave.'] },
  ],
};

export default arena;
