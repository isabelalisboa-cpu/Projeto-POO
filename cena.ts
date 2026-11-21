export interface Cena {
  /** false = sobreposição (diálogo, menu): a cena de baixo continua sendo desenhada. */
  readonly opaca: boolean;
  atualizar(dt: number): void;
  desenhar(ctx: CanvasRenderingContext2D): void;
}

/** Pilha de cenas: só a do topo recebe atualizar(); desenha-se da última opaca para cima. */
export class PilhaCenas {
  private pilha: Cena[] = [];

  empilhar(cena: Cena): void { this.pilha.push(cena); }

  remover(cena: Cena): void {
    const i = this.pilha.indexOf(cena);
    if (i !== -1) this.pilha.splice(i, 1);
  }

  substituirTudo(cena: Cena): void { this.pilha = [cena]; }

  topo(): Cena | undefined { return this.pilha[this.pilha.length - 1]; }

  atualizar(dt: number): void {
    this.topo()?.atualizar(dt);
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    let inicio = this.pilha.length - 1;
    while (inicio > 0 && !this.pilha[inicio].opaca) inicio--;
    for (let i = Math.max(0, inicio); i < this.pilha.length; i++) this.pilha[i].desenhar(ctx);
  }
}
