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
  LAMA = "Lama",
  QUEIMADO = "Queimado",
  SANGRANDO = "Sangrando"
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

// A classe Item agora aceita uma função que pode ou não receber um Ataque específico
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

// ==========================================
// 4. CLASSE ABSTRATA MONSTRINHO
// ==========================================
export abstract class Monstrinho {
  protected vidaAtual: number;
  protected ataques: Ataque[] = [];
  protected elementosAplicados: Elemento[] = [];
  protected estados: Estado[] = [];
  
  protected modificadores = { ataque: 1, defesa: 1, velocidade: 1, precisao: 1 };

  constructor(
    public readonly nome: string,
    protected readonly elementoInerente: Elemento,
    protected vidaMaxima: number,
    protected ataque: number,
    protected defesa: number,
    protected velocidade: number,
    protected precisao: number,
    protected nivel: number = 1,
    protected experiencia: number = 0
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

  // --- Métodos de Vida e Modificadores ---
  public receberDano(valor: number): void { this.vidaAtual = Math.max(0, this.vidaAtual - valor); }
  public curar(valor: number): void { this.vidaAtual = Math.min(this.vidaMaxima, this.vidaAtual + valor); }
  public aplicarModificador(status: 'ataque' | 'defesa' | 'velocidade' | 'precisao', multiplicador: number): void {
    this.modificadores[status] *= multiplicador;
  }

  // --- Métodos de Ataque e Nível ---
  public aprenderAtaque(ataque: Ataque): void {
    if (this.ataques.length < 4) this.ataques.push(ataque);
    else throw new Error("O monstrinho já possui 4 ataques.");
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
      } else break;
    }
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
// 5. POKEDEX (CLASSES ESPECÍFICAS)
// ==========================================

// --- FOGO ---
export class Frilizard extends Monstrinho {
  constructor(nivel = 1) { super("Frilizard", Elemento.FOGO, 28, 18, 10, 14, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Flareperor() : null; }
}
export class Flareperor extends Monstrinho {
  constructor() { super("Flareperor", Elemento.FOGO, 55, 40, 15, 30, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- GRAMA ---
export class Verdalisk extends Monstrinho {
  constructor(nivel = 1) { super("Verdalisk", Elemento.PLANTA, 40, 8, 15, 7, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Katanlisk() : null; }
}
export class Katanlisk extends Monstrinho {
  constructor() { super("Katanlisk", Elemento.PLANTA, 80, 18, 32, 10, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- PEDRA ---
export class Lithoscorp extends Monstrinho {
  constructor(nivel = 1) { super("Lithoscorp", Elemento.PEDRA, 42, 10, 16, 2, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Rockpion() : null; }
}
export class Rockpion extends Monstrinho {
  constructor() { super("Rockpion", Elemento.PEDRA, 80, 25, 30, 5, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ELÉTRICO ---
export class Amperell extends Monstrinho {
  constructor(nivel = 1) { super("Amperell", Elemento.ELETRICO, 24, 16, 8, 22, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Electrusa() : null; }
}
export class Electrusa extends Monstrinho {
  constructor() { super("Electrusa", Elemento.ELETRICO, 50, 35, 15, 40, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- VENTO ---
export class Zephyling extends Monstrinho {
  constructor(nivel = 1) { super("Zephyling", Elemento.VENTO, 26, 10, 8, 26, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Hurrihawk() : null; }
}
export class Hurrihawk extends Monstrinho {
  constructor() { super("Hurrihawk", Elemento.VENTO, 50, 20, 15, 55, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- GELO ---
export class Glaceow extends Monstrinho {
  constructor(nivel = 1) { super("Glaceow", Elemento.GELO, 35, 15, 12, 8, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Glacielle() : null; }
}
export class Glacielle extends Monstrinho {
  constructor() { super("Glacielle", Elemento.GELO, 65, 30, 25, 20, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ÁGUA ---
export class Ocelly extends Monstrinho {
  constructor(nivel = 1) { super("Ocelly", Elemento.AGUA, 38, 10, 14, 8, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Jellerinna() : null; }
}
export class Jellerinna extends Monstrinho {
  constructor() { super("Jellerinna", Elemento.AGUA, 75, 20, 30, 15, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- MÍSTICO ---
export class FizzyJr extends Monstrinho {
  constructor(nivel = 1) { super("Fizzy Jr.", Elemento.MISTICO, 32, 14, 12, 12, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Fizzarolly() : null; }
}
export class Fizzarolly extends Monstrinho {
  constructor() { super("Fizzarolly", Elemento.MISTICO, 60, 30, 25, 25, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- LUZ ---
export class Lumi extends Monstrinho {
  constructor(nivel = 1) { super("Lumi", Elemento.LUZ, 34, 10, 14, 12, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Celestina() : null; }
}
export class Celestina extends Monstrinho {
  constructor() { super("Celestina", Elemento.LUZ, 65, 20, 30, 25, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// --- ESCURIDÃO ---
export class Lumiel extends Monstrinho {
  constructor(nivel = 1) { super("Lumiel", Elemento.ESCURIDAO, 30, 16, 10, 14, 100, nivel); }
  public evoluir(): Monstrinho | null { return this.nivel >= 15 ? new Shadenight() : null; }
}
export class Shadenight extends Monstrinho {
  constructor() { super("Shadenight", Elemento.ESCURIDAO, 55, 35, 20, 30, 100, 15); }
  public evoluir(): Monstrinho | null { return null; }
}

// ==========================================
// 6. TREINADOR E ARMAZENAMENTO
// ==========================================
export class Treinador {
  public ativos: Monstrinho[] = [];
  public mochila: Item[] = [];
  public armazenamento: Monstrinho[] = []; // Limite altíssimo (teoricamente infinito)

  constructor(
    public readonly nome: string, 
    public equipe: Monstrinho[] = []
  ) {
    this.atualizarAtivosIniciais();
  }

  private atualizarAtivosIniciais(): void {
    this.ativos = this.equipe.filter(m => m.getVida() > 0).slice(0, 2);
  }

  // --- Gestão de Equipe e Captura ---
  public capturarMonstrinho(novoMonstrinho: Monstrinho, trocarPor?: Monstrinho): void {
    if (this.equipe.length < 6) {
      this.equipe.push(novoMonstrinho);
      console.log(`✅ ${novoMonstrinho.nome} foi adicionado à equipe de ${this.nome}!`);
      if (this.ativos.length < 2) this.ativos.push(novoMonstrinho);
    } else {
      // Equipe cheia
      if (trocarPor) {
        const index = this.equipe.indexOf(trocarPor);
        if (index !== -1) {
          this.armazenamento.push(trocarPor);
          this.equipe[index] = novoMonstrinho;
          
          // Se o que foi trocado estava ativo, o novo assume o lugar
          const indexAtivo = this.ativos.indexOf(trocarPor);
          if (indexAtivo !== -1) this.ativos[indexAtivo] = novoMonstrinho;
          
          console.log(`🔄 ${novoMonstrinho.nome} entrou na equipe. ${trocarPor.nome} foi para o armazenamento.`);
        }
      } else {
        this.armazenamento.push(novoMonstrinho);
        console.log(`📦 Equipe cheia! ${novoMonstrinho.nome} foi enviado para o armazenamento.`);
      }
    }
  }

  public todosDesmaiaram(): boolean {
    return this.equipe.every(m => m.getVida() <= 0);
  }

  // --- Gestão de Batalha e Trocas ---
  public trocarMonstrinho(antigo: Monstrinho, novo: Monstrinho): boolean {
    if (antigo.temEstado(Estado.LAMA)) {
      console.log(`❌ ${antigo.nome} está preso pela Lama e não pode ser trocado!`);
      return false;
    }
    const index = this.ativos.indexOf(antigo);
    if (index === -1) return false;
    if (novo.getVida() <= 0) {
      console.log(`❌ ${novo.nome} está desmaiado!`);
      return false;
    }
    this.ativos[index] = novo;
    return true;
  }

  public substituirDesmaiado(desmaiado: Monstrinho, substituto: Monstrinho): boolean {
    const index = this.ativos.indexOf(desmaiado);
    if (index === -1) return false;
    if (substituto.getVida() > 0) {
      this.ativos[index] = substituto;
      return true;
    }
    return false;
  }

  // --- Gestão de Itens ---
  public adicionarItem(item: Item): void {
    this.mochila.push(item);
  }

  public usarItem(item: Item, alvo: Monstrinho, ataqueAlvo?: Ataque): boolean {
    const index = this.mochila.indexOf(item);
    if (index === -1) {
      console.log(`❌ ${this.nome} não tem ${item.nome} na mochila!`);
      return false;
    }
    item.usar(alvo, ataqueAlvo);
    this.mochila.splice(index, 1);
    return true;
  }

  // --- Evolução ---
  public verificarEvolucoes(): void {
    for (let i = 0; i < this.equipe.length; i++) {
      const monstrinhoAtual = this.equipe[i];
      const evoluido = monstrinhoAtual.evoluir();
      
      if (evoluido) {
        evoluido.restaurarEstado(monstrinhoAtual.getVida(), monstrinhoAtual.getExperiencia());
        this.equipe[i] = evoluido;
        
        const indexAtivo = this.ativos.indexOf(monstrinhoAtual);
        if (indexAtivo !== -1) this.ativos[indexAtivo] = evoluido;

        console.log(`🌟 UAU! ${monstrinhoAtual.nome} evoluiu para ${evoluido.nome}!`);
      }
    }
  }
}

// ==========================================
// 7. CRIAÇÃO DOS ITENS DEFINIDOS
// ==========================================
export const PocaoInicial = new Item("Poção Inicial", (alvo) => alvo.curar(10));
export const PocaoIntermediaria = new Item("Poção Intermediária", (alvo) => alvo.curar(20));
export const PocaoAvancada = new Item("Poção Avançada", (alvo) => alvo.curar(40));

export const Vitalizador = new Item("Vitalizador", (alvo, ataque) => {
  if (ataque) {
    ataque.restaurarPP();
    console.log(`   -> PP de ${ataque.getNome()} totalmente restaurado!`);
  } else {
    console.log("   -> Nenhum ataque específico foi selecionado.");
  }
});

export const VitalizadorSupremo = new Item("Vitalizador Supremo", (alvo) => {
  alvo.restaurarTodosPP();
  console.log(`   -> Todos os PP de ${alvo.nome} foram restaurados!`);
});


// ==========================================
// 8. SISTEMA DE AÇÕES
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
      console.log(`❌ ${this.usuario.nome} não pode atacar!`);
      return;
    }
    if (!this.ataque.temPP()) {
      console.log(`❌ ${this.usuario.nome} tentou usar ${this.ataque.getNome()}, mas não tem mais PP!`);
      return;
    }
    this.ataque.consumirPP();
    batalha.processarAtaque(this.usuario, this.alvo, this.ataque);
  }
}

export class AcaoTrocar implements Acao {
  prioridade = 3;
  constructor(
    public usuario: Treinador,
    public antigoMonstrinho: Monstrinho,
    public novoMonstrinho: Monstrinho
  ) {}
  executar(batalha: Batalha): void {
    this.usuario.trocarMonstrinho(this.antigoMonstrinho, this.novoMonstrinho);
  }
}

export class AcaoItem implements Acao {
  prioridade = 2;
  constructor(
    public usuario: Treinador,
    public item: Item, 
    public alvo: Monstrinho,
    public ataqueAlvo?: Ataque // Opcional para o Vitalizador
  ) {}
  executar(batalha: Batalha): void {
    this.usuario.usarItem(this.item, this.alvo, this.ataqueAlvo);
  }
}

// ==========================================
// 9. GERENCIADOR DE REAÇÕES
// ==========================================
export class GerenciadorDeReacoes {
  public static processarReacao(elementoAplicado: Elemento, elementoNovo: Elemento, alvo: Monstrinho, atacante: Monstrinho): void {
    const chave = `${elementoAplicado}_${elementoNovo}`;
    const nomeReacao = TabelaReacoes[chave];

    if (!nomeReacao) return; 

    console.log(`✨ REAÇÃO ATIVADA em ${alvo.nome}: ${nomeReacao}!`);

    switch (nomeReacao) {
      case "Vaporizacao":
        alvo.aplicarModificador('defesa', 0.8); 
        console.log(`   -> Defesa de ${alvo.nome} reduziu!`);
        break;
      case "Queimadura":
        alvo.adicionarEstado(Estado.QUEIMADO);
        console.log(`   -> ${alvo.nome} está queimando!`);
        break;
      case "Dissipa":
        console.log(`   -> O vento dissipou os elementos!`);
        break;
      default:
        console.log(`   -> Efeito de ${nomeReacao} ainda não implementado mecanicamente.`);
    }
  }
}

// ==========================================
// 10. CLASSE BATALHA
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
      const velA = a.usuario instanceof Monstrinho ? a.usuario.getVelocidade() : 999;
      const velB = b.usuario instanceof Monstrinho ? b.usuario.getVelocidade() : 999;
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
      if (defensor.getVida() <= 0) continue;

      if (Math.random() * 100 > ataque.getPrecisao()) {
        console.log(`❌ ${atacante.nome} errou o ataque ${ataque.getNome()} em ${defensor.nome}!`);
        continue;
      }

      const dano = this.calcularDano(atacante, defensor, ataque);
      defensor.receberDano(dano);
      console.log(`⚔️  ${atacante.nome} causou ${dano} de dano em ${defensor.nome} com ${ataque.getNome()}!`);

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

    let danoBase = ((((2 * nivel / 5) + 2) * poder * ataqueStat) / defesaStat) / 50 + 2;

    if (ataque.getElemento() === atacante.getElementoInerente()) {
      danoBase *= 1.5; 
    }

    const efetividade = TabelaEfetividade[ataque.getElemento()]?.[defensor.getElementoInerente()] ?? 1;
    danoBase *= efetividade;

    if (Math.random() < 0.1) {
      danoBase *= 1.5; 
      console.log("🔥 Foi um acerto crítico!");
    }

    const roll = Math.random() * 0.15 + 0.85; 
    danoBase *= roll;

    return Math.floor(danoBase);
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
    if (this.treinador1.todosDesmaiaram() || this.treinador2.todosDesmaiaram()) {
      this.estado = "Finalizada";
      console.log("\n🏁 === A BATALHA TERMINOU! === 🏁");

      const resetarEquipe = (treinador: Treinador) => {
        treinador.equipe.forEach(monstrinho => monstrinho.resetarAposBatalha());
        treinador.ativos.forEach(monstrinho => monstrinho.resetarAposBatalha());
      };

      resetarEquipe(this.treinador1);
      resetarEquipe(this.treinador2);
    }
  }
}
