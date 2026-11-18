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
  CONFUSO = "Confuso", LAMA = "Lama", QUEIMADO = "Queimado", SANGRANDO = "Sangrando"
}

export enum StatusBatalha {
  EM_ANDAMENTO = "Em Andamento", FINALIZADA = "Finalizada"
}

// ==========================================
// 2. TABELAS DE REGRAS
// ==========================================

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

export const TabelaReacoes: Record<string, string> = {
  [`${Elemento.FOGO}_${Elemento.AGUA}`]: "Vaporizacao",
  [`${Elemento.AGUA}_${Elemento.FOGO}`]: "Vaporizacao",
  [`${Elemento.FOGO}_${Elemento.PLANTA}`]: "Queimadura",
  [`${Elemento.AGUA}_${Elemento.PLANTA}`]: "Vinhas",
  [`${Elemento.PLANTA}_${Elemento.AGUA}`]: "Vinhas",
  [`${Elemento.ELETRICO}_${Elemento.PEDRA}`]: "Condutividade",
  [`${Elemento.VENTO}_${Elemento.FOGO}`]: "Redemoinho",
  [`${Elemento.FOGO}_${Elemento.VENTO}`]: "Dissipa",
  [`${Elemento.AGUA}_${Elemento.PEDRA}`]: "Lama",
  [`${Elemento.PEDRA}_${Elemento.AGUA}`]: "Lama",
  [`${Elemento.AGUA}_${Elemento.ELETRICO}`]: "Confusao",
  [`${Elemento.ELETRICO}_${Elemento.AGUA}`]: "Confusao",
  [`${Elemento.AGUA}_${Elemento.GELO}`]: "Congelamento",
  [`${Elemento.GELO}_${Elemento.AGUA}`]: "Congelamento",
};

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

// ==========================================
// 4. CLASSE ABSTRATA MONSTRINHO
// ==========================================
export abstract class Monstrinho {
  protected vidaAtual: number;
  protected ataques: Ataque[] = [];
  protected elementosAplicados: Elemento[] = [];
  protected estados: Estado[] = [];
  protected modificadores = { ataque: 1, defesa: 1, velocidade: 1, precisao: 1 };
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
  public getPrecisao(): number { return Math.floor(this.precisao * this.modificadores.precisao); }
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
    this.limparElementos();
    this.estados = []; 
  }
}

// ==========================================
// 5. POKEDEX
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
// 6. TREINADOR
// ==========================================
export class Treinador {
  public ativos: Monstrinho[] = [];
  public mochila: Item[] = [];
  public armazenamento: Monstrinho[] = [];
  public isSelvagem: boolean = false;

  constructor(public readonly nome: string, public equipe: Monstrinho[] = []) {
    this.atualizarAtivosIniciais();
  }

  private atualizarAtivosIniciais(): void {
    this.ativos = this.equipe.filter(m => m.getVida() > 0).slice(0, 2);
  }

  // NOVO MÉTODO: Reorganizar a ordem dos monstrinhos na equipe
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
    if (this.equipe.length < 6) {
      this.equipe.push(novoMonstrinho);
      if (this.ativos.length < 2) this.ativos.push(novoMonstrinho);
      console.log(`✅ ${novoMonstrinho.nome} foi adicionado à equipe de ${this.nome}!`);
    } else if (trocarPor) {
      const index = this.equipe.indexOf(trocarPor);
      if (index !== -1) {
        this.armazenamento.push(trocarPor);
        this.equipe[index] = novoMonstrinho;
        const indexAtivo = this.ativos.indexOf(trocarPor);
        if (indexAtivo !== -1) this.ativos[indexAtivo] = novoMonstrinho;
        console.log(`🔄 ${novoMonstrinho.nome} entrou na equipe. ${trocarPor.nome} foi para o armazenamento.`);
      }
    } else {
      this.armazenamento.push(novoMonstrinho);
      console.log(`📦 Equipe cheia! ${novoMonstrinho.nome} foi enviado para o armazenamento.`);
    }
  }

  public removerMonstrinho(m: Monstrinho): void {
    this.equipe = this.equipe.filter(pkmn => pkmn !== m);
    this.ativos = this.ativos.filter(pkmn => pkmn !== m);
  }

  public todosDesmaiaram(): boolean {
    return this.equipe.every(m => m.getVida() <= 0);
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

// ==========================================
// 7. ITENS
// ==========================================
export const PocaoInicial = new Item("Poção Inicial", (alvo) => alvo.curar(10));
export const PocaoIntermediaria = new Item("Poção Intermediária", (alvo) => alvo.curar(20));
export const PocaoAvancada = new Item("Poção Avançada", (alvo) => alvo.curar(40));
export const Vitalizador = new Item("Vitalizador", (alvo, ataque) => { if (ataque) ataque.restaurarPP(); });
export const VitalizadorSupremo = new Item("Vitalizador Supremo", (alvo) => alvo.restaurarTodosPP());

export const CapturadorComum = new ItemCaptura("Capturador Comum", 1.0);
export const CapturadorAvancado = new ItemCaptura("Capturador Avançado", 1.5);
export const CapturadorSupremo = new ItemCaptura("Capturador Supremo", 2.0);

// ==========================================
// 8. SISTEMA DE EXPLORAÇÃO
// ==========================================
export class GramaAlta {
  private chances: Record<Elemento, number> = {
    [Elemento.LUZ]: 5,
    [Elemento.ESCURIDAO]: 5,
    [Elemento.MISTICO]: 5,
    [Elemento.AGUA]: 10,
    [Elemento.PLANTA]: 10,
    [Elemento.FOGO]: 10,
    [Elemento.PEDRA]: 13.75,
    [Elemento.ELETRICO]: 13.75,
    [Elemento.GELO]: 13.75,
    [Elemento.VENTO]: 13.75,
  };

  private pokedexBase: Record<Elemento, () => Monstrinho> = {
    [Elemento.LUZ]: () => new Lumi(),
    [Elemento.ESCURIDAO]: () => new Lumiel(),
    [Elemento.MISTICO]: () => new FizzyJr(),
    [Elemento.AGUA]: () => new Ocelly(),
    [Elemento.PLANTA]: () => new Verdalisk(),
    [Elemento.FOGO]: () => new Frilizard(),
    [Elemento.PEDRA]: () => new Lithoscorp(),
    [Elemento.ELETRICO]: () => new Amperell(),
    [Elemento.GELO]: () => new Glaceow(),
    [Elemento.VENTO]: () => new Zephyling(),
  };

  public explorar(): Monstrinho {
    const random = Math.random() * 100;
    let acumulado = 0;
    
    for (const elemento in this.chances) {
      acumulado += this.chances[elemento as Elemento];
      if (random <= acumulado) {
        return this.pokedexBase[elemento as Elemento]();
      }
    }
    return this.pokedexBase[Elemento.FOGO]();
  }
}

// ==========================================
// 9. AÇÕES
// ==========================================
export interface Acao {
  prioridade: number;
  usuario: Monstrinho | Treinador;
  executar(batalha: Batalha): void;
}

export class AcaoAtacar implements Acao {
  prioridade = 1;
  constructor(public usuario: Monstrinho, public alvo: Monstrinho | Monstrinho[], public ataque: Ataque) {}
  executar(batalha: Batalha): void {
    if (this.usuario.temEstado(Estado.DORMINDO) || this.usuario.temEstado(Estado.CONGELADO)) return;
    if (!this.ataque.temPP()) return;
    this.ataque.consumirPP();
    batalha.processarAtaque(this.usuario, this.alvo, this.ataque);
  }
}

export class AcaoTrocar implements Acao {
  prioridade = 3;
  constructor(public usuario: Treinador, public antigoMonstrinho: Monstrinho, public novoMonstrinho: Monstrinho) {}
  executar(batalha: Batalha): void { this.usuario.trocarMonstrinho(this.antigoMonstrinho, this.novoMonstrinho); }
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

// ==========================================
// 10. GERENCIADOR DE REAÇÕES
// ==========================================
export class GerenciadorDeReacoes {
  public static processarReacao(elementoAplicado: Elemento, elementoNovo: Elemento, alvo: Monstrinho, atacante: Monstrinho): boolean {
    const chave = `${elementoAplicado}_${elementoNovo}`;
    const nomeReacao = TabelaReacoes[chave];
    if (!nomeReacao) return false;

    console.log(`✨ REAÇÃO ATIVADA em ${alvo.nome}: ${nomeReacao}!`);
    switch (nomeReacao) {
      case "Vaporizacao": alvo.aplicarModificador('defesa', 0.8); break;
      case "Queimadura": alvo.adicionarEstado(Estado.QUEIMADO); break;
      case "Dissipa": break;
      case "Lama": alvo.adicionarEstado(Estado.LAMA); break;
      default: console.log(`   -> Efeito de ${nomeReacao} ainda não implementado.`);
    }
    return true;
  }
}

// ==========================================
// 11. BATALHA
// ==========================================
export class Batalha {
  private filaDeAcoes: Acao[] = [];
  private estado: StatusBatalha = StatusBatalha.EM_ANDAMENTO;

  constructor(public treinador1: Treinador, public treinador2: Treinador) {}

  public registrarAcao(acao: Acao): void { this.filaDeAcoes.push(acao); }

  public resolverTurno(): void {
    if ((this.estado as StatusBatalha) === StatusBatalha.FINALIZADA) return;

    this.filaDeAcoes.sort((a, b) => {
      if (a.prioridade !== b.prioridade) return b.prioridade - a.prioridade;
      const velA = a.usuario instanceof Monstrinho ? a.usuario.getVelocidade() : 999;
      const velB = b.usuario instanceof Monstrinho ? b.usuario.getVelocidade() : 999;
      return velB - velA;
    });

    for (const acao of this.filaDeAcoes) {
      if ((this.estado as StatusBatalha) === StatusBatalha.FINALIZADA) break;
      acao.executar(this);
      this.verificarFimDeJogo();
    }

    this.processarEfeitosFimDeTurno();
    this.filaDeAcoes = [];
  }

  public processarAtaque(atacante: Monstrinho, alvo: Monstrinho | Monstrinho[], ataque: Ataque): void {
    const alvos = Array.isArray(alvo) ? alvo : [alvo];

    for (const defensor of alvos) {
      if (defensor.getVida() <= 0) continue;
      if (Math.random() * 100 > ataque.getPrecisao()) continue;

      const dano = this.calcularDano(atacante, defensor, ataque);
      defensor.receberDano(dano);
      console.log(`⚔️  ${atacante.nome} causou ${dano} de dano em ${defensor.nome} com ${ataque.getNome()}!`);

      const elementoNovo = atacante.getElementoInerente();
      const combinacao = defensor.aplicarElemento(elementoNovo);
      
      if (combinacao) {
        const teveReacao = GerenciadorDeReacoes.processarReacao(combinacao[0], combinacao[1], defensor, atacante);
        if (!teveReacao) {
          defensor.aplicarElemento(elementoNovo);
          console.log(`   -> Nenhuma reação. O elemento ${elementoNovo} substituiu o elemento anterior.`);
        }
      }
    }
  }

  public processarCaptura(treinador: Treinador, alvo: Monstrinho, capturador: ItemCaptura): void {
    const oponente = treinador === this.treinador1 ? this.treinador2 : this.treinador1;
    
    if (!oponente.isSelvagem) {
      console.log(`❌ Você não pode capturar o monstrinho de outro treinador!`);
      return;
    }

    const indexItem = treinador.mochila.indexOf(capturador);
    if (indexItem === -1) {
      console.log(`❌ ${treinador.nome} não tem ${capturador.nome} na mochila!`);
      return;
    }

    treinador.mochila.splice(indexItem, 1);
    console.log(`\n🔴 ${treinador.nome} jogou um ${capturador.nome} em ${alvo.nome}!`);
    
    let statusMultiplier = 1.0;
    if (alvo.temEstado(Estado.DORMINDO) || alvo.temEstado(Estado.CONGELADO)) {
      statusMultiplier = 2.0;
    } else if (alvo.getEstados().length > 0) {
      statusMultiplier = 1.5;
    }

    const vidaMax = alvo.getVidaMaxima();
    const vidaAtual = alvo.getVida();
    const taxa = alvo.getTaxaCaptura();
    
    const a = ((3 * vidaMax - 2 * vidaAtual) * taxa * capturador.bonus * statusMultiplier) / (3 * vidaMax);
    const roll = Math.floor(Math.random() * 256);

    console.log(`   -> Cálculo base (a): ${Math.floor(a)} / 255. Sorteado: ${roll}`);

    if (roll <= a) {
      console.log(`✨ CLICK! ${alvo.nome} foi capturado com sucesso!`);
      
      oponente.removerMonstrinho(alvo);
      treinador.capturarMonstrinho(alvo);
      this.verificarFimDeJogo();
    } else {
      console.log(`❌ Ah não! ${alvo.nome} escapou da captura!`);
    }
  }

  private calcularDano(atacante: Monstrinho, defensor: Monstrinho, ataque: Ataque): number {
    let danoBase = ((((2 * atacante.getNivel() / 5) + 2) * ataque.getPoderBase() * atacante.getAtaque()) / defensor.getDefesa()) / 50 + 2;
    if (ataque.getElemento() === atacante.getElementoInerente()) danoBase *= 1.5; 
    danoBase *= TabelaEfetividade[ataque.getElemento()]?.[defensor.getElementoInerente()] ?? 1;
    if (Math.random() < 0.1) { danoBase *= 1.5; console.log("🔥 Crítico!"); }
    return Math.floor(danoBase * (Math.random() * 0.15 + 0.85));
  }

  private processarEfeitosFimDeTurno(): void {
    const processarStatus = (treinador: Treinador) => {
      treinador.equipe.forEach(m => {
        if (m.getVida() <= 0) return;
        if (m.temEstado(Estado.QUEIMADO)) {
          const dano = Math.floor(m.getVidaMaxima() * 0.05);
          m.receberDano(dano);
          console.log(`🔥 ${m.nome} sofreu ${dano} de dano por Queimadura.`);
        }
        if (m.temEstado(Estado.SANGRANDO)) {
          const dano = Math.floor(m.getVidaMaxima() * 0.05);
          m.receberDano(dano);
          console.log(`🩸 ${m.nome} sofreu ${dano} de dano por Sangramento.`);
        }
      });
    };
    processarStatus(this.treinador1);
    processarStatus(this.treinador2);
  }

  private verificarFimDeJogo(): void {
    if (this.treinador1.todosDesmaiaram() || this.treinador2.todosDesmaiaram() || this.treinador1.equipe.length === 0 || this.treinador2.equipe.length === 0) {
      this.estado = StatusBatalha.FINALIZADA;
      console.log("\n🏁 === A BATALHA TERMINOU! === 🏁");
      const resetarEquipe = (treinador: Treinador) => {
        treinador.equipe.forEach(m => m.resetarAposBatalha());
        treinador.ativos.forEach(m => m.resetarAposBatalha());
      };
      resetarEquipe(this.treinador1);
      resetarEquipe(this.treinador2);
    }
  }
}
