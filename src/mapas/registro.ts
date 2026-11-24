import type { DefinicaoMapa } from './tipos';

// Todo arquivo .ts dentro de definicoes/ é registrado automaticamente.
// Para adicionar um mapa: coloque a imagem em public/assets/mapas/ e crie
// um arquivo novo em definicoes/ (veja o README). Não é preciso alterar mais nada.
const modulos = import.meta.glob<{ default: DefinicaoMapa }>('./definicoes/*.ts', { eager: true });

export const MAPAS: Record<string, DefinicaoMapa> = {};
for (const [arquivo, modulo] of Object.entries(modulos)) {
  const mapa = modulo.default;
  if (!mapa?.id) { console.warn(`[mapas] ${arquivo} não exporta um mapa por padrão.`); continue; }
  if (MAPAS[mapa.id]) console.warn(`[mapas] id repetido: "${mapa.id}" (${arquivo}).`);
  MAPAS[mapa.id] = mapa;
}

export function obterMapa(id: string): DefinicaoMapa {
  const mapa = MAPAS[id];
  if (!mapa) throw new Error(`Mapa "${id}" não existe. Mapas registrados: ${Object.keys(MAPAS).join(', ')}`);
  return mapa;
}

/** Confere as ligações entre mapas e avisa no console sobre erros de digitação. */
export function validarMapas(): string[] {
  const problemas: string[] = [];
  for (const mapa of Object.values(MAPAS)) {
    for (const portal of mapa.portais) {
      const destino = MAPAS[portal.destino];
      if (!destino) problemas.push(`${mapa.id}: portal aponta para o mapa inexistente "${portal.destino}".`);
      else if (!destino.entradas[portal.entrada]) {
        problemas.push(`${mapa.id}: portal usa a entrada "${portal.entrada}", que não existe em "${portal.destino}".`);
      }
    }
    for (const npc of mapa.npcs ?? []) {
      if (!npc.aparencia && !npc.areaInteracao) {
        problemas.push(`${mapa.id}: NPC "${npc.id}" sem aparência precisa de "areaInteracao".`);
      }
    }
  }
  for (const p of problemas) console.warn(`[mapas] ${p}`);
  return problemas;
}
