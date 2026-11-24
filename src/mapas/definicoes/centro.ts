import type { DefinicaoMapa } from '../tipos';

const centro: DefinicaoMapa = {
  id: 'centro',
  nome: 'Centro de Cuidados',
  imagem: 'centro.jpg',
  tamanhoPersonagem: 125,

  entradas: {
    entrada: { x: 768, y: 905, direcao: 'cima' },
    recuperacao: { x: 768, y: 540, direcao: 'cima' },  // onde o jogador acorda após uma derrota
  },

  portais: [
    { area: { x: 675, y: 958, w: 190, h: 30 }, destino: 'cidade', entrada: 'centro' },
  ],

  areasAndaveis: [
    { x: 60, y: 300, w: 1420, h: 642 },   // piso
    { x: 675, y: 935, w: 190, h: 53 },    // tapete de saída
  ],

  colisoes: [
    { x: 130, y: 300, w: 270, h: 12 },    // planta e estante do fundo
    { x: 405, y: 300, w: 715, h: 150 },   // balcão
    { x: 1110, y: 300, w: 115, h: 12 },   // máquina do fundo
    { x: 5, y: 555, w: 132, h: 250 },     // mesa de vidro esquerda
    { x: 155, y: 555, w: 90, h: 210 },    // banquinhos
    { x: 1292, y: 555, w: 92, h: 210 },   // banquinhos
    { x: 1400, y: 555, w: 130, h: 250 },  // mesa de vidro direita
  ],

  npcs: [
    {
      // A enfermeira já está desenhada na imagem (atrás do balcão).
      tipo: 'loja',
      id: 'centro_enfermeira',
      nome: 'Enfermeira',
      x: 765, y: 300,
      areaInteracao: { x: 560, y: 446, w: 420, h: 85 },
      cura: true,   // Hospital.curar(): cura a equipe inteira de graça
      itens: ['Poção Inicial', 'Poção Intermediária', 'Poção Avançada', 'Vitalizador', 'Vitalizador Supremo'],
      saudacao: ['Olá! Posso curar a sua equipe de graça, e também vendo poções e vitalizadores.'],
      despedida: ['Cuide bem deles!'],
    },
  ],
};

export default centro;
