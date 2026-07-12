import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BrandConfig } from "../../config/brand";
import type { Empresa } from "../../models/Empresa";
import { buscarEmpresaPorSlug } from "../../services/empresa/empresa.service";
import {
  abrirErpPdvCaixa,
  buscarErpPdvCaixaAberto,
  buscarErpPdvClientes,
  buscarErpPdvVendasParaTroca,
  calcularErpPdvResumoCaixa,
  fecharErpPdvCaixa,
  finalizarErpPdvVenda,
  listarErpPdvProdutos,
  listarErpPdvUsuarios,
  listarErpPdvValesTroca,
  registrarErpPdvDevolucao,
  type ErpPdvCaixa,
  type ErpPdvCaixaResumo,
  type ErpPdvCliente,
  type ErpPdvFormaPagamento,
  type ErpPdvPermissao,
  type ErpPdvProduto,
  type ErpPdvTabelaPreco,
  type ErpPdvUsuario,
  type ErpPdvValeTroca,
  type ErpPdvVendaBusca,
} from "../../services/erpPdv/erpPdv.service";
import { applyRobotsMetadata } from "../../utils/seo";

import "./PublicPdvPage.css";

type EmpresaPdv = Empresa & {
  recursos_contratados?: {
    erp_pdv?: boolean;
  } | null;
};

type CarrinhoItem = {
  produtoId: string;
  quantidade: number;
};

const formasPagamento: Array<{ id: ErpPdvFormaPagamento; label: string }> = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "debito", label: "Debito" },
  { id: "credito", label: "Credito" },
  { id: "vale_troca", label: "Vale-Troca" },
  { id: "outros", label: "Outros" },
];

const tabelasPreco: Array<{ id: ErpPdvTabelaPreco; label: string; permissao: ErpPdvPermissao }> = [
  { id: "varejo", label: "Varejo", permissao: "tabela_varejo" },
  { id: "atacado", label: "Atacado", permissao: "tabela_atacado" },
  { id: "revenda", label: "Revenda", permissao: "tabela_revenda" },
  { id: "personalizada", label: "Personalizada", permissao: "preco_alterar" },
];

const perfisUsuario: Record<string, string> = {
  administrador: "Administrador",
  gerente: "Gerente",
  caixa: "Caixa",
  vendedor: "Vendedor",
  estoque: "Estoque",
};

const modulosIniciais: Record<string, string> = {
  pdv: "PDV",
  caixa: "Caixa",
  trocas: "Trocas",
  estoque: "Estoque",
  relatorios: "Relatorios",
};

function numero(valor: number | string | null | undefined) {
  const parsed = typeof valor === "number" ? valor : Number(String(valor || "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function obterPreco(produto: ErpPdvProduto, tabela: ErpPdvTabelaPreco) {
  if (tabela === "atacado") return produto.preco_atacado || produto.preco_venda;
  if (tabela === "revenda") return produto.preco_revenda || produto.preco_venda;
  if (tabela === "personalizada") {
    return produto.preco_personalizado || produto.preco_venda;
  }
  return produto.preco_venda;
}

function pode(usuario: ErpPdvUsuario | null, permissao: ErpPdvPermissao) {
  return Boolean(usuario?.permissoes[permissao]);
}

function obterTabelasLiberadas(usuario: ErpPdvUsuario | null) {
  return tabelasPreco.filter((item) => pode(usuario, item.permissao));
}

export default function PublicPdvPage() {
  const { slug = "" } = useParams();
  const [empresa, setEmpresa] = useState<EmpresaPdv | null>(null);
  const [produtos, setProdutos] = useState<ErpPdvProduto[]>([]);
  const [usuarios, setUsuarios] = useState<ErpPdvUsuario[]>([]);
  const [clientes, setClientes] = useState<ErpPdvCliente[]>([]);
  const [vales, setVales] = useState<ErpPdvValeTroca[]>([]);
  const [caixa, setCaixa] = useState<ErpPdvCaixa | null>(null);
  const [resumoCaixa, setResumoCaixa] = useState<ErpPdvCaixaResumo | null>(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [operadorModalAberto, setOperadorModalAberto] = useState(true);
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [tabela, setTabela] = useState<ErpPdvTabelaPreco>("varejo");
  const [formaPagamento, setFormaPagamento] =
    useState<ErpPdvFormaPagamento>("dinheiro");
  const [valeId, setValeId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ErpPdvCliente | null>(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [valorFechamento, setValorFechamento] = useState("");
  const [cupom, setCupom] = useState("");
  const [vendasTroca, setVendasTroca] = useState<ErpPdvVendaBusca[]>([]);
  const [vendaTroca, setVendaTroca] = useState<ErpPdvVendaBusca | null>(null);
  const [motivoTroca, setMotivoTroca] = useState("");
  const [quantidadesTroca, setQuantidadesTroca] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const [atalhosAberto, setAtalhosAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [telaCheiaVisual, setTelaCheiaVisual] = useState(false);
  const buscaRef = useRef<HTMLInputElement>(null);
  const clienteBuscaRef = useRef<HTMLInputElement>(null);
  const tabelaRef = useRef<HTMLSelectElement>(null);

  const usuarioAtual = usuarios.find((usuario) => usuario.id === usuarioId) || null;
  const operador = usuarioAtual?.nome || "";
  const empresaId = empresa?.id || "";
  const erpContratado = empresa?.recursos_contratados?.erp_pdv === true;
  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo);
  const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
  const tabelaLiberada = obterTabelasLiberadas(usuarioAtual);
  const tabelaAtualLiberada = tabelaLiberada.some((item) => item.id === tabela);
  const sessaoOperadorKey = `mikaon:pdv:${slug}:operador`;
  const valesAtivos = vales.filter(
    (vale) =>
      vale.status === "ativo" &&
      vale.saldo_restante > 0 &&
      vale.validade_em >= new Date().toISOString().slice(0, 10)
  );
  const valeSelecionado = valesAtivos.find((vale) => vale.id === valeId) || null;

  const produtosEncontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const ativos = produtos.filter((produto) => produto.ativo);
    if (!termo) return ativos.slice(0, 12);
    return ativos
      .filter((produto) =>
        [produto.nome, produto.sku, produto.codigo_barras].some((valor) =>
          valor.toLowerCase().includes(termo)
        )
      )
      .slice(0, 12);
  }, [busca, produtos]);

  const carrinhoDetalhado = carrinho
    .map((item) => {
      const produto = produtosPorId.get(item.produtoId);
      if (!produto) return null;
      const preco = obterPreco(produto, tabelaAtualLiberada ? tabela : "varejo");
      return {
        produto,
        quantidade: item.quantidade,
        preco,
        subtotal: item.quantidade * preco,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const total = carrinhoDetalhado.reduce((soma, item) => soma + item.subtotal, 0);
  const valorVale = valeSelecionado ? Math.min(total, valeSelecionado.saldo_restante) : 0;
  const complemento = Math.max(0, total - valorVale);
  const podeOperarCaixa = pode(usuarioAtual, "caixa_abrir_fechar");
  const podeVender = tabelaLiberada.length > 0;
  const podeOperarTrocas =
    pode(usuarioAtual, "devolucao_realizar") && pode(usuarioAtual, "vale_troca_emitir");
  const temModuloOperacional = podeOperarCaixa || podeVender || podeOperarTrocas;
  const podeFinalizarVenda =
    Boolean(caixa) && carrinhoDetalhado.length > 0 && operador.trim().length > 0 && !salvando;

  const modoTelaCheiaAtivo = telaCheia || telaCheiaVisual;
  async function carregarDados() {
    if (!slug) return;
    setCarregando(true);
    setFeedback("");

    try {
      const { data, error } = await buscarEmpresaPorSlug(slug);
      if (error) throw error;
      if (!data) throw new Error("Empresa nao encontrada.");

      const empresaCarregada = data as EmpresaPdv;
      setEmpresa(empresaCarregada);

      if (!empresaCarregada.recursos_contratados?.erp_pdv) return;

      const [
        produtosResultado,
        usuariosResultado,
        clientesResultado,
        valesResultado,
        caixaResultado,
      ] = await Promise.all([
        listarErpPdvProdutos(empresaCarregada.id),
        listarErpPdvUsuarios(empresaCarregada.id),
        buscarErpPdvClientes(empresaCarregada.id, ""),
        listarErpPdvValesTroca(empresaCarregada.id),
        buscarErpPdvCaixaAberto(empresaCarregada.id),
      ]);

      if (produtosResultado.error) throw produtosResultado.error;
      if (usuariosResultado.error) throw usuariosResultado.error;
      if (clientesResultado.error) throw clientesResultado.error;
      if (valesResultado.error) throw valesResultado.error;
      if (caixaResultado.error) throw caixaResultado.error;

      setProdutos(produtosResultado.data);
      setUsuarios(usuariosResultado.data);
      setClientes(clientesResultado.data);
      setVales(valesResultado.data);
      setCaixa(caixaResultado.data);

      if (caixaResultado.data) {
        const resumo = await calcularErpPdvResumoCaixa(caixaResultado.data);
        if (resumo.error) throw resumo.error;
        setResumoCaixa(resumo.data);
        setValorFechamento(String(resumo.data?.totalEsperado || ""));
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel carregar o PDV.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    document.title = `PDV | ${BrandConfig.platformName}`;
    applyRobotsMetadata("noindex,nofollow");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!usuariosAtivos.length) return;

    const operadorSalvo = sessionStorage.getItem(sessaoOperadorKey);
    const usuarioSalvo = usuariosAtivos.find((usuario) => usuario.id === operadorSalvo);

    if (usuarioSalvo) {
      selecionarUsuario(usuarioSalvo.id);
      setOperadorModalAberto(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessaoOperadorKey, usuarios.length]);

  useEffect(() => {
    function aoAlterarTelaCheia() {
      setTelaCheia(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", aoAlterarTelaCheia);
    return () => document.removeEventListener("fullscreenchange", aoAlterarTelaCheia);
  }, []);

  function obterLabelPerfil(usuario: ErpPdvUsuario) {
    return perfisUsuario[usuario.perfil] || usuario.perfil;
  }

  function obterLabelModulo(usuario: ErpPdvUsuario) {
    return modulosIniciais[usuario.modulo_inicial] || "PDV";
  }

  function obterLabelsTabelas(usuario: ErpPdvUsuario) {
    const tabelas = obterTabelasLiberadas(usuario).map((item) => item.label);
    return tabelas.length ? tabelas.join(", ") : "Nenhuma tabela liberada";
  }

  function selecionarUsuario(id: string) {
    setUsuarioId(id);
    const usuario = usuarios.find((item) => item.id === id);
    if (!usuario) return;

    sessionStorage.setItem(sessaoOperadorKey, id);
    setOperadorModalAberto(false);
    setFeedback(`Operador ${usuario.nome} selecionado.`);

    const primeiraTabela = obterTabelasLiberadas(usuario)[0]?.id || "varejo";
    setTabela(primeiraTabela);

    window.setTimeout(() => {
      if (usuario.modulo_inicial === "trocas") {
        document.getElementById("pdv-trocas")?.scrollIntoView({ behavior: "smooth" });
      }
      if (usuario.modulo_inicial === "caixa") {
        document.getElementById("pdv-caixa")?.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }

  function trocarOperador() {
    if (carrinho.length > 0) {
      const confirmar = window.confirm(
        "Existe uma venda em andamento. Deseja cancelar o carrinho e trocar o operador?"
      );
      if (!confirmar) return;
    }

    setCarrinho([]);
    setCupom("");
    setValeId("");
    setClienteSelecionado(null);
    setUsuarioId("");
    sessionStorage.removeItem(sessaoOperadorKey);
    setOperadorModalAberto(true);
    setFeedback("Selecione o operador para continuar.");
  }

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setTelaCheiaVisual(false);
        return;
      }

      if (telaCheiaVisual) {
        setTelaCheiaVisual(false);
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch {
      setTelaCheiaVisual(true);
      setFeedback("Modo tela cheia aplicado dentro do navegador.");
    }
  }

  function cancelarVendaAtual() {
    if (!carrinhoDetalhado.length || !pode(usuarioAtual, "venda_cancelar")) return;
    setCarrinho([]);
    setFeedback("Venda cancelada antes da finalizacao.");
  }

  function renderModalOperador() {
    return (
      <section className="public-pdv-operator-modal" aria-modal="true" role="dialog">
        <div className="public-pdv-operator-card">
          <span>{BrandConfig.platformName} ERP/PDV</span>
          <h2>Selecione o operador</h2>
          <p>
            O acesso permanece sem senha nesta Sprint. As permissoes carregadas
            seguem o perfil do operador escolhido.
          </p>

          <div className="public-pdv-operator-list">
            {usuariosAtivos.length > 0 ? (
              usuariosAtivos.map((usuario) => (
                <button
                  type="button"
                  key={usuario.id}
                  onClick={() => selecionarUsuario(usuario.id)}
                  className="public-pdv-operator-option"
                >
                  <strong>{usuario.nome}</strong>
                  <small>{obterLabelPerfil(usuario)}</small>
                  <span>Tabelas: {obterLabelsTabelas(usuario)}</span>
                  <span>Modulo inicial: {obterLabelModulo(usuario)}</span>
                </button>
              ))
            ) : (
              <p className="public-pdv-operator-empty">
                Nenhum usuario ativo do ERP/PDV foi encontrado para esta empresa.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  function adicionarProduto(produto: ErpPdvProduto) {
    if (!tabelaAtualLiberada) {
      setFeedback("Operador sem tabela de preco liberada para venda.");
      return;
    }

    if (produto.estoque_atual <= 0) {
      setFeedback("Produto esgotado.");
      return;
    }

    setCarrinho((itens) => {
      const atual = itens.find((item) => item.produtoId === produto.id);
      if (atual) {
        return itens.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: Math.min(item.quantidade + 1, produto.estoque_atual) }
            : item
        );
      }
      return [...itens, { produtoId: produto.id, quantidade: 1 }];
    });
    setBusca("");
  }

  async function abrirCaixa() {
    if (!empresaId || !pode(usuarioAtual, "caixa_abrir_fechar")) return;
    setSalvando(true);
    try {
      const resultado = await abrirErpPdvCaixa({
        empresaId,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        saldoInicial: numero(saldoInicial.replace(",", ".")),
      });
      if (resultado.error) throw resultado.error;
      setCaixa(resultado.data);
      setSaldoInicial("");
      if (resultado.data) {
        const resumo = await calcularErpPdvResumoCaixa(resultado.data);
        if (resumo.error) throw resumo.error;
        setResumoCaixa(resumo.data);
      }
      setFeedback("Caixa aberto.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel abrir o caixa.");
    } finally {
      setSalvando(false);
    }
  }

  async function fecharCaixa() {
    if (!empresaId || !caixa || !pode(usuarioAtual, "caixa_abrir_fechar")) return;
    setSalvando(true);
    try {
      const resultado = await fecharErpPdvCaixa({
        empresaId,
        caixaId: caixa.id,
        valorInformado: numero(valorFechamento.replace(",", ".")),
        observacao: `Fechado por ${operador || "modo desenvolvimento"}`,
      });
      if (resultado.error) throw resultado.error;
      setResumoCaixa(resultado.data);
      setCaixa(null);
      setCarrinho([]);
      setFeedback("Caixa fechado.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel fechar o caixa.");
    } finally {
      setSalvando(false);
    }
  }

  async function buscarClientes() {
    if (!empresaId) return;
    const resultado = await buscarErpPdvClientes(empresaId, clienteBusca);
    if (resultado.error) {
      setFeedback(resultado.error.message);
      return;
    }
    setClientes(resultado.data);
  }

  async function finalizarVenda() {
    if (!empresaId || !caixa || !operador.trim()) return;
    if (!tabelaAtualLiberada) {
      setFeedback("Operador sem tabela de preco liberada para venda.");
      return;
    }

    if (formaPagamento === "vale_troca" && !valeSelecionado) {
      setFeedback("Selecione um vale-troca ativo.");
      return;
    }

    setSalvando(true);
    try {
      const resultado = await finalizarErpPdvVenda({
        empresaId,
        caixaId: caixa.id,
        clienteId: clienteSelecionado?.id,
        clienteNome: clienteSelecionado?.nome,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        formaPagamento,
        valeTrocaId: formaPagamento === "vale_troca" ? valeId : undefined,
        itens: carrinhoDetalhado.map((item) => ({
          produtoId: item.produto.id,
          descricao: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })),
      });
      if (resultado.error) throw resultado.error;
      if (!resultado.data) throw new Error("Venda nao retornada.");

      setCupom(
        [
          empresa?.nome || "Empresa",
          "CUPOM NAO FISCAL",
          `Venda #${resultado.data.numero}`,
          `Operador: ${resultado.data.operador}`,
          `Cliente: ${resultado.data.cliente_nome}`,
          ...carrinhoDetalhado.map(
            (item) => `${item.quantidade} x ${item.produto.nome} - R$ ${moeda(item.subtotal)}`
          ),
          `Total: R$ ${moeda(resultado.data.total)}`,
          resultado.data.vale_troca_valor_utilizado
            ? `Vale-Troca: R$ ${moeda(resultado.data.vale_troca_valor_utilizado)}`
            : "",
          resultado.data.pagamento_complementar
            ? `Complemento: R$ ${moeda(resultado.data.pagamento_complementar)}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      );
      setProdutos((atuais) =>
        atuais.map((produto) => {
          const mov = resultado.data?.movimentacoes.find(
            (item) => item.produto_id === produto.id
          );
          return mov ? { ...produto, estoque_atual: mov.estoque_posterior } : produto;
        })
      );
      setCarrinho([]);
      setValeId("");
      const valesAtualizados = await listarErpPdvValesTroca(empresaId);
      if (!valesAtualizados.error) setVales(valesAtualizados.data);
      const resumo = await calcularErpPdvResumoCaixa(caixa);
      if (!resumo.error) setResumoCaixa(resumo.data);
      setFeedback("Venda finalizada.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel finalizar.");
    } finally {
      setSalvando(false);
    }
  }

  async function buscarTrocas() {
    if (!empresaId || !pode(usuarioAtual, "devolucao_realizar")) return;
    const resultado = await buscarErpPdvVendasParaTroca(empresaId, {
      numero: "",
      cliente: clienteBusca,
      documento: "",
      data: "",
      operador: "",
    });
    if (resultado.error) {
      setFeedback(resultado.error.message);
      return;
    }
    setVendasTroca(resultado.data);
    setVendaTroca(resultado.data[0] || null);
  }

  async function registrarTroca() {
    if (!empresaId || !vendaTroca) return;
    if (!pode(usuarioAtual, "devolucao_realizar") || !pode(usuarioAtual, "vale_troca_emitir")) {
      setFeedback("Operador sem permissao para troca/vale-troca.");
      return;
    }
    const itens = vendaTroca.itens
      .map((item) => ({
        vendaItemId: item.id,
        quantidade: numero(quantidadesTroca[item.id]),
      }))
      .filter((item) => item.quantidade > 0);

    setSalvando(true);
    try {
      const resultado = await registrarErpPdvDevolucao({
        empresaId,
        vendaId: vendaTroca.id,
        operador,
        operadorUsuarioId: usuarioAtual?.id,
        motivo: motivoTroca,
        validadeDias: 30,
        itens,
      });
      if (resultado.error) throw resultado.error;
      if (resultado.data) setVales((atuais) => [resultado.data!.vale, ...atuais]);
      setMotivoTroca("");
      setQuantidadesTroca({});
      setFeedback("Troca registrada e vale-troca emitido.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel registrar a troca.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    function aoPressionarTecla(evento: KeyboardEvent) {
      const alvo = evento.target as HTMLElement | null;

      if (evento.key === "F2") {
        evento.preventDefault();
        buscaRef.current?.focus();
        return;
      }

      if (evento.key === "F4") {
        evento.preventDefault();
        if (podeFinalizarVenda) void finalizarVenda();
        return;
      }

      if (evento.key === "F6") {
        evento.preventDefault();
        clienteBuscaRef.current?.focus();
        return;
      }

      if (evento.key === "F7") {
        evento.preventDefault();
        tabelaRef.current?.focus();
        return;
      }

      if (evento.key === "F8") {
        evento.preventDefault();
        cancelarVendaAtual();
        return;
      }

      if (evento.key === "F9") {
        evento.preventDefault();
        setMenuAberto((atual) => !atual);
        return;
      }

      if (evento.key === "F10") {
        evento.preventDefault();
        void alternarTelaCheia();
        return;
      }

      if (evento.key === "Escape") {
        if (atalhosAberto) {
          evento.preventDefault();
          setAtalhosAberto(false);
          return;
        }
        if (menuAberto) {
          evento.preventDefault();
          setMenuAberto(false);
          return;
        }
        if (document.fullscreenElement) {
          evento.preventDefault();
          void document.exitFullscreen();
          return;
        }
        if (telaCheiaVisual) {
          evento.preventDefault();
          setTelaCheiaVisual(false);
        }
        return;
      }

      if (evento.key === "Enter" && alvo === buscaRef.current) {
        evento.preventDefault();
        if (produtosEncontrados[0]) adicionarProduto(produtosEncontrados[0]);
      }
    }

    window.addEventListener("keydown", aoPressionarTecla);
    return () => window.removeEventListener("keydown", aoPressionarTecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atalhosAberto, menuAberto, produtosEncontrados, podeFinalizarVenda, carrinhoDetalhado.length, usuarioAtual, telaCheiaVisual]);

  if (carregando) {
    return <main className="public-pdv public-pdv--center">Carregando PDV...</main>;
  }

  if (!empresa || !erpContratado) {
    return (
      <main className="public-pdv public-pdv--center">
        <section className="public-pdv-message">
          <h1>PDV nao disponivel</h1>
          <p>O ERP/PDV ainda nao esta ativo para esta empresa.</p>
          <Link to={`/${slug}`}>Voltar para pagina publica</Link>
        </section>
      </main>
    );
  }

  if (!usuarioAtual || operadorModalAberto) {
    return (
      <main className="public-pdv public-pdv--operator">
        {feedback && <div className="public-pdv-feedback">{feedback}</div>}
        {renderModalOperador()}
      </main>
    );
  }

  return (
    <main
      className={`public-pdv public-pdv--cashier ${menuAberto ? "public-pdv--menu-open" : ""} ${
        telaCheiaVisual ? "public-pdv--fullscreen" : ""
      }`}
    >
      <header className="public-pdv-header">
        <div>
          <span>{BrandConfig.platformName} ERP/PDV</span>
          <h1>{empresa.nome}</h1>
          <p>Acesso operacional em modo desenvolvimento, sem login obrigatorio.</p>
          <div className="public-pdv-current-operator">
            <strong>{usuarioAtual.nome}</strong>
            <span>{obterLabelPerfil(usuarioAtual)}</span>
          </div>
        </div>
        <div className="public-pdv-header-actions">
          <button type="button" onClick={() => setMenuAberto((atual) => !atual)}>
            {menuAberto ? "Fechar menu" : "Menu"}
          </button>
          <button type="button" onClick={() => setAtalhosAberto((atual) => !atual)}>
            Atalhos
          </button>
          <button type="button" onClick={alternarTelaCheia}>
            {modoTelaCheiaAtivo ? "Sair da tela cheia" : "Tela cheia"}
          </button>
          <button type="button" onClick={trocarOperador}>
            Trocar operador
          </button>
          <Link to={`/${empresa.slug}`}>Pagina publica</Link>
        </div>
      </header>

      {feedback && <div className="public-pdv-feedback">{feedback}</div>}

      <section className="public-pdv-panel public-pdv-session-bar">
        <div>
          <span>Tabelas liberadas</span>
          <strong>
            {tabelaLiberada.length
              ? tabelaLiberada.map((item) => item.label).join(", ")
              : "Nenhuma tabela liberada"}
          </strong>
        </div>
        <div>
          <label>Tabela de venda</label>
          <select
            ref={tabelaRef}
            value={tabela}
            onChange={(e) => setTabela(e.target.value as ErpPdvTabelaPreco)}
          >
            {tabelaLiberada.length > 0 ? (
              tabelaLiberada.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))
            ) : (
              <option value="varejo">Sem tabela liberada</option>
            )}
          </select>
        </div>
      </section>

      {!temModuloOperacional && (
        <section className="public-pdv-panel public-pdv-empty-state">
          <h2>Nenhum modulo operacional liberado</h2>
          <p>Este operador esta ativo, mas nao possui permissoes de caixa, venda ou trocas para esta tela.</p>
        </section>
      )}

      {atalhosAberto && (
        <section className="public-pdv-panel public-pdv-shortcuts" aria-label="Ajuda de atalhos">
          <h2>Atalhos</h2>
          <div>
            <span>F2 Busca</span>
            <span>F4 Finalizar</span>
            <span>F6 Cliente</span>
            <span>F7 Tabela</span>
            <span>F8 Cancelar</span>
            <span>F9 Menu</span>
            <span>F10 Tela cheia</span>
            <span>Esc Fechar</span>
            <span>Enter Adicionar</span>
          </div>
        </section>
      )}

      <section className="public-pdv-grid">
        {podeOperarCaixa && (
        <div className="public-pdv-panel" id="pdv-caixa">
          <h2>Caixa</h2>
          {caixa ? (
            <>
              <p>Aberto por {caixa.operador}</p>
              <strong>Esperado: R$ {moeda(resumoCaixa?.totalEsperado || 0)}</strong>
              <label>Valor informado</label>
              <input value={valorFechamento} onChange={(e) => setValorFechamento(e.target.value)} />
              <button disabled={salvando || !pode(usuarioAtual, "caixa_abrir_fechar")} onClick={fecharCaixa}>
                Fechar caixa
              </button>
            </>
          ) : (
            <>
              <label>Valor inicial</label>
              <input value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} />
              <button disabled={salvando || !operador.trim() || !pode(usuarioAtual, "caixa_abrir_fechar")} onClick={abrirCaixa}>
                Abrir caixa
              </button>
            </>
          )}
        </div>
        )}

        {podeVender && (
        <div className="public-pdv-panel public-pdv-products">
          <div className="public-pdv-section-title">
            <h2>Produtos</h2>
            <small>F2 busca | Enter adiciona</small>
          </div>
          <input
            ref={buscaRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome, SKU ou codigo"
          />
          <div className="public-pdv-product-list">
            {produtosEncontrados.map((produto) => (
              <button key={produto.id} onClick={() => adicionarProduto(produto)}>
                {produto.imagem_url && <img src={produto.imagem_url} alt={produto.nome} />}
                <span>{produto.nome}</span>
                <strong>R$ {moeda(obterPreco(produto, tabelaAtualLiberada ? tabela : "varejo"))}</strong>
                <small>Estoque: {produto.estoque_atual}</small>
              </button>
            ))}
          </div>
        </div>
        )}

        {podeVender && (
        <div className="public-pdv-panel public-pdv-cart">
          <div className="public-pdv-section-title">
            <h2>Carrinho</h2>
            <small>{carrinhoDetalhado.length} item(ns)</small>
          </div>
          {carrinhoDetalhado.map((item) => (
            <div key={item.produto.id} className="public-pdv-cart-item">
              <span>{item.produto.nome}</span>
              <input
                value={item.quantidade}
                onChange={(e) =>
                  setCarrinho((itens) =>
                    itens.map((linha) =>
                      linha.produtoId === item.produto.id
                        ? { ...linha, quantidade: Math.min(numero(e.target.value), item.produto.estoque_atual) }
                        : linha
                    )
                  )
                }
              />
              <strong>R$ {moeda(item.subtotal)}</strong>
              <button
                onClick={() =>
                  setCarrinho((itens) =>
                    itens.filter((linha) => linha.produtoId !== item.produto.id)
                  )
                }
              >
                Remover
              </button>
            </div>
          ))}

          <div className="public-pdv-total">Total: R$ {moeda(total)}</div>
          <button
            disabled={!carrinhoDetalhado.length || !pode(usuarioAtual, "venda_cancelar")}
            onClick={cancelarVendaAtual}
          >
            Cancelar venda
          </button>

          <label>Cliente</label>
          <div className="public-pdv-inline">
            <input
              ref={clienteBuscaRef}
              value={clienteBusca}
              onChange={(e) => setClienteBusca(e.target.value)}
            />
            <button onClick={buscarClientes}>Buscar</button>
          </div>
          <select
            value={clienteSelecionado?.id || ""}
            onChange={(e) =>
              setClienteSelecionado(clientes.find((cliente) => cliente.id === e.target.value) || null)
            }
          >
            <option value="">Consumidor nao identificado</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>

          <label>Pagamento</label>
          <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value as ErpPdvFormaPagamento)}>
            {formasPagamento.map((forma) => (
              <option key={forma.id} value={forma.id}>
                {forma.label}
              </option>
            ))}
          </select>

          {formaPagamento === "vale_troca" && (
            <>
              <label>Vale-Troca</label>
              <select value={valeId} onChange={(e) => setValeId(e.target.value)}>
                <option value="">Selecione</option>
                {valesAtivos.map((vale) => (
                  <option key={vale.id} value={vale.id}>
                    #{vale.numero} - {vale.cliente_nome} - R$ {moeda(vale.saldo_restante)}
                  </option>
                ))}
              </select>
              <small>Vale: R$ {moeda(valorVale)} | Complemento: R$ {moeda(complemento)}</small>
            </>
          )}

          <button
            className="public-pdv-finalize"
            disabled={!podeFinalizarVenda}
            onClick={finalizarVenda}
          >
            Finalizar venda
          </button>
        </div>
        )}
      </section>

      {cupom && (
        <section className="public-pdv-panel public-pdv-receipt">
          <h2>Cupom</h2>
          <pre>{cupom}</pre>
          <button onClick={() => window.print()}>Imprimir</button>
        </section>
      )}

      {podeOperarTrocas && (
      <section className="public-pdv-panel" id="pdv-trocas">
        <h2>Trocas autorizadas</h2>
        <p>Disponivel para operadores com permissao de devolucao e vale-troca.</p>
        <button disabled={!pode(usuarioAtual, "devolucao_realizar")} onClick={buscarTrocas}>
          Buscar vendas
        </button>
        <div className="public-pdv-exchange">
          <select
            value={vendaTroca?.id || ""}
            onChange={(e) =>
              setVendaTroca(vendasTroca.find((venda) => venda.id === e.target.value) || null)
            }
          >
            <option value="">Selecione uma venda</option>
            {vendasTroca.map((venda) => (
              <option key={venda.id} value={venda.id}>
                #{venda.numero} - {venda.cliente_nome} - R$ {moeda(venda.total)}
              </option>
            ))}
          </select>
          {vendaTroca?.itens.map((item) => (
            <label key={item.id}>
              {item.descricao} ({item.quantidade_disponivel} disp.)
              <input
                value={quantidadesTroca[item.id] || ""}
                onChange={(e) =>
                  setQuantidadesTroca((atuais) => ({
                    ...atuais,
                    [item.id]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
          <textarea
            value={motivoTroca}
            onChange={(e) => setMotivoTroca(e.target.value)}
            placeholder="Motivo da troca/devolucao"
          />
          <button
            disabled={
              salvando ||
              !vendaTroca ||
              !motivoTroca.trim() ||
              !pode(usuarioAtual, "devolucao_realizar") ||
              !pode(usuarioAtual, "vale_troca_emitir")
            }
            onClick={registrarTroca}
          >
            Registrar troca e emitir vale
          </button>
        </div>
      </section>
      )}
    </main>
  );
}
