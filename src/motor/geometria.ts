export interface Ret { x: number; y: number; w: number; h: number }

export function intersecta(a: Ret, b: Ret): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function contemPonto(r: Ret, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function expandir(r: Ret, margem: number): Ret {
  return { x: r.x - margem, y: r.y - margem, w: r.w + margem * 2, h: r.h + margem * 2 };
}

export function inteiroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
