import { abrirMenuPrincipal } from './cenas/menuPrincipal';
import { CONFIG } from './config';
import { jogo } from './jogo/jogo';
import { precarregarPersonagens } from './jogo/personagens';
import { spriteDe } from './jogo/spritesChumments';
import { MAPAS, validarMapas } from './mapas/registro';
import { Entrada } from './motor/entrada';
import { carregarImagem, urlRecurso } from './motor/recursos';
import { Tela } from './motor/tela';

jogo.tela = new Tela(document.getElementById('jogo') as HTMLCanvasElement);
jogo.entrada = new Entrada();
document.title = CONFIG.titulo.charAt(0) + CONFIG.titulo.slice(1).toLowerCase();

validarMapas();
// Carrega as imagens dos mapas em segundo plano para as trocas serem instantâneas.
for (const mapa of Object.values(MAPAS)) {
  carregarImagem(urlRecurso('assets/mapas/' + mapa.imagem)).catch(() => { /* o mapa avisa ao ser aberto */ });
}

precarregarPersonagens();

abrirMenuPrincipal();

let anterior = performance.now();
function quadro(agora: number): void {
  const dt = Math.min(0.05, (agora - anterior) / 1000);
  anterior = agora;

  // Desenha primeiro (estado já assentado do quadro anterior) e atualiza depois:
  // assim, menus encadeados com async/await nunca piscam entre um e outro.
  jogo.tela.iniciarQuadro();
  jogo.cenas.desenhar(jogo.tela.ctx);
  jogo.tela.finalizarQuadro();

  if (jogo.entrada.pressionou('depurar')) jogo.depurar = !jogo.depurar;
  jogo.cenas.atualizar(dt);
  jogo.entrada.fimDoQuadro();

  requestAnimationFrame(quadro);
}
requestAnimationFrame(quadro);

// Acesso pelo console do navegador, útil para testes: __chumments.jogo.estado
(window as unknown as { __chumments: unknown }).__chumments = { jogo, CONFIG, spriteDe };
