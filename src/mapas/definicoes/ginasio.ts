import type { DefinicaoMapa } from '../tipos';

const ginasio: DefinicaoMapa = {
  id: 'ginasio',
  nome: 'Praça do Ginásio',
  imagem: 'ginasio.jpg',
  tamanhoPersonagem: 82,

  entradas: {
    sul: { x: 770, y: 968, direcao: 'cima' },
    // Use esta entrada quando o interior do ginásio for adicionado.
    porta: { x: 768, y: 470, direcao: 'baixo' },
  },

  portais: [
    { area: { x: 605, y: 1006, w: 330, h: 18 }, destino: 'rota1', entrada: 'norte' },
    // Quando existir a imagem do interior, basta criar o mapa e descomentar:
    // { area: { x: 700, y: 425, w: 140, h: 16 }, destino: 'ginasio_interior', entrada: 'entrada' },
  ],

  // Aqui é mais simples dizer onde SE PODE andar (calçada, praça e escada).
  areasAndaveis: [
    { x: 605, y: 845, w: 330, h: 179 },   // caminho de entrada
    { x: 600, y: 795, w: 340, h: 55 },    // passagem entre os postes
    { x: 265, y: 635, w: 1010, h: 165 },  // praça
    { x: 575, y: 505, w: 390, h: 135 },   // frente da escada
    { x: 635, y: 428, w: 265, h: 82 },    // escada
  ],

  colisoes: [],

  interacoes: [
    { area: { x: 690, y: 380, w: 155, h: 50 }, tipo: 'mensagem', texto: ['As portas do Ginásio estão fechadas.', 'Um aviso diz: "Em breve, novos desafios!"'] },
  ],

  npcs: [
    {
      tipo: 'treinador',
      id: 'ginasio_blue',
      idTreinador: 'npc_rival',
      nome: 'Rival Blue',
      x: 905, y: 610, direcao: 'baixo',
      aparencia: { cabelo: '#3a2a1c', pele: '#e9b98f', roupa: '#6a4bc4', calca: '#2b2f45' },
      falaDerrotado: ['Hmpf. Da próxima vez eu venço!'],
    },
  ],
};

export default ginasio;
