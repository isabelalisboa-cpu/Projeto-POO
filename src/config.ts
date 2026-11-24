// =====================================================================
// CONFIGURAÇÃO DO JOGO
// Tudo que é "ajuste de balanceamento" ou preferência fica aqui, para
// que ninguém precise mexer no motor nem no chuments.ts.
// =====================================================================

export const CONFIG = {
  titulo: 'CHUMMENTS',
  subtitulo: 'Capture. Combine. Reaja.',

  // --- Salvamento -----------------------------------------------------
  chaveSave: 'chumments.save.v1',
  /** Salva sozinho ao trocar de mapa e ao fim de cada batalha. */
  autoSalvar: true,

  // --- Início de jogo -------------------------------------------------
  mapaInicial: 'quarto',
  entradaInicial: 'inicio',
  dinheiroInicial: 200,
  /** Nomes (campo "nome" do chumment) oferecidos como inicial. */
  iniciais: ['Frilizard', 'Ocelly', 'Verdalisk'],
  itensIniciais: { 'Capturador Comum': 5, 'Poção Inicial': 3 } as Record<string, number>,

  // --- Derrota: onde o jogador acorda (com a equipe recuperada) -------
  mapaRecuperacao: 'centro',
  entradaRecuperacao: 'recuperacao',

  // --- Preços (o chuments.ts não define preços) -----------------------
  precos: {
    'Poção Inicial': 20,
    'Poção Intermediária': 45,
    'Poção Avançada': 90,
    'Vitalizador': 40,
    'Vitalizador Supremo': 120,
    'Capturador Comum': 30,
    'Capturador Avançado': 75,
    'Capturador Supremo': 150,
  } as Record<string, number>,

  // --- Recompensas ----------------------------------------------------
  /** XP ganho ao derrotar um chumment (dividido entre os aliados em campo). */
  xpPorDerrota: (nivelInimigo: number): number => 6 + 4 * nivelInimigo,
  /** Dinheiro por chumment selvagem derrotado (0 desliga). */
  dinheiroPorSelvagem: (nivelInimigo: number): number => 3 * nivelInimigo,

  // --- Movimento ------------------------------------------------------
  /** Velocidade do jogador, em "alturas do personagem" por segundo. */
  velocidadeJogador: 3.4,

  // --- Sprites dos chumments -----------------------------------------
  pastaSprites: 'assets/chumments/',
  /**
   * Só é necessário se algum PNG NÃO tiver o nome do chumment.
   * Ex.: { 'Fizzy Jr.': 'fizzy.png' }
   */
  arquivosSprites: {} as Record<string, string>,
  /** Espelha horizontalmente os chumments do jogador na batalha. */
  espelharAliados: true,

  // --- IA dos oponentes -----------------------------------------------
  /** Chance de o oponente escolher o melhor golpe em vez de um aleatório. */
  chanceIAEsperta: 0.65,
};
