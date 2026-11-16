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
  QUEIMADO = "Queimado",
  SANGRANDO = "Sangrando"
}

// Tabela 1: Efetividade de Dano (Atacante -> Defensor)
// 2 = Super efetivo, 0.5 = Pouco efetivo, 1 = Normal
export const TabelaEfetividade: Record<Elemento, Record<Elemento, number>> = {
  [Elemento.FOGO]: { [Elemento.AGUA]: 0.5, [Elemento.PLANTA]: 2, [Elemento.PEDRA]: 0.5 } as any,
  [Elemento.AGUA]: { [Elemento.FOGO]: 2, [Elemento.PLANTA]: 0.5, [Elemento.ELETRICO]: 0.5 } as any,
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
  [`${Elemento.AGUA}_${Elemento.PLANTA}`]: "Vinhas",
  [`${Elemento.PLANTA}_${Elemento.AGUA}`]: "Vinhas",
  [`${Elemento.ELETRICO}_${Elemento.PEDRA}`]: "Condutividade",
  [`${Elemento.VENTO}_${Elemento.FOGO}`]: "Redemoinho",
  [`${Elemento.FOGO}_${Elemento.VENTO}`]: "Dissipa",
  // ... Preencher o restante conforme a imagem 2
};

// ==========================================
// 2. CLASSE ATAQUE
// ==========================================
export class Ataque {
  constructor(
    private readonly nome: string,
    private readonly poderBase: number,
    private readonly precisao: number,
    private readonly custoMana: number,
    private readonly elemento: Elemento,
    private readonly isMultiTarget: boolean = false
  ) {}

  public getNome(): string { return this.nome; }
  public getPoderBase(): number { return this.poderBase; }
  public getPrecisao(): number { return this.precisao; }
  public getCustoMana(): number { return this.custoMana; }
  public getElemento(): Elemento { return this.elemento; }
  public isMultiTargetAtaque(): boolean { return this.isMultiTarget; }
}

// ==========================================
// 3. CLASSE MONSTRINHO (Com novas regras de XP)
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
    private vidaMaxima: number,
    private manaMaxima: number,
    private ataque: number,
    private defesa: number,
    private velocidade: number,
    private precisao: number,
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
    return false;
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

  // Nova regra de XP e Level Up
  public ganharExperiencia(valor: number): void {
    if (this.nivel >= 30) return; // Nível máximo

    this.experiencia += valor;
    
    // Fórmula: XP necessário = 5 * (nível atual + 1)
    // Nível 1 -> 2 precisa de 10 (5 * 2)
    // Nível 2 -> 3 precisa de 15 (5 * 3)
    while (this.nivel < 30) {
      const xpNecessario = 5 * (this.nivel + 1);
      
      if (this.experiencia >= xpNecessario) {
        this.experiencia -= xpNecessario;
        this.subirNivel();
      } else {
        break;
      }
    }
  }

  private subirNivel(): void {
    this.nivel++;
    // Aumento básico de atributos a cada nível (pode ser balanceado depois)
    this.vidaMaxima += 5;
    this.ataque += 2;
    this.defesa += 2;
    this.velocidade += 1;
    this.manaMaxima += 2;
    
    // Restaura vida e mana ao upar (opcional, mas comum em RPGs)
    this.vidaAtual = this.vidaMaxima;
    this.manaAtual = this.manaMaxima;
    
    console.log(`${this.nome} subiu para o nível ${this.nivel}!`);
  }

  // --- Métodos de Elementos e Reações ---
  public aplicarElemento(elemento: Elemento): Elemento[] | null {
    this.elementosAplicados.push(elemento);

    if (this.elementosAplicados.length === 2) {
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

  public restaurarEstado(vida: number, experiencia: number, mana: number = this.manaMaxima): void {
    this.vidaAtual = vida;
    this.experiencia = experiencia;
    this.manaAtual = mana;
  }
}

// ==========================================
// 4. STUBS (Classes temporárias para não dar erro)
// ==========================================
export class Treinador {
  constructor(public nome: string, public equipe: Monstrinho[]) {}
  public trocarMonstrinho(novo: Monstrinho) { /* Implementar depois */ }
  public usarItem(item: any, alvo: Monstrinho) { /* Implementar depois */ }
  public todosDesmaiaram(): boolean { return this.equipe.every(m => m.getVida() <= 0); }
}

// ==========================================
// 5. SISTEMA DE AÇÕES (Polimorfismo)
// ==========================================
export interface Acao {
  prioridade: number;
  usuario: Monstrinho | Treinador;
  executar(batalha: Batalha): void;
}

export class AcaoAtacar implements Acao {
  prioridade = 1;
  
  constructor(
    public usuario: Monstrinho,
    public alvo: Monstrinho | Monstrinho[],
    public ataque: Ataque
  ) {}

  executar(batalha: Batalha): void {
    if (this.usuario.temEstado(Estado.DORMINDO) || this.usuario.temEstado(Estado.CONGELADO)) {
      console.log(`${this.usuario.nome} não pode atacar!`);
      return;
    }
    
    if (!this.usuario.gastarMana(this.ataque.getCustoMana())) {
      console.log(`${this.usuario.nome} não tem mana suficiente!`);
      return;
    }

    batalha.processarAtaque(this.usuario, this.alvo, this.ataque);
  }
}

export class AcaoTrocar implements Acao {
  prioridade = 3; // Maior prioridade

  constructor(
    public usuario: Treinador,
    public novoMonstrinho: Monstrinho
  ) {}

  executar(batalha: Batalha): void {
    this.usuario.trocarMonstrinho(this.novoMonstrinho);
    console.log(`${this.usuario.nome} trocou para ${this.novoMonstrinho.nome}!`);
  }
}

export class AcaoItem implements Acao {
  prioridade = 2;

  constructor(
    public usuario: Treinador,
    public item: any, 
    public alvo: Monstrinho
  ) {}

  executar(batalha: Batalha): void {
    this.usuario.usarItem(this.item, this.alvo);
    console.log(`${this.usuario.nome} usou um item em ${this.alvo.nome}!`);
  }
}

// ==========================================
// 6. GERENCIADOR DE REAÇÕES
// ==========================================
export class GerenciadorDeReacoes {
  public static processarReacao(elementoAplicado: Elemento, elementoNovo: Elemento, alvo: Monstrinho, atacante: Monstrinho): void {
    const chave = `${elementoAplicado}_${elementoNovo}`;
    const nomeReacao = TabelaReacoes[chave];

    if (!nomeReacao) return; 

    console.log(`Reação ativada em ${alvo.nome}: ${nomeReacao}!`);

    switch (nomeReacao) {
      case "Vaporizacao":
        // Exemplo simplificado
        alvo.adicionarEstado(Estado.NORMAL); 
        break;
      case "Queimadura":
        alvo.adicionarEstado(Estado.QUEIMADO);
        break;
      case "Dissipa":
        break;
      default:
        console.log(`Efeito de ${nomeReacao} ainda não implementado mecanicamente.`);
    }
  }
}

// ==========================================
// 7. CLASSE BATALHA
// ==========================================
export class Batalha {
  private filaDeAcoes: Acao[] = [];
  private estado: "Em Andamento" | "Finalizada" = "Em Andamento";

  constructor(
    public treinador1: Treinador,
    public treinador2: Treinador
  ) {}

  public registrarAcao(acao: Acao): void {
    this.filaDeAcoes.push(acao);
  }

  public resolverTurno(): void {
    if (this.estado === "Finalizada") return;

    this.filaDeAcoes.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return b.prioridade - a.prioridade;
      }
      const velA = a.usuario instanceof Monstrinho ? a.usuario.getVelocidade() : 0;
      const velB = b.usuario instanceof Monstrinho ? b.usuario.getVelocidade() : 0;
      return velB - velA;
    });

    for (const acao of this.filaDeAcoes) {
      if (this.estado === "Finalizada") break;
      acao.executar(this);
      this.verificarFimDeJogo();
    }

    this.processarEfeitosFimDeTurno();
    this.filaDeAcoes = [];
  }

  public processarAtaque(atacante: Monstrinho, alvo: Monstrinho | Monstrinho[], ataque: Ataque): void {
    const alvos = Array.isArray(alvo) ? alvo : [alvo];

    for (const defensor of alvos) {
      if (Math.random() * 100 > ataque.getPrecisao()) {
        console.log(`${atacante.nome} errou o ataque ${ataque.getNome()} em ${defensor.nome}!`);
        continue;
      }

      const dano = this.calcularDano(atacante, defensor, ataque);
      defensor.receberDano(dano);
      console.log(`${atacante.nome} causou ${dano} de dano em ${defensor.nome}!`);

      const combinacao = defensor.aplicarElemento(ataque.getElemento());
      
      if (combinacao) {
        GerenciadorDeReacoes.processarReacao(combinacao[0], combinacao[1], defensor, atacante);
      }
    }
  }

  private calcularDano(atacante: Monstrinho, defensor: Monstrinho, ataque: Ataque): number {
    const nivel = atacante.getNivel();
    const poder = ataque.getPoderBase();
    const ataqueStat = atacante.getAtaque();
    const defesaStat = defensor.getDefesa();

    let danoBase = ((((2 * nivel / 5) + 2) * poder * (ataqueStat / defesaStat)) / 50) + 2;

    if (ataque.getElemento() === atacante.getElementoInerente()) {
      danoBase *= 1.5; // STAB
    }

    const efetividade = TabelaEfetividade[ataque.getElemento()]?.[defensor.getElementoInerente()] ?? 1;
    danoBase *= efetividade;

    if (Math.random() < 0.1) {
      danoBase *= 1.5; // Crítico
      console.log("Foi um acerto crítico!");
    }

    const roll = Math.random() * 0.15 + 0.85; // Variação de 0.85 a 1.0
    danoBase *= roll;

    return Math.floor(danoBase);
  }

  private processarEfeitosFimDeTurno(): void {
    // Lógica para Queimadura, Sangramento, etc.
  }

  private verificarFimDeJogo(): void {
    if (this.treinador1.todosDesmaiaram() || this.treinador2.todosDesmaiaram()) {
      this.estado = "Finalizada";
      console.log("A batalha terminou!");
    }
  }
}
    this.manaAtual = mana;
  }
}
