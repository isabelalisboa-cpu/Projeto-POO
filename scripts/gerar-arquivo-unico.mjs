// Junta o resultado de "vite build" (pasta dist/) em um único chumments.html:
// o JavaScript vai embutido na página e as imagens viram data: URIs.
// O arquivo abre com dois cliques, sem servidor.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
const TIPOS = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

// 1) Imagens -> { 'assets/mapas/sala.jpg': 'data:image/jpeg;base64,...' }
const embutidos = {};
for (const pasta of ['assets/mapas', 'assets/personagens', 'assets/chumments']) {
  const caminho = join(dist, pasta);
  if (!existsSync(caminho)) continue;
  for (const arquivo of readdirSync(caminho)) {
    const tipo = TIPOS[extname(arquivo).toLowerCase()];
    if (!tipo) continue;
    embutidos[`${pasta}/${arquivo}`] = `data:${tipo};base64,${readFileSync(join(caminho, arquivo)).toString('base64')}`;
  }
}

// 2) JavaScript do jogo embutido no lugar da tag <script src="...">
const fecharScript = (codigo) => codigo.replace(/<\/script/gi, '<\\/script');
let html = readFileSync(join(dist, 'index.html'), 'utf8');
let scripts = 0;
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (_tag, src) => {
  scripts++;
  const codigo = readFileSync(join(dist, src), 'utf8');
  return `<script type="module">${fecharScript(codigo)}</script>`;
});
if (scripts === 0) throw new Error('Nenhum <script src> encontrado em dist/index.html. Rode "vite build" antes.');

// 3) Tabela de imagens antes do código do jogo
const tabela = `<script>window.__RECURSOS_EMBUTIDOS = ${fecharScript(JSON.stringify(embutidos))};</script>`;
html = html.replace('<canvas', `${tabela}\n    <canvas`);

const saida = join(raiz, 'chumments.html');
writeFileSync(saida, html);
console.log(`chumments.html gerado: ${(html.length / 1048576).toFixed(1)} MB, ${Object.keys(embutidos).length} imagens embutidas.`);
