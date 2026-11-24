import type { DefinicaoMapa } from '../tipos';

const loja: DefinicaoMapa = {
  id: 'loja',
  nome: 'Loja',
  imagem: 'loja.jpg',
  tamanhoPersonagem: 125,

  entradas: {
    entrada: { x: 768, y: 905, direcao: 'cima' },
  },

  portais: [
    { area: { x: 670, y: 955, w: 195, h: 30 }, destino: 'cidade', entrada: 'loja' },
  ],

  areasAndaveis: [
    { x: 110, y: 290, w: 1320, h: 648 },  // piso
    { x: 670, y: 930, w: 195, h: 55 },    // tapete de saída
  ],

  colisoes: [
    { x: 120, y: 290, w: 95, h: 55 },     // planta
    { x: 385, y: 290, w: 95, h: 20 },     // prateleira do fundo
    { x: 475, y: 290, w: 585, h: 142 },   // balcão
    { x: 1135, y: 290, w: 165, h: 32 },   // prateleira do fundo
    { x: 1330, y: 290, w: 90, h: 55 },    // planta
    { x: 352, y: 470, w: 243, h: 268 },   // gôndola esquerda
    { x: 940, y: 470, w: 248, h: 268 },   // gôndola direita
    { x: 110, y: 395, w: 28, h: 350 },    // prateleira lateral
    { x: 1400, y: 395, w: 30, h: 350 },   // prateleira lateral
  ],

  npcs: [
    {
      // O vendedor já está desenhado na imagem (atrás do balcão): sem "aparencia".
      tipo: 'loja',
      id: 'loja_vendedor',
      nome: 'Vendedor',
      x: 765, y: 300,
      areaInteracao: { x: 540, y: 428, w: 450, h: 85 },
      itens: ['Capturador Comum', 'Capturador Avançado', 'Capturador Supremo'],
      saudacao: ['Bem-vindo à loja! Temos capturadores para todos os bolsos.'],
      despedida: ['Volte sempre!'],
    },
  ],
};

export default loja;
