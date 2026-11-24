import type { DefinicaoMapa } from '../tipos';

const rota1: DefinicaoMapa = {
  id: 'rota1',
  nome: 'Rota 1',
  imagem: 'rota1.jpg',
  tamanhoPersonagem: 68,

  entradas: {
    sul: { x: 770, y: 962, direcao: 'cima' },    // vindo da vila
    norte: { x: 770, y: 62, direcao: 'baixo' },  // vindo do ginásio
  },

  portais: [
    { area: { x: 715, y: 1004, w: 110, h: 20 }, destino: 'cidade', entrada: 'norte' },
    { area: { x: 700, y: 0, w: 140, h: 16 }, destino: 'ginasio', entrada: 'sul' },
  ],

  colisoes: [
    // Árvores
    { x: 0, y: 0, w: 100, h: 1024 },
    { x: 1440, y: 0, w: 96, h: 1024 },
    { x: 0, y: 900, w: 715, h: 124 },
    { x: 825, y: 900, w: 711, h: 124 },
    // Cercas e canteiros de cima
    { x: 100, y: 15, w: 555, h: 55 },
    { x: 895, y: 15, w: 545, h: 55 },
    // Cercas laterais
    { x: 115, y: 130, w: 30, h: 325 },
    { x: 115, y: 495, w: 30, h: 350 },
    { x: 1398, y: 130, w: 28, h: 325 },
    { x: 1398, y: 515, w: 28, h: 335 },
    // Cercas e canteiros de baixo
    { x: 110, y: 845, w: 535, h: 50 },
    { x: 912, y: 845, w: 515, h: 50 },
  ],

  encontros: {
    zonas: [
      { x: 190, y: 95, w: 450, h: 235 },
      { x: 895, y: 95, w: 450, h: 235 },
      { x: 190, y: 520, w: 450, h: 290 },
      { x: 895, y: 520, w: 450, h: 290 },
    ],
    chancePorPasso: 0.14,
    niveis: [1, 3],
  },

  npcs: [
    {
      tipo: 'treinador',
      id: 'rota1_gary',
      idTreinador: 'npc_jovem',
      nome: 'Jovem Gary',
      x: 1290, y: 446, direcao: 'esquerda',
      aparencia: { cabelo: '#c9772b', pele: '#f2c9a0', roupa: '#3d7fd9', calca: '#3b3f57' },
      falaDerrotado: ['Você luta bem! Vou treinar mais na grama alta.'],
    },
  ],
};

export default rota1;
