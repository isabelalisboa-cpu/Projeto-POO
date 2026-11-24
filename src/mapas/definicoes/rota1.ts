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

  // Os oito treinadores fáceis de criarNPCs(). Sprites: os quatro visuais de TreinadoresRetro.png,
  // cada um usado por dois treinadores (um olhando para a esquerda, outro para a direita).
  npcs: [
    { tipo: 'treinador', id: 'rota1_lia', idTreinador: 'npc_lia', nome: 'Criança Lia',
      x: 742, y: 800, direcao: 'direita', sprite: 'treinadora_rosa',
      falaDerrotado: ['Ah... perdi! Mas foi divertido brincar de batalha.'] },
    { tipo: 'treinador', id: 'rota1_tiao', idTreinador: 'npc_tiao', nome: 'Pescador Tião',
      x: 800, y: 640, direcao: 'esquerda', sprite: 'treinador_azul',
      falaDerrotado: ['Nem peixe, nem vitória. Que dia!'] },
    { tipo: 'treinador', id: 'rota1_duda', idTreinador: 'npc_duda', nome: 'Campista Duda',
      x: 600, y: 458, direcao: 'direita', sprite: 'treinadora_verde',
      falaDerrotado: ['Boa batalha! Vou voltar para a barraca e treinar mais.'] },
    { tipo: 'treinador', id: 'rota1_caio', idTreinador: 'npc_caio', nome: 'Mochileiro Caio',
      x: 250, y: 458, direcao: 'direita', sprite: 'treinador_azul',
      falaDerrotado: ['Rodei o mundo todo e nunca vi ninguém lutar assim.'] },
    { tipo: 'treinador', id: 'rota1_bia', idTreinador: 'npc_bia', nome: 'Estudante Bia',
      x: 960, y: 410, direcao: 'esquerda', sprite: 'treinadora_verde',
      falaDerrotado: ['Preciso revisar a matéria de reações elementais...'] },
    { tipo: 'treinador', id: 'rota1_gary', idTreinador: 'npc_jovem', nome: 'Jovem Gary',
      x: 1290, y: 446, direcao: 'esquerda', sprite: 'treinador_vermelho',
      falaDerrotado: ['Você luta bem! Vou treinar mais na grama alta.'] },
    { tipo: 'treinador', id: 'rota1_davi', idTreinador: 'npc_davi', nome: 'Menino Davi',
      x: 742, y: 300, direcao: 'direita', sprite: 'treinador_vermelho',
      falaDerrotado: ['Fogo e gelo não bastaram... você é forte!'] },
    { tipo: 'treinador', id: 'rota1_nina', idTreinador: 'npc_nina', nome: 'Garota Nina',
      x: 800, y: 150, direcao: 'esquerda', sprite: 'treinadora_rosa',
      falaDerrotado: ['Você passou por mim. A Liga fica logo ao norte. Boa sorte!'] },
  ],
};

export default rota1;
