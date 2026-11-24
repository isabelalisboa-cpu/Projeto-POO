// Menus do jogo fora de batalha: pausa, equipe, mochila, loja e armazenamento (PC).
import type { Ataque, Monstrinho, Treinador } from '../chuments';
import { CONFIG } from '../config';
import { contarMochila, definirAtivos, infoItem, type InfoItem, vivos } from '../jogo/catalogo';
import { estado } from '../jogo/jogo';
import { salvarJogo } from '../jogo/persistencia';
import { obterMapa } from '../mapas/registro';
import type { NPCLoja } from '../mapas/tipos';
import { confirmar, escolher, falar, type OpcaoMenu } from '../ui/dialogos';
import { desenharFicha } from '../ui/ficha';
import { CORES, painel, texto } from '../ui/ui';
import { abrirMenuPrincipal } from './menuPrincipal';

// ---------------------------------------------------------------------
// Escolha de chumment (lista à esquerda, ficha à direita)
// ---------------------------------------------------------------------
export interface OpcoesEscolhaChumment {
  /** Devolve true se pode ser escolhido, ou o motivo (texto curto) se não pode. */
  permitido?: (m: Monstrinho) => true | string;
  cancelavel?: boolean;
  indiceInicial?: number;
}

export function escolherChumment(titulo: string, lista: Monstrinho[], o: OpcoesEscolhaChumment = {}): Promise<Monstrinho | null> {
  const opcoes: OpcaoMenu<Monstrinho>[] = lista.map((m) => {
    const permitido = o.permitido ? o.permitido(m) : true;
    return {
      rotulo: m.nome,
      valor: m,
      detalhe: permitido === true ? `Nv ${m.getNivel()}  ${m.getVida()}/${m.getVidaMaxima()}` : permitido,
      desabilitada: permitido !== true,
    };
  });
  return escolher<Monstrinho>({
    titulo, opcoes, x: 24, y: 60, largura: 420, escurecer: true,
    cancelavel: o.cancelavel, indiceInicial: o.indiceInicial,
    painelExtra: (ctx, m) => { if (m) desenharFicha(ctx, m, 462, 60, 474, 400); },
  });
}

// ---------------------------------------------------------------------
// Uso de itens (compartilhado entre a mochila e a batalha)
// ---------------------------------------------------------------------
export interface AlvoItem { alvo: Monstrinho; ataque?: Ataque }

/** Pergunta em quem (e, se for o caso, em qual ataque) usar o item. */
export async function escolherAlvoDeItem(t: Treinador, info: InfoItem): Promise<AlvoItem | null> {
  const nome = info.item.nome;
  if (info.uso === 'cura') {
    const alvo = await escolherChumment(`Usar ${nome} em quem?`, t.equipe, {
      permitido: (m) => (m.getVida() <= 0 ? 'Desmaiado' : m.getVida() >= m.getVidaMaxima() ? 'Vida cheia' : true),
    });
    return alvo ? { alvo } : null;
  }
  const precisaDePP = (m: Monstrinho) => m.getAtaques().some((a) => a.getPPAtual() < a.getPPMaximo());
  while (true) {
    const alvo = await escolherChumment(`Usar ${nome} em quem?`, t.equipe, {
      permitido: (m) => (precisaDePP(m) ? true : 'PP cheio'),
    });
    if (!alvo) return null;
    if (info.uso === 'pp-todos') return { alvo };
    const ataque = await escolher<Ataque>({
      titulo: `Restaurar qual ataque de ${alvo.nome}?`,
      largura: 440,
      opcoes: alvo.getAtaques().map((a) => ({
        rotulo: a.getNome(), valor: a,
        detalhe: `PP ${a.getPPAtual()}/${a.getPPMaximo()}`,
        desabilitada: a.getPPAtual() >= a.getPPMaximo(),
      })),
    });
    if (ataque) return { alvo, ataque };
  }
}

// ---------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------
async function menuEquipe(): Promise<void> {
  const t = estado().treinador;
  let indice = 0;
  while (true) {
    const m = await escolherChumment('EQUIPE — os dois primeiros entram em batalha', t.equipe, { indiceInicial: indice });
    if (!m) return;
    indice = t.equipe.indexOf(m);
    if (t.equipe.length < 2) continue;
    const destino = await escolher<number>({
      titulo: `Mover ${m.nome} para qual posição?`,
      largura: 400,
      opcoes: t.equipe.map((outro, i) => ({
        rotulo: `${i + 1}º lugar`, valor: i,
        detalhe: i === indice ? 'atual' : outro.nome,
        desabilitada: i === indice,
      })),
    });
    if (destino !== null) {
      t.reorganizarEquipe(indice, destino);
      indice = destino;
    }
  }
}

// ---------------------------------------------------------------------
// Mochila
// ---------------------------------------------------------------------
async function menuMochila(): Promise<void> {
  const t = estado().treinador;
  let indice = 0;
  while (true) {
    const grupos = contarMochila(t.mochila);
    if (grupos.length === 0) { await falar('A mochila está vazia.'); return; }
    const info = await escolher<InfoItem>({
      titulo: 'MOCHILA', x: 250, y: 90, largura: 460, escurecer: true,
      indiceInicial: Math.min(indice, grupos.length - 1),
      opcoes: grupos.map((g) => ({ rotulo: g.info.item.nome, valor: g.info, detalhe: `x${g.quantidade}`, descricao: g.info.descricao })),
    });
    if (!info) return;
    indice = grupos.findIndex((g) => g.info === info);

    if (info.uso === 'captura') {
      await falar('Capturadores só podem ser usados em batalha, contra chumments selvagens.');
      continue;
    }
    const escolha = await escolherAlvoDeItem(t, info);
    if (!escolha) continue;
    const vidaAntes = escolha.alvo.getVida();
    if (!t.usarItem(info.item, escolha.alvo, escolha.ataque)) continue;
    if (info.uso === 'cura') {
      await falar(`${escolha.alvo.nome} recuperou ${escolha.alvo.getVida() - vidaAntes} de vida.`);
    } else if (escolha.ataque) {
      await falar(`O PP de ${escolha.ataque.getNome()} foi restaurado.`);
    } else {
      await falar(`O PP de todos os ataques de ${escolha.alvo.nome} foi restaurado.`);
    }
  }
}

// ---------------------------------------------------------------------
// Loja (enfermeira, vendedor ou qualquer NPC do tipo "loja")
// ---------------------------------------------------------------------
export async function abrirLoja(npc: NPCLoja): Promise<void> {
  const t = estado().treinador;
  await falar(npc.saudacao, npc.nome);
  let indice = 0;
  while (true) {
    const produtos = npc.itens
      .map((nome) => ({ info: infoItem(nome), preco: CONFIG.precos[nome] }))
      .filter((p): p is { info: InfoItem; preco: number } => {
        if (!p.info || p.preco === undefined) console.warn(`[loja] item sem cadastro ou sem preço: verifique catalogo.ts e config.ts`);
        return !!p.info && p.preco !== undefined;
      });
    const escolhido = await escolher<{ info: InfoItem; preco: number }>({
      titulo: `${npc.nome.toUpperCase()} — Seu dinheiro: $${t.dinheiro}`,
      x: 220, y: 80, largura: 520, indiceInicial: indice,
      opcoes: produtos.map((p) => {
        const tem = t.mochila.filter((i) => i === p.info.item).length;
        return {
          rotulo: p.info.item.nome, valor: p,
          detalhe: `$${p.preco}`,
          descricao: `${p.info.descricao} Você tem: ${tem}.`,
          desabilitada: t.dinheiro < p.preco,
        };
      }),
    });
    if (!escolhido) break;
    indice = produtos.indexOf(escolhido);
    if (t.gastarDinheiro(escolhido.preco)) t.adicionarItem(escolhido.info.item);
  }
  await falar(npc.despedida, npc.nome);
}

// ---------------------------------------------------------------------
// Armazenamento (computador do quarto)
// ---------------------------------------------------------------------
export async function abrirPC(): Promise<void> {
  const t = estado().treinador;
  await falar('Você ligou o computador. O sistema de armazenamento de chumments está online.');
  while (true) {
    const acao = await escolher<'retirar' | 'guardar'>({
      titulo: 'ARMAZENAMENTO', largura: 420,
      opcoes: [
        { rotulo: 'Retirar chumment', valor: 'retirar', detalhe: `${t.armazenamento.length} guardados`, desabilitada: t.armazenamento.length === 0 },
        { rotulo: 'Guardar chumment', valor: 'guardar', detalhe: `${t.equipe.length}/6 na equipe`, desabilitada: t.equipe.length <= 1 },
      ],
    });
    if (!acao) return;

    if (acao === 'retirar') {
      if (t.equipe.length >= 6) { await falar('A equipe já tem 6 chumments. Guarde um antes de retirar outro.'); continue; }
      const m = await escolherChumment('Retirar qual chumment?', t.armazenamento);
      if (!m) continue;
      t.armazenamento = t.armazenamento.filter((x) => x !== m);
      t.equipe.push(m);
      definirAtivos(t);
      await falar(`${m.nome} entrou na equipe.`);
    } else {
      const m = await escolherChumment('Guardar qual chumment?', t.equipe, {
        permitido: (x) => (x.getVida() > 0 && vivos(t.equipe).length <= 1 ? 'Último de pé' : true),
      });
      if (!m) continue;
      t.removerMonstrinho(m);
      t.armazenamento.push(m);
      definirAtivos(t);
      await falar(`${m.nome} foi guardado no armazenamento.`);
    }
  }
}

// ---------------------------------------------------------------------
// Menu de pausa
// ---------------------------------------------------------------------
export async function abrirMenuPausa(): Promise<void> {
  let indice = 0;
  while (true) {
    const e = estado();
    const t = e.treinador;
    const opcao = await escolher<'equipe' | 'mochila' | 'salvar' | 'sair'>({
      titulo: 'MENU', x: 640, y: 30, largura: 296, escurecer: true, indiceInicial: indice,
      opcoes: [
        { rotulo: 'Equipe', valor: 'equipe', detalhe: `${t.equipe.length}/6` },
        { rotulo: 'Mochila', valor: 'mochila', detalhe: `${t.mochila.length} itens` },
        { rotulo: 'Salvar', valor: 'salvar' },
        { rotulo: 'Menu principal', valor: 'sair' },
      ],
      painelExtra: (ctx) => {
        painel(ctx, 24, 30, 360, 132);
        texto(ctx, t.nome, 46, 48, { tamanho: 24 });
        texto(ctx, obterMapa(e.mapa).nome, 46, 82, { tamanho: 16, cor: CORES.fraco });
        texto(ctx, `$${t.dinheiro}`, 46, 112, { tamanho: 22, cor: CORES.dinheiro });
        texto(ctx, `Armazenados: ${t.armazenamento.length}`, 362, 116, { tamanho: 15, cor: CORES.fraco, alinhar: 'right' });
      },
    });
    if (opcao === null) return;
    if (opcao === 'equipe') { indice = 0; await menuEquipe(); }
    else if (opcao === 'mochila') { indice = 1; await menuMochila(); }
    else if (opcao === 'salvar') {
      indice = 2;
      await falar(salvarJogo(e) ? 'Jogo salvo!' : 'Não foi possível salvar (o navegador bloqueou o armazenamento).');
    } else {
      indice = 3;
      if (await confirmar('Salvar e voltar ao menu principal?')) {
        salvarJogo(e);
        abrirMenuPrincipal();
        return;
      }
    }
  }
}
