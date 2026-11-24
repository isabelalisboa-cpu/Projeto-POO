const carregando = new Map<string, Promise<HTMLImageElement>>();
const prontas = new Map<string, HTMLImageElement>();

/** Caminho de um arquivo dentro de public/ (respeita a "base" do Vite). */
export function urlRecurso(caminho: string): string {
  return import.meta.env.BASE_URL + caminho;
}

export function carregarImagem(url: string): Promise<HTMLImageElement> {
  let p = carregando.get(url);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolver, rejeitar) => {
      const img = new Image();
      img.onload = () => { prontas.set(url, img); resolver(img); };
      img.onerror = () => rejeitar(new Error(`Não foi possível carregar a imagem: ${url}`));
      img.src = url;
    });
    carregando.set(url, p);
  }
  return p;
}

/** Devolve a imagem se ela já terminou de carregar. */
export function imagemPronta(url: string): HTMLImageElement | undefined {
  return prontas.get(url);
}
