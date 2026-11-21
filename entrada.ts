export type Botao =
  | 'cima' | 'baixo' | 'esquerda' | 'direita'
  | 'confirmar' | 'cancelar' | 'menu' | 'depurar';

/** Teclas (KeyboardEvent.code) -> botões do jogo. Para remapear, altere só esta tabela. */
const TECLAS: Record<string, Botao[]> = {
  ArrowUp: ['cima'], KeyW: ['cima'],
  ArrowDown: ['baixo'], KeyS: ['baixo'],
  ArrowLeft: ['esquerda'], KeyA: ['esquerda'],
  ArrowRight: ['direita'], KeyD: ['direita'],
  Enter: ['confirmar'], NumpadEnter: ['confirmar'], Space: ['confirmar'],
  Escape: ['cancelar', 'menu'],
  Backspace: ['cancelar'], KeyX: ['cancelar'],
  F2: ['depurar'],
};

const DIRECOES = new Set<Botao>(['cima', 'baixo', 'esquerda', 'direita']);

export class Entrada {
  private segurados = new Set<Botao>();
  private pressionados = new Set<Botao>();
  private caracteres: string[] = [];
  /** Quando true, o teclado digita texto (tela de nome) em vez de comandar o jogo. */
  modoTexto = false;

  constructor() {
    window.addEventListener('keydown', (e) => this.aoPressionar(e));
    window.addEventListener('keyup', (e) => {
      for (const b of TECLAS[e.code] ?? []) this.segurados.delete(b);
    });
    window.addEventListener('blur', () => this.segurados.clear());
  }

  private aoPressionar(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (this.modoTexto) {
      if (e.key === 'Enter') this.pressionados.add('confirmar');
      else if (e.key === 'Escape') this.pressionados.add('cancelar');
      else if (e.key === 'Backspace') this.caracteres.push('\b');
      else if (e.key.length === 1) this.caracteres.push(e.key);
      else return;
      e.preventDefault();
      return;
    }

    const botoes = TECLAS[e.code];
    if (!botoes) return;
    e.preventDefault();
    for (const b of botoes) {
      // A repetição automática do teclado só vale para as setas (navegar em menus).
      if (!e.repeat || DIRECOES.has(b)) this.pressionados.add(b);
      this.segurados.add(b);
    }
  }

  /** O botão está sendo segurado agora? (movimento) */
  segurando(b: Botao): boolean { return this.segurados.has(b); }
  /** O botão foi pressionado neste quadro? (menus, interação) */
  pressionou(b: Botao): boolean { return this.pressionados.has(b); }
  /** Caracteres digitados neste quadro ('\b' = apagar). Só em modoTexto. */
  textoDigitado(): string[] { return this.caracteres; }

  fimDoQuadro(): void {
    this.pressionados.clear();
    this.caracteres = [];
  }
}
