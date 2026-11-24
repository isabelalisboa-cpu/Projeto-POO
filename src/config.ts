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

  // --- Recompensas ----------------------------------------------------
  /** XP ganho ao derrotar um chumment (dividido entre os aliados em campo). */
  xpPorDerrota: (nivelInimigo: number): number => 6 + 4 * nivelInimigo,
  /** Dinheiro por chumment selvagem derrotado (0 desliga). */
  dinheiroPorSelvagem: (nivelInimigo: number): number => 3 * nivelInimigo,

  // --- Movimento ------------------------------------------------------
  /** Velocidade do jogador, em "alturas do personagem" por segundo. */
  velocidadeJogador: 3.4,

  // --- Sprites dos personagens ---------------------------------------
  pastaPersonagens: 'assets/personagens/',
  /** Folha de sprites do jogador (chave em jogo/folhasPersonagens.ts) conforme a escolha no início. */
  spritesJogador: { Masculino: 'jovem', Feminino: 'treinadora' } as Record<string, string>,

  // --- Sprites dos chumments -----------------------------------------
  pastaSprites: 'assets/chumments/',
  /**
   * Só é necessário se algum PNG NÃO tiver o nome do chumment.
   * Ex.: { 'Fizzy Jr.': 'fizzy.png' }
   */
  arquivosSprites: {} as Record<string, string>,
  /**
   * Desenhos sem transparência, com fundo de uma cor só (ex.: cinza): o jogo apaga o fundo
   * sozinho, a partir das bordas da imagem, e recorta a sobra em volta do chumment.
   * PNGs que já têm transparência não são alterados.
   */
  removerFundoSprites: true,
  /**
   * Chumments em que os espaços FECHADOS pelo desenho (ex.: o vão dentro do laço da Electrusa)
   * também devem ficar transparentes. Não é feito para todos porque em alguns desenhos uma parte
   * do corpo tem exatamente a cor do fundo (o rosto do Lumi e do Lumiel) e sumiria junto.
   */
  fundoInternoTransparente: ['Electrusa', 'Hurrihawk', 'Jellerinna', 'Frilizard', 'Flareperor', 'Glacielle', 'Verdalisk'],
  /** Espelha horizontalmente os chumments do jogador na batalha. */
  espelharAliados: true,

  // --- IA dos oponentes -----------------------------------------------
  /** Chance de o oponente escolher o melhor golpe em vez de um aleatório. */
  chanceIAEsperta: 0.65,
};
