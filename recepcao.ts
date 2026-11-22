import type { DefinicaoMapa } from '../tipos';

const recepcao: DefinicaoMapa = {
  id: 'recepcao',
  nome: 'Liga — Recepção',
  imagem: 'recepcao.jpg',
  tamanhoPersonagem: 125,

  entradas: {
    entrada: { x: 768, y: 955, direcao: 'cima' },  // vindo da praça
    arena: { x: 768, y: 385, direcao: 'baixo' },   // voltando da arena
  },

  portais: [
    { area: { x: 630, y: 1000, w: 280, h: 24 }, destino: 'ginasio', entrada: 'porta' },
    { area: { x: 690, y: 180, w: 160, h: 30 }, destino: 'arena', entrada: 'sul' },
  ],

  areasAndaveis: [
    { x: 75, y: 335, w: 1390, h: 642 },   // piso
    { x: 690, y: 180, w: 160, h: 160 },   // corredor da porta de cima
    { x: 630, y: 970, w: 280, h: 54 },    // tapete de saída
  ],

  colisoes: [
    { x: 90, y: 335, w: 70, h: 50 },      // planta
    { x: 200, y: 335, w: 100, h: 97 },    // estátua esquerda
    { x: 1238, y: 335, w: 100, h: 97 },   // estátua direita
    { x: 1385, y: 335, w: 70, h: 50 },    // planta
    { x: 520, y: 405, w: 498, h: 185 },   // balcão
    { x: 175, y: 615, w: 262, h: 195 },   // sofás e mesa (esquerda)
    { x: 1103, y: 615, w: 260, h: 195 },  // sofás e mesa (direita)
    { x: 90, y: 900, w: 70, h: 62 },      // planta
    { x: 1385, y: 900, w: 70, h: 62 },    // planta
  ],

  npcs: [
    {
      // A recepcionista já está desenhada na imagem (atrás do balcão).
      tipo: 'fala',
      id: 'recepcao_atendente',
      nome: 'Recepcionista',
      x: 768, y: 470,
      areaInteracao: { x: 560, y: 588, w: 420, h: 85 },
      falas: [
        'Bem-vindo à Liga Chumment, {nome}!',
        'Os quatro líderes esperam na Arena, pela porta atrás de mim. Vença todos eles e a campeã aparecerá para o desafio final.',
        'Se a sua equipe estiver cansada, descanse nos sofás antes de entrar.',
      ],
    },
  ],

  interacoes: [
    // Os sofás recuperam a equipe (não há Centro de Cuidados dentro da Liga).
    { area: { x: 175, y: 615, w: 262, h: 195 }, tipo: 'descansar' },
    { area: { x: 1103, y: 615, w: 260, h: 195 }, tipo: 'descansar' },
    { area: { x: 200, y: 335, w: 100, h: 97 }, tipo: 'mensagem', texto: ['Estátua de um chumment lendário. A placa diz: "Aos campeões."'] },
    { area: { x: 1238, y: 335, w: 100, h: 97 }, tipo: 'mensagem', texto: ['Estátua de um chumment lendário. A placa diz: "Aos campeões."'] },
  ],
};

export default recepcao;
