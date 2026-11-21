import type { DefinicaoMapa } from '../tipos';

// Coordenadas em pixels da imagem (1536 x 1024).
const cidade: DefinicaoMapa = {
  id: 'cidade',
  nome: 'Vila Inicial',
  imagem: 'cidade.jpg',
  tamanhoPersonagem: 66,

  entradas: {
    casa: { x: 368, y: 352, direcao: 'baixo' },     // saindo da casa do jogador
    centro: { x: 1150, y: 352, direcao: 'baixo' },  // saindo do Centro de Cuidados
    loja: { x: 428, y: 884, direcao: 'baixo' },     // saindo da loja
    norte: { x: 760, y: 70, direcao: 'baixo' },     // vindo da Rota 1
  },

  portais: [
    { area: { x: 338, y: 308, w: 60, h: 22 }, destino: 'sala', entrada: 'entrada' },
    { area: { x: 1115, y: 308, w: 72, h: 22 }, destino: 'centro', entrada: 'entrada' },
    { area: { x: 396, y: 842, w: 66, h: 22 }, destino: 'loja', entrada: 'entrada' },
    { area: { x: 690, y: 0, w: 140, h: 18 }, destino: 'rota1', entrada: 'sul' },
  ],

  colisoes: [
    // Bordas de árvores
    { x: 0, y: 0, w: 62, h: 1024 },
    { x: 1470, y: 0, w: 66, h: 1024 },
    { x: 0, y: 948, w: 1536, h: 76 },

    // Casa do jogador (telhado vermelho) e quintal
    { x: 260, y: 20, w: 340, h: 292 },
    { x: 135, y: 80, w: 125, h: 55 },
    { x: 135, y: 80, w: 28, h: 325 },
    { x: 135, y: 362, w: 160, h: 45 },
    { x: 205, y: 240, w: 55, h: 85 },
    { x: 600, y: 60, w: 60, h: 245 },
    { x: 575, y: 305, w: 85, h: 90 },

    // Centro de Cuidados (cruz vermelha) e quintal
    { x: 940, y: 15, w: 412, h: 297 },
    { x: 865, y: 50, w: 80, h: 55 },
    { x: 865, y: 120, w: 65, h: 95 },
    { x: 868, y: 245, w: 55, h: 55 },
    { x: 868, y: 315, w: 140, h: 85 },
    { x: 1350, y: 50, w: 97, h: 55 },
    { x: 1415, y: 50, w: 32, h: 360 },
    { x: 1220, y: 345, w: 227, h: 62 },

    // Loja (carrinho) e quintal
    { x: 255, y: 565, w: 345, h: 281 },
    { x: 132, y: 608, w: 30, h: 325 },
    { x: 132, y: 608, w: 120, h: 55 },
    { x: 165, y: 590, w: 90, h: 155 },
    { x: 132, y: 878, w: 100, h: 55 },
    { x: 600, y: 590, w: 58, h: 215 },
    { x: 575, y: 800, w: 78, h: 82 },

    // Casa fechada (telhado azul/roxo) e quintal
    { x: 962, y: 580, w: 365, h: 263 },
    { x: 868, y: 610, w: 30, h: 290 },
    { x: 868, y: 610, w: 95, h: 52 },
    { x: 900, y: 670, w: 62, h: 82 },
    { x: 928, y: 762, w: 58, h: 90 },
    { x: 1325, y: 610, w: 122, h: 52 },
    { x: 1415, y: 610, w: 32, h: 322 },
    { x: 1298, y: 878, w: 150, h: 55 },
    { x: 1338, y: 690, w: 60, h: 115 },
  ],

  interacoes: [
    // Casa inacessível: sem portal, só uma mensagem ao tentar a porta.
    { area: { x: 1050, y: 800, w: 76, h: 44 }, tipo: 'mensagem', texto: ['A porta está trancada. Parece não haver ninguém em casa.'] },
    { area: { x: 575, y: 800, w: 78, h: 82 }, tipo: 'mensagem', texto: ['LOJA — Capturadores para todo tipo de treinador!'] },
  ],
};

export default cidade;
