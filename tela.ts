/** Resolução lógica do jogo. Tudo é desenhado nessas coordenadas e escalado para a janela. */
export const LARGURA = 960;
export const ALTURA = 640;

export class Tela {
  readonly ctx: CanvasRenderingContext2D;
  private escala = 1;
  private ox = 0;
  private oy = 0;
  /** Posição do mouse em coordenadas lógicas (usada pelo modo de depuração). */
  readonly mouse = { x: 0, y: 0, pressionado: false };

  constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    window.addEventListener('resize', () => this.ajustar());
    canvas.addEventListener('mousemove', (e) => this.atualizarMouse(e));
    canvas.addEventListener('mousedown', (e) => { this.atualizarMouse(e); this.mouse.pressionado = true; });
    window.addEventListener('mouseup', () => { this.mouse.pressionado = false; });
    this.ajustar();
  }

  private atualizarMouse(e: MouseEvent): void {
    const dpr = window.devicePixelRatio || 1;
    this.mouse.x = (e.clientX * dpr - this.ox) / this.escala;
    this.mouse.y = (e.clientY * dpr - this.oy) / this.escala;
  }

  ajustar(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.escala = Math.min(this.canvas.width / LARGURA, this.canvas.height / ALTURA);
    this.ox = (this.canvas.width - LARGURA * this.escala) / 2;
    this.oy = (this.canvas.height - ALTURA * this.escala) / 2;
  }

  iniciarQuadro(): void {
    const c = this.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(this.escala, 0, 0, this.escala, this.ox, this.oy);
    c.save();
    c.beginPath();
    c.rect(0, 0, LARGURA, ALTURA);
    c.clip();
  }

  finalizarQuadro(): void {
    this.ctx.restore();
  }
}
