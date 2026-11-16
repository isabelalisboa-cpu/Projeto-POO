// ==========================================
// 1. ENUMS E TIPOS BASE
// ==========================================

export enum Elemento {
  FOGO = "Fogo",
  AGUA = "Água",
  PLANTA = "Planta",
  PEDRA = "Pedra",
  ELETRICO = "Elétrico",
  GELO = "Gelo",
  VENTO = "Vento",
  MISTICO = "Místico",
  LUZ = "Luz",
  ESCURIDAO = "Escuridão"
}

export enum Estado {
  NORMAL = "Normal",
  CONGELADO = "Congelado",
  DORMINDO = "Dormindo",
  CONFUSO = "Confuso",
  LAMA = "Lama", // Impede troca
  // Outros estados podem ser adicionados aqui
}

// ==========================================
// 2. CLASSE ATAQUE
// ==========================================

export class Ataque {
  constructor(
    private readonly nome: string,
    private readonly poderBase: number,
    private readonly precisao: number, // Ex: 100 para 100%, 90 para 90%
    private readonly custoMana: number,
    private readonly elemento: Elemento,
    private readonly isMultiTarget: boolean = false
  ) {}

  public getNome(): string {
    return this.nome;
  }

  public getPoderBase(): number {
    return this.poderBase;
  }

  public getPrecisao(): number {
    return this.precisao;
  }

  public getCustoMana(): number {
    return this.custoMana;
  }

  public getElemento(): Elemento {
    return this.elemento;
  }

  public isMultiTargetAtaque(): boolean {
    return this.isMultiTarget;
  }
}

// ==========================================
// 3. CLASSE MONSTRINHO
// ==========================================

export class Monstrinho {
  private vidaAtual: number;
  private manaAtual: number;
  private ataques: Ataque[] = [];
  private elementosAplicados: Elemento[] = [];
  private estados: Estado[] = [];

  constructor(
    public readonly nome: string,
    private readonly elementoInerente: Elemento,
    private readonly vidaMaxima: number,
    private readonly manaMaxima: number,
    private readonly ataque: number,
    private readonly defesa: number,
    private readonly velocidade: number,
    private readonly precisao: number,
    private nivel: number = 1,
    private experiencia: number = 0
  ) {
    this.vidaAtual = vidaMaxima;
    this.manaAtual = manaMaxima;
  }

  // --- Getters Básicos ---
  public getVida(): number { return this.vidaAtual; }
  public getVidaMaxima(): number { return this.vidaMaxima; }
  public getMana(): number { return this.manaAtual; }
  public getManaMaxima(): number { return this.manaMaxima; }
  public getAtaque(): number { return this.ataque; }
  public getDefesa(): number { return this.defesa; }
  public getVelocidade(): number { return this.velocidade; }
  public getPrecisao(): number { return this.precisao; }
  public getElementoInerente(): Elemento { return this.elementoInerente; }
  public getNivel(): number { return this.nivel; }
  public getExperiencia(): number { return this.experiencia; }
  public getAtaques(): Ataque[] { return this.ataques; }
  public getElementosAplicados(): Elemento[] { return this.elementosAplicados; }
  public getEstados(): Estado[] { return this.estados; }

  // --- Métodos de Vida e Mana ---
  public receberDano(valor: number): void {
    this.vidaAtual = Math.max(0, this.vidaAtual - valor);
  }

  public curar(valor: number): void {
    this.vidaAtual = Math.min(this.vidaMaxima, this.vidaAtual + valor);
  }

  public gastarMana(valor: number): boolean {
    if (this.manaAtual >= valor) {
      this.manaAtual -= valor;
      return true;
    }
    return false; // Mana insuficiente
  }

  public recuperarMana(valor: number): void {
    this.manaAtual = Math.min(this.manaMaxima, this.manaAtual + valor);
  }

  // --- Métodos de Ataque e Nível ---
  public aprenderAtaque(ataque: Ataque): void {
    if (this.ataques.length < 4) {
      this.ataques.push(ataque);
    } else {
      throw new Error("O monstrinho já possui 4 ataques. Esqueça um para aprender outro.");
    }
  }

  public ganharExperiencia(valor: number): void {
    this.experiencia += valor;
    // Lógica de subir de nível pode ser implementada aqui
    // enquanto (this.experiencia >= this.nivel * 100) { this.subirNivel(); }
  }

  private subirNivel(): void {
    this.nivel++;
    // Aqui poderíamos aumentar atributos base (ex: vidaMaxima += 5, etc.)
  }

  // --- Métodos de Elementos e Reações ---
  public aplicarElemento(elemento: Elemento): Elemento[] | null {
    this.elementosAplicados.push(elemento);

    // Se atingiu 2 elementos, precisamos disparar uma reação
    if (this.elementosAplicados.length === 2) {
      // Retornamos os dois elementos para que a Batalha (ou um Gerenciador de Reações)
      // saiba qual reação aplicar. Depois, limpamos a lista.
      const combinacao = [...this.elementosAplicados];
      this.limparElementos();
      return combinacao;
    }

    return null;
  }

  public limparElementos(): void {
    this.elementosAplicados = [];
  }

  // --- Métodos de Estados ---
  public adicionarEstado(estado: Estado): void {
    if (!this.estados.includes(estado)) {
      this.estados.push(estado);
    }
  }

  public removerEstado(estado: Estado): void {
    this.estados = this.estados.filter(e => e !== estado);
  }

  public temEstado(estado: Estado): boolean {
    return this.estados.includes(estado);
  }

  // --- Restaurar Estado (para o Repository) ---
  public restaurarEstado(vida: number, experiencia: number, mana: number = this.manaMaxima): void {
    this.vidaAtual = vida;
    this.experiencia = experiencia;
    this.manaAtual = mana;
  }
}