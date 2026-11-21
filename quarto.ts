import type { DefinicaoMapa } from '../tipos';

// Imagem de 1600 x 900.
const quarto: DefinicaoMapa = {
  id: 'quarto',
  nome: 'Casa — Quarto',
  imagem: 'quarto.jpg',
  tamanhoPersonagem: 120,

  entradas: {
    inicio: { x: 480, y: 580, direcao: 'baixo' },  // novo jogo: ao lado da cama
    porta: { x: 800, y: 772, direcao: 'cima' },    // vindo da sala
  },

  portais: [
    { area: { x: 725, y: 818, w: 150, h: 28 }, destino: 'sala', entrada: 'escada' },
  ],

  areasAndaveis: [
    { x: 152, y: 268, w: 1296, h: 530 },  // piso
    { x: 725, y: 790, w: 150, h: 56 },    // tapete de saída
  ],

  colisoes: [
    { x: 162, y: 268, w: 165, h: 70 },    // estante
    { x: 345, y: 268, w: 275, h: 72 },    // escrivaninha
    { x: 378, y: 300, w: 95, h: 52 },     // cadeira
    { x: 990, y: 268, w: 178, h: 70 },    // TV
    { x: 1335, y: 268, w: 90, h: 78 },    // planta
    { x: 197, y: 420, w: 190, h: 272 },   // cama
  ],

  interacoes: [
    { area: { x: 197, y: 420, w: 190, h: 272 }, tipo: 'descansar' },
    { area: { x: 345, y: 268, w: 275, h: 84 }, tipo: 'pc' },
    { area: { x: 990, y: 268, w: 178, h: 70 }, tipo: 'mensagem', texto: ['Na TV passa um documentário: "Os chumments e seus elementos".'] },
  ],
};

export default quarto;
