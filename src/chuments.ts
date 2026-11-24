// ==========================================
// 1. ENUMS E TIPOS BASE
// ==========================================

export enum Elemento {
  FOGO = "Fogo", AGUA = "Água", PLANTA = "Planta", PEDRA = "Pedra",
  ELETRICO = "Elétrico", GELO = "Gelo", VENTO = "Vento",
  MISTICO = "Místico", LUZ = "Luz", ESCURIDAO = "Escuridão"
}

export enum Estado {
  NORMAL = "Normal", CONGELADO = "Congelado", DORMINDO = "Dormindo",
  CONFUSO = "Confuso", LAMA = "Lama", QUEIMADO = "Queimado", SANGRANDO = "Sangrando", HIBERNANDO = "Hibernando"
}

export enum StatusBatalha {
  EM_ANDAMENTO = "Em Andamento",
  FINALIZADA = "Finalizada"
}

export enum Dificuldade {
  FACIL = "Fácil",
  MEDIO = "Médio",
  DIFICIL = "Difícil"
}

// ==========================================
// 2. TABELAS DE REGRAS
// ==========================================

// Tabela 1: Efetividade de Dano (Atacante -> Defensor)
export const TabelaEfetividade: Record<Elemento, Record<Elemento, number>> = {
  [Elemento.FOGO]: { [Elemento.AGUA]: 0.5, [Elemento.PLANTA]: 2, [Elemento.PEDRA]: 0.5 } as any,
  [Elemento.AGUA]: { [Elemento.FOGO]: 2, [Elemento.PLANTA]: 0.5, [Elemento.PEDRA]: 2, [Elemento.ELETRICO]: 0.5 } as any,
  [Elemento.PLANTA]: { [Elemento.FOGO]: 0.5, [Elemento.AGUA]: 2, [Elemento.PEDRA]: 2 } as any,
  [Elemento.PEDRA]: { [Elemento.FOGO]: 2, [Elemento.AGUA]: 0.5, [Elemento.PLANTA]: 0.5 } as any,
  [Elemento.ELETRICO]: { [Elemento.AGUA]: 2, [Elemento.PLANTA]: 0.5, [Elemento.PEDRA]: 0.5 } as any,
  [Elemento.GELO]: { [Elemento.FOGO]: 0.5, [Elemento.AGUA]: 0.5, [Elemento.PLANTA]: 2, [Elemento.PEDRA]: 2 } as any,
  [Elemento.VENTO]: { [Elemento.PLANTA]: 2, [Elemento.ELETRICO]: 0.5, [Elemento.PEDRA]: 0.5 } as any,
  [Elemento.MISTICO]: { [Elemento.LUZ]: 2, [Elemento.ESCURIDAO]: 2 } as any,
  [Elemento.LUZ]: { [Elemento.ESCURIDAO]: 2, [Elemento.MISTICO]: 0.5 } as any,
  [Elemento.ESCURIDAO]: { [Elemento.LUZ]: 2, [Elemento.MISTICO]: 0.5 } as any,
};

// Tabela 2: Reações (Chave: "ElementoAplicado_ElementoNovo")
export const TabelaReacoes: Record<string, string> = {
  [`${Elemento.FOGO}_${Elemento.AGUA}`]: "Vaporizacao",
  [`${Elemento.AGUA}_${Elemento.FOGO}`]: "Vaporizacao",
  [`${Elemento.FOGO}_${Elemento.PLANTA}`]: "Queimadura",
  [`${Elemento.PLANTA}_${Elemento.FOGO}`]: "Queimadura",          // CORRIGIDO: direção inversa faltava
  [`${Elemento.AGUA}_${Elemento.PLANTA}`]: "Vinhas",
  [`${Elemento.PLANTA}_${Elemento.AGUA}`]: "Vinhas",
  [`${Elemento.ELETRICO}_${Elemento.PEDRA}`]: "Condutividade",
  [`${Elemento.PEDRA}_${Elemento.ELETRICO}`]: "Condutividade",    // CORRIGIDO: direção inversa faltava
  [`${Elemento.VENTO}_${Elemento.FOGO}`]: "Redemoinho",
  [`${Elemento.FOGO}_${Elemento.VENTO}`]: "Dissipa",
  [`${Elemento.AGUA}_${Elemento.PEDRA}`]: "Lama",
  [`${Elemento.PEDRA}_${Elemento.AGUA}`]: "Lama",
  [`${Elemento.AGUA}_${Elemento.ELETRICO}`]: "Confusao",
  [`${Elemento.ELETRICO}_${Elemento.AGUA}`]: "Confusao",
  [`${Elemento.AGUA}_${Elemento.GELO}`]: "Congelamento",
  [`${Elemento.GELO}_${Elemento.AGUA}`]: "Congelamento",
  [`${Elemento.GELO}_${Elemento.FOGO}`]: "Derretimento",
  [`${Elemento.FOGO}_${Elemento.GELO}`]: "Derretimento",
  [`${Elemento.PLANTA}_${Elemento.GELO}`]: "Hibernacao",
  [`${Elemento.GELO}_${Elemento.PLANTA}`]: "Hibernacao",
  [`${Elemento.PEDRA}_${Elemento.GELO}`]: "Estilhaco",
  [`${Elemento.GELO}_${Elemento.PEDRA}`]: "Estilhaco",
};

// Mística: ao aplicar o elemento Místico, há 25% de chance de gerar uma reação aleatória.
// O sorteio usa todas as reações da tabela (sem repetir nomes) + Cegueira.
export const CHANCE_MISTICA = 0.25;
export const REACOES_ALEATORIAS: string[] = [...new Set(Object.values(TabelaReacoes)), "Cegueira", "Sangramento"];

// ==========================================
// 3. CLASSES BASE (ATAQUE E ITEM)
// ==========================================

export class Ataque {
  private ppAtual: number;

  constructor(
    private readonly nome: string,
    private readonly poderBase: number,
    private readonly precisao: number,
    private readonly ppMaximo: number,
    private readonly elemento: Elemento,
    private readonly isMultiTarget: boolean = false
  ) {
    this.ppAtual = ppMaximo;
  }

  public getNome(): string { return this.nome; }
  public getPoderBase(): number { return this.poderBase; }
  public getPrecisao(): number { return this.precisao; }
  public getPPAtual(): number { return this.ppAtual; }
  public getPPMaximo(): number { return this.ppMaximo; }
  public getElemento(): Elemento { return this.elemento; }
  public isMultiTargetAtaque(): boolean { return this.isMultiTarget; }

  public temPP(): boolean { return this.ppAtual > 0; }
  public consumirPP(): void { if (this.ppAtual > 0) this.ppAtual--; }
  public restaurarPP(): void { this.ppAtual = this.ppMaximo; }
}

export class Item {
  constructor(
    public readonly nome: string,
    private readonly efeito: (alvo: Monstrinho, ataque?: Ataque) => void
  ) {}
  public usar(alvo: Monstrinho, ataque?: Ataque): void {
    console.log(`🎒 Usando ${this.nome} em ${alvo.nome}...`);
    this.efeito(alvo, ataque);
  }
}

export class ItemCaptura extends Item {
  constructor(
    public readonly nome: string,
    public readonly bonus: number
  ) {
    super(nome, () => {}); 
  }
}

// Cegueira: cada stack reduz a precisão do monstrinho em 5%, com no máximo 5 stacks.
export const MAX_STACKS_CEGUEIRA = 5;
export const REDUCAO_PRECISAO_POR_STACK = 0.05;

// Estilhaço: dano (fração da vida máxima) que o monstrinho leva ao entrar em campo sobre os fragmentos.
export const DANO_ESTILHACO = 0.1;

// Captura: experiência dada a cada monstrinho ativo = nível do capturado * este valor.
export const XP_CAPTURA_POR_NIVEL = 10;

// Início do jogo
export const NIVEL_INICIAL = 5;
export const CAPTURADORES_INICIAIS = 10;
export const POCOES_INICIAIS = 10;

// ==========================================
// 4. CLASSE ABSTRATA MONSTRINHO
// ==========================================
export abstract class Monstrinho {
  protected vidaAtual: number;
  protected ataques: Ataque[] = [];
  protected elementosAplicados: Elemento[] = [];
  protected estados: Estado[] = [];
  protected modificadores = { ataque: 1, defesa: 1, velocidade: 1, precisao: 1 };
  protected stacksCegueira: number = 0; // cada stack reduz a precisão em 5% (máx. 5)
  protected turnosHibernacao: number = 0; // quantos ataques ainda serão impedidos pela Hibernação
  protected tabelaDeAprendizado: Record<number, Ataque> = {};
  protected ataquePendente: Ataque | null = null;

  constructor(
    public readonly nome: string,
    protected readonly elementoInerente: Elemento,
    protected vidaMaxima: number,
    protected ataque: number,
    protected defesa: number,
    protected velocidade: number,
    protected precisao: number,
    protected nivel: number = 1,
    protected experiencia: number = 0,
    protected taxaCaptura: number = 190
  ) {
    this.vidaAtual = vidaMaxima;
  }

  public abstract evoluir(): Monstrinho | null;

  // --- Getters ---
  public getVida(): number { return this.vidaAtual; }
  public getVidaMaxima(): number { return this.vidaMaxima; }
  public getAtaque(): number { return Math.floor(this.ataque * this.modificadores.ataque); }
  public getDefesa(): number { return Math.floor(this.defesa * this.modificadores.defesa); }
  public getVelocidade(): number { return Math.floor(this.velocidade * this.modificadores.velocidade); }
  public getPrecisao(): number {
    const fatorCegueira = 1 - this.stacksCegueira * REDUCAO_PRECISAO_POR_STACK;
    return Math.floor(this.precisao * this.modificadores.precisao * fatorCegueira);
  }
  public getStacksCegueira(): number { return this.stacksCegueira; }
  public getElementoInerente(): Elemento { return this.elementoInerente; }
  public getNivel(): number { return this.nivel; }
  public getExperiencia(): number { return this.experiencia; }
  public getAtaques(): Ataque[] { return this.ataques; }
  public getElementosAplicados(): Elemento[] { return this.elementosAplicados; }
  public getEstados(): Estado[] { return this.estados; }
  public getAtaquePendente(): Ataque | null { return this.ataquePendente; }
  public getTaxaCaptura(): number { return this.taxaCaptura; }

  // --- Métodos de Vida e Modificadores ---
  public receberDano(valor: number): void { this.vidaAtual = Math.max(0, this.vidaAtual - valor); }
  public curar(valor: number): void { this.vidaAtual = Math.min(this.vidaMaxima, this.vidaAtual + valor); }
  public aplicarModificador(status: 'ataque' | 'defesa' | 'velocidade' | 'precisao', multiplicador: number): void {
    this.modificadores[status] *= multiplicador;
  }

  /** Hibernação: o monstrinho não pode atacar pelos próximos `turnos` turnos (ou até ser atacado). */
  public hibernar(turnos: number = 3): void {
    this.adicionarEstado(Estado.HIBERNANDO);
    this.turnosHibernacao = turnos;
  }

  /** Gasta um turno de hibernação (quando o monstrinho tenta agir). Retorna quantos restam. */
  public consumirTurnoHibernacao(): number {
    this.turnosHibernacao = Math.max(0, this.turnosHibernacao - 1);
    if (this.turnosHibernacao === 0) this.removerEstado(Estado.HIBERNANDO);
    return this.turnosHibernacao;
  }

  /** Acorda da hibernação (ex.: ao ser atacado). Retorna true se estava hibernando. */
  public acordarHibernacao(): boolean {
    if (!this.temEstado(Estado.HIBERNANDO)) return false;
    this.turnosHibernacao = 0;
    this.removerEstado(Estado.HIBERNANDO);
    return true;
  }

  /** Adiciona 1 stack de cegueira. Retorna false se já estiver no máximo. */
  public adicionarStackCegueira(): boolean {
    if (this.stacksCegueira >= MAX_STACKS_CEGUEIRA) return false;
    this.stacksCegueira++;
    return true;
  }

  // --- Métodos de Ataque e Nível ---
  public aprenderAtaque(ataque: Ataque): boolean {
    if (this.ataques.length < 4) {
      this.ataques.push(ataque);
      return true;
    }
    return false; 
  }

  public resolverAtaquePendente(indexParaEsquecer: number): boolean {
    if (!this.ataquePendente) return false;
    if (indexParaEsquecer < 0 || indexParaEsquecer >= this.ataques.length) return false;

    const ataqueEsquecido = this.ataques[indexParaEsquecer];
    this.ataques[indexParaEsquecer] = this.ataquePendente;
    console.log(`🔄 ${this.nome} esqueceu ${ataqueEsquecido.getNome()} e aprendeu ${this.ataquePendente.getNome()}!`);
    this.ataquePendente = null;
    return true;
  }

  public cancelarAtaquePendente(): void {
    if (this.ataquePendente) {
      console.log(`❌ ${this.nome} decidiu não aprender ${this.ataquePendente.getNome()}.`);
      this.ataquePendente = null;
    }
  }

  /** Equipa os (até) 4 melhores ataques que o monstrinho já teria aprendido no nível atual. Útil para NPCs. */
  public equiparMelhoresAtaques(): void {
    const niveis = Object.keys(this.tabelaDeAprendizado)
      .map(Number)
      .filter(n => n <= this.nivel)
      .sort((a, b) => b - a)
      .slice(0, 4)
      .sort((a, b) => a - b);
    this.ataques = niveis.map(n => this.tabelaDeAprendizado[n]);
  }

  public restaurarTodosPP(): void {
    this.ataques.forEach(ataque => ataque.restaurarPP());
  }

  public ganharExperiencia(valor: number): void {
    if (this.nivel >= 30) return;
    this.experiencia += valor;
    
    while (this.nivel < 30) {
      const xpNecessario = 5 * (this.nivel + 1);
      if (this.experiencia >= xpNecessario) {
        this.experiencia -= xpNecessario;
        this.nivel++;
        this.vidaMaxima += 5;
        this.ataque += 2;
        this.defesa += 2;
        this.velocidade += 1;
        this.vidaAtual = this.vidaMaxima; 

        if (this.tabelaDeAprendizado[this.nivel]) {
          const novoAtaque = this.tabelaDeAprendizado[this.nivel];
          if (!this.aprenderAtaque(novoAtaque)) {
            this.ataquePendente = novoAtaque;
            console.log(`⚠️ ${this.nome} subiu para o Nível ${this.nivel} e quer aprender ${novoAtaque.getNome()}, mas já tem 4 ataques!`);
          } else {
            console.log(`📚 ${this.nome} subiu para o Nível ${this.nivel} e aprendeu ${novoAtaque.getNome()}!`);
          }
        } else {
          console.log(`⭐ ${this.nome} subiu para o Nível ${this.nivel}!`);
        }
      } else break;
    }
  }

  // --- Métodos de Elementos e Reações ---
  public aplicarElemento(elemento: Elemento): Elemento[] | null {
    if (this.elementosAplicados.length === 0) {
      this.elementosAplicados.push(elemento);
      return null;
    }
    if (this.elementosAplicados.length === 1) {
      const elementoAnterior = this.elementosAplicados[0];
      this.elementosAplicados = []; 
      return [elementoAnterior, elemento];
    }
    return null;
  }

  public limparElementos(): void { this.elementosAplicados = []; }
  public adicionarEstado(estado: Estado): void { if (!this.estados.includes(estado)) this.estados.push(estado); }
  public removerEstado(estado: Estado): void { this.estados = this.estados.filter(e => e !== estado); }
  public temEstado(estado: Estado): boolean { return this.estados.includes(estado); }

  public restaurarEstado(vida: number, experiencia: number): void {
    this.vidaAtual = vida;
    this.experiencia = experiencia;
  }

  public resetarAposBatalha(): void {
    this.modificadores = { ataque: 1, defesa: 1, velocidade: 1, precisao: 1 };
    this.stacksCegueira = 0;
    this.turnosHibernacao = 0;
    this.limparElementos();
    this.estados = []; 
  }
}

// ==========================================
// 5. POKEDEX COMPLETA
// ==========================================

// --- FOGO ---
export class Frilizard extends Monstrinho {
  constructor(nivel = 1) { 
    super("Frilizard", Elemento.FOGO, 28, 18, 10, 14, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Brasa", 40, 100, 30, Elemento.FOGO),
      3: new Ataque("Presa Ígnea", 50, 100, 25, Elemento.FOGO),
      6: new Ataque("Punho de Fogo", 60, 100, 20, Elemento.FOGO),
      9: new Ataque("Giro Flamejante", 40, 100, 15, Elemento.FOGO, true),
      12: new Ataque("Lança-Chamas", 75, 95, 15, Elemento.FOGO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Flareperor(this.nivel) : null; }
}
export class Flareperor extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Flareperor", Elemento.FOGO, 55, 40, 15, 30, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Fogo do Imperador", 80, 100, 15, Elemento.FOGO),
      18: new Ataque("Explosão de Chamas", 90, 90, 10, Elemento.FOGO),
      21: new Ataque("Fogo Fátuo", 100, 90, 10, Elemento.FOGO),
      24: new Ataque("Erupção", 110, 85, 5, Elemento.FOGO),
      27: new Ataque("Inferno", 120, 85, 5, Elemento.FOGO),
      30: new Ataque("Sol Flamejante", 150, 80, 5, Elemento.FOGO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ÁGUA ---
export class Ocelly extends Monstrinho {
  constructor(nivel = 1) { 
    super("Ocelly", Elemento.AGUA, 38, 10, 14, 8, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Jato d'Água", 40, 100, 30, Elemento.AGUA),
      3: new Ataque("Bolha", 50, 100, 25, Elemento.AGUA),
      6: new Ataque("Aqua Jato", 60, 100, 20, Elemento.AGUA),
      9: new Ataque("Surf", 40, 100, 15, Elemento.AGUA, true),
      12: new Ataque("Hidro Bomba", 75, 95, 15, Elemento.AGUA)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Jellerinna(this.nivel) : null; }
}
export class Jellerinna extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Jellerinna", Elemento.AGUA, 75, 20, 30, 15, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Água Vital", 80, 100, 15, Elemento.AGUA),
      18: new Ataque("Canhão de Água", 90, 90, 10, Elemento.AGUA),
      21: new Ataque("Tsunami", 100, 90, 10, Elemento.AGUA),
      24: new Ataque("Hidro Canhão", 110, 85, 5, Elemento.AGUA),
      27: new Ataque("Dilúvio", 120, 85, 5, Elemento.AGUA),
      30: new Ataque("Fúria do Oceano", 150, 80, 5, Elemento.AGUA)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- PLANTA ---
export class Verdalisk extends Monstrinho {
  constructor(nivel = 1) { 
    super("Verdalisk", Elemento.PLANTA, 40, 8, 15, 7, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Chicote de Vinha", 40, 100, 30, Elemento.PLANTA),
      3: new Ataque("Folha Navalha", 50, 100, 25, Elemento.PLANTA),
      6: new Ataque("Absorver", 60, 100, 20, Elemento.PLANTA),
      9: new Ataque("Pólen Paralisante", 40, 100, 15, Elemento.PLANTA, true),
      12: new Ataque("Lâmina de Grama", 75, 95, 15, Elemento.PLANTA)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Katanlisk(this.nivel) : null; }
}
export class Katanlisk extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Katanlisk", Elemento.PLANTA, 80, 18, 32, 10, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Corte Samurai", 80, 100, 15, Elemento.PLANTA),
      18: new Ataque("Bomba de Sementes", 90, 90, 10, Elemento.PLANTA),
      21: new Ataque("Lâmina Solar", 100, 90, 10, Elemento.PLANTA),
      24: new Ataque("Tempestade de Folhas", 110, 85, 5, Elemento.PLANTA),
      27: new Ataque("Dança das Pétalas", 120, 85, 5, Elemento.PLANTA),
      30: new Ataque("Fúria da Floresta", 150, 80, 5, Elemento.PLANTA)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- PEDRA ---
export class Lithoscorp extends Monstrinho {
  constructor(nivel = 1) { 
    super("Lithoscorp", Elemento.PEDRA, 42, 10, 16, 2, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Pedrada", 40, 100, 30, Elemento.PEDRA),
      3: new Ataque("Rocha Afiada", 50, 100, 25, Elemento.PEDRA),
      6: new Ataque("Garra de Pedra", 60, 100, 20, Elemento.PEDRA),
      9: new Ataque("Terremoto", 40, 100, 15, Elemento.PEDRA, true),
      12: new Ataque("Rocha Pesada", 75, 95, 15, Elemento.PEDRA)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Rockpion(this.nivel) : null; }
}
export class Rockpion extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Rockpion", Elemento.PEDRA, 80, 25, 30, 5, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Fúria do Titã", 80, 100, 15, Elemento.PEDRA),
      18: new Ataque("Deslizamento", 90, 90, 10, Elemento.PEDRA),
      21: new Ataque("Gema Poderosa", 100, 90, 10, Elemento.PEDRA),
      24: new Ataque("Meteorito", 110, 85, 5, Elemento.PEDRA),
      27: new Ataque("Espinhos de Rocha", 120, 85, 5, Elemento.PEDRA),
      30: new Ataque("Impacto Estelar", 150, 80, 5, Elemento.PEDRA)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ELÉTRICO ---
export class Amperell extends Monstrinho {
  constructor(nivel = 1) { 
    super("Amperell", Elemento.ELETRICO, 24, 16, 8, 22, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Choque do Trovão", 40, 100, 30, Elemento.ELETRICO),
      3: new Ataque("Faísca", 50, 100, 25, Elemento.ELETRICO),
      6: new Ataque("Onda de Choque", 60, 100, 20, Elemento.ELETRICO),
      9: new Ataque("Descarga Elétrica", 40, 100, 15, Elemento.ELETRICO, true),
      12: new Ataque("Raio", 75, 95, 15, Elemento.ELETRICO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Electrusa(this.nivel) : null; }
}
export class Electrusa extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Electrusa", Elemento.ELETRICO, 50, 35, 15, 40, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Medusa Elétrica", 80, 100, 15, Elemento.ELETRICO),
      18: new Ataque("Trovão", 90, 90, 10, Elemento.ELETRICO),
      21: new Ataque("Relâmpago", 100, 90, 10, Elemento.ELETRICO),
      24: new Ataque("Tempestade Elétrica", 110, 85, 5, Elemento.ELETRICO),
      27: new Ataque("Fúria do Trovão", 120, 85, 5, Elemento.ELETRICO),
      30: new Ataque("Julgamento de Zeus", 150, 80, 5, Elemento.ELETRICO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- VENTO ---
export class Zephyling extends Monstrinho {
  constructor(nivel = 1) { 
    super("Zephyling", Elemento.VENTO, 26, 10, 8, 26, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Rajada de Vento", 40, 100, 30, Elemento.VENTO),
      3: new Ataque("Ataque de Asa", 50, 100, 25, Elemento.VENTO),
      6: new Ataque("Vento Cortante", 60, 100, 20, Elemento.VENTO),
      9: new Ataque("Ciclone", 40, 100, 15, Elemento.VENTO, true),
      12: new Ataque("Vendaval", 75, 95, 15, Elemento.VENTO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Hurrihawk(this.nivel) : null; }
}
export class Hurrihawk extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Hurrihawk", Elemento.VENTO, 50, 20, 15, 55, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Mergulho do Falcão", 80, 100, 15, Elemento.VENTO),
      18: new Ataque("Tempestade de Ar", 90, 90, 10, Elemento.VENTO),
      21: new Ataque("Furacão", 100, 90, 10, Elemento.VENTO),
      24: new Ataque("Lâmina de Vento", 110, 85, 5, Elemento.VENTO),
      27: new Ataque("Tufão", 120, 85, 5, Elemento.VENTO),
      30: new Ataque("Fúria dos Céus", 150, 80, 5, Elemento.VENTO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- GELO ---
export class Glaceow extends Monstrinho {
  constructor(nivel = 1) { 
    super("Glaceow", Elemento.GELO, 35, 15, 12, 8, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Rajada de Gelo", 40, 100, 30, Elemento.GELO),
      3: new Ataque("Vento Gélido", 50, 100, 25, Elemento.GELO),
      6: new Ataque("Presa de Gelo", 60, 100, 20, Elemento.GELO),
      9: new Ataque("Nevasca", 40, 100, 15, Elemento.GELO, true),
      12: new Ataque("Raio de Gelo", 75, 95, 15, Elemento.GELO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Glacielle(this.nivel) : null; }
}
export class Glacielle extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Glacielle", Elemento.GELO, 65, 30, 25, 20, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Elegância Glacial", 80, 100, 15, Elemento.GELO),
      18: new Ataque("Zero Absoluto", 90, 90, 10, Elemento.GELO),
      21: new Ataque("Cristal de Gelo", 100, 90, 10, Elemento.GELO),
      24: new Ataque("Avalanche", 110, 85, 5, Elemento.GELO),
      27: new Ataque("Fúria Congelante", 120, 85, 5, Elemento.GELO),
      30: new Ataque("Era do Gelo", 150, 80, 5, Elemento.GELO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- MÍSTICO ---
export class FizzyJr extends Monstrinho {
  constructor(nivel = 1) { 
    super("Fizzy Jr.", Elemento.MISTICO, 32, 14, 12, 12, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Onda Mística", 40, 100, 30, Elemento.MISTICO),
      3: new Ataque("Raio Psíquico", 50, 100, 25, Elemento.MISTICO),
      6: new Ataque("Poder Oculto", 60, 100, 20, Elemento.MISTICO),
      9: new Ataque("Pulso Mágico", 40, 100, 15, Elemento.MISTICO, true),
      12: new Ataque("Psíquico", 75, 95, 15, Elemento.MISTICO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Fizzarolly(this.nivel) : null; }
}
export class Fizzarolly extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Fizzarolly", Elemento.MISTICO, 60, 30, 25, 25, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Desejo Arcano", 80, 100, 15, Elemento.MISTICO),
      18: new Ataque("Premonição", 90, 90, 10, Elemento.MISTICO),
      21: new Ataque("Truque Mágico", 100, 90, 10, Elemento.MISTICO),
      24: new Ataque("Bola Sombria", 110, 85, 5, Elemento.MISTICO),
      27: new Ataque("Fissura Espacial", 120, 85, 5, Elemento.MISTICO),
      30: new Ataque("Criação Divina", 150, 80, 5, Elemento.MISTICO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- LUZ ---
export class Lumi extends Monstrinho {
  constructor(nivel = 1) { 
    super("Lumi", Elemento.LUZ, 34, 10, 14, 12, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Luz Sagrada", 40, 100, 30, Elemento.LUZ),
      3: new Ataque("Raio de Sol", 50, 100, 25, Elemento.LUZ),
      6: new Ataque("Purificação", 60, 100, 20, Elemento.LUZ),
      9: new Ataque("Onda de Luz", 40, 100, 15, Elemento.LUZ, true),
      12: new Ataque("Julgamento", 75, 95, 15, Elemento.LUZ)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Celestina(this.nivel) : null; }
}
export class Celestina extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Celestina", Elemento.LUZ, 65, 20, 30, 25, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Bênção Celestial", 80, 100, 15, Elemento.LUZ),
      18: new Ataque("Lança Radiante", 90, 90, 10, Elemento.LUZ),
      21: new Ataque("Explosão Estelar", 100, 90, 10, Elemento.LUZ),
      24: new Ataque("Aurora", 110, 85, 5, Elemento.LUZ),
      27: new Ataque("Luz Divina", 120, 85, 5, Elemento.LUZ),
      30: new Ataque("Supernova", 150, 80, 5, Elemento.LUZ)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ESCURIDÃO ---
export class Lumiel extends Monstrinho {
  constructor(nivel = 1) { 
    super("Lumiel", Elemento.ESCURIDAO, 30, 16, 10, 14, 100, nivel, 0, 190);
    this.tabelaDeAprendizado = {
      1: new Ataque("Mordida Sombria", 40, 100, 30, Elemento.ESCURIDAO),
      3: new Ataque("Pulso Sombrio", 50, 100, 25, Elemento.ESCURIDAO),
      6: new Ataque("Ataque Noturno", 60, 100, 20, Elemento.ESCURIDAO),
      9: new Ataque("Onda de Trevas", 40, 100, 15, Elemento.ESCURIDAO, true),
      12: new Ataque("Lâmina das Trevas", 75, 95, 15, Elemento.ESCURIDAO)
    };
    this.aprenderAtaque(this.tabelaDeAprendizado[1]);
    for(let i = 3; i <= nivel; i+=3) {
       if(this.tabelaDeAprendizado[i]) this.aprenderAtaque(this.tabelaDeAprendizado[i]);
    }
  }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Shadenight(this.nivel) : null; }
}
export class Shadenight extends Monstrinho {
  constructor(nivel: number = 15) { 
    super("Shadenight", Elemento.ESCURIDAO, 55, 35, 20, 30, 100, nivel, 0, 45);
    this.tabelaDeAprendizado = {
      15: new Ataque("Abraço do Vampiro", 80, 100, 15, Elemento.ESCURIDAO),
      18: new Ataque("Devorar", 90, 90, 10, Elemento.ESCURIDAO),
      21: new Ataque("Buraco Negro", 100, 90, 10, Elemento.ESCURIDAO),
      24: new Ataque("Fúria Noturna", 110, 85, 5, Elemento.ESCURIDAO),
      27: new Ataque("Eclipse", 120, 85, 5, Elemento.ESCURIDAO),
      30: new Ataque("Fim do Mundo", 150, 80, 5, Elemento.ESCURIDAO)
    };
  }
  public evoluir(): Monstrinho | null { return null; }
}

// ==========================================
// 6. TREINADOR E NPCs
// ==========================================
export const MAX_EQUIPE = 6; // máximo de monstrinhos que um treinador leva em batalha

export class Treinador {
  public ativos: Monstrinho[] = [];
  public fragmentos: Elemento | null = null; // Estilhaço: elemento aplicado em quem entrar em campo
  public substituicaoAutomatica: boolean = false; // true para NPCs/selvagens: reserva entra sozinho quando o ativo desmaia
  public mochila: Item[] = [];
  public armazenamento: Monstrinho[] = [];
  public isSelvagem: boolean = false;
  public dinheiro: number = 0;
  public sexo: string = "Não definido";
  private limiteAtivos: number = 2; // 1 em batalha selvagem, 2 contra treinadores

  constructor(public readonly nome: string, public equipe: Monstrinho[] = []) {
    this.equipe = this.equipe.slice(0, MAX_EQUIPE);
    this.atualizarAtivosIniciais();
  }

  private atualizarAtivosIniciais(): void {
    this.ativos = this.equipe.filter(m => m.getVida() > 0).slice(0, this.limiteAtivos);
  }

  /** Define quantos monstrinhos lutam ao mesmo tempo (1 ou 2) e refaz a lista de ativos. */
  public definirLimiteAtivos(limite: number): void {
    this.limiteAtivos = limite;
    this.atualizarAtivosIniciais();
  }

  /**
   * Tira os desmaiados do campo e coloca reservas vivos no lugar (até o limite de ativos).
   * Retorna os monstrinhos que acabaram de entrar em campo.
   */
  public reporAtivosDesmaiados(): Monstrinho[] {
    this.ativos = this.ativos.filter(m => m.getVida() > 0);
    const entraram: Monstrinho[] = [];
    for (const m of this.equipe) {
      if (this.ativos.length >= this.limiteAtivos) break;
      if (m.getVida() > 0 && !this.ativos.includes(m)) {
        this.ativos.push(m);
        entraram.push(m);
      }
    }
    return entraram;
  }

  public reorganizarEquipe(indexOrigem: number, indexDestino: number): boolean {
    if (indexOrigem < 0 || indexOrigem >= this.equipe.length || 
        indexDestino < 0 || indexDestino >= this.equipe.length) {
      return false;
    }
    const monstrinho = this.equipe[indexOrigem];
    this.equipe.splice(indexOrigem, 1);
    this.equipe.splice(indexDestino, 0, monstrinho);
    this.atualizarAtivosIniciais();
    return true;
  }

  public capturarMonstrinho(novoMonstrinho: Monstrinho, trocarPor?: Monstrinho): void {
    if (this.equipe.length < MAX_EQUIPE) {
      this.equipe.push(novoMonstrinho);
      if (this.ativos.length < this.limiteAtivos) this.ativos.push(novoMonstrinho);
    } else if (trocarPor) {
      const index = this.equipe.indexOf(trocarPor);
      if (index !== -1) {
        this.armazenamento.push(trocarPor);
        this.equipe[index] = novoMonstrinho;
        const indexAtivo = this.ativos.indexOf(trocarPor);
        if (indexAtivo !== -1) this.ativos[indexAtivo] = novoMonstrinho;
      }
    } else {
      this.armazenamento.push(novoMonstrinho);
    }
  }

  public removerMonstrinho(m: Monstrinho): void {
    this.equipe = this.equipe.filter(pkmn => pkmn !== m);
    this.ativos = this.ativos.filter(pkmn => pkmn !== m);
  }

  public todosDesmaiaram(): boolean {
    return this.equipe.every(m => m.getVida() <= 0);
  }

  /** Cura total da equipe (vida, PP, estados) e reorganiza os ativos. Usado pelo Hospital. */
  public curarEquipeCompleta(): void {
    this.equipe.forEach(m => {
      m.curar(m.getVidaMaxima());
      m.restaurarTodosPP();
      m.resetarAposBatalha(); // limpa estados, elementos e modificadores
    });
    this.atualizarAtivosIniciais();
  }

  public trocarMonstrinho(antigo: Monstrinho, novo: Monstrinho): boolean {
    if (antigo.temEstado(Estado.LAMA) || novo.getVida() <= 0) return false;
    const index = this.ativos.indexOf(antigo);
    if (index !== -1) { this.ativos[index] = novo; return true; }
    return false;
  }

  public adicionarItem(item: Item): void { this.mochila.push(item); }

  public usarItem(item: Item, alvo: Monstrinho, ataqueAlvo?: Ataque): boolean {
    const index = this.mochila.indexOf(item);
    if (index === -1) return false;
    item.usar(alvo, ataqueAlvo);
    this.mochila.splice(index, 1);
    return true;
  }

  public gastarDinheiro(valor: number): boolean {
    if (this.dinheiro >= valor) { this.dinheiro -= valor; return true; }
    return false;
  }

  public adicionarDinheiro(valor: number): void { this.dinheiro += valor; }

  public verificarEvolucoes(): void {
    for (let i = 0; i < this.equipe.length; i++) {
      const monstrinhoAtual = this.equipe[i];
      const evoluido = monstrinhoAtual.evoluir();
      
      if (evoluido) {
        evoluido.restaurarEstado(monstrinhoAtual.getVida(), monstrinhoAtual.getExperiencia());
        this.equipe[i] = evoluido;
        monstrinhoAtual.getAtaques().forEach(atk => evoluido.aprenderAtaque(atk));
        const indexAtivo = this.ativos.indexOf(monstrinhoAtual);
        if (indexAtivo !== -1) this.ativos[indexAtivo] = evoluido;
        console.log(`\n🌟 UAU! ${monstrinhoAtual.nome} evoluiu para ${evoluido.nome}!\n`);
      }
    }
  }
}

export interface DadosNPC {
  id: string;
  nome: string;
  sexo?: string;
  dificuldade: Dificuldade;
  equipe: Monstrinho[];
  dinheiroPremio: number;
  textoVitoria: string;
}

/** Garante que o monstrinho do NPC use os melhores ataques disponíveis para o nível dele. */
function preparar<T extends Monstrinho>(m: T): T {
  m.equiparMelhoresAtaques();
  return m;
}

/**
 * 13 NPCs (batalhas contra treinadores são sempre 2 contra 2 em campo):
 *  - 8 Fáceis   (2 monstrinhos, níveis 3 a 6)
 *  - 4 Médios   (4 monstrinhos, níveis 20 a 22)
 *  - 1 Difícil  (6 monstrinhos, todos nível 30) - a mãe do protagonista
 */
export function criarNPCs(): DadosNPC[] {
  return [
    // ---------------- FÁCEIS (8) ----------------
    {
      id: "npc_jovem", nome: "Jovem Gary", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Ocelly(3)), preparar(new Frilizard(3)) ],
      dinheiroPremio: 50,
      textoVitoria: "Ei, você! Meu monstrinho é muito mais forte que o seu!"
    },
    {
      id: "npc_lia", nome: "Criança Lia", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Zephyling(3)), preparar(new Lumi(4)) ],
      dinheiroPremio: 30,
      textoVitoria: "Vamos brincar de batalha? Eu vou ganhar!"
    },
    {
      id: "npc_tiao", nome: "Pescador Tião", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Ocelly(4)), preparar(new Glaceow(4)) ],
      dinheiroPremio: 40,
      textoVitoria: "Hoje o peixe não mordeu, mas a batalha vai ser boa!"
    },
    {
      id: "npc_duda", nome: "Campista Duda", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Verdalisk(4)), preparar(new Lithoscorp(5)) ],
      dinheiroPremio: 45,
      textoVitoria: "Acampar com monstrinhos é o melhor! Mostra o que você tem!"
    },
    {
      id: "npc_caio", nome: "Mochileiro Caio", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Amperell(5)), preparar(new Zephyling(5)) ],
      dinheiroPremio: 55,
      textoVitoria: "Rodei o mundo todo e agora quero te desafiar!"
    },
    {
      id: "npc_bia", nome: "Estudante Bia", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Lumi(5)), preparar(new FizzyJr(5)) ],
      dinheiroPremio: 60,
      textoVitoria: "Estudei os elementos a semana inteira. Vai ser fácil!"
    },
    {
      id: "npc_davi", nome: "Menino Davi", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new Frilizard(6)), preparar(new Glaceow(6)) ],
      dinheiroPremio: 70,
      textoVitoria: "Fogo e gelo! Ninguém consegue me vencer!"
    },
    {
      id: "npc_nina", nome: "Garota Nina", dificuldade: Dificuldade.FACIL,
      equipe: [ preparar(new FizzyJr(6)), preparar(new Lumiel(6)) ],
      dinheiroPremio: 80,
      textoVitoria: "Luz, sombra e magia... prepare-se!"
    },

    // ---------------- MÉDIOS (4) ----------------
    {
      id: "npc_marina", nome: "Nadadora Marina", dificuldade: Dificuldade.MEDIO,
      equipe: [ preparar(new Jellerinna(22)), preparar(new Glacielle(21)), preparar(new Katanlisk(20)), preparar(new Hurrihawk(20)) ],
      dinheiroPremio: 250,
      textoVitoria: "As águas são minhas! Vai afundar ou nadar?"
    },
    {
      id: "npc_rogerio", nome: "Montanhista Rogério", dificuldade: Dificuldade.MEDIO,
      equipe: [ preparar(new Rockpion(22)), preparar(new Electrusa(21)), preparar(new Flareperor(20)), preparar(new Katanlisk(20)) ],
      dinheiroPremio: 280,
      textoVitoria: "Escalei montanhas maiores do que você!"
    },
    {
      id: "npc_kaito", nome: "Ninja Kaito", dificuldade: Dificuldade.MEDIO,
      equipe: [ preparar(new Hurrihawk(22)), preparar(new Shadenight(21)), preparar(new Electrusa(20)), preparar(new Glacielle(20)) ],
      dinheiroPremio: 320,
      textoVitoria: "Você não vai nem me ver chegando..."
    },
    {
      id: "npc_selene", nome: "Mística Selene", dificuldade: Dificuldade.MEDIO,
      equipe: [ preparar(new Fizzarolly(22)), preparar(new Celestina(21)), preparar(new Shadenight(20)), preparar(new Flareperor(20)) ],
      dinheiroPremio: 350,
      textoVitoria: "As estrelas previram esta batalha. Elas também previram o resultado."
    },

    // ---------------- DIFÍCIL (1) ----------------
    {
      id: "npc_mae", nome: "Mamãe", sexo: "Feminino", dificuldade: Dificuldade.DIFICIL,
      equipe: [
        preparar(new Flareperor(30)), preparar(new Jellerinna(30)), preparar(new Katanlisk(30)),
        preparar(new Electrusa(30)), preparar(new Celestina(30)), preparar(new Shadenight(30))
      ],
      dinheiroPremio: 1000,
      textoVitoria: "Você cresceu tanto, meu bem... mas a mamãe ainda tem muito a te ensinar. Venha!"
    }
  ];
}

/** Atalho: lista só os NPCs de uma dificuldade. */
export function npcsPorDificuldade(dificuldade: Dificuldade): DadosNPC[] {
  return criarNPCs().filter(n => n.dificuldade === dificuldade);
}

/** Converte os dados de um NPC em um Treinador pronto para batalhar (reservas entram sozinhas). */
export function criarTreinadorNPC(dados: DadosNPC): Treinador {
  const t = new Treinador(dados.nome, dados.equipe);
  if (dados.sexo) t.sexo = dados.sexo;
  t.dinheiro = dados.dinheiroPremio;
  t.substituicaoAutomatica = true;
  return t;
}

// ==========================================
// 7. ITENS E EXPLORAÇÃO
// ==========================================
export const PocaoInicial = new Item("Poção Inicial", (alvo) => alvo.curar(10));
export const PocaoIntermediaria = new Item("Poção Intermediária", (alvo) => alvo.curar(20));
export const PocaoAvancada = new Item("Poção Avançada", (alvo) => alvo.curar(40));
export const Vitalizador = new Item("Vitalizador", (alvo, ataque) => { if (ataque) ataque.restaurarPP(); });
export const VitalizadorSupremo = new Item("Vitalizador Supremo", (alvo) => alvo.restaurarTodosPP());
export const CapturadorComum = new ItemCaptura("Capturador Comum", 1.0);
export const CapturadorAvancado = new ItemCaptura("Capturador Avançado", 1.5);
export const CapturadorSupremo = new ItemCaptura("Capturador Supremo", 2.0);

export class GramaAlta {
  private chances: Record<Elemento, number> = {
    [Elemento.LUZ]: 5, [Elemento.ESCURIDAO]: 5, [Elemento.MISTICO]: 5,
    [Elemento.AGUA]: 10, [Elemento.PLANTA]: 10, [Elemento.FOGO]: 10,
    [Elemento.PEDRA]: 13.75, [Elemento.ELETRICO]: 13.75, [Elemento.GELO]: 13.75, [Elemento.VENTO]: 13.75,
  };

  private pokedexBase: Record<Elemento, () => Monstrinho> = {
    [Elemento.LUZ]: () => new Lumi(), [Elemento.ESCURIDAO]: () => new Lumiel(),
    [Elemento.MISTICO]: () => new FizzyJr(), [Elemento.AGUA]: () => new Ocelly(),
    [Elemento.PLANTA]: () => new Verdalisk(), [Elemento.FOGO]: () => new Frilizard(),
    [Elemento.PEDRA]: () => new Lithoscorp(), [Elemento.ELETRICO]: () => new Amperell(),
    [Elemento.GELO]: () => new Glaceow(), [Elemento.VENTO]: () => new Zephyling(),
  };

  public explorar(): Monstrinho {
    const random = Math.random() * 100;
    let acumulado = 0;
    for (const elemento in this.chances) {
      acumulado += this.chances[elemento as Elemento];
      if (random <= acumulado) return this.pokedexBase[elemento as Elemento]();
    }
    return this.pokedexBase[Elemento.FOGO]();
  }

  /** Encontro no matinho: cria o treinador selvagem e inicia uma batalha 1 contra 1. */
  public iniciarBatalha(jogador: Treinador): Batalha {
    const selvagem = new Treinador("Selvagem", [this.explorar()]);
    selvagem.isSelvagem = true;
    return new Batalha(jogador, selvagem);
  }
}

// ==========================================
// 7.4 INÍCIO DO JOGO
// ==========================================
export type EscolhaInicial = "fogo" | "agua" | "planta";

/** Cria o monstrinho inicial escolhido pelo jogador, já no nível 5. */
export function criarMonstrinhoInicial(escolha: EscolhaInicial): Monstrinho {
  switch (escolha) {
    case "fogo":   return new Frilizard(NIVEL_INICIAL);
    case "agua":   return new Ocelly(NIVEL_INICIAL);
    case "planta": return new Verdalisk(NIVEL_INICIAL);
  }
}

/** Cria o jogador: monstrinho inicial nível 5, 10 Capturadores Comuns e 10 Poções Iniciais. */
export function criarJogador(nome: string, escolha: EscolhaInicial): Treinador {
  const jogador = new Treinador(nome, [criarMonstrinhoInicial(escolha)]);
  for (let i = 0; i < CAPTURADORES_INICIAIS; i++) jogador.adicionarItem(CapturadorComum);
  for (let i = 0; i < POCOES_INICIAIS; i++) jogador.adicionarItem(PocaoInicial);
  return jogador;
}

// ==========================================
// 7.5 HOSPITAL E LOJA
// ==========================================
export class Hospital {
  /** Cura toda a equipe de graça: vida, PP, estados (inclusive desmaiados). */
  public curar(treinador: Treinador): string {
    if (treinador.equipe.length === 0) return "🏥 Você não tem monstrinhos para curar.";
    treinador.curarEquipeCompleta();
    return "🏥 Sua equipe foi totalmente curada. Esperamos você de volta!";
  }
}

export interface ItemLoja {
  item: Item;
  preco: number;
}

export class Loja {
  // Preços ajustáveis
  public readonly catalogo: ItemLoja[] = [
    { item: PocaoInicial, preco: 20 },
    { item: PocaoIntermediaria, preco: 50 },
    { item: PocaoAvancada, preco: 120 },
    { item: Vitalizador, preco: 40 },
    { item: VitalizadorSupremo, preco: 150 },
    { item: CapturadorComum, preco: 30 },
    { item: CapturadorAvancado, preco: 80 },
    { item: CapturadorSupremo, preco: 200 },
  ];

  public listar(): string[] {
    return this.catalogo.map(i => `${i.item.nome} - $${i.preco}`);
  }

  public comprar(treinador: Treinador, item: Item, quantidade: number = 1): string {
    const entrada = this.catalogo.find(i => i.item === item);
    if (!entrada) return "❌ Esse item não é vendido aqui.";
    if (quantidade < 1) return "❌ Quantidade inválida.";

    const total = entrada.preco * quantidade;
    if (!treinador.gastarDinheiro(total)) {
      return `❌ Dinheiro insuficiente! ${quantidade}x ${item.nome} custa $${total}.`;
    }
    for (let i = 0; i < quantidade; i++) treinador.adicionarItem(item);
    return `🛒 Você comprou ${quantidade}x ${item.nome} por $${total}.`;
  }
}

// ==========================================
// 8. GERENCIADOR DE REAÇÕES
// ==========================================

// Condutividade: dano AoE = dano do golpe * FATOR_BASE * BONUS.
// Ajuste esses dois valores para balancear a reação.
const CONDUTIVIDADE_FATOR_BASE = 0.5;
const CONDUTIVIDADE_BONUS = 1.5;

export class GerenciadorDeReacoes {

  /**
   * Aplica um elemento no alvo e resolve a reação, se houver.
   * Retorna uma mensagem descritiva (ou null se foi só a primeira aplicação).
   */
  public static aplicarElementoComReacao(
    alvo: Monstrinho,
    elemento: Elemento,
    atacante: Monstrinho,
    batalha: Batalha,
    danoCausado: number,
    profundidade: number = 0
  ): string | null {
    const mensagens: string[] = [];

    // Mística: 25% de chance de gerar uma reação aleatória ao aplicar o elemento Místico
    if (elemento === Elemento.MISTICO) {
      const msgMistica = GerenciadorDeReacoes.aplicarMistica(alvo, atacante, batalha, danoCausado, profundidade);
      if (msgMistica) mensagens.push(msgMistica);
    }

    // Cegueira: ocorre ao aplicar Luz em qualquer monstrinho, sem precisar de outro elemento aplicado
    if (elemento === Elemento.LUZ) {
      mensagens.push(GerenciadorDeReacoes.aplicarCegueira(alvo));
    }

    // Sangramento: ocorre ao aplicar Escuridão em qualquer monstrinho, sem precisar de outro elemento
    if (elemento === Elemento.ESCURIDAO) {
      mensagens.push(GerenciadorDeReacoes.aplicarSangramento(alvo));
    }

    const combinacao = alvo.aplicarElemento(elemento);
    if (combinacao) {
      const reagiu = GerenciadorDeReacoes.processarReacao(
        combinacao[0], combinacao[1], alvo, atacante, batalha, danoCausado, profundidade
      );
      if (!reagiu) {
        alvo.aplicarElemento(elemento); // Substitui o antigo
        mensagens.push(`Elemento ${elemento} substituiu o anterior`);
      } else {
        mensagens.push(`Reação: ${TabelaReacoes[`${combinacao[0]}_${combinacao[1]}`]}`);
      }
    }

    return mensagens.length > 0 ? mensagens.join("; ") : null;
  }

  /** Reação Mística: chance de gerar uma reação aleatória (qualquer reação existente). */
  public static aplicarMistica(
    alvo: Monstrinho,
    atacante: Monstrinho,
    batalha: Batalha,
    danoCausado: number,
    profundidade: number
  ): string | null {
    if (Math.random() >= CHANCE_MISTICA) return null;
    const sorteada = REACOES_ALEATORIAS[Math.floor(Math.random() * REACOES_ALEATORIAS.length)];
    console.log(`🔮 REAÇÃO ATIVADA em ${alvo.nome}: Mística!`);
    // Se sortear Redemoinho, o elemento espalhado é o Místico
    GerenciadorDeReacoes.executarEfeito(sorteada, alvo, atacante, batalha, danoCausado, profundidade, Elemento.MISTICO);
    return `Reação: Mística → ${sorteada}`;
  }

  /** Reação de Sangramento: perde parte da vida a cada turno. Sem stacks. */
  public static aplicarSangramento(alvo: Monstrinho): string {
    if (alvo.temEstado(Estado.SANGRANDO)) return "Sangramento já ativo";
    alvo.adicionarEstado(Estado.SANGRANDO);
    console.log(`✨ REAÇÃO ATIVADA em ${alvo.nome}: Sangramento!`);
    return "Reação: Sangramento";
  }

  /** Reação de Cegueira: -5% de precisão por stack, até 5 stacks. */
  public static aplicarCegueira(alvo: Monstrinho): string {
    if (!alvo.adicionarStackCegueira()) {
      return `Cegueira já está no máximo (${MAX_STACKS_CEGUEIRA}/${MAX_STACKS_CEGUEIRA})`;
    }
    console.log(`✨ REAÇÃO ATIVADA em ${alvo.nome}: Cegueira!`);
    return `Reação: Cegueira (${alvo.getStacksCegueira()}/${MAX_STACKS_CEGUEIRA}, precisão ${alvo.getPrecisao()}%)`;
  }

  public static processarReacao(
    elementoAplicado: Elemento,
    elementoNovo: Elemento,
    alvo: Monstrinho,
    atacante: Monstrinho,
    batalha: Batalha,
    danoCausado: number = 0,
    profundidade: number = 0
  ): boolean {
    const chave = `${elementoAplicado}_${elementoNovo}`;
    const nomeReacao = TabelaReacoes[chave];
    if (!nomeReacao) return false;

    const elementoEspalhavel = elementoAplicado === Elemento.VENTO ? elementoNovo : elementoAplicado;
    GerenciadorDeReacoes.executarEfeito(nomeReacao, alvo, atacante, batalha, danoCausado, profundidade, elementoEspalhavel, elementoAplicado);
    return true;
  }

  /** Executa o efeito de uma reação pelo nome. Usado pelas reações normais e pela Mística. */
  public static executarEfeito(
    nomeReacao: string,
    alvo: Monstrinho,
    atacante: Monstrinho,
    batalha: Batalha,
    danoCausado: number,
    profundidade: number,
    elementoEspalhavel: Elemento,
    elementoPrimeiro?: Elemento // elemento que estava aplicado antes (usado pelo Estilhaço)
  ): void {
    console.log(`✨ REAÇÃO ATIVADA em ${alvo.nome}: ${nomeReacao}!`);
    switch (nomeReacao) {
      case "Vaporizacao":
        alvo.aplicarModificador('defesa', 0.8);
        break;

      case "Queimadura":
        alvo.adicionarEstado(Estado.QUEIMADO);
        break;

      case "Vinhas":
        // Diminui a velocidade do monstrinho
        alvo.aplicarModificador('velocidade', 0.8);
        console.log(`   -> ${alvo.nome} ficou preso nas vinhas (velocidade reduzida)!`);
        break;

      case "Condutividade": {
        // Dano AoE em todos os monstrinhos ativos do time do alvo, com dano aumentado
        const danoAoe = Math.max(1, Math.floor(danoCausado * CONDUTIVIDADE_FATOR_BASE * CONDUTIVIDADE_BONUS));
        const time = batalha.getAtivosDoTime(alvo).filter(m => m.getVida() > 0);
        for (const m of time) {
          m.receberDano(danoAoe);
          console.log(`   -> ⚡ Condutividade causou ${danoAoe} de dano em ${m.nome}!`);
        }
        break;
      }

      case "Redemoinho": {
        // Espalha o outro elemento (o que não é Vento) para o companheiro de batalha
        if (profundidade >= 1) break; // evita cadeia infinita de reações
        const elementoEspalhado = elementoEspalhavel;
        const companheiros = batalha.getAtivosDoTime(alvo).filter(m => m !== alvo && m.getVida() > 0);
        for (const comp of companheiros) {
          console.log(`   -> 🌪️ O redemoinho espalhou ${elementoEspalhado} para ${comp.nome}!`);
          const msg = GerenciadorDeReacoes.aplicarElementoComReacao(
            comp, elementoEspalhado, atacante, batalha, danoCausado, profundidade + 1
          );
          if (msg) console.log(`      (${comp.nome}: ${msg})`);
        }
        break;
      }

      case "Dissipa":
        break; // intencional: sem efeito

      case "Lama":
        alvo.adicionarEstado(Estado.LAMA);
        break;

      case "Confusao":
        alvo.adicionarEstado(Estado.CONFUSO);
        break;

      case "Congelamento":
        alvo.adicionarEstado(Estado.CONGELADO);
        break;

      case "Derretimento":
        // Gelo + Fogo: os dois elementos são consumidos e Água é aplicada no lugar
        alvo.limparElementos();
        alvo.aplicarElemento(Elemento.AGUA);
        console.log(`   -> 💧 O gelo derreteu e ${alvo.nome} ficou molhado (Água aplicada)!`);
        break;

      case "Cegueira":
        // Usada quando a Cegueira é sorteada pela Mística (a Cegueira normal vem de aplicarCegueira)
        if (alvo.adicionarStackCegueira()) {
          console.log(`   -> 🌑 ${alvo.nome} ficou cego (${alvo.getStacksCegueira()}/${MAX_STACKS_CEGUEIRA})!`);
        }
        break;

      case "Sangramento":
        // Usada quando o Sangramento é sorteado pela Mística (o normal vem de aplicarSangramento)
        alvo.adicionarEstado(Estado.SANGRANDO);
        break;

      case "Hibernacao":
        // Grama + Gelo: o alvo não pode atacar por 3 turnos, mas acorda ao ser atacado
        alvo.hibernar(3);
        console.log(`   -> 😴 ${alvo.nome} entrou em hibernação por 3 turnos!`);
        break;

      case "Estilhaco": {
        // Pedra + Gelo: deixa fragmentos no campo do alvo. Quem entrar em campo leva dano e recebe o
        // elemento que estava aplicado primeiro. (Se vier da Mística, sorteia Pedra ou Gelo.)
        const treinador = batalha.getTreinadorDe(alvo);
        if (treinador) {
          const el = elementoPrimeiro ?? (Math.random() < 0.5 ? Elemento.PEDRA : Elemento.GELO);
          treinador.fragmentos = el;
          console.log(`   -> 💎 Fragmentos de ${el} se espalharam pelo campo de ${treinador.nome}!`);
        }
        break;
      }
    }
  }
}

// ==========================================
// 9. AÇÕES E BATALHA
// ==========================================
export interface Acao {
  prioridade: number;
  usuario: Monstrinho | Treinador;
  executar(batalha: Batalha): void;
}

export class AcaoAtacar implements Acao {
  prioridade = 1;
  constructor(public usuario: Monstrinho, public alvo: Monstrinho, public ataque: Ataque) {}
  executar(batalha: Batalha): void {
    if (!this.ataque.temPP()) return;
    this.ataque.consumirPP();
    // A checagem de Congelado/Dormindo/Confuso agora é feita dentro de processarAtaque
    batalha.processarAtaque(this.usuario, this.alvo, this.ataque);
  }
}

export class AcaoTrocar implements Acao {
  prioridade = 3;
  constructor(public usuario: Treinador, public antigoMonstrinho: Monstrinho, public novoMonstrinho: Monstrinho) {}
  executar(batalha: Batalha): void {
    if (this.usuario.trocarMonstrinho(this.antigoMonstrinho, this.novoMonstrinho)) {
      const log = batalha.aoEntrarEmCampo(this.usuario, this.novoMonstrinho);
      if (log) console.log(log);
    }
  }
}

export class AcaoItem implements Acao {
  prioridade = 2;
  constructor(public usuario: Treinador, public item: Item, public alvo: Monstrinho, public ataqueAlvo?: Ataque) {}
  executar(batalha: Batalha): void { this.usuario.usarItem(this.item, this.alvo, this.ataqueAlvo); }
}

export class AcaoCapturar implements Acao {
  prioridade = 2; 
  constructor(public usuario: Treinador, public alvo: Monstrinho, public capturador: ItemCaptura) {}
  executar(batalha: Batalha): void { batalha.processarCaptura(this.usuario, this.alvo, this.capturador); }
}


export class Batalha {
  private estado: StatusBatalha = StatusBatalha.EM_ANDAMENTO;
  private filaDeAcoes: Acao[] = [];

  constructor(public treinador1: Treinador, public treinador2: Treinador) {
    // Selvagem (matinho): 1 contra 1. Contra treinadores: sempre 2 contra 2.
    const limite = (treinador1.isSelvagem || treinador2.isSelvagem) ? 1 : 2;
    treinador1.definirLimiteAtivos(limite);
    treinador2.definirLimiteAtivos(limite);
  }

  public registrarAcao(acao: Acao): void { this.filaDeAcoes.push(acao); }

  /** Retorna os monstrinhos ativos do time ao qual o monstrinho pertence. */
  public getAtivosDoTime(m: Monstrinho): Monstrinho[] {
    const treinador = this.getTreinadorDe(m);
    return treinador ? treinador.ativos : [m];
  }

  /** Retorna o treinador dono do monstrinho (ou undefined). */
  public getTreinadorDe(m: Monstrinho): Treinador | undefined {
    return [this.treinador1, this.treinador2]
      .find(t => t.ativos.includes(m) || t.equipe.includes(m));
  }

  /**
   * Chamado quando um monstrinho entra em campo (troca ou reposição).
   * Se há fragmentos de Estilhaço no campo do treinador, o monstrinho leva dano e recebe o elemento
   * guardado. Os fragmentos são usados (somem) depois disso.
   */
  public aoEntrarEmCampo(treinador: Treinador, m: Monstrinho): string | null {
    const elemento = treinador.fragmentos;
    if (!elemento) return null;
    treinador.fragmentos = null;

    const dano = Math.max(1, Math.floor(m.getVidaMaxima() * DANO_ESTILHACO));
    m.receberDano(dano);
    let msg = `💎 Os estilhaços feriram ${m.nome} (${dano} de dano)`;
    if (m.getVida() > 0) {
      const reacao = GerenciadorDeReacoes.aplicarElementoComReacao(m, elemento, m, this, dano, 1);
      msg += ` e aplicaram ${elemento}` + (reacao ? ` (${reacao})` : "");
    }
    this.verificarFimDeJogo();
    return msg + "!";
  }

  /** Checa estados que impedem o monstrinho de agir. Retorna mensagem se ele não agiu. */
  private podeAgir(m: Monstrinho): string | null {
    if (m.temEstado(Estado.HIBERNANDO)) {
      const restantes = m.consumirTurnoHibernacao();
      return restantes > 0
        ? `😴 ${m.nome} está hibernando e não pode atacar! (restam ${restantes} turno(s))`
        : `😴 ${m.nome} está hibernando e não pode atacar! (acorda no próximo turno)`;
    }
    if (m.temEstado(Estado.CONGELADO)) {
      if (Math.random() < 0.2) { m.removerEstado(Estado.CONGELADO); return null; }
      return `🧊 ${m.nome} está congelado e não conseguiu agir!`;
    }
    if (m.temEstado(Estado.DORMINDO)) {
      if (Math.random() < 0.33) { m.removerEstado(Estado.DORMINDO); return null; }
      return `💤 ${m.nome} está dormindo!`;
    }
    if (m.temEstado(Estado.CONFUSO)) {
      if (Math.random() < 0.33) { m.removerEstado(Estado.CONFUSO); return null; }
      if (Math.random() < 0.33) {
        const dano = Math.max(1, Math.floor(m.getVidaMaxima() * 0.1));
        m.receberDano(dano);
        return `😵 ${m.nome} está confuso e se machucou (${dano} de dano)!`;
      }
    }
    return null;
  }

  public processarAtaque(atacante: Monstrinho, defensor: Monstrinho, ataque: Ataque): string {
    if (defensor.getVida() <= 0) return "";

    const bloqueio = this.podeAgir(atacante);
    if (bloqueio) { this.verificarFimDeJogo(); return bloqueio; }

    if (!ataque.temPP()) return `${atacante.nome} está sem PP!`;
    
    // Precisão: a do ataque multiplicada pela do monstrinho (afetada por cegueira e modificadores)
    const precisaoEfetiva = ataque.getPrecisao() * atacante.getPrecisao() / 100;
    if (Math.random() * 100 > precisaoEfetiva) {
      return `❌ ${atacante.nome} errou o ataque ${ataque.getNome()} em ${defensor.nome}!`;
    }

    // Cálculo de dano
    let danoBase = ((((2 * atacante.getNivel() / 5) + 2) * ataque.getPoderBase() * atacante.getAtaque()) / defensor.getDefesa()) / 50 + 2;
    if (ataque.getElemento() === atacante.getElementoInerente()) danoBase *= 1.5; 
    danoBase *= TabelaEfetividade[ataque.getElemento()]?.[defensor.getElementoInerente()] ?? 1;
    
    let msgCritico = "";
    if (Math.random() < 0.1) { danoBase *= 1.5; msgCritico = " (Crítico!)"; }
    const dano = Math.floor(danoBase * (Math.random() * 0.15 + 0.85));
    
    defensor.receberDano(dano);
    // Ser atacado acorda da Hibernação (feito antes das reações, para não acordar na hora que hiberna)
    if (defensor.acordarHibernacao()) console.log(`⏰ ${defensor.nome} acordou da hibernação!`);
    
    // Lógica de Elementos e Reações (o elemento vem do monstrinho)
    const elementoNovo = atacante.getElementoInerente();
    const resultadoReacao = GerenciadorDeReacoes.aplicarElementoComReacao(
      defensor, elementoNovo, atacante, this, dano
    );
    const msgReacao = resultadoReacao ? ` (${resultadoReacao})` : "";

    this.verificarFimDeJogo();
    
    return `⚔️ ${atacante.nome} causou ${dano} de dano em ${defensor.nome} com ${ataque.getNome()}!${msgCritico}${msgReacao}`;
  }

  public executarTurnoCompleto(acoesJogador: AcaoAtacar[], acoesInimigo: AcaoAtacar[]): string[] {
    const logs: string[] = [];
    
    // Junta as ações de ataque (Ações de troca/item devem ser feitas fora deste método ou no início do turno)
    const todasAcoes = [...acoesJogador, ...acoesInimigo].sort((a, b) => {
      return b.usuario.getVelocidade() - a.usuario.getVelocidade();
    });

    for (const acao of todasAcoes) {
      if (acao.usuario.getVida() > 0 && acao.alvo.getVida() > 0) {
        const log = this.processarAtaque(acao.usuario, acao.alvo, acao.ataque);
        if (log !== "") logs.push(log);
      }
    }

    // Processa Queimadura/Sangramento
    const logsStatus = this.processarEfeitosFimDeTurno();
    logs.push(...logsStatus);

    // Reservas de NPCs/selvagens entram no lugar dos desmaiados
    for (const t of [this.treinador1, this.treinador2]) {
      if (!t.substituicaoAutomatica || this.estado === StatusBatalha.FINALIZADA) continue;
      for (const m of t.reporAtivosDesmaiados()) {
        logs.push(`🔁 ${t.nome} enviou ${m.nome} para a batalha!`);
        const logEstilhaco = this.aoEntrarEmCampo(t, m);
        if (logEstilhaco) logs.push(logEstilhaco);
      }
    }

    this.verificarFimDeJogo();
    return logs;
  }

  public processarCaptura(treinador: Treinador, alvo: Monstrinho, capturador: ItemCaptura): string {
    const oponente = treinador === this.treinador1 ? this.treinador2 : this.treinador1;
    if (!oponente.isSelvagem) return "Você não pode capturar o monstrinho de outro treinador!";
    
    const indexItem = treinador.mochila.indexOf(capturador);
    if (indexItem !== -1) treinador.mochila.splice(indexItem, 1); // Consome o item

    let statusMultiplier = 1.0;
    if (alvo.temEstado(Estado.DORMINDO) || alvo.temEstado(Estado.CONGELADO)) statusMultiplier = 2.0;
    else if (alvo.getEstados().length > 0) statusMultiplier = 1.5;

    const vidaMax = alvo.getVidaMaxima(); const vidaAtual = alvo.getVida(); const taxa = alvo.getTaxaCaptura();
    
    const a = ((3 * vidaMax - 2 * vidaAtual) * taxa * capturador.bonus * statusMultiplier) / (3 * vidaMax);
    const roll = Math.floor(Math.random() * 256);

    if (roll <= a) {
      oponente.equipe = oponente.equipe.filter(m => m !== alvo);
      oponente.ativos = oponente.ativos.filter(m => m !== alvo);
      // Quem estava em campo (vivo) antes da captura ganha experiência pelo nível do capturado
      const beneficiados = treinador.ativos.filter(m => m.getVida() > 0 && m !== alvo);
      const xp = alvo.getNivel() * XP_CAPTURA_POR_NIVEL;
      treinador.capturarMonstrinho(alvo);
      beneficiados.forEach(m => m.ganharExperiencia(xp));
      this.verificarFimDeJogo();
      return `✨ CLICK! ${alvo.nome} foi capturado com sucesso! Seus monstrinhos ativos ganharam ${xp} de experiência.`;
    } else {
      return `❌ Ah não! ${alvo.nome} escapou da captura!`;
    }
  }

  public processarEfeitosFimDeTurno(): string[] {
    const logs: string[] = [];
    const processarStatus = (treinador: Treinador) => {
      treinador.equipe.forEach(m => {
        if (m.getVida() <= 0) return;
        
        if (m.temEstado(Estado.QUEIMADO)) {
          const dano = Math.floor(m.getVidaMaxima() * 0.05);
          m.receberDano(dano);
          logs.push(`🔥 ${m.nome} sofreu ${dano} de dano por Queimadura.`);
        }
        if (m.temEstado(Estado.SANGRANDO)) {
          const dano = Math.floor(m.getVidaMaxima() * 0.05);
          m.receberDano(dano);
          logs.push(`🩸 ${m.nome} sofreu ${dano} de dano por Sangramento.`);
        }
      });
    };
    processarStatus(this.treinador1);
    processarStatus(this.treinador2);
    this.verificarFimDeJogo();
    return logs;
  }

  public getEstado(): StatusBatalha { return this.estado; }

  private verificarFimDeJogo(): void {
    if (this.treinador1.todosDesmaiaram() || this.treinador2.todosDesmaiaram() || this.treinador1.equipe.length === 0 || this.treinador2.equipe.length === 0) {
      this.estado = StatusBatalha.FINALIZADA;
      // Limpa os status ao final
      const resetarEquipe = (treinador: Treinador) => {
        treinador.equipe.forEach(m => m.resetarAposBatalha());
        treinador.ativos.forEach(m => m.resetarAposBatalha());
      };
      resetarEquipe(this.treinador1);
      resetarEquipe(this.treinador2);
      // Os fragmentos de Estilhaço somem ao fim da batalha
      this.treinador1.fragmentos = null;
      this.treinador2.fragmentos = null;
      // Fora de batalha o padrão volta a ser 2 ativos
      this.treinador1.definirLimiteAtivos(2);
      this.treinador2.definirLimiteAtivos(2);
    }
  }
}
