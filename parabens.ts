// Tela de "Parabéns", mostrada quando o jogador vence o chefe final (a mãe).
import { estado, jogo } from '../jogo/jogo';
import { desenharFigura, visualJogador } from '../jogo/personagens';
import { salvarJogo } from '../jogo/persistencia';
import { desenharChumment } from '../jogo/spritesChumments';
import { IDS } from '../jogo/treinadores';
import type { Cena } from '../motor/cena';
import { ALTURA, LARGURA } from '../motor/tela';
import { CORES, painel, texto } from '../ui/ui';

const CORES_CONFETE = ['#ffe08a', '#e8552d', '#3d8bea', '#4cab4a', '#b05fd6', '#ffffff'];

class CenaParabens implements Cena {
  readonly opaca = true;
  private tempo = 0;
  private confetes = Array.from({ length: 90 }, (_, i) => ({
    x: (i * 137) % LARGURA,
    y: -((i * 71) % ALTURA),
    velocidade: 70 + ((i * 29) % 90),
    balanco: 20 + ((i * 13) % 30),
    fase: i * 0.7,
    cor: CORES_CONFETE[i % CORES_CONFETE.length],
    tamanho: 6 + (i % 4) * 2,
  }));

  constructor(private readonly vencido: string, private readonly fim: () => void) {}

  atualizar(dt: number): void {
    this.tempo += dt;
    for (const c of this.confetes) {
      c.y += c.velocidade * dt;
      if (c.y > ALTURA + 20) c.y = -20;
    }
    // Um instante de espera para ninguém pular a tela sem querer.
    if (this.tempo > 1.5 && (jogo.entrada.pressionou('confirmar') || jogo.entrada.pressionou('cancelar'))) {
      jogo.cenas.remover(this);
      this.fim();
    }
  }

  desenhar(ctx: CanvasRenderingContext2D): void {
    const e = estado();
    const t = e.treinador;
    const fundo = ctx.createLinearGradient(0, 0, 0, ALTURA);
    fundo.addColorStop(0, '#2a1f5c');
    fundo.addColorStop(1, '#6a4bc4');
    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // Raios de luz girando atrás do título
    ctx.save();
    ctx.translate(LARGURA / 2, 150);
    ctx.rotate(this.tempo * 0.15);
    ctx.fillStyle = 'rgba(255,224,138,0.10)';
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -900); ctx.lineTo(60, -900); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    for (const c of this.confetes) {
      ctx.save();
      ctx.translate(c.x + Math.sin(this.tempo * 2 + c.fase) * c.balanco, c.y);
      ctx.rotate(this.tempo * 3 + c.fase);
      ctx.fillStyle = c.cor;
      ctx.fillRect(-c.tamanho / 2, -c.tamanho / 4, c.tamanho, c.tamanho / 2);
      ctx.restore();
    }

    const pulo = Math.sin(this.tempo * 2.2) * 6;
    texto(ctx, 'PARABÉNS!', LARGURA / 2 + 5, 62 + pulo + 6, { tamanho: 96, cor: '#150f38', alinhar: 'center' });
    texto(ctx, 'PARABÉNS!', LARGURA / 2, 62 + pulo, { tamanho: 96, cor: CORES.selecao, alinhar: 'center' });

    const titulo = t.sexo === 'Feminino' ? 'a nova campeã' : 'o novo campeão';
    texto(ctx, `${t.nome} venceu ${this.vencido} e é ${titulo} da Liga!`, LARGURA / 2, 182, { tamanho: 26, cor: CORES.textoClaro, alinhar: 'center', larguraMax: LARGURA - 80 });

    // Jogador e a equipe campeã
    painel(ctx, 60, 236, LARGURA - 120, 250);
    texto(ctx, 'EQUIPE CAMPEÃ', 86, 254, { tamanho: 16, cor: CORES.fraco });
    desenharFigura(ctx, visualJogador(t.sexo), 150, 440, 150, 'baixo', null);
    const equipe = t.equipe.slice(0, 6);
    const largura = (LARGURA - 120 - 190) / Math.max(1, equipe.length);
    equipe.forEach((m, i) => {
      const cx = 250 + largura * (i + 0.5);
      const salto = Math.abs(Math.sin(this.tempo * 3 + i * 0.8)) * 8;
      desenharChumment(ctx, m, cx, 410 - salto, Math.min(110, largura - 10));
      texto(ctx, m.nome, cx, 420, { tamanho: 15, alinhar: 'center', larguraMax: largura - 8 });
      texto(ctx, `Nv ${m.getNivel()}`, cx, 440, { tamanho: 14, cor: CORES.fraco, alinhar: 'center' });
    });

    const vencidos = IDS.filter((id) => e.npcsDerrotados.has(id)).length;
    const chumments = t.equipe.length + t.armazenamento.length;
    texto(ctx, `Treinadores vencidos: ${vencidos} de ${IDS.length}   ·   Chumments capturados: ${chumments}   ·   Dinheiro: $${t.dinheiro}`,
      LARGURA / 2, 512, { tamanho: 17, cor: CORES.textoClaro, alinhar: 'center' });

    if (this.tempo > 1.5 && Math.floor(this.tempo * 2) % 2 === 0) {
      texto(ctx, 'Pressione Enter para continuar jogando', LARGURA / 2, 572, { tamanho: 20, cor: CORES.selecao, alinhar: 'center' });
    }
  }
}

/** Mostra a tela de parabéns e espera o jogador confirmar. O jogo é salvo e continua depois dela. */
export function mostrarParabens(vencido: string): Promise<void> {
  salvarJogo(estado());
  return new Promise((fim) => jogo.cenas.empilhar(new CenaParabens(vencido, fim)));
}
