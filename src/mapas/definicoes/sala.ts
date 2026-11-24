import type { DefinicaoMapa } from '../tipos';

const sala: DefinicaoMapa = {
  id: 'sala',
  nome: 'Casa — Sala',
  imagem: 'sala.jpg',
  tamanhoPersonagem: 120,

  entradas: {
    entrada: { x: 770, y: 905, direcao: 'cima' },  // vindo da vila
    escada: { x: 750, y: 300, direcao: 'baixo' },  // vindo do quarto
  },

  portais: [
    { area: { x: 690, y: 955, w: 160, h: 30 }, destino: 'cidade', entrada: 'casa' },
    { area: { x: 690, y: 190, w: 120, h: 32 }, destino: 'quarto', entrada: 'porta' },
  ],

  areasAndaveis: [
    { x: 45, y: 225, w: 1450, h: 692 },  // piso
    { x: 690, y: 190, w: 120, h: 40 },   // porta de cima
    { x: 690, y: 910, w: 160, h: 75 },   // tapete de saída
  ],

  colisoes: [
    { x: 60, y: 225, w: 100, h: 100 },    // planta
    { x: 1028, y: 225, w: 420, h: 95 },   // estante
    { x: 450, y: 445, w: 150, h: 300 },   // sofá esquerdo
    { x: 675, y: 495, w: 185, h: 205 },   // mesa
    { x: 936, y: 445, w: 152, h: 300 },   // sofá direito
    { x: 1385, y: 800, w: 95, h: 100 },   // planta
  ],

  interacoes: [
    { area: { x: 1028, y: 225, w: 420, h: 95 }, tipo: 'mensagem', texto: ['Livros sobre chumments e reações elementais.', '"Água sobre Fogo vira Vaporização: a defesa do alvo cai."'] },
  ],
};

export default sala;
