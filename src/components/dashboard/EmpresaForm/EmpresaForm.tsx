import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

import {
  buscarEmpresaPorId,
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../../../services/empresa/empresa.service";
import {
  abrirErpPdvCaixa,
  buscarErpPdvCaixaAberto,
  buscarErpPdvClientes,
  calcularErpPdvResumoCaixa,
  fecharErpPdvCaixa,
  gerarErpPdvRelatorioOperacional,
  criarErpPdvCategoria,
  listarErpPdvMovimentacoes,
  listarErpPdvCategorias,
  listarErpPdvClientes,
  listarErpPdvProdutos,
  finalizarErpPdvVenda,
  registrarErpPdvCaixaMovimentacao,
  registrarErpPdvMovimentacao,
  salvarErpPdvCliente,
  salvarErpPdvProduto,
  type ErpPdvCaixa,
  type ErpPdvCaixaMovimentacaoTipo,
  type ErpPdvCaixaResumo,
  type ErpPdvCliente,
  type ErpPdvClientePayload,
  type ErpPdvFormaPagamento,
  type ErpPdvFormacaoPrecoTipo,
  type ErpPdvCategoria,
  type ErpPdvMovimentacao,
  type ErpPdvMovimentacaoPayload,
  type ErpPdvMovimentacaoTipo,
  type ErpPdvProduto,
  type ErpPdvProdutoPayload,
  type ErpPdvRelatorioResumo,
  type ErpPdvTabelaPreco,
} from "../../../services/erpPdv/erpPdv.service";

import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import UploadImagem from "../UploadImagem";
import QRCodeEmpresa from "../QRCodeEmpresa/QRCodeEmpresa";
import HeroEmpresa from "../../public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../public/ContatosEmpresa/ContatosEmpresa";
import {
  PublicLandingPageContent,
  type EmpresaLanding,
} from "../../../pages/PublicLandingPage/PublicLandingPage";
import {
  obterResumoStorageEmpresas,
  type StorageResumo,
} from "../../../services/storage/storage.service";
import { BrandConfig } from "../../../config/brand";

import "../../../pages/PublicEmpresaPage/PublicEmpresaPage.css";
import "../../../pages/PublicLandingPage/PublicLandingPage.css";

const categoriasEmpresa = [
  "Comunicação Visual",
  "Restaurante",
  "Lanchonete",
  "Pizzaria",
  "Barbearia",
  "Salão de Beleza",
  "Clínica",
  "Dentista",
  "Loja",
  "Oficina",
  "Borracharia",
  "Auto Center",
  "Pet Shop",
  "Academia",
  "Mercado",
  "Padaria",
  "Imobiliária",
  "Advogado",
  "Escola",
  "Igreja",
];

type AbaEmpresa =
  | "informacoes"
  | "aparencia"
  | "plano"
  | "landing"
  | "cardapio"
  | "catalogo"
  | "agendamento"
  | "wifiMarketing"
  | "fidelidade"
  | "crm"
  | "erpPdv"
  | "ia"
  | "contato"
  | "endereco"
  | "redes"
  | "conectividade";

type LogoExibicao = "normal" | "hidden";
type TipoFundo = "solida" | "gradiente";
type DirecaoGradiente = "horizontal" | "vertical" | "diagonal";
type AparenciaConfig = {
  logoExibicao: LogoExibicao;
  corPrincipal: string;
  corSecundaria: string;
  corBotoes: string;
  corTextoBotoes: string;
  corFundoPagina: string;
  corAreaPrincipal: string;
  corFundoHero: string;
  tipoFundo: TipoFundo;
  gradienteInicio: string;
  gradienteFim: string;
  gradienteDirecao: DirecaoGradiente;
};

const abasEmpresa: Array<{
  id: AbaEmpresa;
  label: string;
  adminOnly?: boolean;
}> = [
  { id: "informacoes", label: "Informações" },
  { id: "aparencia", label: "Personalizar Página" },
  { id: "plano", label: "Plano e Recursos", adminOnly: true },
  { id: "landing", label: "Landing Page" },
  { id: "cardapio", label: "Cardapio Digital" },
  { id: "catalogo", label: "Catalogo" },
  { id: "agendamento", label: "Agendamento" },
  { id: "wifiMarketing", label: "Wi-Fi Marketing" },
  { id: "fidelidade", label: "Fidelidade" },
  { id: "crm", label: "CRM" },
  { id: "erpPdv", label: "ERP/PDV" },
  { id: "ia", label: "IA" },
  { id: "contato", label: "Contato" },
  { id: "endereco", label: "Endereço" },
  { id: "redes", label: "Redes Sociais" },
  { id: "conectividade", label: "Conectividade" },
];

type PlanoEmpresa = "starter" | "pro" | "premium";
type RecursoEmpresaId =
  | "pagina_publica"
  | "painel_cliente"
  | "landing_page"
  | "dominio_personalizado"
  | "cardapio_digital"
  | "catalogo"
  | "agendamento"
  | "wifi_marketing"
  | "fidelidade"
  | "crm"
  | "erp_pdv"
  | "ia"
  | "wifi"
  | "google_reviews"
  | "nfc"
  | "qr_code";

type RecursosContratados = Record<RecursoEmpresaId, boolean>;

const planosEmpresa: Array<{
  id: PlanoEmpresa;
  nome: string;
  descricao: string;
}> = [
  {
    id: "starter",
    nome: "Starter",
    descricao: "Base para pagina publica, painel, NFC e QR Code.",
  },
  {
    id: "pro",
    nome: "Pro",
    descricao: "Preparado para modulos comerciais e relacionamento.",
  },
  {
    id: "premium",
    nome: "Premium",
    descricao: "Estrutura completa para recursos avancados e modulos avulsos.",
  },
];

const recursosPadrao: RecursosContratados = {
  pagina_publica: true,
  painel_cliente: true,
  landing_page: false,
  dominio_personalizado: false,
  cardapio_digital: false,
  catalogo: false,
  agendamento: false,
  wifi_marketing: false,
  fidelidade: false,
  crm: false,
  erp_pdv: false,
  ia: false,
  wifi: false,
  google_reviews: false,
  nfc: true,
  qr_code: true,
};

const recursosEmpresa: Array<{
  id: RecursoEmpresaId;
  nome: string;
  descricao: string;
  statusInativo: "Em breve" | "Nao contratado";
}> = [
  {
    id: "pagina_publica",
    nome: "Pagina Publica",
    descricao: "Vitrine principal acessada por clientes.",
    statusInativo: "Nao contratado",
  },
  {
    id: "painel_cliente",
    nome: "Painel do Cliente",
    descricao: "Permite que o cliente edite dados da propria empresa.",
    statusInativo: "Nao contratado",
  },
  {
    id: "landing_page",
    nome: "Landing Page",
    descricao: "Modulo reservado para campanhas e ofertas.",
    statusInativo: "Em breve",
  },
  {
    id: "dominio_personalizado",
    nome: "Dominio Personalizado",
    descricao: "Uso de dominio proprio ou white label.",
    statusInativo: "Em breve",
  },
  {
    id: "cardapio_digital",
    nome: "Cardapio Digital",
    descricao: "Estrutura futura para produtos, categorias e pedidos.",
    statusInativo: "Em breve",
  },
  {
    id: "catalogo",
    nome: "Catalogo",
    descricao: "Estrutura para vitrine de produtos e servicos sem checkout.",
    statusInativo: "Em breve",
  },
  {
    id: "agendamento",
    nome: "Agendamento",
    descricao: "Estrutura para servicos, duracao e reserva de horarios.",
    statusInativo: "Em breve",
  },
  {
    id: "wifi_marketing",
    nome: "Wi-Fi Marketing",
    descricao: "Campanhas exibidas para clientes conectados ou em captacao.",
    statusInativo: "Em breve",
  },
  {
    id: "fidelidade",
    nome: "Programa de Fidelidade",
    descricao: "Estrutura para campanhas de pontos, carimbos e recompensas.",
    statusInativo: "Em breve",
  },
  {
    id: "crm",
    nome: "CRM",
    descricao: "Cadastro e organizacao de clientes, tags, status e observacoes.",
    statusInativo: "Em breve",
  },
  {
    id: "erp_pdv",
    nome: "ERP/PDV",
    descricao: "Base online para produtos, estoque, vendas e caixa.",
    statusInativo: "Em breve",
  },
  {
    id: "ia",
    nome: "Assistente de IA",
    descricao: "Estrutura inicial para assistente comercial inteligente.",
    statusInativo: "Em breve",
  },
  {
    id: "wifi",
    nome: "Wi-Fi",
    descricao: "Exibicao de dados de rede para clientes autorizados.",
    statusInativo: "Nao contratado",
  },
  {
    id: "google_reviews",
    nome: "Google Reviews",
    descricao: "Atalho para avaliacoes e reputacao no Google.",
    statusInativo: "Nao contratado",
  },
  {
    id: "nfc",
    nome: "NFC",
    descricao: "Link preparado para gravacao em etiquetas NFC.",
    statusInativo: "Nao contratado",
  },
  {
    id: "qr_code",
    nome: "QR Code",
    descricao: "Geracao e uso do QR Code da empresa.",
    statusInativo: "Nao contratado",
  },
];

function normalizarPlano(valor: unknown): PlanoEmpresa {
  return planosEmpresa.some((plano) => plano.id === valor)
    ? (valor as PlanoEmpresa)
    : "starter";
}

function normalizarRecursos(valor: unknown): RecursosContratados {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...recursosPadrao };
  }

  const recursosRecebidos = valor as Partial<Record<RecursoEmpresaId, unknown>>;

  return recursosEmpresa.reduce<RecursosContratados>(
    (recursos, recurso) => ({
      ...recursos,
      [recurso.id]:
        typeof recursosRecebidos[recurso.id] === "boolean"
          ? Boolean(recursosRecebidos[recurso.id])
          : recursosPadrao[recurso.id],
    }),
    { ...recursosPadrao }
  );
}

type LandingPageSecaoId =
  | "templates"
  | "ordenacao"
  | "historico"
  | "blocosExtras"
  | "hero"
  | "sobre"
  | "servicos"
  | "galeria"
  | "depoimentos"
  | "videos"
  | "audios"
  | "produtosDigitais"
  | "contato"
  | "cta"
  | "seo";

type LandingPageHeroConfig = {
  titulo: string;
  subtitulo: string;
  botaoTexto: string;
  botaoLink: string;
  imagemDestaque: string;
};

type LandingPageSobreConfig = {
  titulo: string;
  texto: string;
  imagem: string;
};

type LandingPageServicoConfig = {
  titulo: string;
  descricao: string;
};

type LandingPageGaleriaImagemConfig = {
  url: string;
  alt: string;
};

type LandingPageDepoimentoConfig = {
  nome: string;
  cargoEmpresa: string;
  texto: string;
};

type LandingPageVideoConfig = {
  titulo: string;
  descricao: string;
  url: string;
  visivel: boolean;
};

type LandingPageAudioConfig = {
  titulo: string;
  descricao: string;
  arquivoUrl: string;
  visivel: boolean;
};

type LandingPageProdutoDigitalConfig = {
  titulo: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  linkCompra: string;
  categoria: string;
  visivel: boolean;
};

type LandingPageContatoConfig = {
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
};

type LandingPageFormularioCampoId =
  | "nome"
  | "telefone"
  | "whatsapp"
  | "email"
  | "mensagem";

type LandingPageFormularioCampoConfig = {
  ativo: boolean;
  obrigatorio: boolean;
};

type LandingPageFormularioContatoConfig = Record<
  LandingPageFormularioCampoId,
  LandingPageFormularioCampoConfig
>;

type LandingPageCtaConfig = {
  titulo: string;
  texto: string;
  botaoTexto: string;
  botaoLink: string;
};

type LandingPageSeoConfig = {
  titulo: string;
  descricao: string;
  palavrasChave: string;
  imagemCompartilhamento: string;
};

type LandingPageSecaoConteudoId =
  | "hero"
  | "sobre"
  | "servicos"
  | "galeria"
  | "depoimentos"
  | "videos"
  | "audios"
  | "produtosDigitais"
  | "contato"
  | "cta";

type LandingPageConfig = {
  publicada: boolean;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  videos: LandingPageVideoConfig[];
  audios: LandingPageAudioConfig[];
  produtosDigitais: LandingPageProdutoDigitalConfig[];
  categoriasProdutosDigitais: string[];
  contato: LandingPageContatoConfig;
  formularioContato: LandingPageFormularioContatoConfig;
  cta: LandingPageCtaConfig;
  seo: LandingPageSeoConfig;
  ordemSecoes: LandingPageSecaoConteudoId[];
  visibilidadeSecoes: Record<LandingPageSecaoConteudoId, boolean>;
  versaoPublicada: LandingPagePublicavelConfig | null;
  alteracoesNaoPublicadas: boolean;
  historicoVersoes: LandingPagePublicavelConfig[];
};

type LandingPagePublicavelConfig = Omit<
  LandingPageConfig,
  "versaoPublicada" | "alteracoesNaoPublicadas" | "historicoVersoes"
> & {
  publicadaEm?: string;
  publicadaPor?: string;
};

type LandingPageSectionProps = {
  nome: string;
  descricao: string;
  landingPageContratada: boolean;
  pastaUploadLanding: string;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  galeria: LandingPageGaleriaImagemConfig[];
  depoimentos: LandingPageDepoimentoConfig[];
  videos: LandingPageVideoConfig[];
  audios: LandingPageAudioConfig[];
  produtosDigitais: LandingPageProdutoDigitalConfig[];
  categoriasProdutosDigitais: string[];
  contato: LandingPageContatoConfig;
  formularioContato: LandingPageFormularioContatoConfig;
  cta: LandingPageCtaConfig;
  seo: LandingPageSeoConfig;
  ordemSecoes: LandingPageSecaoConteudoId[];
  visibilidadeSecoes: Record<LandingPageSecaoConteudoId, boolean>;
  onHeroChange: (campo: keyof LandingPageHeroConfig, valor: string) => void;
  onSobreChange: (campo: keyof LandingPageSobreConfig, valor: string) => void;
  onServicoChange: (
    indice: number,
    campo: keyof LandingPageServicoConfig,
    valor: string
  ) => void;
  onServicoAdd: () => void;
  onServicoRemove: (indice: number) => void;
  onGaleriaImagemChange: (
    indice: number,
    campo: keyof LandingPageGaleriaImagemConfig,
    valor: string
  ) => void;
  onGaleriaImagemAdd: () => void;
  onGaleriaImagemRemove: (indice: number) => void;
  onDepoimentoChange: (
    indice: number,
    campo: keyof LandingPageDepoimentoConfig,
    valor: string
  ) => void;
  onDepoimentoAdd: () => void;
  onDepoimentoRemove: (indice: number) => void;
  onVideoChange: (
    indice: number,
    campo: keyof LandingPageVideoConfig,
    valor: string | boolean
  ) => void;
  onVideoAdd: () => void;
  onVideoRemove: (indice: number) => void;
  onVideoMove: (indice: number, direcao: "up" | "down") => void;
  onAudioChange: (
    indice: number,
    campo: keyof LandingPageAudioConfig,
    valor: string | boolean
  ) => void;
  onAudioAdd: () => void;
  onAudioRemove: (indice: number) => void;
  onAudioMove: (indice: number, direcao: "up" | "down") => void;
  onProdutoDigitalChange: (
    indice: number,
    campo: keyof LandingPageProdutoDigitalConfig,
    valor: string | boolean
  ) => void;
  onProdutoDigitalAdd: () => void;
  onProdutoDigitalRemove: (indice: number) => void;
  onProdutoDigitalMove: (indice: number, direcao: "up" | "down") => void;
  onProdutoCategoriaAdd: (categoria: string) => void;
  onProdutoCategoriaRemove: (categoria: string) => void;
  onContatoChange: (campo: keyof LandingPageContatoConfig, valor: string) => void;
  onFormularioContatoChange: (
    campo: LandingPageFormularioCampoId,
    propriedade: keyof LandingPageFormularioCampoConfig,
    valor: boolean
  ) => void;
  onCtaChange: (campo: keyof LandingPageCtaConfig, valor: string) => void;
  onSeoChange: (campo: keyof LandingPageSeoConfig, valor: string) => void;
  onTemplateApply: (template: LandingPageTemplateConfig) => void;
  onSecaoMove: (secao: LandingPageSecaoConteudoId, direcao: "up" | "down") => void;
  onSecaoVisibilityChange: (
    secao: LandingPageSecaoConteudoId,
    visivel: boolean
  ) => void;
  historicoVersoes: LandingPagePublicavelConfig[];
  versaoHistoricoVisualizada: LandingPagePublicavelConfig | null;
  onHistoricoView: (versao: LandingPagePublicavelConfig) => void;
  onHistoricoRestore: (versao: LandingPagePublicavelConfig) => void;
  onHistoricoClose: () => void;
};

type LandingPageSecaoConfig = {
  id: LandingPageSecaoId;
  nome: string;
  descricao: string;
  ordem: number;
  Component: (props: LandingPageSectionProps) => ReactElement;
};

type LandingPageIaContexto = {
  nomeEmpresa: string;
  categoria: string;
  descricao: string;
  servicos: LandingPageServicoConfig[];
  contatos: LandingPageContatoConfig;
};

type LandingPageTemplateConfig = {
  id: string;
  nome: string;
  segmento: string;
  descricao: string;
  hero: LandingPageHeroConfig;
  sobre: LandingPageSobreConfig;
  servicos: LandingPageServicoConfig[];
  cta: LandingPageCtaConfig;
};

type LandingPageBlocoExtraConfig = {
  id: "audios" | "produtos_digitais_partituras";
  nome: string;
  segmento: string;
  descricao: string;
  recursoFuturo: string;
};

type CardapioCategoriaConfig = {
  id: string;
  nome: string;
  descricao: string;
  visivel: boolean;
};

type CardapioProdutoConfig = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  observacoes: string;
  preco: string;
  imagemUrl: string;
  disponivel: boolean;
};

type CardapioConfig = {
  categorias: CardapioCategoriaConfig[];
  produtos: CardapioProdutoConfig[];
};

type CatalogoCategoriaConfig = {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
};

type CatalogoProdutoConfig = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  ativo: boolean;
};

type CatalogoConfig = {
  categorias: CatalogoCategoriaConfig[];
  produtos: CatalogoProdutoConfig[];
};

type AgendamentoServicoConfig = {
  id: string;
  nome: string;
  descricao: string;
  duracaoMinutos: string;
  valor: string;
  ativo: boolean;
};

type AgendamentoConfig = {
  servicos: AgendamentoServicoConfig[];
};

type WifiMarketingConfig = {
  titulo: string;
  mensagem: string;
  imagemUrl: string;
  botaoTexto: string;
  botaoLink: string;
  ativo: boolean;
};

type FidelidadeConfig = {
  titulo: string;
  descricao: string;
  recompensa: string;
  quantidade: string;
  tipoAcumulo: "pontos" | "carimbos";
  ativo: boolean;
};

type IaTomComunicacao =
  | "profissional"
  | "amigavel"
  | "consultivo"
  | "descontraido";

type IaContextoFonte =
  | "dados_empresa"
  | "pagina_publica"
  | "landing_page"
  | "cardapio_digital"
  | "catalogo"
  | "agendamento"
  | "fidelidade"
  | "crm";

type IaContextoConfig = {
  fontes: Record<IaContextoFonte, boolean>;
  ultimaAtualizacao: string;
  resumo: string;
  dados: Record<string, unknown>;
};

type IaPerguntaFrequenteConfig = {
  id: string;
  pergunta: string;
  resposta: string;
};

type IaBaseConhecimentoConfig = {
  perguntasFrequentes: IaPerguntaFrequenteConfig[];
  politicasEmpresa: string;
  informacoesImportantes: string;
};

type IaPromptMestreConfig = {
  conteudo: string;
  geradoEm: string;
  versao: string;
};

type IaFaqRascunho = {
  pergunta: string;
  resposta: string;
};

type IaConfig = {
  ativa: boolean;
  nomeAssistente: string;
  tomComunicacao: IaTomComunicacao;
  instrucoesPersonalizadas: string;
  contexto: IaContextoConfig;
  baseConhecimento: IaBaseConhecimentoConfig;
  promptMestre: IaPromptMestreConfig;
};

type IaConfigCampoEditavel =
  | "ativa"
  | "nomeAssistente"
  | "tomComunicacao"
  | "instrucoesPersonalizadas";

type CrmClienteStatus = "prospect" | "ativo" | "inativo";

type CrmPipelineEtapa =
  | "novo_lead"
  | "em_atendimento"
  | "proposta"
  | "fechado"
  | "perdido";

type CrmInteracaoOrigem =
  | "manual"
  | "sistema"
  | "whatsapp"
  | "telefone"
  | "email"
  | "reuniao"
  | "landing_page"
  | "catalogo"
  | "agendamento"
  | "fidelidade";

type CrmInteracaoConfig = {
  id: string;
  texto: string;
  origem: CrmInteracaoOrigem;
  dataHora: string;
};

type CrmTarefaPrioridade = "baixa" | "media" | "alta";

type CrmTarefaStatus = "pendente" | "concluida";

type CrmTarefaConfig = {
  id: string;
  titulo: string;
  descricao: string;
  vencimento: string;
  prioridade: CrmTarefaPrioridade;
  status: CrmTarefaStatus;
  criadoEm?: string;
  concluidoEm?: string;
};

type CrmTarefaRascunho = {
  titulo: string;
  descricao: string;
  vencimento: string;
  prioridade: CrmTarefaPrioridade;
};

type CrmAutomacaoEvento =
  | "novo_lead"
  | "mudanca_etapa"
  | "tarefa_vencida";

type CrmAutomacaoAcao =
  | "registrar_historico"
  | "preparar_whatsapp"
  | "preparar_email";

type CrmAutomacaoConfig = {
  id: string;
  evento: CrmAutomacaoEvento;
  titulo: string;
  mensagem: string;
  acao: CrmAutomacaoAcao;
  ativa: boolean;
};

type CrmClienteConfig = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  observacoes: string;
  tags: string[];
  status: CrmClienteStatus;
  etapaPipeline: CrmPipelineEtapa;
  origem?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  movimentadoEm?: string;
  interacoes: CrmInteracaoConfig[];
  tarefas: CrmTarefaConfig[];
};

type CrmClienteCampoEditavel =
  | "nome"
  | "telefone"
  | "email"
  | "observacoes"
  | "tags"
  | "status";

type CrmConfig = {
  clientes: CrmClienteConfig[];
  automacoes: CrmAutomacaoConfig[];
};

type ErpPdvProdutoForm = {
  id: string;
  nome: string;
  categoriaId: string;
  codigoBarras: string;
  sku: string;
  marca: string;
  custo: string;
  precoVenda: string;
  precoAtacado: string;
  precoRevenda: string;
  precoPersonalizado: string;
  formacaoPrecoTipo: ErpPdvFormacaoPrecoTipo;
  percentualPreco: string;
  unidade: string;
  estoqueAtual: string;
  estoqueMinimo: string;
  localizacao: string;
  ncm: string;
  observacoes: string;
  imagemUrl: string;
  ativo: boolean;
};

type ErpPdvOrdenacaoProdutos = "nome" | "estoque" | "preco";

type ErpPdvMovimentacaoForm = {
  produtoId: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: string;
  motivo: string;
  observacao: string;
  usuarioResponsavel: string;
};

type ErpPdvMovimentacaoFiltroTipo = ErpPdvMovimentacaoTipo | "todos";

type ErpPdvCarrinhoItem = {
  produtoId: string;
  quantidade: number;
};

type ErpPdvClienteForm = {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  observacoes: string;
};

type ErpPdvCupomLayout = "58mm" | "80mm" | "a4";

type ErpPdvCupomItem = {
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  tabelaPreco: ErpPdvTabelaPreco;
};

type ErpPdvCupomNaoFiscal = {
  vendaNumero: number;
  empresa: string;
  cnpj: string;
  endereco: string;
  cliente: string;
  clienteDocumento: string;
  clienteContato: string;
  dataHora: string;
  operador: string;
  pagamento: string;
  itens: ErpPdvCupomItem[];
  total: number;
};

type ErpPdvModoImpressao = "direta" | "navegador" | "pdf" | "whatsapp";

type ErpPdvPerfilImpressao =
  | "escpos_generico"
  | "impressora_sistema"
  | "navegador";

type ErpPdvImpressaoConfig = {
  modo: ErpPdvModoImpressao;
  nomeImpressora: string;
  marca: string;
  modelo: string;
  largura: ErpPdvCupomLayout;
  impressaoAutomatica: boolean;
  numeroVias: number;
  perfil: ErpPdvPerfilImpressao;
  conectorLocalPreparado: boolean;
};

type ErpPdvCaixaMovimentoForm = {
  tipo: ErpPdvCaixaMovimentacaoTipo;
  valor: string;
  observacao: string;
};

const erpPdvFormasPagamento: Array<{
  id: ErpPdvFormaPagamento;
  label: string;
}> = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "debito", label: "Cartao de Debito" },
  { id: "credito", label: "Cartao de Credito" },
  { id: "outros", label: "Outros" },
];

const erpPdvTabelasPreco: Array<{
  id: ErpPdvTabelaPreco;
  label: string;
}> = [
  { id: "varejo", label: "Varejo" },
  { id: "atacado", label: "Atacado" },
  { id: "revenda", label: "Revenda" },
  { id: "personalizada", label: "Personalizada" },
];

const erpPdvModosImpressao: Array<{
  id: ErpPdvModoImpressao;
  label: string;
  descricao: string;
}> = [
  {
    id: "navegador",
    label: "Navegador",
    descricao: "Usa a impressao padrao do navegador.",
  },
  {
    id: "pdf",
    label: "PDF",
    descricao: "Abre o dialogo para salvar como PDF.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    descricao: "Compartilha o resumo textual do cupom.",
  },
  {
    id: "direta",
    label: "Impressao direta",
    descricao: "Preparado para o futuro Conector de Impressao local.",
  },
];

const erpPdvPerfisImpressao: Array<{
  id: ErpPdvPerfilImpressao;
  label: string;
  descricao: string;
}> = [
  {
    id: "navegador",
    label: "Navegador",
    descricao: "Compatibilidade atual para qualquer impressora instalada.",
  },
  {
    id: "impressora_sistema",
    label: "Impressora do sistema",
    descricao: "Preparado para escolher impressoras instaladas no computador.",
  },
  {
    id: "escpos_generico",
    label: "Generico ESC/POS",
    descricao: "Base para impressoras termicas 58 mm e 80 mm.",
  },
];

const erpPdvImpressaoConfigPadrao: ErpPdvImpressaoConfig = {
  modo: "navegador",
  nomeImpressora: "",
  marca: "",
  modelo: "",
  largura: "80mm",
  impressaoAutomatica: false,
  numeroVias: 1,
  perfil: "navegador",
  conectorLocalPreparado: true,
};

const erpPdvCaixaMovimentoFormPadrao: ErpPdvCaixaMovimentoForm = {
  tipo: "suprimento",
  valor: "",
  observacao: "",
};

const erpPdvClienteFormPadrao: ErpPdvClienteForm = {
  nome: "",
  cpfCnpj: "",
  telefone: "",
  whatsapp: "",
  email: "",
  endereco: "",
  observacoes: "",
};

const erpPdvProdutoFormPadrao: ErpPdvProdutoForm = {
  id: "",
  nome: "",
  categoriaId: "",
  codigoBarras: "",
  sku: "",
  marca: "",
  custo: "",
  precoVenda: "",
  precoAtacado: "",
  precoRevenda: "",
  precoPersonalizado: "",
  formacaoPrecoTipo: "manual",
  percentualPreco: "",
  unidade: "un",
  estoqueAtual: "",
  estoqueMinimo: "",
  localizacao: "",
  ncm: "",
  observacoes: "",
  imagemUrl: "",
  ativo: true,
};

const erpPdvMovimentacaoFormPadrao: ErpPdvMovimentacaoForm = {
  produtoId: "",
  tipo: "entrada",
  quantidade: "",
  motivo: "",
  observacao: "",
  usuarioResponsavel: "",
};

const cardapioCategoriaPadrao: CardapioCategoriaConfig = {
  id: "categoria-1",
  nome: "",
  descricao: "",
  visivel: true,
};

const cardapioProdutoPadrao: CardapioProdutoConfig = {
  id: "produto-1",
  categoriaId: "",
  nome: "",
  descricao: "",
  observacoes: "",
  preco: "",
  imagemUrl: "",
  disponivel: true,
};

const cardapioConfigPadrao: CardapioConfig = {
  categorias: [{ ...cardapioCategoriaPadrao }],
  produtos: [{ ...cardapioProdutoPadrao }],
};

const catalogoCategoriaPadrao: CatalogoCategoriaConfig = {
  id: "categoria-1",
  nome: "",
  descricao: "",
  ativo: true,
};

const catalogoProdutoPadrao: CatalogoProdutoConfig = {
  id: "produto-1",
  categoriaId: "",
  nome: "",
  descricao: "",
  preco: "",
  imagemUrl: "",
  ativo: true,
};

const catalogoConfigPadrao: CatalogoConfig = {
  categorias: [{ ...catalogoCategoriaPadrao }],
  produtos: [{ ...catalogoProdutoPadrao }],
};

const agendamentoServicoPadrao: AgendamentoServicoConfig = {
  id: "servico-1",
  nome: "",
  descricao: "",
  duracaoMinutos: "",
  valor: "",
  ativo: true,
};

const agendamentoConfigPadrao: AgendamentoConfig = {
  servicos: [{ ...agendamentoServicoPadrao }],
};

const wifiMarketingConfigPadrao: WifiMarketingConfig = {
  titulo: "",
  mensagem: "",
  imagemUrl: "",
  botaoTexto: "",
  botaoLink: "",
  ativo: false,
};

const fidelidadeConfigPadrao: FidelidadeConfig = {
  titulo: "",
  descricao: "",
  recompensa: "",
  quantidade: "",
  tipoAcumulo: "carimbos",
  ativo: false,
};

const iaTonsComunicacao: Array<{
  id: IaTomComunicacao;
  nome: string;
  descricao: string;
}> = [
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Clareza, objetividade e postura institucional.",
  },
  {
    id: "amigavel",
    nome: "Amigavel",
    descricao: "Atendimento proximo, simples e acolhedor.",
  },
  {
    id: "consultivo",
    nome: "Consultivo",
    descricao: "Foco em diagnostico, orientacao e proximos passos.",
  },
  {
    id: "descontraido",
    nome: "Descontraido",
    descricao: "Tom leve para conversas mais informais.",
  },
];

const iaContextoFontes: Array<{
  id: IaContextoFonte;
  nome: string;
  descricao: string;
}> = [
  {
    id: "dados_empresa",
    nome: "Dados da empresa",
    descricao: "Nome, categoria, descricao, contatos e identidade visual.",
  },
  {
    id: "pagina_publica",
    nome: "Pagina Publica",
    descricao: "Link publico, redes sociais, conectividade e recursos ativos.",
  },
  {
    id: "landing_page",
    nome: "Landing Page",
    descricao: "Conteudo publicado, secoes, SEO e configuracoes comerciais.",
  },
  {
    id: "cardapio_digital",
    nome: "Cardapio Digital",
    descricao: "Categorias, produtos, valores e disponibilidade.",
  },
  {
    id: "catalogo",
    nome: "Catalogo",
    descricao: "Produtos, categorias, imagens e links de orcamento.",
  },
  {
    id: "agendamento",
    nome: "Agendamento",
    descricao: "Servicos, duracao, valores e horarios configurados.",
  },
  {
    id: "fidelidade",
    nome: "Programa de Fidelidade",
    descricao: "Campanha, recompensa, regras e status.",
  },
  {
    id: "crm",
    nome: "CRM",
    descricao: "Leads, pipeline, tarefas, historico e automacoes.",
  },
];

const iaContextoFontesPadrao: Record<IaContextoFonte, boolean> = {
  dados_empresa: true,
  pagina_publica: true,
  landing_page: true,
  cardapio_digital: true,
  catalogo: true,
  agendamento: true,
  fidelidade: true,
  crm: true,
};

const iaContextoPadrao: IaContextoConfig = {
  fontes: { ...iaContextoFontesPadrao },
  ultimaAtualizacao: "",
  resumo: "",
  dados: {},
};

const iaBaseConhecimentoPadrao: IaBaseConhecimentoConfig = {
  perguntasFrequentes: [],
  politicasEmpresa: "",
  informacoesImportantes: "",
};

const iaPromptMestrePadrao: IaPromptMestreConfig = {
  conteudo: "",
  geradoEm: "",
  versao: "1.0",
};

const iaConfigPadrao: IaConfig = {
  ativa: false,
  nomeAssistente: "Assistente MikaON",
  tomComunicacao: "profissional",
  instrucoesPersonalizadas: "",
  contexto: {
    ...iaContextoPadrao,
    fontes: { ...iaContextoFontesPadrao },
  },
  baseConhecimento: {
    perguntasFrequentes: [],
    politicasEmpresa: "",
    informacoesImportantes: "",
  },
  promptMestre: {
    ...iaPromptMestrePadrao,
  },
};

const crmPipelineEtapas: Array<{
  id: CrmPipelineEtapa;
  nome: string;
  descricao: string;
}> = [
  {
    id: "novo_lead",
    nome: "Novo Lead",
    descricao: "Contatos recem-chegados ao CRM.",
  },
  {
    id: "em_atendimento",
    nome: "Em Atendimento",
    descricao: "Leads em conversa ativa.",
  },
  {
    id: "proposta",
    nome: "Proposta",
    descricao: "Oportunidades com proposta enviada.",
  },
  {
    id: "fechado",
    nome: "Fechado",
    descricao: "Clientes convertidos.",
  },
  {
    id: "perdido",
    nome: "Perdido",
    descricao: "Oportunidades encerradas.",
  },
];

const crmInteracaoOrigens: Array<{
  id: CrmInteracaoOrigem;
  nome: string;
}> = [
  { id: "manual", nome: "Anotacao manual" },
  { id: "whatsapp", nome: "WhatsApp" },
  { id: "telefone", nome: "Telefone" },
  { id: "email", nome: "E-mail" },
  { id: "reuniao", nome: "Reuniao" },
  { id: "landing_page", nome: "Landing Page" },
  { id: "catalogo", nome: "Catalogo" },
  { id: "agendamento", nome: "Agendamento" },
  { id: "fidelidade", nome: "Fidelidade" },
  { id: "sistema", nome: "Sistema" },
];

const crmTarefaPrioridades: Array<{
  id: CrmTarefaPrioridade;
  nome: string;
  classes: string;
}> = [
  {
    id: "baixa",
    nome: "Baixa",
    classes: "bg-slate-100 text-slate-700",
  },
  {
    id: "media",
    nome: "Media",
    classes: "bg-amber-100 text-amber-700",
  },
  {
    id: "alta",
    nome: "Alta",
    classes: "bg-red-100 text-red-700",
  },
];

const crmAutomacaoEventos: Array<{
  id: CrmAutomacaoEvento;
  nome: string;
  descricao: string;
}> = [
  {
    id: "novo_lead",
    nome: "Novo lead",
    descricao: "Executada quando um lead e criado no CRM.",
  },
  {
    id: "mudanca_etapa",
    nome: "Mudanca de etapa do pipeline",
    descricao: "Executada quando o lead muda de coluna.",
  },
  {
    id: "tarefa_vencida",
    nome: "Tarefa vencida",
    descricao: "Executada ao verificar tarefas pendentes vencidas.",
  },
];

const crmAutomacaoAcoes: Array<{
  id: CrmAutomacaoAcao;
  nome: string;
}> = [
  { id: "registrar_historico", nome: "Registrar no historico" },
  { id: "preparar_whatsapp", nome: "Preparar WhatsApp futuro" },
  { id: "preparar_email", nome: "Preparar e-mail futuro" },
];

const crmClientePadrao: CrmClienteConfig = {
  id: "cliente-1",
  nome: "",
  telefone: "",
  email: "",
  observacoes: "",
  tags: [],
  status: "prospect",
  etapaPipeline: "novo_lead",
  origem: "manual",
  criadoEm: "",
  atualizadoEm: "",
  movimentadoEm: "",
  interacoes: [],
  tarefas: [],
};

const crmAutomacoesPadrao: CrmAutomacaoConfig[] = [
  {
    id: "automacao-novo-lead",
    evento: "novo_lead",
    titulo: "Boas-vindas ao novo lead",
    mensagem:
      "Lead recebido no CRM. Proxima acao sugerida: iniciar atendimento.",
    acao: "registrar_historico",
    ativa: true,
  },
  {
    id: "automacao-mudanca-etapa",
    evento: "mudanca_etapa",
    titulo: "Acompanhamento de pipeline",
    mensagem: "Lead movimentado no pipeline. Revisar proximos passos.",
    acao: "registrar_historico",
    ativa: true,
  },
  {
    id: "automacao-tarefa-vencida",
    evento: "tarefa_vencida",
    titulo: "Tarefa vencida",
    mensagem:
      "Existe tarefa pendente vencida. Priorize o contato com este lead.",
    acao: "registrar_historico",
    ativa: true,
  },
];

const crmConfigPadrao: CrmConfig = {
  clientes: [{ ...crmClientePadrao }],
  automacoes: crmAutomacoesPadrao.map((automacao) => ({ ...automacao })),
};

const landingPageHeroPadrao: LandingPageHeroConfig = {
  titulo: "",
  subtitulo: "",
  botaoTexto: "",
  botaoLink: "",
  imagemDestaque: "",
};

const landingPageHeroExemplo: LandingPageHeroConfig = {
  titulo: "Transforme visitantes em clientes",
  subtitulo:
    "Uma landing page objetiva, bonita e preparada para destacar sua empresa.",
  botaoTexto: "Falar agora",
  botaoLink: "#contato",
  imagemDestaque: "",
};

const landingPageSobrePadrao: LandingPageSobreConfig = {
  titulo: "",
  texto: "",
  imagem: "",
};

const landingPageSobreExemplo: LandingPageSobreConfig = {
  titulo: "Sobre a empresa",
  texto:
    "Apresente sua historia, seus diferenciais e o motivo pelo qual clientes devem escolher sua empresa.",
  imagem: "",
};

const landingPageServicosPadrao: LandingPageServicoConfig[] = [
  {
    titulo: "",
    descricao: "",
  },
];

const landingPageServicosExemplo: LandingPageServicoConfig[] = [
  {
    titulo: "Atendimento personalizado",
    descricao: "Solucoes pensadas para a necessidade de cada cliente.",
  },
  {
    titulo: "Entrega profissional",
    descricao: "Processo organizado para garantir qualidade do inicio ao fim.",
  },
  {
    titulo: "Suporte rapido",
    descricao: "Canais simples para tirar duvidas e solicitar atendimento.",
  },
];

const landingPageGaleriaPadrao: LandingPageGaleriaImagemConfig[] = [
  {
    url: "",
    alt: "",
  },
];

const landingPageGaleriaExemplo: LandingPageGaleriaImagemConfig[] = [
  {
    url: "",
    alt: "Ambiente preparado para receber clientes",
  },
  {
    url: "",
    alt: "Produto ou servico em destaque",
  },
  {
    url: "",
    alt: "Equipe realizando um atendimento",
  },
  {
    url: "",
    alt: "Detalhe visual do trabalho entregue",
  },
];

const landingPageDepoimentosPadrao: LandingPageDepoimentoConfig[] = [
  {
    nome: "",
    cargoEmpresa: "",
    texto: "",
  },
];

const landingPageDepoimentosExemplo: LandingPageDepoimentoConfig[] = [
  {
    nome: "Ana Martins",
    cargoEmpresa: "Cliente recorrente",
    texto:
      "O atendimento foi rapido, cuidadoso e resolveu exatamente o que eu precisava.",
  },
  {
    nome: "Carlos Silva",
    cargoEmpresa: "Empresario local",
    texto:
      "A experiencia foi simples do primeiro contato ate a entrega final.",
  },
  {
    nome: "Mariana Costa",
    cargoEmpresa: "",
    texto:
      "Recomendo para quem busca qualidade, organizacao e suporte de verdade.",
  },
];

const landingPageAudiosPadrao: LandingPageAudioConfig[] = [
  {
    titulo: "",
    descricao: "",
    arquivoUrl: "",
    visivel: true,
  },
];

const landingPageVideosPadrao: LandingPageVideoConfig[] = [
  {
    titulo: "",
    descricao: "",
    url: "",
    visivel: true,
  },
];

const landingPageProdutosDigitaisPadrao: LandingPageProdutoDigitalConfig[] = [
  {
    titulo: "",
    descricao: "",
    preco: "",
    imagemUrl: "",
    linkCompra: "",
    categoria: "",
    visivel: true,
  },
];

const landingPageCategoriasProdutosDigitaisPadrao: string[] = [];

const landingPageContatoPadrao: LandingPageContatoConfig = {
  telefone: "",
  whatsapp: "",
  email: "",
  endereco: "",
};

const landingPageFormularioCampos: Array<{
  id: LandingPageFormularioCampoId;
  label: string;
}> = [
  { id: "nome", label: "Nome" },
  { id: "telefone", label: "Telefone" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "E-mail" },
  { id: "mensagem", label: "Mensagem" },
];

const landingPageFormularioContatoPadrao: LandingPageFormularioContatoConfig = {
  nome: { ativo: true, obrigatorio: true },
  telefone: { ativo: true, obrigatorio: false },
  whatsapp: { ativo: false, obrigatorio: false },
  email: { ativo: true, obrigatorio: true },
  mensagem: { ativo: true, obrigatorio: true },
};

const landingPageCtaPadrao: LandingPageCtaConfig = {
  titulo: "",
  texto: "",
  botaoTexto: "",
  botaoLink: "",
};

const landingPageCtaExemplo: LandingPageCtaConfig = {
  titulo: "Pronto para comecar?",
  texto:
    "Fale com a nossa equipe e descubra como podemos ajudar sua empresa hoje.",
  botaoTexto: "Solicitar atendimento",
  botaoLink: "#contato",
};

const landingPageSeoPadrao: LandingPageSeoConfig = {
  titulo: "",
  descricao: "",
  palavrasChave: "",
  imagemCompartilhamento: "",
};

const landingPageBlocosExtras: LandingPageBlocoExtraConfig[] = [
  {
    id: "audios",
    nome: "Audios",
    segmento: "Musica, aulas e conteudo sonoro",
    descricao:
      "Espaco preparado para destacar demonstracoes, aulas, previews ou materiais em audio dentro da Landing Page.",
    recursoFuturo: "landing_page_audios",
  },
  {
    id: "produtos_digitais_partituras",
    nome: "Produtos digitais / Partituras",
    segmento: "Produtos digitais e materiais musicais",
    descricao:
      "Base reservada para catalogo de partituras, PDFs, apostilas e outros produtos digitais por segmento.",
    recursoFuturo: "landing_page_produtos_digitais",
  },
];

const landingPageOrdemSecoesPadrao: LandingPageSecaoConteudoId[] = [
  "hero",
  "sobre",
  "servicos",
  "galeria",
  "depoimentos",
  "videos",
  "audios",
  "produtosDigitais",
  "contato",
  "cta",
];

const landingPageSecoesOrdenaveis: Array<{
  id: LandingPageSecaoConteudoId;
  nome: string;
}> = [
  { id: "hero", nome: "Hero" },
  { id: "sobre", nome: "Sobre" },
  { id: "servicos", nome: "Servicos" },
  { id: "galeria", nome: "Galeria" },
  { id: "depoimentos", nome: "Depoimentos" },
  { id: "videos", nome: "Videos" },
  { id: "audios", nome: "Audios" },
  { id: "produtosDigitais", nome: "Produtos Digitais" },
  { id: "contato", nome: "Contato" },
  { id: "cta", nome: "CTA" },
];

const landingPageVisibilidadeSecoesPadrao: Record<
  LandingPageSecaoConteudoId,
  boolean
> = {
  hero: true,
  sobre: true,
  servicos: true,
  galeria: true,
  depoimentos: true,
  videos: true,
  audios: true,
  produtosDigitais: true,
  contato: true,
  cta: true,
};

const landingPageTemplates: LandingPageTemplateConfig[] = [
  {
    id: "auto-center",
    nome: "Auto Center",
    segmento: "Automotivo",
    descricao: "Ideal para oficinas, auto centers, borracharias e mecanicas.",
    hero: {
      titulo: "Cuide do seu carro com quem entende",
      subtitulo:
        "Servicos automotivos com atendimento rapido, diagnostico claro e compromisso com a seguranca do seu veiculo.",
      botaoTexto: "Agendar atendimento",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Especialistas em manutencao automotiva",
      texto:
        "Atendemos motoristas que buscam confianca, transparencia e qualidade em cada etapa do servico, da avaliacao inicial ate a entrega do veiculo.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Revisao preventiva",
        descricao:
          "Checklist completo para identificar problemas antes que eles virem prejuizo.",
      },
      {
        titulo: "Freios e suspensao",
        descricao:
          "Manutencao essencial para conforto, estabilidade e seguranca na direcao.",
      },
      {
        titulo: "Troca de oleo e filtros",
        descricao:
          "Servicos rapidos com orientacao sobre o melhor cuidado para o motor.",
      },
    ],
    cta: {
      titulo: "Seu carro merece atencao hoje",
      texto:
        "Fale com a equipe e agende uma avaliacao para manter seu veiculo em dia.",
      botaoTexto: "Chamar no WhatsApp",
      botaoLink: "#contato",
    },
  },
  {
    id: "restaurante",
    nome: "Restaurante",
    segmento: "Alimentacao",
    descricao: "Pensado para restaurantes, lanchonetes, pizzarias e bares.",
    hero: {
      titulo: "Sabor que transforma qualquer momento",
      subtitulo:
        "Pratos preparados com cuidado, ingredientes selecionados e atendimento acolhedor para voce aproveitar sem pressa.",
      botaoTexto: "Ver atendimento",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Uma experiencia feita para receber bem",
      texto:
        "Unimos sabor, ambiente agradavel e uma equipe atenta para entregar uma experiencia simples, gostosa e memoravel.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Almoco e jantar",
        descricao:
          "Opcoes para diferentes momentos do dia, sempre com preparo cuidadoso.",
      },
      {
        titulo: "Pedidos e reservas",
        descricao:
          "Canais simples para pedir, reservar mesa ou tirar duvidas antes de vir.",
      },
      {
        titulo: "Eventos e grupos",
        descricao:
          "Atendimento preparado para encontros, comemoracoes e momentos especiais.",
      },
    ],
    cta: {
      titulo: "Bateu a vontade?",
      texto:
        "Entre em contato e descubra a melhor opcao para seu pedido ou reserva.",
      botaoTexto: "Falar com o restaurante",
      botaoLink: "#contato",
    },
  },
  {
    id: "clinica",
    nome: "Clinica",
    segmento: "Saude e bem-estar",
    descricao: "Base para clinicas, consultorios, dentistas e profissionais de saude.",
    hero: {
      titulo: "Cuidado profissional para sua saude",
      subtitulo:
        "Atendimento humanizado, estrutura organizada e orientacao clara para cada etapa do seu cuidado.",
      botaoTexto: "Agendar consulta",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Atendimento com proximidade e responsabilidade",
      texto:
        "A clinica foi preparada para receber cada paciente com atencao, respeito e foco em uma experiencia tranquila do agendamento ao retorno.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Consultas especializadas",
        descricao:
          "Avaliacoes feitas com escuta ativa, orientacao clara e plano de cuidado.",
      },
      {
        titulo: "Acompanhamento",
        descricao:
          "Suporte para acompanhar evolucao, retornos e proximos passos do tratamento.",
      },
      {
        titulo: "Atendimento preventivo",
        descricao:
          "Cuidados pensados para prevencao, bem-estar e qualidade de vida.",
      },
    ],
    cta: {
      titulo: "Agende seu atendimento",
      texto:
        "Fale com a equipe e encontre o melhor horario para cuidar da sua saude.",
      botaoTexto: "Marcar consulta",
      botaoLink: "#contato",
    },
  },
  {
    id: "barbearia",
    nome: "Barbearia",
    segmento: "Beleza masculina",
    descricao: "Template para barbearias, saloes masculinos e studios de beleza.",
    hero: {
      titulo: "Visual alinhado, atendimento de respeito",
      subtitulo:
        "Cortes, barba e cuidados masculinos em um ambiente confortavel, com profissionais atentos ao seu estilo.",
      botaoTexto: "Reservar horario",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Mais que corte, uma experiencia",
      texto:
        "A barbearia combina tecnica, conversa boa e um atendimento pontual para deixar cada cliente pronto para a rotina ou para uma ocasiao especial.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Corte masculino",
        descricao:
          "Do classico ao moderno, com acabamento pensado para o seu formato e estilo.",
      },
      {
        titulo: "Barba completa",
        descricao:
          "Modelagem, alinhamento e acabamento para valorizar o rosto.",
      },
      {
        titulo: "Pacotes de cuidado",
        descricao:
          "Combinacoes de corte, barba e tratamentos para manter o visual em dia.",
      },
    ],
    cta: {
      titulo: "Seu proximo horario esta aqui",
      texto:
        "Chame a equipe e reserve o melhor momento para renovar o visual.",
      botaoTexto: "Agendar agora",
      botaoLink: "#contato",
    },
  },
  {
    id: "pet-shop",
    nome: "Pet Shop",
    segmento: "Pets",
    descricao: "Feito para pet shops, banho e tosa, clinicas e servicos para pets.",
    hero: {
      titulo: "Cuidado carinhoso para seu pet",
      subtitulo:
        "Servicos pensados para bem-estar, higiene e conforto, com atendimento cuidadoso para cada bichinho.",
      botaoTexto: "Agendar para meu pet",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Seu pet tratado com carinho e seguranca",
      texto:
        "Nossa rotina valoriza atencao individual, ambiente limpo e comunicacao simples para que tutores fiquem tranquilos.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Banho e tosa",
        descricao:
          "Higiene, cuidado com pelagem e acabamento de acordo com cada pet.",
      },
      {
        titulo: "Produtos para pets",
        descricao:
          "Itens selecionados para alimentacao, conforto, diversao e cuidado diario.",
      },
      {
        titulo: "Atendimento personalizado",
        descricao:
          "Orientacao para escolher o melhor cuidado conforme porte, idade e rotina.",
      },
    ],
    cta: {
      titulo: "Seu pet merece esse cuidado",
      texto:
        "Fale com a equipe e confira horarios, servicos e opcoes disponiveis.",
      botaoTexto: "Chamar atendimento",
      botaoLink: "#contato",
    },
  },
  {
    id: "loja",
    nome: "Loja",
    segmento: "Varejo",
    descricao: "Base para lojas fisicas, boutiques, mercados e comercios locais.",
    hero: {
      titulo: "Encontre o que precisa com facilidade",
      subtitulo:
        "Produtos selecionados, atendimento proximo e uma experiencia de compra simples do primeiro contato ate a entrega.",
      botaoTexto: "Falar com a loja",
      botaoLink: "#contato",
      imagemDestaque: "",
    },
    sobre: {
      titulo: "Uma loja feita para atender bem",
      texto:
        "Trabalhamos para oferecer boas escolhas, informacao clara e suporte para que cada cliente compre com confianca.",
      imagem: "",
    },
    servicos: [
      {
        titulo: "Produtos selecionados",
        descricao:
          "Curadoria de itens para facilitar sua decisao e valorizar sua rotina.",
      },
      {
        titulo: "Atendimento consultivo",
        descricao:
          "Ajuda para escolher a opcao ideal de acordo com sua necessidade.",
      },
      {
        titulo: "Compra simples",
        descricao:
          "Canais praticos para tirar duvidas, consultar disponibilidade e combinar entrega.",
      },
    ],
    cta: {
      titulo: "Vamos ajudar na sua escolha",
      texto:
        "Entre em contato e veja as melhores opcoes disponiveis para voce.",
      botaoTexto: "Consultar produtos",
      botaoLink: "#contato",
    },
  },
];

function criarLandingPageConfigPadrao(): LandingPageConfig {
  const rascunhoPadrao: LandingPagePublicavelConfig = {
    publicada: false,
    hero: { ...landingPageHeroPadrao },
    sobre: { ...landingPageSobrePadrao },
    servicos: landingPageServicosPadrao.map((servico) => ({ ...servico })),
    galeria: landingPageGaleriaPadrao.map((imagem) => ({ ...imagem })),
    depoimentos: landingPageDepoimentosPadrao.map((depoimento) => ({
      ...depoimento,
    })),
    videos: landingPageVideosPadrao.map((video) => ({ ...video })),
    audios: landingPageAudiosPadrao.map((audio) => ({ ...audio })),
    produtosDigitais: landingPageProdutosDigitaisPadrao.map((produto) => ({
      ...produto,
    })),
    categoriasProdutosDigitais: [...landingPageCategoriasProdutosDigitaisPadrao],
    contato: { ...landingPageContatoPadrao },
    formularioContato: structuredClone(landingPageFormularioContatoPadrao),
    cta: { ...landingPageCtaPadrao },
    seo: { ...landingPageSeoPadrao },
    ordemSecoes: [...landingPageOrdemSecoesPadrao],
    visibilidadeSecoes: { ...landingPageVisibilidadeSecoesPadrao },
  };

  return {
    ...rascunhoPadrao,
    versaoPublicada: { ...rascunhoPadrao },
    alteracoesNaoPublicadas: false,
    historicoVersoes: [],
  };
}

function lerCampoTexto(objeto: Record<string, unknown>, campo: string) {
  const valor = objeto[campo];

  return typeof valor === "string" ? valor : "";
}

function lerCampoBooleano(objeto: Record<string, unknown>, campo: string) {
  const valor = objeto[campo];

  return typeof valor === "boolean" ? valor : false;
}

function criarCardapioId(prefixo: string, indice: number) {
  return `${prefixo}-${indice + 1}`;
}

function normalizarCardapioConfig(valor: unknown): CardapioConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(cardapioConfigPadrao);
  }

  const config = valor as Record<string, unknown>;
  const categorias = Array.isArray(config.categorias)
    ? config.categorias.slice(0, 30).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...cardapioCategoriaPadrao,
            id: criarCardapioId("categoria", indice),
          };
        }

        const categoria = item as Record<string, unknown>;

        return {
          id:
            lerCampoTexto(categoria, "id") ||
            criarCardapioId("categoria", indice),
          nome: lerCampoTexto(categoria, "nome"),
          descricao: lerCampoTexto(categoria, "descricao"),
          visivel:
            typeof categoria.visivel === "boolean"
              ? categoria.visivel
              : true,
        };
      })
    : cardapioConfigPadrao.categorias.map((categoria) => ({ ...categoria }));
  const categoriaIds = new Set(categorias.map((categoria) => categoria.id));
  const produtos = Array.isArray(config.produtos)
    ? config.produtos.slice(0, 100).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...cardapioProdutoPadrao,
            id: criarCardapioId("produto", indice),
          };
        }

        const produto = item as Record<string, unknown>;
        const categoriaId = lerCampoTexto(produto, "categoriaId");

        return {
          id:
            lerCampoTexto(produto, "id") ||
            criarCardapioId("produto", indice),
          categoriaId: categoriaIds.has(categoriaId) ? categoriaId : "",
          nome: lerCampoTexto(produto, "nome"),
          descricao: lerCampoTexto(produto, "descricao"),
          observacoes: lerCampoTexto(produto, "observacoes"),
          preco: lerCampoTexto(produto, "preco"),
          imagemUrl: lerCampoTexto(produto, "imagemUrl"),
          disponivel:
            typeof produto.disponivel === "boolean"
              ? produto.disponivel
              : true,
        };
      })
    : cardapioConfigPadrao.produtos.map((produto) => ({ ...produto }));

  return {
    categorias:
      categorias.length > 0
        ? categorias
        : cardapioConfigPadrao.categorias.map((categoria) => ({ ...categoria })),
    produtos:
      produtos.length > 0
        ? produtos
        : cardapioConfigPadrao.produtos.map((produto) => ({ ...produto })),
  };
}

function normalizarCatalogoConfig(valor: unknown): CatalogoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(catalogoConfigPadrao);
  }

  const config = valor as Record<string, unknown>;
  const categorias = Array.isArray(config.categorias)
    ? config.categorias.slice(0, 30).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...catalogoCategoriaPadrao,
            id: criarCardapioId("categoria", indice),
          };
        }

        const categoria = item as Record<string, unknown>;

        return {
          id:
            lerCampoTexto(categoria, "id") ||
            criarCardapioId("categoria", indice),
          nome: lerCampoTexto(categoria, "nome"),
          descricao: lerCampoTexto(categoria, "descricao"),
          ativo:
            typeof categoria.ativo === "boolean" ? categoria.ativo : true,
        };
      })
    : catalogoConfigPadrao.categorias.map((categoria) => ({ ...categoria }));
  const categoriaIds = new Set(categorias.map((categoria) => categoria.id));
  const produtos = Array.isArray(config.produtos)
    ? config.produtos.slice(0, 100).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...catalogoProdutoPadrao,
            id: criarCardapioId("produto", indice),
          };
        }

        const produto = item as Record<string, unknown>;
        const categoriaId = lerCampoTexto(produto, "categoriaId");

        return {
          id:
            lerCampoTexto(produto, "id") ||
            criarCardapioId("produto", indice),
          categoriaId: categoriaIds.has(categoriaId) ? categoriaId : "",
          nome: lerCampoTexto(produto, "nome"),
          descricao: lerCampoTexto(produto, "descricao"),
          preco: lerCampoTexto(produto, "preco"),
          imagemUrl: lerCampoTexto(produto, "imagemUrl"),
          ativo: typeof produto.ativo === "boolean" ? produto.ativo : true,
        };
      })
    : catalogoConfigPadrao.produtos.map((produto) => ({ ...produto }));

  return {
    categorias:
      categorias.length > 0
        ? categorias
        : catalogoConfigPadrao.categorias.map((categoria) => ({ ...categoria })),
    produtos:
      produtos.length > 0
        ? produtos
        : catalogoConfigPadrao.produtos.map((produto) => ({ ...produto })),
  };
}

function normalizarAgendamentoConfig(valor: unknown): AgendamentoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(agendamentoConfigPadrao);
  }

  const config = valor as Record<string, unknown>;
  const servicos = Array.isArray(config.servicos)
    ? config.servicos.slice(0, 100).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...agendamentoServicoPadrao,
            id: criarCardapioId("servico", indice),
          };
        }

        const servico = item as Record<string, unknown>;

        return {
          id:
            lerCampoTexto(servico, "id") ||
            criarCardapioId("servico", indice),
          nome: lerCampoTexto(servico, "nome"),
          descricao: lerCampoTexto(servico, "descricao"),
          duracaoMinutos:
            lerCampoTexto(servico, "duracaoMinutos") ||
            lerCampoTexto(servico, "duracao"),
          valor: lerCampoTexto(servico, "valor"),
          ativo: typeof servico.ativo === "boolean" ? servico.ativo : true,
        };
      })
    : agendamentoConfigPadrao.servicos.map((servico) => ({ ...servico }));

  return {
    servicos:
      servicos.length > 0
        ? servicos
        : agendamentoConfigPadrao.servicos.map((servico) => ({ ...servico })),
  };
}

function normalizarWifiMarketingConfig(valor: unknown): WifiMarketingConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...wifiMarketingConfigPadrao };
  }

  const config = valor as Record<string, unknown>;

  return {
    titulo: lerCampoTexto(config, "titulo"),
    mensagem: lerCampoTexto(config, "mensagem"),
    imagemUrl: lerCampoTexto(config, "imagemUrl"),
    botaoTexto: lerCampoTexto(config, "botaoTexto"),
    botaoLink: lerCampoTexto(config, "botaoLink"),
    ativo: typeof config.ativo === "boolean" ? config.ativo : false,
  };
}

function normalizarFidelidadeConfig(valor: unknown): FidelidadeConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...fidelidadeConfigPadrao };
  }

  const config = valor as Record<string, unknown>;
  const tipoAcumulo = lerCampoTexto(config, "tipoAcumulo");

  return {
    titulo: lerCampoTexto(config, "titulo"),
    descricao: lerCampoTexto(config, "descricao"),
    recompensa: lerCampoTexto(config, "recompensa"),
    quantidade:
      lerCampoTexto(config, "quantidade") ||
      lerCampoTexto(config, "quantidadePontos") ||
      lerCampoTexto(config, "quantidadeCarimbos"),
    tipoAcumulo: tipoAcumulo === "pontos" ? "pontos" : "carimbos",
    ativo: typeof config.ativo === "boolean" ? config.ativo : false,
  };
}

function normalizarIaTomComunicacao(valor: unknown): IaTomComunicacao {
  return iaTonsComunicacao.some((tom) => tom.id === valor)
    ? (valor as IaTomComunicacao)
    : "profissional";
}

function normalizarIaContextoFontes(valor: unknown) {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...iaContextoFontesPadrao };
  }

  const fontes = valor as Partial<Record<IaContextoFonte, unknown>>;

  return iaContextoFontes.reduce<Record<IaContextoFonte, boolean>>(
    (fontesNormalizadas, fonte) => ({
      ...fontesNormalizadas,
      [fonte.id]:
        typeof fontes[fonte.id] === "boolean"
          ? Boolean(fontes[fonte.id])
          : iaContextoFontesPadrao[fonte.id],
    }),
    { ...iaContextoFontesPadrao }
  );
}

function normalizarIaContexto(valor: unknown): IaContextoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return {
      ...iaContextoPadrao,
      fontes: { ...iaContextoFontesPadrao },
    };
  }

  const contexto = valor as Record<string, unknown>;
  const dados =
    contexto.dados && typeof contexto.dados === "object" && !Array.isArray(contexto.dados)
      ? (contexto.dados as Record<string, unknown>)
      : {};

  return {
    fontes: normalizarIaContextoFontes(contexto.fontes),
    ultimaAtualizacao: lerCampoTexto(contexto, "ultimaAtualizacao"),
    resumo: lerCampoTexto(contexto, "resumo"),
    dados,
  };
}

function normalizarIaPerguntasFrequentes(
  valor: unknown
): IaPerguntaFrequenteConfig[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor
    .map((item, indice) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const perguntaFrequente = item as Record<string, unknown>;
      const pergunta =
        lerCampoTexto(perguntaFrequente, "pergunta") ||
        lerCampoTexto(perguntaFrequente, "titulo");
      const resposta =
        lerCampoTexto(perguntaFrequente, "resposta") ||
        lerCampoTexto(perguntaFrequente, "texto");

      if (!pergunta && !resposta) {
        return null;
      }

      return {
        id:
          lerCampoTexto(perguntaFrequente, "id") ||
          `faq-${Date.now()}-${indice}`,
        pergunta,
        resposta,
      };
    })
    .filter(
      (perguntaFrequente): perguntaFrequente is IaPerguntaFrequenteConfig =>
        Boolean(perguntaFrequente)
    )
    .slice(0, 50);
}

function normalizarIaBaseConhecimento(valor: unknown): IaBaseConhecimentoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...iaBaseConhecimentoPadrao };
  }

  const baseConhecimento = valor as Record<string, unknown>;

  return {
    perguntasFrequentes: normalizarIaPerguntasFrequentes(
      baseConhecimento.perguntasFrequentes ||
        baseConhecimento.perguntas_frequentes ||
        baseConhecimento.faqs
    ),
    politicasEmpresa:
      lerCampoTexto(baseConhecimento, "politicasEmpresa") ||
      lerCampoTexto(baseConhecimento, "politicas_empresa") ||
      lerCampoTexto(baseConhecimento, "politicas"),
    informacoesImportantes:
      lerCampoTexto(baseConhecimento, "informacoesImportantes") ||
      lerCampoTexto(baseConhecimento, "informacoes_importantes") ||
      lerCampoTexto(baseConhecimento, "informacoes"),
  };
}

function normalizarIaPromptMestre(valor: unknown): IaPromptMestreConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...iaPromptMestrePadrao };
  }

  const promptMestre = valor as Record<string, unknown>;

  return {
    conteudo:
      lerCampoTexto(promptMestre, "conteudo") ||
      lerCampoTexto(promptMestre, "prompt") ||
      lerCampoTexto(promptMestre, "texto"),
    geradoEm:
      lerCampoTexto(promptMestre, "geradoEm") ||
      lerCampoTexto(promptMestre, "gerado_em") ||
      lerCampoTexto(promptMestre, "atualizadoEm"),
    versao:
      lerCampoTexto(promptMestre, "versao") || iaPromptMestrePadrao.versao,
  };
}

function normalizarIaConfig(valor: unknown): IaConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return {
      ...iaConfigPadrao,
      contexto: {
        ...iaConfigPadrao.contexto,
        fontes: { ...iaConfigPadrao.contexto.fontes },
      },
      baseConhecimento: {
        ...iaConfigPadrao.baseConhecimento,
        perguntasFrequentes: [
          ...iaConfigPadrao.baseConhecimento.perguntasFrequentes,
        ],
      },
      promptMestre: {
        ...iaConfigPadrao.promptMestre,
      },
    };
  }

  const config = valor as Record<string, unknown>;

  return {
    ativa: typeof config.ativa === "boolean" ? config.ativa : false,
    nomeAssistente:
      lerCampoTexto(config, "nomeAssistente") ||
      lerCampoTexto(config, "nome_assistente") ||
      iaConfigPadrao.nomeAssistente,
    tomComunicacao: normalizarIaTomComunicacao(
      config.tomComunicacao || config.tom_comunicacao
    ),
    instrucoesPersonalizadas:
      lerCampoTexto(config, "instrucoesPersonalizadas") ||
      lerCampoTexto(config, "instrucoes_personalizadas"),
    contexto: normalizarIaContexto(config.contexto),
    baseConhecimento: normalizarIaBaseConhecimento(
      config.baseConhecimento || config.base_conhecimento
    ),
    promptMestre: normalizarIaPromptMestre(
      config.promptMestre || config.prompt_mestre
    ),
  };
}

function normalizarTagsCrm(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor
      .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
      .filter(Boolean)
      .slice(0, 20);
  }

  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  return [];
}

function normalizarCrmStatus(valor: unknown): CrmClienteStatus {
  return valor === "ativo" || valor === "inativo" ? valor : "prospect";
}

function normalizarCrmPipelineEtapa(valor: unknown): CrmPipelineEtapa {
  return crmPipelineEtapas.some((etapa) => etapa.id === valor)
    ? (valor as CrmPipelineEtapa)
    : "novo_lead";
}

function normalizarCrmInteracaoOrigem(valor: unknown): CrmInteracaoOrigem {
  return crmInteracaoOrigens.some((origem) => origem.id === valor)
    ? (valor as CrmInteracaoOrigem)
    : "manual";
}

function normalizarCrmInteracoes(valor: unknown): CrmInteracaoConfig[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .slice(0, 100)
    .map((item, indice) => {
      const interacao =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};

      return {
        id:
          lerCampoTexto(interacao, "id") ||
          criarCardapioId("interacao", indice),
        texto:
          lerCampoTexto(interacao, "texto") ||
          lerCampoTexto(interacao, "anotacao") ||
          lerCampoTexto(interacao, "descricao"),
        origem: normalizarCrmInteracaoOrigem(interacao.origem),
        dataHora:
          lerCampoTexto(interacao, "dataHora") ||
          lerCampoTexto(interacao, "criadoEm"),
      };
    })
    .filter((interacao) => interacao.texto)
    .sort((a, b) => {
      const dataA = new Date(a.dataHora).getTime();
      const dataB = new Date(b.dataHora).getTime();

      return (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
    });
}

function normalizarCrmTarefaPrioridade(valor: unknown): CrmTarefaPrioridade {
  return valor === "media" || valor === "alta" ? valor : "baixa";
}

function normalizarCrmTarefaStatus(valor: unknown): CrmTarefaStatus {
  return valor === "concluida" ? "concluida" : "pendente";
}

function ordenarCrmTarefas(tarefas: CrmTarefaConfig[]) {
  return [...tarefas].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pendente" ? -1 : 1;

    const dataA = new Date(a.vencimento).getTime();
    const dataB = new Date(b.vencimento).getTime();

    return (Number.isNaN(dataA) ? 0 : dataA) - (Number.isNaN(dataB) ? 0 : dataB);
  });
}

function normalizarCrmTarefas(valor: unknown): CrmTarefaConfig[] {
  if (!Array.isArray(valor)) return [];

  return ordenarCrmTarefas(
    valor
      .slice(0, 100)
      .map((item, indice) => {
        const tarefa =
          item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};

        return {
          id:
            lerCampoTexto(tarefa, "id") ||
            criarCardapioId("tarefa", indice),
          titulo:
            lerCampoTexto(tarefa, "titulo") ||
            lerCampoTexto(tarefa, "nome"),
          descricao: lerCampoTexto(tarefa, "descricao"),
          vencimento:
            lerCampoTexto(tarefa, "vencimento") ||
            lerCampoTexto(tarefa, "dataVencimento"),
          prioridade: normalizarCrmTarefaPrioridade(tarefa.prioridade),
          status: normalizarCrmTarefaStatus(tarefa.status),
          criadoEm: lerCampoTexto(tarefa, "criadoEm"),
          concluidoEm: lerCampoTexto(tarefa, "concluidoEm"),
        };
      })
      .filter((tarefa) => tarefa.titulo)
  );
}

function normalizarCrmAutomacaoEvento(valor: unknown): CrmAutomacaoEvento {
  return valor === "mudanca_etapa" || valor === "tarefa_vencida"
    ? valor
    : "novo_lead";
}

function normalizarCrmAutomacaoAcao(valor: unknown): CrmAutomacaoAcao {
  return valor === "preparar_whatsapp" || valor === "preparar_email"
    ? valor
    : "registrar_historico";
}

function normalizarCrmAutomacoes(valor: unknown): CrmAutomacaoConfig[] {
  if (!Array.isArray(valor)) {
    return crmAutomacoesPadrao.map((automacao) => ({ ...automacao }));
  }

  const automacoes = valor
    .slice(0, 20)
    .map((item, indice) => {
      const automacao =
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {};
      const evento = normalizarCrmAutomacaoEvento(automacao.evento);
      const automacaoPadrao = crmAutomacoesPadrao.find(
        (padrao) => padrao.evento === evento
      );

      return {
        id:
          lerCampoTexto(automacao, "id") ||
          criarCardapioId("automacao", indice),
        evento,
        titulo:
          lerCampoTexto(automacao, "titulo") ||
          automacaoPadrao?.titulo ||
          "Automacao CRM",
        mensagem:
          lerCampoTexto(automacao, "mensagem") ||
          automacaoPadrao?.mensagem ||
          "Automacao registrada no CRM.",
        acao: normalizarCrmAutomacaoAcao(automacao.acao),
        ativa:
          typeof automacao.ativa === "boolean"
            ? automacao.ativa
            : automacaoPadrao?.ativa ?? true,
      };
    })
    .filter((automacao) => automacao.titulo);

  return crmAutomacaoEventos.map((evento) => {
    const automacaoSalva = automacoes.find(
      (automacao) => automacao.evento === evento.id
    );
    const automacaoPadrao =
      crmAutomacoesPadrao.find((automacao) => automacao.evento === evento.id) ||
      crmAutomacoesPadrao[0];

    return automacaoSalva || { ...automacaoPadrao };
  });
}

function obterCrmPipelineEtapaNome(etapaId: CrmPipelineEtapa) {
  return (
    crmPipelineEtapas.find((etapa) => etapa.id === etapaId)?.nome ||
    "Novo Lead"
  );
}

function obterCrmInteracaoOrigemNome(origemId: CrmInteracaoOrigem) {
  return (
    crmInteracaoOrigens.find((origem) => origem.id === origemId)?.nome ||
    "Anotacao manual"
  );
}

function obterCrmTarefaPrioridade(prioridadeId: CrmTarefaPrioridade) {
  return (
    crmTarefaPrioridades.find((prioridade) => prioridade.id === prioridadeId) ||
    crmTarefaPrioridades[0]
  );
}

function obterCrmAutomacaoEvento(eventoId: CrmAutomacaoEvento) {
  return (
    crmAutomacaoEventos.find((evento) => evento.id === eventoId) ||
    crmAutomacaoEventos[0]
  );
}

function obterCrmAutomacaoAcao(acaoId: CrmAutomacaoAcao) {
  return (
    crmAutomacaoAcoes.find((acao) => acao.id === acaoId) ||
    crmAutomacaoAcoes[0]
  );
}

function formatarDataMovimentacaoCrm(valor?: string) {
  if (!valor) return "Sem movimentacao registrada";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "Data nao informada";

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatarDataVencimentoCrm(valor?: string) {
  if (!valor) return "Sem vencimento";

  const data = new Date(`${valor}T00:00:00`);

  if (Number.isNaN(data.getTime())) return "Data nao informada";

  return data.toLocaleDateString("pt-BR");
}

function normalizarCrmConfig(valor: unknown): CrmConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return {
      clientes: crmConfigPadrao.clientes.map((cliente) => ({ ...cliente })),
      automacoes: crmConfigPadrao.automacoes.map((automacao) => ({
        ...automacao,
      })),
    };
  }

  const config = valor as Record<string, unknown>;
  const clientes = Array.isArray(config.clientes)
    ? config.clientes.slice(0, 500).map((item, indice) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          return {
            ...crmClientePadrao,
            id: criarCardapioId("cliente", indice),
          };
        }

        const cliente = item as Record<string, unknown>;

        return {
          id:
            lerCampoTexto(cliente, "id") ||
            criarCardapioId("cliente", indice),
          nome: lerCampoTexto(cliente, "nome"),
          telefone: lerCampoTexto(cliente, "telefone"),
          email: lerCampoTexto(cliente, "email"),
          observacoes: lerCampoTexto(cliente, "observacoes"),
          tags: normalizarTagsCrm(cliente.tags),
          status: normalizarCrmStatus(cliente.status),
          etapaPipeline: normalizarCrmPipelineEtapa(
            cliente.etapaPipeline || cliente.pipeline
          ),
          origem: lerCampoTexto(cliente, "origem") || "manual",
          criadoEm: lerCampoTexto(cliente, "criadoEm"),
          atualizadoEm: lerCampoTexto(cliente, "atualizadoEm"),
          movimentadoEm: lerCampoTexto(cliente, "movimentadoEm"),
          interacoes: normalizarCrmInteracoes(cliente.interacoes),
          tarefas: normalizarCrmTarefas(cliente.tarefas),
        };
      })
    : crmConfigPadrao.clientes.map((cliente) => ({ ...cliente }));

  return {
    clientes:
      clientes.length > 0
        ? clientes
        : crmConfigPadrao.clientes.map((cliente) => ({ ...cliente })),
    automacoes: normalizarCrmAutomacoes(config.automacoes),
  };
}

function normalizarErpPdvConfig(valor: unknown): ErpPdvImpressaoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...erpPdvImpressaoConfigPadrao };
  }

  const config = valor as Partial<ErpPdvImpressaoConfig>;
  const modosValidos: ErpPdvModoImpressao[] = [
    "direta",
    "navegador",
    "pdf",
    "whatsapp",
  ];
  const perfisValidos: ErpPdvPerfilImpressao[] = [
    "escpos_generico",
    "impressora_sistema",
    "navegador",
  ];
  const largurasValidas: ErpPdvCupomLayout[] = ["58mm", "80mm", "a4"];
  const numeroVias = Number(config.numeroVias || 1);

  return {
    modo: modosValidos.includes(config.modo as ErpPdvModoImpressao)
      ? (config.modo as ErpPdvModoImpressao)
      : erpPdvImpressaoConfigPadrao.modo,
    nomeImpressora: String(config.nomeImpressora || ""),
    marca: String(config.marca || ""),
    modelo: String(config.modelo || ""),
    largura: largurasValidas.includes(config.largura as ErpPdvCupomLayout)
      ? (config.largura as ErpPdvCupomLayout)
      : erpPdvImpressaoConfigPadrao.largura,
    impressaoAutomatica: Boolean(config.impressaoAutomatica),
    numeroVias:
      Number.isFinite(numeroVias) && numeroVias > 0
        ? Math.min(Math.round(numeroVias), 5)
        : erpPdvImpressaoConfigPadrao.numeroVias,
    perfil: perfisValidos.includes(config.perfil as ErpPdvPerfilImpressao)
      ? (config.perfil as ErpPdvPerfilImpressao)
      : erpPdvImpressaoConfigPadrao.perfil,
    conectorLocalPreparado: true,
  };
}

function normalizarObjetoLanding<T extends Record<string, string>>(
  valor: unknown,
  padrao: T,
  campos: Array<keyof T>
): T {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...padrao };
  }

  const objeto = valor as Record<string, unknown>;

  return campos.reduce<T>(
    (config, campo) => ({
      ...config,
      [campo]: lerCampoTexto(objeto, String(campo)),
    }),
    { ...padrao }
  );
}

function normalizarListaLanding<T extends Record<string, string>>(
  valor: unknown,
  padrao: T[],
  campos: Array<keyof T>,
  limite = 6
): T[] {
  if (!Array.isArray(valor)) {
    return padrao.map((item) => ({ ...item }));
  }

  const itens = valor
    .slice(0, limite)
    .map((item) => normalizarObjetoLanding(item, padrao[0], campos));

  return itens.length > 0 ? itens : padrao.map((item) => ({ ...item }));
}

function criarYouTubeEmbedUrl(url: string) {
  const urlLimpa = url.trim();

  if (!urlLimpa) return "";

  try {
    const urlYoutube = new URL(urlLimpa);
    const host = urlYoutube.hostname.replace(/^www\./, "").toLowerCase();
    const isYoutube =
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be";

    if (!isYoutube) return "";

    const playlist = urlYoutube.searchParams.get("list") || "";

    if (urlYoutube.pathname === "/playlist" && playlist) {
      return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
        playlist
      )}`;
    }

    let videoId = "";

    if (host === "youtu.be") {
      videoId = urlYoutube.pathname.split("/").filter(Boolean)[0] || "";
    } else if (urlYoutube.pathname === "/watch") {
      videoId = urlYoutube.searchParams.get("v") || "";
    } else if (urlYoutube.pathname.startsWith("/embed/")) {
      videoId = urlYoutube.pathname.split("/").filter(Boolean)[1] || "";
    } else if (urlYoutube.pathname.startsWith("/shorts/")) {
      videoId = urlYoutube.pathname.split("/").filter(Boolean)[1] || "";
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    }

    if (playlist) {
      return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
        playlist
      )}`;
    }
  } catch {
    return "";
  }

  return "";
}

function formatarBytesStorage(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const unidades = ["B", "KB", "MB", "GB", "TB"];
  let valor = bytes;
  let indiceUnidade = 0;

  while (valor >= 1024 && indiceUnidade < unidades.length - 1) {
    valor /= 1024;
    indiceUnidade += 1;
  }

  return `${valor.toLocaleString("pt-BR", {
    maximumFractionDigits: indiceUnidade === 0 ? 0 : 1,
  })} ${unidades[indiceUnidade]}`;
}

function parseNumeroErpPdv(valor: string) {
  const normalizado = valor
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : 0;
}

function formatarNumeroErpPdv(valor: number) {
  if (!Number.isFinite(valor) || valor === 0) return "";

  return String(valor).replace(".", ",");
}

function formatarMoedaErpPdv(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calcularPrecoPorPercentualErpPdv(custo: number, percentual: number) {
  if (custo <= 0 || percentual <= 0) return 0;

  return custo + custo * (percentual / 100);
}

function calcularIndicadoresPrecoErpPdv(custo: number, preco: number) {
  const lucro = preco - custo;
  const margemPercentual = preco > 0 ? (lucro / preco) * 100 : 0;
  const markupPercentual = custo > 0 ? (lucro / custo) * 100 : 0;

  return {
    lucro,
    margemPercentual,
    markupPercentual,
    abaixoDoCusto: custo > 0 && preco > 0 && preco < custo,
  };
}

function obterPrecoProdutoPorTabelaErpPdv(
  produto: ErpPdvProduto,
  tabela: ErpPdvTabelaPreco
) {
  if (tabela === "atacado") return produto.preco_atacado || produto.preco_venda;
  if (tabela === "revenda") return produto.preco_revenda || produto.preco_venda;
  if (tabela === "personalizada") {
    return produto.preco_personalizado || produto.preco_venda;
  }

  return produto.preco_venda;
}

function obterLabelTabelaPrecoErpPdv(tabela: ErpPdvTabelaPreco) {
  return erpPdvTabelasPreco.find((item) => item.id === tabela)?.label || tabela;
}

function criarErpPdvProdutoForm(produto: ErpPdvProduto): ErpPdvProdutoForm {
  return {
    id: produto.id,
    nome: produto.nome,
    categoriaId: produto.categoria_id || "",
    codigoBarras: produto.codigo_barras,
    sku: produto.sku,
    marca: produto.marca,
    custo: formatarNumeroErpPdv(produto.custo),
    precoVenda: formatarNumeroErpPdv(produto.preco_venda),
    precoAtacado: formatarNumeroErpPdv(produto.preco_atacado),
    precoRevenda: formatarNumeroErpPdv(produto.preco_revenda),
    precoPersonalizado: formatarNumeroErpPdv(produto.preco_personalizado),
    formacaoPrecoTipo: produto.formacao_preco_tipo,
    percentualPreco: formatarNumeroErpPdv(produto.percentual_preco),
    unidade: produto.unidade || "un",
    estoqueAtual: formatarNumeroErpPdv(produto.estoque_atual),
    estoqueMinimo: formatarNumeroErpPdv(produto.estoque_minimo),
    localizacao: produto.localizacao,
    ncm: produto.ncm,
    observacoes: produto.observacoes,
    imagemUrl: produto.imagem_url,
    ativo: produto.ativo,
  };
}

function normalizarVideosLanding(valor: unknown): LandingPageVideoConfig[] {
  if (!Array.isArray(valor)) {
    return landingPageVideosPadrao.map((video) => ({ ...video }));
  }

  const videos = valor.slice(0, 8).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...landingPageVideosPadrao[0] };
    }

    const video = item as Record<string, unknown>;

    return {
      titulo: lerCampoTexto(video, "titulo"),
      descricao: lerCampoTexto(video, "descricao"),
      url: lerCampoTexto(video, "url"),
      visivel:
        typeof video.visivel === "boolean" ? video.visivel : true,
    };
  });

  return videos.length > 0
    ? videos
    : landingPageVideosPadrao.map((video) => ({ ...video }));
}

function normalizarAudiosLanding(valor: unknown): LandingPageAudioConfig[] {
  if (!Array.isArray(valor)) {
    return landingPageAudiosPadrao.map((audio) => ({ ...audio }));
  }

  const audios = valor.slice(0, 10).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...landingPageAudiosPadrao[0] };
    }

    const audio = item as Record<string, unknown>;

    return {
      titulo: lerCampoTexto(audio, "titulo"),
      descricao: lerCampoTexto(audio, "descricao"),
      arquivoUrl: lerCampoTexto(audio, "arquivoUrl"),
      visivel:
        typeof audio.visivel === "boolean" ? audio.visivel : true,
    };
  });

  return audios.length > 0
    ? audios
    : landingPageAudiosPadrao.map((audio) => ({ ...audio }));
}

function normalizarProdutosDigitaisLanding(
  valor: unknown
): LandingPageProdutoDigitalConfig[] {
  if (!Array.isArray(valor)) {
    return landingPageProdutosDigitaisPadrao.map((produto) => ({ ...produto }));
  }

  const produtos = valor.slice(0, 20).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ...landingPageProdutosDigitaisPadrao[0] };
    }

    const produto = item as Record<string, unknown>;

    return {
      titulo: lerCampoTexto(produto, "titulo"),
      descricao: lerCampoTexto(produto, "descricao"),
      preco: lerCampoTexto(produto, "preco"),
      imagemUrl: lerCampoTexto(produto, "imagemUrl"),
      linkCompra: lerCampoTexto(produto, "linkCompra"),
      categoria: lerCampoTexto(produto, "categoria"),
      visivel:
        typeof produto.visivel === "boolean" ? produto.visivel : true,
    };
  });

  return produtos.length > 0
    ? produtos
    : landingPageProdutosDigitaisPadrao.map((produto) => ({ ...produto }));
}

function normalizarCategoriasProdutosDigitaisLanding(valor: unknown): string[] {
  if (!Array.isArray(valor)) {
    return [...landingPageCategoriasProdutosDigitaisPadrao];
  }

  return valor
    .filter((categoria): categoria is string => typeof categoria === "string")
    .map((categoria) => categoria.trim())
    .filter(Boolean)
    .filter((categoria, indice, lista) => lista.indexOf(categoria) === indice);
}

function normalizarFormularioContatoLanding(
  valor: unknown,
  fallback: LandingPageFormularioContatoConfig
): LandingPageFormularioContatoConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return structuredClone(fallback);
  }

  const formularioRecebido = valor as Record<string, unknown>;

  return landingPageFormularioCampos.reduce<LandingPageFormularioContatoConfig>(
    (formulario, campo) => {
      const configCampo = formularioRecebido[campo.id];
      const fallbackCampo = fallback[campo.id];

      if (!configCampo || typeof configCampo !== "object" || Array.isArray(configCampo)) {
        return {
          ...formulario,
          [campo.id]: { ...fallbackCampo },
        };
      }

      const configRecebida = configCampo as Record<string, unknown>;

      return {
        ...formulario,
        [campo.id]: {
          ativo:
            typeof configRecebida.ativo === "boolean"
              ? configRecebida.ativo
              : fallbackCampo.ativo,
          obrigatorio:
            typeof configRecebida.obrigatorio === "boolean"
              ? configRecebida.obrigatorio
              : fallbackCampo.obrigatorio,
        },
      };
    },
    structuredClone(fallback)
  );
}

function normalizarOrdemSecoesLanding(valor: unknown): LandingPageSecaoConteudoId[] {
  if (!Array.isArray(valor)) {
    return [...landingPageOrdemSecoesPadrao];
  }

  const secoesValidas = new Set<LandingPageSecaoConteudoId>(
    landingPageOrdemSecoesPadrao
  );
  const ordemRecebida = valor.filter(
    (secao): secao is LandingPageSecaoConteudoId =>
      typeof secao === "string" &&
      secoesValidas.has(secao as LandingPageSecaoConteudoId)
  );
  const ordemSemDuplicidade = ordemRecebida.filter(
    (secao, indice, lista) => lista.indexOf(secao) === indice
  );
  const secoesFaltantes = landingPageOrdemSecoesPadrao.filter(
    (secao) => !ordemSemDuplicidade.includes(secao)
  );

  return [...ordemSemDuplicidade, ...secoesFaltantes];
}

function normalizarVisibilidadeSecoesLanding(
  valor: unknown
): Record<LandingPageSecaoConteudoId, boolean> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return { ...landingPageVisibilidadeSecoesPadrao };
  }

  const visibilidadeRecebida = valor as Record<string, unknown>;

  return landingPageOrdemSecoesPadrao.reduce<
    Record<LandingPageSecaoConteudoId, boolean>
  >(
    (visibilidade, secao) => ({
      ...visibilidade,
      [secao]:
        typeof visibilidadeRecebida[secao] === "boolean"
          ? Boolean(visibilidadeRecebida[secao])
          : true,
    }),
    { ...landingPageVisibilidadeSecoesPadrao }
  );
}

function criarLandingPagePublicavel(config: LandingPagePublicavelConfig) {
  return {
    publicada: config.publicada,
    hero: { ...config.hero },
    sobre: { ...config.sobre },
    servicos: config.servicos.map((servico) => ({ ...servico })),
    galeria: config.galeria.map((imagem) => ({ ...imagem })),
    depoimentos: config.depoimentos.map((depoimento) => ({ ...depoimento })),
    videos: config.videos.map((video) => ({ ...video })),
    audios: config.audios.map((audio) => ({ ...audio })),
    produtosDigitais: config.produtosDigitais.map((produto) => ({
      ...produto,
    })),
    categoriasProdutosDigitais: [...config.categoriasProdutosDigitais],
    contato: { ...config.contato },
    formularioContato: structuredClone(config.formularioContato),
    cta: { ...config.cta },
    seo: { ...config.seo },
    ordemSecoes: [...config.ordemSecoes],
    visibilidadeSecoes: { ...config.visibilidadeSecoes },
    publicadaEm: config.publicadaEm,
    publicadaPor: config.publicadaPor,
  };
}

function normalizarLandingPagePublicavelConfig(
  valor: unknown,
  fallback: LandingPagePublicavelConfig
): LandingPagePublicavelConfig {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return criarLandingPagePublicavel(fallback);
  }

  const config = valor as Partial<Record<keyof LandingPagePublicavelConfig, unknown>>;
  const objetoRecebido = valor as Record<string, unknown>;

  return {
    publicada: lerCampoBooleano(objetoRecebido, "publicada"),
    hero: normalizarObjetoLanding(config.hero, fallback.hero, [
      "titulo",
      "subtitulo",
      "botaoTexto",
      "botaoLink",
      "imagemDestaque",
    ]),
    sobre: normalizarObjetoLanding(config.sobre, fallback.sobre, [
      "titulo",
      "texto",
      "imagem",
    ]),
    servicos: normalizarListaLanding(config.servicos, fallback.servicos, [
      "titulo",
      "descricao",
    ]),
    galeria: normalizarListaLanding(config.galeria, fallback.galeria, [
      "url",
      "alt",
    ]),
    depoimentos: normalizarListaLanding(
      config.depoimentos,
      fallback.depoimentos,
      ["nome", "cargoEmpresa", "texto"]
    ),
    videos: normalizarVideosLanding(config.videos),
    audios: normalizarAudiosLanding(config.audios),
    produtosDigitais: normalizarProdutosDigitaisLanding(
      config.produtosDigitais
    ),
    categoriasProdutosDigitais: normalizarCategoriasProdutosDigitaisLanding(
      config.categoriasProdutosDigitais
    ),
    contato: normalizarObjetoLanding(config.contato, fallback.contato, [
      "telefone",
      "whatsapp",
      "email",
      "endereco",
    ]),
    formularioContato: normalizarFormularioContatoLanding(
      config.formularioContato,
      fallback.formularioContato
    ),
    cta: normalizarObjetoLanding(config.cta, fallback.cta, [
      "titulo",
      "texto",
      "botaoTexto",
      "botaoLink",
    ]),
    seo: normalizarObjetoLanding(config.seo, fallback.seo, [
      "titulo",
      "descricao",
      "palavrasChave",
      "imagemCompartilhamento",
    ]),
    ordemSecoes: normalizarOrdemSecoesLanding(config.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoesLanding(
      config.visibilidadeSecoes
    ),
    publicadaEm: lerCampoTexto(objetoRecebido, "publicadaEm"),
    publicadaPor: lerCampoTexto(objetoRecebido, "publicadaPor"),
  };
}

function normalizarLandingPageConfig(valor: unknown): LandingPageConfig {
  const configPadrao = criarLandingPageConfigPadrao();

  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return configPadrao;
  }

  const configRecebida = valor as Partial<Record<keyof LandingPageConfig, unknown>>;
  const objetoRecebido = valor as Record<string, unknown>;

  const rascunho: LandingPagePublicavelConfig = {
    publicada: lerCampoBooleano(objetoRecebido, "publicada"),
    hero: normalizarObjetoLanding(
      configRecebida.hero,
      landingPageHeroPadrao,
      ["titulo", "subtitulo", "botaoTexto", "botaoLink", "imagemDestaque"]
    ),
    sobre: normalizarObjetoLanding(
      configRecebida.sobre,
      landingPageSobrePadrao,
      ["titulo", "texto", "imagem"]
    ),
    servicos: normalizarListaLanding(
      configRecebida.servicos,
      landingPageServicosPadrao,
      ["titulo", "descricao"]
    ),
    galeria: normalizarListaLanding(
      configRecebida.galeria,
      landingPageGaleriaPadrao,
      ["url", "alt"]
    ),
    depoimentos: normalizarListaLanding(
      configRecebida.depoimentos,
      landingPageDepoimentosPadrao,
      ["nome", "cargoEmpresa", "texto"]
    ),
    videos: normalizarVideosLanding(configRecebida.videos),
    audios: normalizarAudiosLanding(configRecebida.audios),
    produtosDigitais: normalizarProdutosDigitaisLanding(
      configRecebida.produtosDigitais
    ),
    categoriasProdutosDigitais: normalizarCategoriasProdutosDigitaisLanding(
      configRecebida.categoriasProdutosDigitais
    ),
    contato: normalizarObjetoLanding(
      configRecebida.contato,
      landingPageContatoPadrao,
      ["telefone", "whatsapp", "email", "endereco"]
    ),
    formularioContato: normalizarFormularioContatoLanding(
      configRecebida.formularioContato,
      landingPageFormularioContatoPadrao
    ),
    cta: normalizarObjetoLanding(
      configRecebida.cta,
      landingPageCtaPadrao,
      ["titulo", "texto", "botaoTexto", "botaoLink"]
    ),
    seo: normalizarObjetoLanding(
      configRecebida.seo,
      landingPageSeoPadrao,
      ["titulo", "descricao", "palavrasChave", "imagemCompartilhamento"]
    ),
    ordemSecoes: normalizarOrdemSecoesLanding(configRecebida.ordemSecoes),
    visibilidadeSecoes: normalizarVisibilidadeSecoesLanding(
      configRecebida.visibilidadeSecoes
    ),
  };
  const versaoPublicada = normalizarLandingPagePublicavelConfig(
    configRecebida.versaoPublicada,
    rascunho
  );

  return {
    ...rascunho,
    versaoPublicada,
    alteracoesNaoPublicadas:
      JSON.stringify(rascunho) !== JSON.stringify(versaoPublicada),
    historicoVersoes: Array.isArray(configRecebida.historicoVersoes)
      ? configRecebida.historicoVersoes
          .slice(0, 10)
          .map((versao) =>
            normalizarLandingPagePublicavelConfig(versao, versaoPublicada)
          )
      : [],
  };
}

function LandingPageSectionPlaceholder({
  nome,
  descricao,
}: LandingPageSectionProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-green-700">
        {nome}
      </p>

      <h4 className="mt-2 text-lg font-bold text-slate-900">
        Esta seção será implementada nas próximas Sprints.
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {descricao}
      </p>
    </div>
  );
}

void LandingPageSectionPlaceholder;

function LandingSecaoVisibilitySwitch({
  secao,
  visivel,
  desabilitado,
  onChange,
}: {
  secao: LandingPageSecaoConteudoId;
  visivel: boolean;
  desabilitado: boolean;
  onChange: (secao: LandingPageSecaoConteudoId, visivel: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <input
        type="checkbox"
        checked={visivel}
        disabled={desabilitado}
        onChange={(e) => onChange(secao, e.target.checked)}
        className="h-5 w-5"
      />

      <span className="text-sm font-bold text-slate-700">
        Exibir secao
      </span>
    </label>
  );
}

function LandingHeroSection({
  landingPageContratada,
  hero,
  onHeroChange,
  pastaUploadLanding,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Hero
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Primeira seção real da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Configure a chamada principal que aparece no topo da landing.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Título principal"
          value={hero.titulo}
          onChange={(e) => onHeroChange("titulo", e.target.value)}
          placeholder={landingPageHeroExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Subtítulo
          </label>

          <textarea
            value={hero.subtitulo}
            onChange={(e) => onHeroChange("subtitulo", e.target.value)}
            placeholder={landingPageHeroExemplo.subtitulo}
            rows={3}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Texto do botão principal"
            value={hero.botaoTexto}
            onChange={(e) => onHeroChange("botaoTexto", e.target.value)}
            placeholder={landingPageHeroExemplo.botaoTexto}
          />

          <Input
            label="Link do botão principal"
            value={hero.botaoLink}
            onChange={(e) => onHeroChange("botaoLink", e.target.value)}
            placeholder="https://wa.me/5500000000000"
          />
        </div>

        <UploadImagem
          titulo="Imagem de destaque da Landing Page"
          imagem={hero.imagemDestaque}
          pasta={`${pastaUploadLanding}/hero`}
          onUpload={async (url) => onHeroChange("imagemDestaque", url)}
        />
      </fieldset>
    </div>
  );
}

function LandingSobreSection({
  landingPageContratada,
  sobre,
  onSobreChange,
  pastaUploadLanding,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Sobre
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Sobre a Empresa
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Conte a historia e destaque os diferenciais da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Título"
          value={sobre.titulo}
          onChange={(e) => onSobreChange("titulo", e.target.value)}
          placeholder={landingPageSobreExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Texto descritivo
          </label>

          <textarea
            value={sobre.texto}
            onChange={(e) => onSobreChange("texto", e.target.value)}
            placeholder={landingPageSobreExemplo.texto}
            rows={5}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <UploadImagem
          titulo="Imagem da secao Sobre"
          imagem={sobre.imagem}
          pasta={`${pastaUploadLanding}/sobre`}
          onUpload={async (url) => onSobreChange("imagem", url)}
        />
      </fieldset>
    </div>
  );
}

function LandingServicosSection({
  landingPageContratada,
  servicos,
  onServicoChange,
  onServicoAdd,
  onServicoRemove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteServicos = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Serviços
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Serviços da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre até 6 serviços para destacar no preview da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Não contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {servicos.map((servico, indice) => (
          <div
            key={`servico-${indice}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h5 className="font-bold text-slate-900">
                Serviço {indice + 1}
              </h5>

              {servicos.length > 1 && (
                <button
                  type="button"
                  onClick={() => onServicoRemove(indice)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              <Input
                label={`Título do serviço ${indice + 1}`}
                value={servico.titulo}
                onChange={(e) =>
                  onServicoChange(indice, "titulo", e.target.value)
                }
                placeholder={
                  landingPageServicosExemplo[indice]?.titulo ||
                  "Nome do serviço"
                }
              />

              <div>
                <label className="block font-medium text-slate-700">
                  Descrição curta
                </label>

                <textarea
                  value={servico.descricao}
                  onChange={(e) =>
                    onServicoChange(indice, "descricao", e.target.value)
                  }
                  placeholder={
                    landingPageServicosExemplo[indice]?.descricao ||
                    "Descreva este serviço em poucas palavras."
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onServicoAdd}
          disabled={camposDesabilitados || servicos.length >= limiteServicos}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar serviço
        </button>
      </fieldset>
    </div>
  );
}

function LandingGaleriaSection({
  landingPageContratada,
  galeria,
  onGaleriaImagemChange,
  onGaleriaImagemAdd,
  onGaleriaImagemRemove,
  pastaUploadLanding,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteImagens = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Galeria
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Galeria da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 6 imagens por upload para exibir no preview da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {galeria.map((imagem, indice) => {
          const imagemUrl = imagem.url.trim();

          return (
            <div
              key={`galeria-${indice}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="font-bold text-slate-900">
                  Imagem {indice + 1}
                </h5>

                {galeria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onGaleriaImagemRemove(indice)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4">
                <UploadImagem
                  titulo={`Imagem da galeria ${indice + 1}`}
                  imagem={imagem.url}
                  pasta={`${pastaUploadLanding}/galeria/${indice + 1}`}
                  onUpload={async (url) =>
                    onGaleriaImagemChange(indice, "url", url)
                  }
                />

                <div className="grid gap-4">
                  <Input
                    label="Texto alternativo / descricao curta"
                    value={imagem.alt}
                    onChange={(e) =>
                      onGaleriaImagemChange(indice, "alt", e.target.value)
                    }
                    placeholder={
                      landingPageGaleriaExemplo[indice]?.alt ||
                      "Descricao curta da imagem"
                    }
                  />
                </div>

                {imagemUrl && (
                  <p className="break-all text-xs font-semibold text-slate-500">
                    URL atual: {imagemUrl}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onGaleriaImagemAdd}
          disabled={camposDesabilitados || galeria.length >= limiteImagens}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar imagem
        </button>
      </fieldset>
    </div>
  );
}

function LandingDepoimentosSection({
  landingPageContratada,
  depoimentos,
  onDepoimentoChange,
  onDepoimentoAdd,
  onDepoimentoRemove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteDepoimentos = 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Depoimentos
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Depoimentos da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 6 relatos de clientes para destacar no preview.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {depoimentos.map((depoimento, indice) => (
          <div
            key={`depoimento-${indice}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h5 className="font-bold text-slate-900">
                Depoimento {indice + 1}
              </h5>

              {depoimentos.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDepoimentoRemove(indice)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 sm:w-auto"
                >
                  Remover
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={`Nome ${indice + 1}`}
                  value={depoimento.nome}
                  onChange={(e) =>
                    onDepoimentoChange(indice, "nome", e.target.value)
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.nome ||
                    "Nome do cliente"
                  }
                />

                <Input
                  label="Cargo / Empresa (opcional)"
                  value={depoimento.cargoEmpresa}
                  onChange={(e) =>
                    onDepoimentoChange(
                      indice,
                      "cargoEmpresa",
                      e.target.value
                    )
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.cargoEmpresa ||
                    "Cliente, empresa ou funcao"
                  }
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700">
                  Texto do depoimento
                </label>

                <textarea
                  value={depoimento.texto}
                  onChange={(e) =>
                    onDepoimentoChange(indice, "texto", e.target.value)
                  }
                  placeholder={
                    landingPageDepoimentosExemplo[indice]?.texto ||
                    "Escreva o relato do cliente em poucas linhas."
                  }
                  rows={4}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onDepoimentoAdd}
          disabled={
            camposDesabilitados || depoimentos.length >= limiteDepoimentos
          }
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar depoimento
        </button>
      </fieldset>
    </div>
  );
}

function LandingVideosSection({
  landingPageContratada,
  videos,
  onVideoChange,
  onVideoAdd,
  onVideoRemove,
  onVideoMove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteVideos = 8;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Videos
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Videos do YouTube na Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre um video principal e videos adicionais usando apenas links do YouTube. Upload de video permanece fora do padrao oficial.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {videos.map((video, indice) => {
          const urlVideo = video.url.trim();
          const embedUrl = criarYouTubeEmbedUrl(urlVideo);
          const urlInvalida = Boolean(urlVideo && !embedUrl);

          return (
            <div
              key={`video-${indice}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-900">
                    {indice === 0 ? "Video principal" : `Video adicional ${indice}`}
                  </h5>

                  <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={video.visivel}
                      onChange={(e) =>
                        onVideoChange(indice, "visivel", e.target.checked)
                      }
                    />
                    Exibir video
                  </label>
                </div>

                <div className="grid gap-2 sm:flex sm:shrink-0">
                  <button
                    type="button"
                    disabled={camposDesabilitados || indice === 0}
                    onClick={() => onVideoMove(indice, "up")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Subir
                  </button>

                  <button
                    type="button"
                    disabled={camposDesabilitados || indice === videos.length - 1}
                    onClick={() => onVideoMove(indice, "down")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Descer
                  </button>

                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onVideoRemove(indice)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Titulo"
                    value={video.titulo}
                    onChange={(e) =>
                      onVideoChange(indice, "titulo", e.target.value)
                    }
                    placeholder="Nome do video ou da playlist"
                  />

                  <Input
                    label="Descricao (opcional)"
                    value={video.descricao}
                    onChange={(e) =>
                      onVideoChange(indice, "descricao", e.target.value)
                    }
                    placeholder="Contexto curto para o visitante"
                  />
                </div>

                <Input
                  label="Link do YouTube"
                  value={video.url}
                  onChange={(e) =>
                    onVideoChange(indice, "url", e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />

                {urlInvalida && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    Informe um link valido do YouTube ou de uma playlist do YouTube.
                  </p>
                )}

                {embedUrl && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                    <iframe
                      title={video.titulo || `Video ${indice + 1}`}
                      src={embedUrl}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onVideoAdd}
          disabled={camposDesabilitados || videos.length >= limiteVideos}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar video
        </button>
      </fieldset>

      <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
        Padrao oficial: imagens, PDFs, documentos e audios usam upload; videos usam somente link do YouTube.
      </p>
    </div>
  );
}

function LandingAudiosSection({
  landingPageContratada,
  audios,
  onAudioChange,
  onAudioAdd,
  onAudioRemove,
  onAudioMove,
  pastaUploadLanding,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteAudios = 10;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Audios
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Bloco de audios da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 10 audios em MP3, WAV, OGG ou M4A para tocar diretamente na pagina.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        {audios.map((audio, indice) => {
          const audioUrl = audio.arquivoUrl.trim();

          return (
            <div
              key={`audio-${indice}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-900">
                    Audio {indice + 1}
                  </h5>

                  <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={audio.visivel}
                      onChange={(e) =>
                        onAudioChange(indice, "visivel", e.target.checked)
                      }
                    />
                    Exibir audio
                  </label>
                </div>

                <div className="grid gap-2 sm:flex sm:shrink-0">
                  <button
                    type="button"
                    disabled={camposDesabilitados || indice === 0}
                    onClick={() => onAudioMove(indice, "up")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Subir
                  </button>

                  <button
                    type="button"
                    disabled={camposDesabilitados || indice === audios.length - 1}
                    onClick={() => onAudioMove(indice, "down")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Descer
                  </button>

                  {audios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onAudioRemove(indice)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Titulo"
                    value={audio.titulo}
                    onChange={(e) =>
                      onAudioChange(indice, "titulo", e.target.value)
                    }
                    placeholder="Nome da faixa, aula ou demonstracao"
                  />

                  <Input
                    label="Descricao (opcional)"
                    value={audio.descricao}
                    onChange={(e) =>
                      onAudioChange(indice, "descricao", e.target.value)
                    }
                    placeholder="Contexto curto sobre o audio"
                  />
                </div>

                <UploadImagem
                  titulo={`Arquivo de audio ${indice + 1}`}
                  imagem={audio.arquivoUrl}
                  tipoArquivo="audio"
                  accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a"
                  formatosPermitidos="MP3, WAV, OGG ou M4A"
                  pasta={`${pastaUploadLanding}/audios/${indice + 1}`}
                  onUpload={async (url) =>
                    onAudioChange(indice, "arquivoUrl", url)
                  }
                />

                {audioUrl && (
                  <p className="break-all text-xs font-semibold text-slate-500">
                    URL atual: {audioUrl}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAudioAdd}
          disabled={camposDesabilitados || audios.length >= limiteAudios}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar audio
        </button>
      </fieldset>
    </div>
  );
}

function LandingProdutosDigitaisSection({
  landingPageContratada,
  produtosDigitais,
  categoriasProdutosDigitais,
  onProdutoDigitalChange,
  onProdutoDigitalAdd,
  onProdutoDigitalRemove,
  onProdutoDigitalMove,
  onProdutoCategoriaAdd,
  onProdutoCategoriaRemove,
  pastaUploadLanding,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;
  const limiteProdutos = 20;
  const [novaCategoria, setNovaCategoria] = useState("");

  function adicionarCategoria() {
    const categoria = novaCategoria.trim();

    if (!categoria) return;

    onProdutoCategoriaAdd(categoria);
    setNovaCategoria("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Produtos Digitais / Partituras
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Produtos digitais da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cadastre ate 20 produtos com capa, preco e link externo de compra. O checkout sera conectado em uma etapa futura.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h5 className="font-bold text-slate-900">
            Categorias
          </h5>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              label="Nova categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              placeholder="Ex.: Partituras, PDFs, Aulas"
            />

            <button
              type="button"
              onClick={adicionarCategoria}
              disabled={camposDesabilitados || !novaCategoria.trim()}
              className="self-end rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Adicionar categoria
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {categoriasProdutosDigitais.length === 0 ? (
              <span className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-500">
                Nenhuma categoria criada.
              </span>
            ) : (
              categoriasProdutosDigitais.map((categoria) => (
                <span
                  key={categoria}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                >
                  {categoria}

                  <button
                    type="button"
                    onClick={() => onProdutoCategoriaRemove(categoria)}
                    className="text-xs font-black text-slate-400 hover:text-red-600"
                    aria-label={`Remover categoria ${categoria}`}
                  >
                    x
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {produtosDigitais.map((produto, indice) => {
          const imagemUrl = produto.imagemUrl.trim();

          return (
            <div
              key={`produto-digital-${indice}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-900">
                    Produto {indice + 1}
                  </h5>

                  <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={produto.visivel}
                      onChange={(e) =>
                        onProdutoDigitalChange(
                          indice,
                          "visivel",
                          e.target.checked
                        )
                      }
                    />
                    Exibir produto
                  </label>
                </div>

                <div className="grid gap-2 sm:flex sm:shrink-0">
                  <button
                    type="button"
                    disabled={camposDesabilitados || indice === 0}
                    onClick={() => onProdutoDigitalMove(indice, "up")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Subir
                  </button>

                  <button
                    type="button"
                    disabled={
                      camposDesabilitados ||
                      indice === produtosDigitais.length - 1
                    }
                    onClick={() => onProdutoDigitalMove(indice, "down")}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Descer
                  </button>

                  {produtosDigitais.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onProdutoDigitalRemove(indice)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Titulo"
                    value={produto.titulo}
                    onChange={(e) =>
                      onProdutoDigitalChange(indice, "titulo", e.target.value)
                    }
                    placeholder="Partitura, apostila ou produto digital"
                  />

                  <Input
                    label="Preco"
                    value={produto.preco}
                    onChange={(e) =>
                      onProdutoDigitalChange(indice, "preco", e.target.value)
                    }
                    placeholder="R$ 49,90"
                  />

                  <div>
                    <label className="block font-medium text-slate-700">
                      Categoria
                    </label>

                    <select
                      value={produto.categoria}
                      onChange={(e) =>
                        onProdutoDigitalChange(
                          indice,
                          "categoria",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    >
                      <option value="">Sem categoria</option>
                      {categoriasProdutosDigitais.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Descricao
                  </label>

                  <textarea
                    value={produto.descricao}
                    onChange={(e) =>
                      onProdutoDigitalChange(
                        indice,
                        "descricao",
                        e.target.value
                      )
                    }
                    placeholder="Descreva o produto, formato e principais beneficios."
                    rows={4}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <UploadImagem
                  titulo={`Capa do produto ${indice + 1}`}
                  imagem={produto.imagemUrl}
                  pasta={`${pastaUploadLanding}/produtos-digitais/${indice + 1}`}
                  onUpload={async (url) =>
                    onProdutoDigitalChange(indice, "imagemUrl", url)
                  }
                />

                {imagemUrl && (
                  <p className="break-all text-xs font-semibold text-slate-500">
                    URL atual da capa: {imagemUrl}
                  </p>
                )}

                <Input
                  label="Link de compra"
                  value={produto.linkCompra}
                  onChange={(e) =>
                    onProdutoDigitalChange(
                      indice,
                      "linkCompra",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  helperText="O botao Comprar abrira este link em uma nova aba."
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onProdutoDigitalAdd}
          disabled={
            camposDesabilitados || produtosDigitais.length >= limiteProdutos
          }
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar produto
        </button>
      </fieldset>
    </div>
  );
}

function LandingContatoSection({
  landingPageContratada,
  contato,
  onContatoChange,
  formularioContato,
  onFormularioContatoChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Contato
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Contato da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Defina canais especificos da landing ou deixe vazio para usar os dados da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Telefone"
            value={contato.telefone}
            onChange={(e) =>
              onContatoChange("telefone", formatarTelefone(e.target.value))
            }
            placeholder="Usar telefone da empresa"
            helperText="Se ficar vazio, o preview usa o telefone cadastrado na empresa."
          />

          <Input
            label="WhatsApp"
            value={contato.whatsapp}
            onChange={(e) =>
              onContatoChange("whatsapp", formatarTelefone(e.target.value))
            }
            placeholder="Usar WhatsApp da empresa"
            helperText="Se ficar vazio, o preview usa o WhatsApp cadastrado na empresa."
          />

          <Input
            label="E-mail"
            type="email"
            value={contato.email}
            onChange={(e) => onContatoChange("email", e.target.value)}
            placeholder="Usar e-mail da empresa"
          />

          <Input
            label="Endereco"
            value={contato.endereco}
            onChange={(e) => onContatoChange("endereco", e.target.value)}
            placeholder="Usar endereco da empresa"
          />
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h5 className="font-bold text-slate-900">
            Google Maps
          </h5>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Esta area fica preparada para receber mapa, coordenadas ou link incorporado em uma sprint futura.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h5 className="font-bold text-slate-900">
                Formulario de contato
              </h5>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Escolha quais campos aparecem na Landing Page e quais serao obrigatorios.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              E-mail e WhatsApp em breve
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {landingPageFormularioCampos.map((campo) => {
              const configCampo = formularioContato[campo.id];

              return (
                <div
                  key={campo.id}
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
                >
                  <strong className="text-sm text-slate-800">
                    {campo.label}
                  </strong>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={configCampo.ativo}
                      onChange={(e) =>
                        onFormularioContatoChange(
                          campo.id,
                          "ativo",
                          e.target.checked
                        )
                      }
                    />
                    Exibir campo
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={configCampo.obrigatorio}
                      disabled={!configCampo.ativo}
                      onChange={(e) =>
                        onFormularioContatoChange(
                          campo.id,
                          "obrigatorio",
                          e.target.checked
                        )
                      }
                    />
                    Obrigatorio
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function LandingCtaSection({
  landingPageContratada,
  cta,
  onCtaChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            CTA
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Chamada para Acao
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Configure a chamada final para conversao da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Titulo"
          value={cta.titulo}
          onChange={(e) => onCtaChange("titulo", e.target.value)}
          placeholder={landingPageCtaExemplo.titulo}
        />

        <div>
          <label className="block font-medium text-slate-700">
            Texto
          </label>

          <textarea
            value={cta.texto}
            onChange={(e) => onCtaChange("texto", e.target.value)}
            placeholder={landingPageCtaExemplo.texto}
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Texto do botao"
            value={cta.botaoTexto}
            onChange={(e) => onCtaChange("botaoTexto", e.target.value)}
            placeholder={landingPageCtaExemplo.botaoTexto}
          />

          <Input
            label="Link do botao"
            value={cta.botaoLink}
            onChange={(e) => onCtaChange("botaoLink", e.target.value)}
            placeholder="https://wa.me/5500000000000"
          />
        </div>
      </fieldset>
    </div>
  );
}

function LandingSeoSection({
  landingPageContratada,
  pastaUploadLanding,
  seo,
  onSeoChange,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            SEO
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Configuracoes para buscadores e compartilhamento
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Quando estes campos estiverem vazios, a Landing Page usa automaticamente nome, descricao e logo ou banner da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <fieldset
        disabled={camposDesabilitados}
        className="mt-5 grid gap-4 disabled:opacity-60"
      >
        <Input
          label="Titulo SEO"
          value={seo.titulo}
          onChange={(e) => onSeoChange("titulo", e.target.value)}
          placeholder="Nome da empresa ou campanha"
        />

        <div>
          <label className="block font-medium text-slate-700">
            Descricao SEO
          </label>

          <textarea
            value={seo.descricao}
            onChange={(e) => onSeoChange("descricao", e.target.value)}
            placeholder="Resumo curto exibido em buscadores e redes sociais."
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
          />
        </div>

        <Input
          label="Palavras-chave"
          value={seo.palavrasChave}
          onChange={(e) => onSeoChange("palavrasChave", e.target.value)}
          placeholder="servico, cidade, categoria"
        />

        <UploadImagem
          titulo="Imagem de compartilhamento"
          imagem={seo.imagemCompartilhamento}
          accept="image/*"
          formatosPermitidos="PNG, JPG, JPEG ou WEBP ate 5 MB"
          tamanhoMaximoMb={5}
          pasta={`${pastaUploadLanding}/seo/compartilhamento`}
          onUpload={async (url) =>
            onSeoChange("imagemCompartilhamento", url)
          }
        />

        {seo.imagemCompartilhamento.trim() && (
          <p className="break-all text-xs font-semibold text-slate-500">
            URL atual da imagem de compartilhamento:{" "}
            {seo.imagemCompartilhamento}
          </p>
        )}

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <h5 className="font-bold text-slate-900">
            Dominio personalizado
          </h5>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A estrutura fica preparada para gerar as metas com o endereco publico atual e receber dominio proprio em uma etapa futura.
          </p>
        </div>
      </fieldset>
    </div>
  );
}

function LandingTemplatesSection({
  landingPageContratada,
  onTemplateApply,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Templates
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Modelos prontos por segmento
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Escolha um modelo para preencher Hero, Sobre, Servicos e CTA. A aplicacao sempre pede confirmacao antes de substituir dados existentes.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {landingPageTemplates.map((template) => (
          <article
            key={template.id}
            className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">
                {template.segmento}
              </span>

              <h5 className="mt-3 text-base font-bold text-slate-900">
                {template.nome}
              </h5>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {template.descricao}
              </p>

              <ul className="mt-3 grid gap-1 text-sm text-slate-500">
                {template.servicos.slice(0, 3).map((servico) => (
                  <li key={servico.titulo}>
                    {servico.titulo}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={camposDesabilitados}
              onClick={() => onTemplateApply(template)}
              className="mt-4 w-full rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Aplicar template
            </button>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <h5 className="font-bold text-slate-900">
          Arquitetura preparada
        </h5>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Novos segmentos podem ser adicionados na lista de templates sem alterar a estrutura de edicao da Landing Page.
        </p>
      </div>
    </div>
  );
}

function LandingBlocosExtrasSection({
  landingPageContratada,
}: LandingPageSectionProps) {
  const status = landingPageContratada ? "Em breve" : "Nao contratado";
  const statusClassName = landingPageContratada
    ? "bg-blue-50 text-blue-700 ring-blue-100"
    : "bg-amber-100 text-amber-700 ring-amber-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Blocos Extras
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Modulos extras por segmento
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Placeholders preparados para ativacao futura por plano, recurso contratado e segmento da empresa.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {landingPageBlocosExtras.map((bloco) => (
          <article
            key={bloco.id}
            className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">
                  {bloco.segmento}
                </span>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClassName}`}
                >
                  {status}
                </span>
              </div>

              <h5 className="mt-3 text-base font-bold text-slate-900">
                {bloco.nome}
              </h5>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {bloco.descricao}
              </p>

              <p className="mt-3 break-all rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                Recurso futuro: {bloco.recursoFuturo}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Este recurso sera liberado em uma etapa futura da Landing Page."
                )
              }
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50"
            >
              Conhecer recurso
            </button>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <h5 className="font-bold text-slate-900">
          Ativacao futura
        </h5>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          A estrutura ja separa cada bloco por identificador de recurso, permitindo liberar modulos por plano, contrato ou segmento sem refazer o editor.
        </p>
      </div>
    </div>
  );
}

function LandingOrdenacaoSection({
  landingPageContratada,
  ordemSecoes,
  onSecaoMove,
}: LandingPageSectionProps) {
  const camposDesabilitados = !landingPageContratada;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Ordenacao
          </p>

          <h4 className="mt-2 text-lg font-bold text-slate-900">
            Ordem das secoes da Landing Page
          </h4>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mova as secoes para cima ou para baixo. A ordem atualiza o preview em tempo real e sera salva junto da Landing Page.
          </p>
        </div>

        {!landingPageContratada && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            Nao contratado
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-2">
        {ordemSecoes.map((secao, indice) => {
          const secaoConfig = landingPageSecoesOrdenaveis.find(
            (item) => item.id === secao
          );

          return (
            <div
              key={secao}
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Secao {indice + 1}
                </p>

                <h5 className="mt-1 font-bold text-slate-900">
                  {secaoConfig?.nome || secao}
                </h5>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={camposDesabilitados || indice === 0}
                  onClick={() => onSecaoMove(secao, "up")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Subir
                </button>

                <button
                  type="button"
                  disabled={camposDesabilitados || indice === ordemSecoes.length - 1}
                  onClick={() => onSecaoMove(secao, "down")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Descer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatarLandingPageVersaoData(versao: LandingPagePublicavelConfig) {
  if (!versao.publicadaEm) {
    return {
      data: "Data nao registrada",
      hora: "Hora nao registrada",
    };
  }

  const data = new Date(versao.publicadaEm);

  if (Number.isNaN(data.getTime())) {
    return {
      data: "Data nao registrada",
      hora: "Hora nao registrada",
    };
  }

  return {
    data: data.toLocaleDateString("pt-BR"),
    hora: data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function LandingHistoricoSection({
  historicoVersoes,
  versaoHistoricoVisualizada,
  onHistoricoView,
  onHistoricoRestore,
  onHistoricoClose,
}: LandingPageSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide text-green-700">
          Historico de Versoes
        </p>

        <h4 className="mt-2 text-lg font-bold text-slate-900">
          Versoes publicadas da Landing Page
        </h4>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          As ultimas 10 versoes publicadas ficam disponiveis para visualizacao e restauracao.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {historicoVersoes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            Nenhuma versao anterior publicada ainda.
          </div>
        ) : (
          historicoVersoes.map((versao, indice) => {
            const dataVersao = formatarLandingPageVersaoData(versao);

            return (
              <div
                key={`${versao.publicadaEm || "sem-data"}-${indice}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Versao {indice + 1}
                    </p>

                    <h5 className="mt-1 font-bold text-slate-900">
                      {dataVersao.data} - {dataVersao.hora}
                    </h5>

                    <p className="mt-1 text-sm text-slate-600">
                      Usuario: {versao.publicadaPor || "Nao informado"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onHistoricoView(versao)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300"
                    >
                      Visualizar
                    </button>

                    <button
                      type="button"
                      onClick={() => onHistoricoRestore(versao)}
                      className="rounded-xl bg-green-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {versaoHistoricoVisualizada && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h5 className="font-bold text-slate-900">
                Visualizacao da versao selecionada
              </h5>

              <p className="mt-1 text-sm text-slate-600">
                Esta visualizacao nao altera o rascunho atual.
              </p>
            </div>

            <button
              type="button"
              onClick={onHistoricoClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
            >
              Fechar preview
            </button>
          </div>

          <LandingPagePreviewReal
            empresa={{
              id: "historico-preview",
              nome: "Landing Page",
              slug: "historico",
              categoria: "",
              tipo: "",
              descricao: "",
              telefone: "",
              whatsapp: "",
              email: "",
              instagram: "",
              facebook: "",
              site: "",
              endereco: "",
              pix: "",
              logo: "",
              banner: "",
              ativo: true,
              landing_page_config: versaoHistoricoVisualizada,
            }}
            landingPage={{
              ...versaoHistoricoVisualizada,
              versaoPublicada: versaoHistoricoVisualizada,
              alteracoesNaoPublicadas: false,
              historicoVersoes: [],
            }}
          />
        </div>
      )}
    </div>
  );
}

const landingPageSections: LandingPageSecaoConfig[] = [
  {
    id: "historico",
    nome: "Historico",
    descricao: "Versoes publicadas e restauracao de conteudo.",
    ordem: 3,
    Component: LandingHistoricoSection,
  },
  {
    id: "ordenacao",
    nome: "Ordenacao",
    descricao: "Controle de ordem das secoes exibidas na Landing Page.",
    ordem: 4,
    Component: LandingOrdenacaoSection,
  },
  {
    id: "templates",
    nome: "Templates",
    descricao: "Modelos prontos por segmento para acelerar a criacao.",
    ordem: 5,
    Component: LandingTemplatesSection,
  },
  {
    id: "blocosExtras",
    nome: "Blocos Extras",
    descricao: "Placeholders para modulos extras por segmento.",
    ordem: 6,
    Component: LandingBlocosExtrasSection,
  },
  {
    id: "hero",
    nome: "Hero",
    descricao: "Area principal para promessa, imagem e chamada inicial.",
    ordem: 10,
    Component: LandingHeroSection,
  },
  {
    id: "sobre",
    nome: "Sobre",
    descricao: "Bloco institucional para apresentar a empresa.",
    ordem: 20,
    Component: LandingSobreSection,
  },
  {
    id: "servicos",
    nome: "Serviços",
    descricao: "Estrutura futura para listar servicos, planos ou ofertas.",
    ordem: 30,
    Component: LandingServicosSection,
  },
  {
    id: "galeria",
    nome: "Galeria",
    descricao: "Espaco reservado para imagens e provas visuais.",
    ordem: 40,
    Component: LandingGaleriaSection,
  },
  {
    id: "depoimentos",
    nome: "Depoimentos",
    descricao: "Area preparada para relatos, reviews e prova social.",
    ordem: 50,
    Component: LandingDepoimentosSection,
  },
  {
    id: "videos",
    nome: "Videos",
    descricao: "Videos do YouTube com preview incorporado.",
    ordem: 52,
    Component: LandingVideosSection,
  },
  {
    id: "audios",
    nome: "Audios",
    descricao: "Player de audios para materiais, demonstracoes e aulas.",
    ordem: 55,
    Component: LandingAudiosSection,
  },
  {
    id: "produtosDigitais",
    nome: "Produtos Digitais",
    descricao: "Cards para partituras, PDFs e produtos digitais.",
    ordem: 56,
    Component: LandingProdutosDigitaisSection,
  },
  {
    id: "contato",
    nome: "Contato",
    descricao: "Base para canais de contato e atendimento.",
    ordem: 60,
    Component: LandingContatoSection,
  },
  {
    id: "cta",
    nome: "CTA",
    descricao: "Chamada final para conversao, agendamento ou compra.",
    ordem: 70,
    Component: LandingCtaSection,
  },
  {
    id: "seo",
    nome: "SEO",
    descricao: "Configuracoes basicas para buscadores e redes sociais.",
    ordem: 80,
    Component: LandingSeoSection,
  },
];

const landingPageSectionRegistry = [...landingPageSections].sort(
  (a, b) => a.ordem - b.ordem
);

const landingPageArquiteturaFutura = [
  "Publicacao independente",
  "Dominio personalizado",
  "IA",
  "Analytics",
  "SEO",
  "Blocos extras por segmento",
];

function LandingPagePreviewReal({
  empresa,
  landingPage,
}: {
  empresa: EmpresaLanding;
  landingPage: LandingPageConfig;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
          Preview em tempo real
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Mesma estrutura da Landing Page publica.
        </p>
      </div>

      <div className="public-landing-preview-frame max-h-[760px] overflow-y-auto bg-white">
        <PublicLandingPageContent
          empresa={empresa}
          landingPage={landingPage}
          exigirPublicacao={false}
        />
      </div>
    </div>
  );
}


type TemaOficial = {
  id:
    | "TemaPadraoMikatech"
    | "TemaAutoCenter"
    | "TemaRestaurante"
    | "TemaClinica"
    | "TemaBarbearia"
    | "TemaLoja"
    | "TemaPetShop"
    | "TemaPremiumEscuro";
  nome: string;
  descricao: string;
  categorias: string[];
  miniatura: {
    tipo: "faixas";
  };
  aparencia: AparenciaConfig;
};

const ThemeRegistry: Record<TemaOficial["id"], TemaOficial> = {
  TemaPadraoMikatech: {
    id: "TemaPadraoMikatech",
    nome: `Padrao ${BrandConfig.developerCompany}`,
    descricao: "Visual institucional claro com destaque verde.",
    categorias: ["institucional", "padrao", "mikatech"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1f3d36",
      corSecundaria: "#32bcad",
      corBotoes: "#ffffff",
      corTextoBotoes: "#1f3d36",
      corFundoPagina: "#f1eee8",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#f1eee8",
      tipoFundo: "solida",
      gradienteInicio: "#fbfaf8",
      gradienteFim: "#f1eee8",
      gradienteDirecao: "vertical",
    },
  },
  TemaAutoCenter: {
    id: "TemaAutoCenter",
    nome: "Auto Center / Borracharia",
    descricao: "Contraste forte, cinza técnico e detalhe amarelo.",
    categorias: ["oficina", "auto center", "borracharia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1f2937",
      corSecundaria: "#f59e0b",
      corBotoes: "#f59e0b",
      corTextoBotoes: "#111827",
      corFundoPagina: "#e5e7eb",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#d1d5db",
      tipoFundo: "solida",
      gradienteInicio: "#f9fafb",
      gradienteFim: "#d1d5db",
      gradienteDirecao: "vertical",
    },
  },
  TemaRestaurante: {
    id: "TemaRestaurante",
    nome: "Restaurante / Lanchonete",
    descricao: "Tons quentes para cardápios, lanches e delivery.",
    categorias: ["restaurante", "lanchonete", "padaria"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#7f1d1d",
      corSecundaria: "#f97316",
      corBotoes: "#c2410c",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#fff7ed",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#ffedd5",
      tipoFundo: "solida",
      gradienteInicio: "#fff7ed",
      gradienteFim: "#fed7aa",
      gradienteDirecao: "vertical",
    },
  },
  TemaClinica: {
    id: "TemaClinica",
    nome: "Clínica / Saúde",
    descricao: "Limpo, leve e confiável para atendimento profissional.",
    categorias: ["clinica", "saude", "consultorio", "farmacia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#0f766e",
      corSecundaria: "#38bdf8",
      corBotoes: "#0f766e",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#ecfeff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#cffafe",
      tipoFundo: "solida",
      gradienteInicio: "#f0fdfa",
      gradienteFim: "#cffafe",
      gradienteDirecao: "vertical",
    },
  },
  TemaBarbearia: {
    id: "TemaBarbearia",
    nome: "Salão / Barbearia",
    descricao: "Elegante, marcante e pronto para serviços de beleza.",
    categorias: ["salao", "barbearia", "beleza"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#581c87",
      corSecundaria: "#e879f9",
      corBotoes: "#581c87",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#faf5ff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#f3e8ff",
      tipoFundo: "solida",
      gradienteInicio: "#faf5ff",
      gradienteFim: "#f3e8ff",
      gradienteDirecao: "vertical",
    },
  },
  TemaLoja: {
    id: "TemaLoja",
    nome: "Loja / Varejo",
    descricao: "Azul comercial com leitura rápida e visual organizado.",
    categorias: ["loja", "varejo", "papelaria", "imobiliaria"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#1d4ed8",
      corSecundaria: "#22c55e",
      corBotoes: "#1d4ed8",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#eff6ff",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#dbeafe",
      tipoFundo: "solida",
      gradienteInicio: "#ffffff",
      gradienteFim: "#dbeafe",
      gradienteDirecao: "vertical",
    },
  },
  TemaPetShop: {
    id: "TemaPetShop",
    nome: "Pet Shop",
    descricao: "Amigável, fresco e colorido para cuidados pet.",
    categorias: ["pet shop", "pet"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#166534",
      corSecundaria: "#facc15",
      corBotoes: "#15803d",
      corTextoBotoes: "#ffffff",
      corFundoPagina: "#f0fdf4",
      corAreaPrincipal: "#ffffff",
      corFundoHero: "#dcfce7",
      tipoFundo: "solida",
      gradienteInicio: "#f0fdf4",
      gradienteFim: "#dcfce7",
      gradienteDirecao: "vertical",
    },
  },
  TemaPremiumEscuro: {
    id: "TemaPremiumEscuro",
    nome: "Premium Escuro",
    descricao: "Escuro sofisticado com detalhe dourado.",
    categorias: ["premium", "hotel", "advocacia", "academia"],
    miniatura: { tipo: "faixas" },
    aparencia: {
      logoExibicao: "normal",
      corPrincipal: "#f8fafc",
      corSecundaria: "#d4af37",
      corBotoes: "#d4af37",
      corTextoBotoes: "#111827",
      corFundoPagina: "#111827",
      corAreaPrincipal: "#1f2937",
      corFundoHero: "#0f172a",
      tipoFundo: "solida",
      gradienteInicio: "#111827",
      gradienteFim: "#0f172a",
      gradienteDirecao: "vertical",
    },
  },
};

const TemaPadraoMikatech = ThemeRegistry.TemaPadraoMikatech.aparencia;
const temasProntos = Object.values(ThemeRegistry);

const diasAtendimento = [
  { id: "segunda", label: "Segunda" },
  { id: "terca", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

type HorarioDia = {
  ativo: boolean;
  abertura: string;
  fechamento: string;
};

type HorariosAtendimento = Record<string, HorarioDia>;

function criarHorariosPadrao(): HorariosAtendimento {
  return diasAtendimento.reduce<HorariosAtendimento>((horarios, dia) => {
    horarios[dia.id] = {
      ativo: ["segunda", "terca", "quarta", "quinta", "sexta"].includes(
        dia.id
      ),
      abertura: "08:00",
      fechamento: "18:00",
    };

    return horarios;
  }, {});
}

function gerarTextoHorario(horarios: HorariosAtendimento) {
  return diasAtendimento
    .filter((dia) => horarios[dia.id]?.ativo)
    .map((dia) => {
      const horario = horarios[dia.id];
      return `${dia.label}: ${horario.abertura} às ${horario.fechamento}`;
    })
    .join("\n");
}

function lerTextoHorario(texto: string) {
  const horarios = criarHorariosPadrao();
  let encontrouHorario = false;

  Object.keys(horarios).forEach((diaId) => {
    horarios[diaId] = {
      ...horarios[diaId],
      ativo: false,
    };
  });

  texto.split("\n").forEach((linha) => {
    const dia = diasAtendimento.find((item) =>
      linha.toLowerCase().startsWith(item.label.toLowerCase())
    );
    const horario = linha.match(/(\d{2}:\d{2}).+?(\d{2}:\d{2})/);

    if (!dia || !horario) return;

    horarios[dia.id] = {
      ativo: true,
      abertura: horario[1],
      fechamento: horario[2],
    };
    encontrouHorario = true;
  });

  return encontrouHorario ? horarios : null;
}

function adicionarVersaoImagem(url: string) {
  if (!url) return url;

  const separador = url.includes("?") ? "&" : "?";

  return `${url}${separador}v=${Date.now()}`;
}

function gerarSlug(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obterDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

function obterTelefoneLocal(valor: string) {
  const digitos = obterDigitos(valor);

  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    return digitos.slice(2);
  }

  return digitos;
}

function formatarTelefone(valor: string) {
  const digitos = obterTelefoneLocal(valor).slice(0, 11);
  const ddd = digitos.slice(0, 2);
  const parteInicial = digitos.length > 10
    ? digitos.slice(2, 7)
    : digitos.slice(2, 6);
  const parteFinal = digitos.length > 10
    ? digitos.slice(7, 11)
    : digitos.slice(6, 10);

  if (digitos.length <= 2) return ddd;
  if (!parteFinal) return `(${ddd}) ${parteInicial}`;

  return `(${ddd}) ${parteInicial}-${parteFinal}`;
}

function normalizarUsuarioRedeSocial(valor: string) {
  const texto = valor.trim();

  if (!texto) return "";

  const textoSemArroba = texto.replace(/^@+/, "");
  const contemLink =
    /^https?:\/\//i.test(texto) ||
    /^www\./i.test(texto) ||
    /(^|\.)instagram\.com/i.test(texto) ||
    /(^|\.)facebook\.com/i.test(texto) ||
    /(^|\.)tiktok\.com/i.test(texto) ||
    /(^|\.)youtube\.com/i.test(texto) ||
    /(^|\.)youtu\.be/i.test(texto) ||
    /(^|\.)kwai\.com/i.test(texto) ||
    /(^|\.)k\.kwai\.com/i.test(texto);

  if (!contemLink) {
    return textoSemArroba.replace(/\s+/g, "");
  }

  try {
    const url = new URL(
      texto.startsWith("http://") || texto.startsWith("https://")
        ? texto
        : `https://${texto}`
    );
    const partes = url.pathname
      .split("/")
      .map((parte) => parte.trim())
      .filter(Boolean);
    const usuario = partes.find((parte) =>
      !["p", "reel", "reels", "tv", "channel", "c", "user"].includes(
        parte.toLowerCase()
      )
    );

    return (usuario || textoSemArroba).replace(/^@+/, "").split("?")[0];
  } catch {
    return textoSemArroba.replace(/\s+/g, "");
  }
}

interface EmpresaFormProps {
  empresaInicialId?: string;
  empresaInicialSlug?: string;
  modoCliente?: boolean;
  onSalvar?: () => void;
  onExcluir?: () => void | Promise<void>;
  onEmpresaAtualChange?: (empresa: {
    nome: string;
    logo?: string | null;
  }) => void;
}

export default function EmpresaForm({
  empresaInicialId,
  empresaInicialSlug,
  modoCliente = false,
  onSalvar,
  onExcluir,
  onEmpresaAtualChange,
}: EmpresaFormProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaEmpresa>("informacoes");
  const [empresaId, setEmpresaId] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAdmin, setSlugAdmin] = useState("");

  const [nome, setNome] = useState("");
  const [tipoGerenciamento, setTipoGerenciamento] = useState("mikatech");
  const [plano, setPlano] = useState<PlanoEmpresa>("starter");
  const [recursosContratados, setRecursosContratados] =
    useState<RecursosContratados>(() => ({ ...recursosPadrao }));
  const [landingPagePlaceholderAberto, setLandingPagePlaceholderAberto] =
    useState(false);
  const [landingPageIaModalAberto, setLandingPageIaModalAberto] =
    useState(false);
  const [landingPagePublicada, setLandingPagePublicada] = useState(false);
  const [landingPageSecaoAtiva, setLandingPageSecaoAtiva] =
    useState<LandingPageSecaoId>("templates");
  const [landingPageHero, setLandingPageHero] =
    useState<LandingPageHeroConfig>(() => ({ ...landingPageHeroPadrao }));
  const [landingPageSobre, setLandingPageSobre] =
    useState<LandingPageSobreConfig>(() => ({ ...landingPageSobrePadrao }));
  const [landingPageServicos, setLandingPageServicos] =
    useState<LandingPageServicoConfig[]>(() =>
      landingPageServicosPadrao.map((servico) => ({ ...servico }))
    );
  const [landingPageGaleria, setLandingPageGaleria] =
    useState<LandingPageGaleriaImagemConfig[]>(() =>
      landingPageGaleriaPadrao.map((imagem) => ({ ...imagem }))
    );
  const [landingPageDepoimentos, setLandingPageDepoimentos] =
    useState<LandingPageDepoimentoConfig[]>(() =>
      landingPageDepoimentosPadrao.map((depoimento) => ({ ...depoimento }))
    );
  const [landingPageVideos, setLandingPageVideos] =
    useState<LandingPageVideoConfig[]>(() =>
      landingPageVideosPadrao.map((video) => ({ ...video }))
    );
  const [landingPageAudios, setLandingPageAudios] =
    useState<LandingPageAudioConfig[]>(() =>
      landingPageAudiosPadrao.map((audio) => ({ ...audio }))
    );
  const [landingPageProdutosDigitais, setLandingPageProdutosDigitais] =
    useState<LandingPageProdutoDigitalConfig[]>(() =>
      landingPageProdutosDigitaisPadrao.map((produto) => ({ ...produto }))
    );
  const [
    landingPageCategoriasProdutosDigitais,
    setLandingPageCategoriasProdutosDigitais,
  ] = useState<string[]>(() => [
    ...landingPageCategoriasProdutosDigitaisPadrao,
  ]);
  const [landingPageContato, setLandingPageContato] =
    useState<LandingPageContatoConfig>(() => ({ ...landingPageContatoPadrao }));
  const [landingPageFormularioContato, setLandingPageFormularioContato] =
    useState<LandingPageFormularioContatoConfig>(() =>
      structuredClone(landingPageFormularioContatoPadrao)
    );
  const [landingPageCta, setLandingPageCta] =
    useState<LandingPageCtaConfig>(() => ({ ...landingPageCtaPadrao }));
  const [landingPageSeo, setLandingPageSeo] =
    useState<LandingPageSeoConfig>(() => ({ ...landingPageSeoPadrao }));
  const [landingPageOrdemSecoes, setLandingPageOrdemSecoes] =
    useState<LandingPageSecaoConteudoId[]>(() => [
      ...landingPageOrdemSecoesPadrao,
    ]);
  const [landingPageVisibilidadeSecoes, setLandingPageVisibilidadeSecoes] =
    useState<Record<LandingPageSecaoConteudoId, boolean>>(() => ({
      ...landingPageVisibilidadeSecoesPadrao,
    }));
  const [landingPageVersaoPublicada, setLandingPageVersaoPublicada] =
    useState<LandingPagePublicavelConfig>(() =>
      criarLandingPagePublicavel(criarLandingPageConfigPadrao())
    );
  const [landingPageHistoricoVersoes, setLandingPageHistoricoVersoes] =
    useState<LandingPagePublicavelConfig[]>([]);
  const [
    landingPageVersaoHistoricoVisualizada,
    setLandingPageVersaoHistoricoVisualizada,
  ] = useState<LandingPagePublicavelConfig | null>(null);
  const [storageResumo, setStorageResumo] = useState<StorageResumo | null>(null);
  const [storageCarregando, setStorageCarregando] = useState(false);
  const [storageErro, setStorageErro] = useState("");
  const [cardapioCategorias, setCardapioCategorias] =
    useState<CardapioCategoriaConfig[]>(() =>
      cardapioConfigPadrao.categorias.map((categoria) => ({ ...categoria }))
    );
  const [cardapioProdutos, setCardapioProdutos] =
    useState<CardapioProdutoConfig[]>(() =>
      cardapioConfigPadrao.produtos.map((produto) => ({ ...produto }))
    );
  const [catalogoCategorias, setCatalogoCategorias] =
    useState<CatalogoCategoriaConfig[]>(() =>
      catalogoConfigPadrao.categorias.map((categoria) => ({ ...categoria }))
    );
  const [catalogoProdutos, setCatalogoProdutos] =
    useState<CatalogoProdutoConfig[]>(() =>
      catalogoConfigPadrao.produtos.map((produto) => ({ ...produto }))
    );
  const [agendamentoServicos, setAgendamentoServicos] =
    useState<AgendamentoServicoConfig[]>(() =>
      agendamentoConfigPadrao.servicos.map((servico) => ({ ...servico }))
    );
  const [wifiMarketingConfig, setWifiMarketingConfig] =
    useState<WifiMarketingConfig>(() => ({ ...wifiMarketingConfigPadrao }));
  const [fidelidadeConfig, setFidelidadeConfig] =
    useState<FidelidadeConfig>(() => ({ ...fidelidadeConfigPadrao }));
  const [iaConfig, setIaConfig] = useState<IaConfig>(() => ({
    ...iaConfigPadrao,
    contexto: {
      ...iaConfigPadrao.contexto,
      fontes: { ...iaConfigPadrao.contexto.fontes },
    },
    baseConhecimento: {
      ...iaConfigPadrao.baseConhecimento,
      perguntasFrequentes: [
        ...iaConfigPadrao.baseConhecimento.perguntasFrequentes,
      ],
    },
    promptMestre: {
      ...iaConfigPadrao.promptMestre,
    },
  }));
  const [iaFaqRascunho, setIaFaqRascunho] = useState<IaFaqRascunho>({
    pergunta: "",
    resposta: "",
  });
  const [crmClientes, setCrmClientes] =
    useState<CrmClienteConfig[]>(() =>
      crmConfigPadrao.clientes.map((cliente) => ({ ...cliente }))
    );
  const [crmAutomacoes, setCrmAutomacoes] =
    useState<CrmAutomacaoConfig[]>(() =>
      crmConfigPadrao.automacoes.map((automacao) => ({ ...automacao }))
    );
  const [crmInteracoesRascunho, setCrmInteracoesRascunho] = useState<
    Record<string, string>
  >({});
  const [crmInteracoesOrigemRascunho, setCrmInteracoesOrigemRascunho] =
    useState<Record<string, CrmInteracaoOrigem>>({});
  const [crmTarefasRascunho, setCrmTarefasRascunho] = useState<
    Record<string, CrmTarefaRascunho>
  >({});
  const [erpPdvCategorias, setErpPdvCategorias] = useState<ErpPdvCategoria[]>(
    []
  );
  const [erpPdvProdutos, setErpPdvProdutos] = useState<ErpPdvProduto[]>([]);
  const [erpPdvMovimentacoes, setErpPdvMovimentacoes] = useState<
    ErpPdvMovimentacao[]
  >([]);
  const [erpPdvClientes, setErpPdvClientes] = useState<ErpPdvCliente[]>([]);
  const [erpPdvClienteBusca, setErpPdvClienteBusca] = useState("");
  const [erpPdvClienteSelecionadoId, setErpPdvClienteSelecionadoId] =
    useState("");
  const [erpPdvClienteForm, setErpPdvClienteForm] =
    useState<ErpPdvClienteForm>(() => ({ ...erpPdvClienteFormPadrao }));
  const [erpPdvExibirCadastroCliente, setErpPdvExibirCadastroCliente] =
    useState(false);
  const [erpPdvPdvBusca, setErpPdvPdvBusca] = useState("");
  const [erpPdvCarrinho, setErpPdvCarrinho] = useState<ErpPdvCarrinhoItem[]>(
    []
  );
  const [erpPdvOperadorVenda, setErpPdvOperadorVenda] = useState("");
  const [erpPdvFormaPagamentoVenda, setErpPdvFormaPagamentoVenda] =
    useState<ErpPdvFormaPagamento>("dinheiro");
  const [erpPdvTabelaPrecoVenda, setErpPdvTabelaPrecoVenda] =
    useState<ErpPdvTabelaPreco>("varejo");
  const [erpPdvCaixaAberto, setErpPdvCaixaAberto] =
    useState<ErpPdvCaixa | null>(null);
  const [erpPdvCaixaOperador, setErpPdvCaixaOperador] = useState("");
  const [erpPdvCaixaSaldoInicial, setErpPdvCaixaSaldoInicial] = useState("");
  const [erpPdvCaixaValorFechamento, setErpPdvCaixaValorFechamento] =
    useState("");
  const [erpPdvCaixaObservacaoFechamento, setErpPdvCaixaObservacaoFechamento] =
    useState("");
  const [erpPdvCaixaMovimentoForm, setErpPdvCaixaMovimentoForm] =
    useState<ErpPdvCaixaMovimentoForm>(() => ({
      ...erpPdvCaixaMovimentoFormPadrao,
    }));
  const [erpPdvResumoCaixa, setErpPdvResumoCaixa] =
    useState<ErpPdvCaixaResumo | null>(null);
  const [erpPdvCupomNaoFiscal, setErpPdvCupomNaoFiscal] =
    useState<ErpPdvCupomNaoFiscal | null>(null);
  const [erpPdvCupomLayout, setErpPdvCupomLayout] =
    useState<ErpPdvCupomLayout>("80mm");
  const [erpPdvImpressaoConfig, setErpPdvImpressaoConfig] =
    useState<ErpPdvImpressaoConfig>(() => ({
      ...erpPdvImpressaoConfigPadrao,
    }));
  const [erpPdvBusca, setErpPdvBusca] = useState("");
  const [erpPdvOrdenacao, setErpPdvOrdenacao] =
    useState<ErpPdvOrdenacaoProdutos>("nome");
  const [erpPdvMovimentacaoProdutoFiltro, setErpPdvMovimentacaoProdutoFiltro] =
    useState("todos");
  const [erpPdvMovimentacaoTipoFiltro, setErpPdvMovimentacaoTipoFiltro] =
    useState<ErpPdvMovimentacaoFiltroTipo>("todos");
  const [erpPdvMovimentacaoInicio, setErpPdvMovimentacaoInicio] =
    useState("");
  const [erpPdvMovimentacaoFim, setErpPdvMovimentacaoFim] = useState("");
  const [erpPdvRelatorioInicio, setErpPdvRelatorioInicio] = useState("");
  const [erpPdvRelatorioFim, setErpPdvRelatorioFim] = useState("");
  const [erpPdvRelatorioOperador, setErpPdvRelatorioOperador] = useState("");
  const [erpPdvRelatorioClienteId, setErpPdvRelatorioClienteId] =
    useState("todos");
  const [erpPdvRelatorioFormaPagamento, setErpPdvRelatorioFormaPagamento] =
    useState("todos");
  const [erpPdvRelatorio, setErpPdvRelatorio] =
    useState<ErpPdvRelatorioResumo | null>(null);
  const [erpPdvCategoriaNome, setErpPdvCategoriaNome] = useState("");
  const [erpPdvProdutoForm, setErpPdvProdutoForm] =
    useState<ErpPdvProdutoForm>(() => ({ ...erpPdvProdutoFormPadrao }));
  const [erpPdvMovimentacaoForm, setErpPdvMovimentacaoForm] =
    useState<ErpPdvMovimentacaoForm>(() => ({
      ...erpPdvMovimentacaoFormPadrao,
    }));
  const [erpPdvCarregando, setErpPdvCarregando] = useState(false);
  const [erpPdvSalvando, setErpPdvSalvando] = useState(false);
  const [erpPdvFeedback, setErpPdvFeedback] = useState<{
    tipo: "sucesso" | "erro" | "info";
    texto: string;
  } | null>(null);
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
  const [feedbackSalvamento, setFeedbackSalvamento] = useState<{
    tipo: "sucesso" | "erro" | "info";
    texto: string;
  } | null>(null);
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");

  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const [site, setSite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [kwai, setKwai] = useState("");
  const [facebook, setFacebook] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numeroEndereco, setNumeroEndereco] = useState("");
  const [complementoEndereco, setComplementoEndereco] = useState("");
  const [cepErro, setCepErro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [horarioAtendimento, setHorarioAtendimento] = useState("");
  const [horariosAtendimento, setHorariosAtendimento] =
    useState<HorariosAtendimento>(() => criarHorariosPadrao());
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  const [pix, setPix] = useState("");
  const [pixNome, setPixNome] = useState("");
  const [pixChave, setPixChave] = useState("");

  const [wifiNome, setWifiNome] = useState("");
  const [wifiSenha, setWifiSenha] = useState("");

  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [logoExibicao, setLogoExibicao] =
    useState<LogoExibicao>("normal");
  const [corPrincipal, setCorPrincipal] = useState("");
  const [corSecundaria, setCorSecundaria] = useState("");
  const [corBotoes, setCorBotoes] = useState("");
  const [corTextoBotoes, setCorTextoBotoes] = useState("");
  const [corFundoPagina, setCorFundoPagina] = useState("");
  const [corAreaPrincipal, setCorAreaPrincipal] = useState("");
  const [corFundoHero, setCorFundoHero] = useState("");
  const [suportaCorFundoHero, setSuportaCorFundoHero] = useState(false);
  const [tipoFundo, setTipoFundo] = useState<TipoFundo>("solida");
  const [gradienteInicio, setGradienteInicio] = useState("");
  const [gradienteFim, setGradienteFim] = useState("");
  const [gradienteDirecao, setGradienteDirecao] =
    useState<DirecaoGradiente>("vertical");
  const [aparenciaSalva, setAparenciaSalva] =
    useState<AparenciaConfig>(TemaPadraoMikatech);
  const categoriaSelecionada = categoriasEmpresa.includes(categoria)
    ? categoria
    : "Outra";
  const slugPublico = slugAdmin || slug;
  const aparenciaAtual: AparenciaConfig = {
    logoExibicao,
    corPrincipal,
    corSecundaria,
    corBotoes,
    corTextoBotoes,
    corFundoPagina,
    corAreaPrincipal,
    corFundoHero,
    tipoFundo,
    gradienteInicio,
    gradienteFim,
    gradienteDirecao,
  };
  const possuiAlteracoesAparencia =
    JSON.stringify(aparenciaAtual) !== JSON.stringify(aparenciaSalva);
  const erpPdvProdutosFiltrados = erpPdvProdutos
    .filter((produto) => {
      const termo = erpPdvBusca.trim().toLowerCase();

      if (!termo) return true;

      return [
        produto.nome,
        produto.sku,
        produto.codigo_barras,
      ].some((valor) => valor.toLowerCase().includes(termo));
    })
    .sort((produtoA, produtoB) => {
      if (erpPdvOrdenacao === "estoque") {
        return produtoA.estoque_atual - produtoB.estoque_atual;
      }

      if (erpPdvOrdenacao === "preco") {
        return produtoA.preco_venda - produtoB.preco_venda;
      }

      return produtoA.nome.localeCompare(produtoB.nome);
    });
  const erpPdvProdutosPorId = new Map(
    erpPdvProdutos.map((produto) => [produto.id, produto])
  );
  const erpPdvClientesPorId = new Map(
    erpPdvClientes.map((clienteErp) => [clienteErp.id, clienteErp])
  );
  const erpPdvClienteSelecionado =
    erpPdvClientesPorId.get(erpPdvClienteSelecionadoId) || null;
  const erpPdvClienteTermoBusca = erpPdvClienteBusca.trim().toLowerCase();
  const erpPdvClientesEncontrados = erpPdvClienteTermoBusca
    ? erpPdvClientes
        .filter((clienteErp) =>
          [
            clienteErp.nome,
            clienteErp.cpf_cnpj,
            clienteErp.telefone,
            clienteErp.whatsapp,
          ].some((valor) => valor.toLowerCase().includes(erpPdvClienteTermoBusca))
        )
        .slice(0, 6)
    : erpPdvClientes.slice(0, 6);
  const erpPdvPdvTermoBusca = erpPdvPdvBusca.trim().toLowerCase();
  const erpPdvPdvProdutosEncontrados = erpPdvPdvTermoBusca
    ? erpPdvProdutos
        .filter((produto) => {
          if (!produto.ativo) return false;

          return [
            produto.nome,
            produto.sku,
            produto.codigo_barras,
          ].some((valor) =>
            valor.toLowerCase().includes(erpPdvPdvTermoBusca)
          );
        })
        .slice(0, 8)
    : erpPdvProdutos.filter((produto) => produto.ativo).slice(0, 8);
  const erpPdvCarrinhoDetalhado = erpPdvCarrinho
    .map((item) => {
      const produto = erpPdvProdutosPorId.get(item.produtoId);

      if (!produto) return null;

      const quantidade = Number.isFinite(item.quantidade)
        ? Math.max(0, item.quantidade)
        : 0;
      const precoUnitario = obterPrecoProdutoPorTabelaErpPdv(
        produto,
        erpPdvTabelaPrecoVenda
      );

      return {
        produto,
        quantidade,
        precoUnitario,
        tabelaPreco: erpPdvTabelaPrecoVenda,
        subtotal: precoUnitario * quantidade,
      };
    })
    .filter(
      (
        item
      ): item is {
        produto: ErpPdvProduto;
        quantidade: number;
        precoUnitario: number;
        tabelaPreco: ErpPdvTabelaPreco;
        subtotal: number;
      } => Boolean(item)
    );
  const erpPdvCarrinhoTotal = erpPdvCarrinhoDetalhado.reduce(
    (total, item) => total + item.subtotal,
    0
  );
  const erpPdvCarrinhoQuantidadeItens = erpPdvCarrinhoDetalhado.reduce(
    (total, item) => total + item.quantidade,
    0
  );
  const erpPdvProdutoFormCusto = parseNumeroErpPdv(erpPdvProdutoForm.custo);
  const erpPdvProdutoFormPercentual = parseNumeroErpPdv(
    erpPdvProdutoForm.percentualPreco
  );
  const erpPdvProdutoFormPrecoCalculado =
    erpPdvProdutoForm.formacaoPrecoTipo === "percentual_custo"
      ? calcularPrecoPorPercentualErpPdv(
          erpPdvProdutoFormCusto,
          erpPdvProdutoFormPercentual
        )
      : parseNumeroErpPdv(erpPdvProdutoForm.precoVenda);
  const erpPdvProdutoFormIndicadores = calcularIndicadoresPrecoErpPdv(
    erpPdvProdutoFormCusto,
    erpPdvProdutoFormPrecoCalculado
  );
  const erpPdvProdutoMovimentacaoSelecionado = erpPdvProdutosPorId.get(
    erpPdvMovimentacaoForm.produtoId
  );
  const erpPdvMovimentacoesFiltradas = erpPdvMovimentacoes.filter(
    (movimentacao) => {
      if (
        erpPdvMovimentacaoProdutoFiltro !== "todos" &&
        movimentacao.produto_id !== erpPdvMovimentacaoProdutoFiltro
      ) {
        return false;
      }

      if (
        erpPdvMovimentacaoTipoFiltro !== "todos" &&
        movimentacao.tipo !== erpPdvMovimentacaoTipoFiltro
      ) {
        return false;
      }

      const dataMovimentacao = new Date(movimentacao.created_at);

      if (erpPdvMovimentacaoInicio) {
        const inicio = new Date(`${erpPdvMovimentacaoInicio}T00:00:00`);
        if (dataMovimentacao < inicio) return false;
      }

      if (erpPdvMovimentacaoFim) {
        const fim = new Date(`${erpPdvMovimentacaoFim}T23:59:59`);
        if (dataMovimentacao > fim) return false;
      }

      return true;
    }
  );
  const erpPdvPilotoMikatech = slugPublico === "mikatech";

  useEffect(() => {
    console.log("[Diagnóstico UPDATE] ID recebido no EmpresaForm:", {
      empresaInicialId,
      empresaInicialSlug,
    });

    carregarEmpresa({
      id: empresaInicialId,
      slug: empresaInicialSlug || "mikatech",
    });
  }, [empresaInicialId, empresaInicialSlug]);

  async function carregarEmpresa(empresa: { id?: string; slug: string }) {
    console.log("[Diagnóstico UPDATE] Carregando empresa para edição:", empresa);

    const { data, error } = empresa.id
      ? await buscarEmpresaPorId(empresa.id)
      : await buscarEmpresaPorSlug(empresa.slug);

    console.log("[Diagnóstico UPDATE] Resultado do SELECT no EmpresaForm:", {
      filtroUsado: empresa.id
        ? `id = ${empresa.id}`
        : `slug = ${empresa.slug}`,
      data,
      error,
    });

    if (error) {
      console.error("Erro ao carregar empresa:", error);
      return;
    }

    if (!data) return;

    setEmpresaId(data.id);
    setSlug(data.slug || "");
    setSlugAdmin(data.slug || "");

    const dadosComPlano = data as typeof data & {
      plano?: string | null;
      recursos_contratados?: unknown;
      landing_page_config?: unknown;
      cardapio_config?: unknown;
      catalogo_config?: unknown;
      agendamento_config?: unknown;
      wifi_marketing_config?: unknown;
      fidelidade_config?: unknown;
      ia_config?: unknown;
      crm_config?: unknown;
      erp_pdv_config?: unknown;
    };
    const landingPageConfig = normalizarLandingPageConfig(
      dadosComPlano.landing_page_config
    );
    const cardapioConfig = normalizarCardapioConfig(
      dadosComPlano.cardapio_config
    );
    const catalogoConfig = normalizarCatalogoConfig(
      dadosComPlano.catalogo_config
    );
    const agendamentoConfig = normalizarAgendamentoConfig(
      dadosComPlano.agendamento_config
    );
    const wifiMarketingConfigCarregado = normalizarWifiMarketingConfig(
      dadosComPlano.wifi_marketing_config
    );
    const fidelidadeConfigCarregado = normalizarFidelidadeConfig(
      dadosComPlano.fidelidade_config
    );
    const iaConfigCarregado = normalizarIaConfig(dadosComPlano.ia_config);
    const crmConfigCarregado = normalizarCrmConfig(dadosComPlano.crm_config);
    const erpPdvConfigCarregado = normalizarErpPdvConfig(
      dadosComPlano.erp_pdv_config
    );

    setNome(data.nome || "");
    setTipoGerenciamento(data.tipo || "mikatech");
    setPlano(normalizarPlano(dadosComPlano.plano));
    setRecursosContratados(
      normalizarRecursos(dadosComPlano.recursos_contratados)
    );
    setErpPdvImpressaoConfig(erpPdvConfigCarregado);
    setErpPdvCupomLayout(erpPdvConfigCarregado.largura);
    setLandingPagePlaceholderAberto(false);
    setLandingPagePublicada(landingPageConfig.publicada);
    setLandingPageSecaoAtiva("templates");
    setLandingPageHero(landingPageConfig.hero);
    setLandingPageSobre(landingPageConfig.sobre);
    setLandingPageServicos(landingPageConfig.servicos);
    setLandingPageGaleria(landingPageConfig.galeria);
    setLandingPageDepoimentos(landingPageConfig.depoimentos);
    setLandingPageVideos(landingPageConfig.videos);
    setLandingPageAudios(landingPageConfig.audios);
    setLandingPageProdutosDigitais(landingPageConfig.produtosDigitais);
    setLandingPageCategoriasProdutosDigitais(
      landingPageConfig.categoriasProdutosDigitais
    );
    setLandingPageContato(landingPageConfig.contato);
    setLandingPageFormularioContato(landingPageConfig.formularioContato);
    setLandingPageCta(landingPageConfig.cta);
    setLandingPageSeo(landingPageConfig.seo);
    setLandingPageOrdemSecoes(landingPageConfig.ordemSecoes);
    setLandingPageVisibilidadeSecoes(landingPageConfig.visibilidadeSecoes);
    setLandingPageVersaoPublicada(
      landingPageConfig.versaoPublicada ||
        criarLandingPagePublicavel(landingPageConfig)
    );
    setLandingPageHistoricoVersoes(landingPageConfig.historicoVersoes);
    setLandingPageVersaoHistoricoVisualizada(null);
    setCardapioCategorias(cardapioConfig.categorias);
    setCardapioProdutos(cardapioConfig.produtos);
    setCatalogoCategorias(catalogoConfig.categorias);
    setCatalogoProdutos(catalogoConfig.produtos);
    setAgendamentoServicos(agendamentoConfig.servicos);
    setWifiMarketingConfig(wifiMarketingConfigCarregado);
    setFidelidadeConfig(fidelidadeConfigCarregado);
    setIaConfig(iaConfigCarregado);
    setCrmClientes(crmConfigCarregado.clientes);
    setCrmAutomacoes(crmConfigCarregado.automacoes);
    setErpPdvFeedback(null);
    setErpPdvProdutoForm({ ...erpPdvProdutoFormPadrao });
    setErpPdvBusca("");
    carregarErpPdvDados(data.id);
    setCategoria(data.categoria || "");
    setDescricao(data.descricao || "");

    setTelefone(formatarTelefone(data.telefone || ""));
    setWhatsapp(formatarTelefone(data.whatsapp || ""));
    setEmail(data.email || "");

    setSite(data.site || "");
    setInstagram(normalizarUsuarioRedeSocial(data.instagram || ""));
    setTiktok(normalizarUsuarioRedeSocial(data.tiktok || ""));
    setYoutube(normalizarUsuarioRedeSocial(data.youtube || ""));
    setKwai(normalizarUsuarioRedeSocial(data.kwai || ""));
    setFacebook(normalizarUsuarioRedeSocial(data.facebook || ""));
    setEndereco(data.endereco || "");
    setHorarioAtendimento(data.horario_atendimento || "");
    const horarioCarregado = lerTextoHorario(data.horario_atendimento || "");

    if (horarioCarregado) {
      setHorariosAtendimento(horarioCarregado);
    }

    setGoogleReviewUrl(data.google_review_url || "");

    setPix(data.pix || "");
    setPixNome(data.pix_nome || "");
    setPixChave(data.pix_chave || "");

    setWifiNome(data.wifi_nome || "");
    setWifiSenha(data.wifi_senha || "");

    setLogo(data.logo || "");
    setBanner(data.banner || "");
    setLogoExibicao(data.logo_exibicao === "hidden" ? "hidden" : "normal");
    const dadosComAparencia = data as typeof data & {
      cor_fundo_hero?: string | null;
    };
    const possuiColunaCorFundoHero = "cor_fundo_hero" in dadosComAparencia;
    const aparenciaCarregada: AparenciaConfig = {
      logoExibicao: data.logo_exibicao === "hidden" ? "hidden" : "normal",
      corPrincipal: data.cor_principal || TemaPadraoMikatech.corPrincipal,
      corSecundaria: data.cor_secundaria || TemaPadraoMikatech.corSecundaria,
      corBotoes: data.cor_botoes || TemaPadraoMikatech.corBotoes,
      corTextoBotoes: data.cor_texto_botoes || TemaPadraoMikatech.corTextoBotoes,
      corFundoPagina: data.cor_fundo_pagina || TemaPadraoMikatech.corFundoPagina,
      corAreaPrincipal: data.cor_area_principal || TemaPadraoMikatech.corAreaPrincipal,
      corFundoHero:
        dadosComAparencia.cor_fundo_hero ||
        data.cor_fundo_pagina ||
        TemaPadraoMikatech.corFundoHero,
      tipoFundo: data.tipo_fundo === "gradiente" ? "gradiente" : "solida",
      gradienteInicio: data.gradiente_inicio || "",
      gradienteFim: data.gradiente_fim || "",
      gradienteDirecao: ["horizontal", "vertical", "diagonal"].includes(data.gradiente_direcao)
        ? data.gradiente_direcao
        : "vertical",
    };

    setCorPrincipal(aparenciaCarregada.corPrincipal);
    setCorSecundaria(aparenciaCarregada.corSecundaria);
    setCorBotoes(aparenciaCarregada.corBotoes);
    setCorTextoBotoes(aparenciaCarregada.corTextoBotoes);
    setCorFundoPagina(aparenciaCarregada.corFundoPagina);
    setCorAreaPrincipal(aparenciaCarregada.corAreaPrincipal);
    setCorFundoHero(aparenciaCarregada.corFundoHero);
    setSuportaCorFundoHero(possuiColunaCorFundoHero);
    setTipoFundo(aparenciaCarregada.tipoFundo);
    setGradienteInicio(aparenciaCarregada.gradienteInicio);
    setGradienteFim(aparenciaCarregada.gradienteFim);
    setGradienteDirecao(aparenciaCarregada.gradienteDirecao);
    setLogoExibicao(aparenciaCarregada.logoExibicao);
    setAparenciaSalva(aparenciaCarregada);
    onEmpresaAtualChange?.({
      nome: data.nome || "",
      logo: data.logo || "",
    });
  }

  async function carregarResumoStorage() {
    try {
      setStorageCarregando(true);
      setStorageErro("");

      const resumo = await obterResumoStorageEmpresas();
      setStorageResumo(resumo);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar o resumo de Storage.";

      setStorageErro(mensagem);
    } finally {
      setStorageCarregando(false);
    }
  }

  async function carregarErpPdvDados(empresaIdAtual = empresaId) {
    if (!empresaIdAtual) return;

    try {
      setErpPdvCarregando(true);
      setErpPdvFeedback(null);

      const [
        categoriasResultado,
        produtosResultado,
        movimentacoesResultado,
        clientesResultado,
        caixaResultado,
      ] = await Promise.all([
        listarErpPdvCategorias(empresaIdAtual),
        listarErpPdvProdutos(empresaIdAtual),
        listarErpPdvMovimentacoes(empresaIdAtual),
        listarErpPdvClientes(empresaIdAtual),
        buscarErpPdvCaixaAberto(empresaIdAtual),
      ]);

      if (categoriasResultado.error) throw categoriasResultado.error;
      if (produtosResultado.error) throw produtosResultado.error;
      if (movimentacoesResultado.error) throw movimentacoesResultado.error;
      if (clientesResultado.error) throw clientesResultado.error;
      if (caixaResultado.error) throw caixaResultado.error;

      setErpPdvCategorias(categoriasResultado.data);
      setErpPdvProdutos(produtosResultado.data);
      setErpPdvMovimentacoes(movimentacoesResultado.data);
      setErpPdvClientes(clientesResultado.data);
      setErpPdvCaixaAberto(caixaResultado.data);
      setErpPdvCaixaOperador(caixaResultado.data?.operador || "");

      if (caixaResultado.data) {
        const resumoResultado = await calcularErpPdvResumoCaixa(caixaResultado.data);
        if (resumoResultado.error) throw resumoResultado.error;
        setErpPdvResumoCaixa(resumoResultado.data);
        setErpPdvCaixaValorFechamento(
          formatarNumeroErpPdv(resumoResultado.data?.totalEsperado || 0)
        );
      } else {
        setErpPdvResumoCaixa(null);
        setErpPdvCaixaValorFechamento("");
      }

      await carregarRelatorioErpPdv(empresaIdAtual);
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar o ERP/PDV.";

      setErpPdvFeedback({
        tipo: "erro",
        texto: mensagem,
      });
    } finally {
      setErpPdvCarregando(false);
    }
  }

  useEffect(() => {
    if (modoCliente || abaAtiva !== "plano" || storageResumo || storageCarregando) {
      return;
    }

    carregarResumoStorage();
  }, [abaAtiva, modoCliente, storageResumo, storageCarregando]);

  function montarEnderecoCompleto(
    ruaAtual = rua,
    bairroAtual = bairro,
    cidadeAtual = cidade,
    estadoAtual = estado,
    numeroAtual = numeroEndereco,
    complementoAtual = complementoEndereco
  ) {
    return [
      [ruaAtual, numeroAtual].filter(Boolean).join(", "),
      complementoAtual,
      bairroAtual,
      [cidadeAtual, estadoAtual].filter(Boolean).join(" - "),
    ]
      .filter(Boolean)
      .join(" - ");
  }

  useEffect(() => {
    const cepNumerico = cep.replace(/\D/g, "");

    if (cepNumerico.length !== 8) {
      setCepErro("");
      return;
    }

    async function buscarCep() {
      try {
        setBuscandoCep(true);
        setCepErro("");

        const resposta = await fetch(
          `https://viacep.com.br/ws/${cepNumerico}/json/`
        );
        const dados = await resposta.json();

        if (dados.erro) {
        setCepErro("CEP não encontrado.");
          return;
        }

        const novaRua = dados.logradouro || "";
        const novoBairro = dados.bairro || "";
        const novaCidade = dados.localidade || "";
        const novoEstado = dados.uf || "";

        setRua(novaRua);
        setBairro(novoBairro);
        setCidade(novaCidade);
        setEstado(novoEstado);
        setEndereco(
          montarEnderecoCompleto(
            novaRua,
            novoBairro,
            novaCidade,
            novoEstado
          )
        );
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        setCepErro("Não foi possível buscar este CEP.");
      } finally {
        setBuscandoCep(false);
      }
    }

    buscarCep();
  }, [cep]);

  useEffect(() => {
    if (!rua && !bairro && !cidade && !estado) return;

    setEndereco(montarEnderecoCompleto());
  }, [numeroEndereco, complementoEndereco]);

  function atualizarHorarioDia(
    diaId: string,
    campo: keyof HorarioDia,
    valor: boolean | string
  ) {
    const novosHorarios = {
      ...horariosAtendimento,
      [diaId]: {
        ...horariosAtendimento[diaId],
        [campo]: valor,
      },
    };

    setHorariosAtendimento(novosHorarios);
    setHorarioAtendimento(gerarTextoHorario(novosHorarios));
  }

  function alternarRecurso(recursoId: RecursoEmpresaId) {
    setRecursosContratados((recursosAtuais) => ({
      ...recursosAtuais,
      [recursoId]: !recursosAtuais[recursoId],
    }));
  }

  function atualizarLandingPageHero(
    campo: keyof LandingPageHeroConfig,
    valor: string
  ) {
    setLandingPageHero((heroAtual) => ({
      ...heroAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageSobre(
    campo: keyof LandingPageSobreConfig,
    valor: string
  ) {
    setLandingPageSobre((sobreAtual) => ({
      ...sobreAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageServico(
    indice: number,
    campo: keyof LandingPageServicoConfig,
    valor: string
  ) {
    setLandingPageServicos((servicosAtuais) =>
      servicosAtuais.map((servico, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...servico,
              [campo]: valor,
            }
          : servico
      )
    );
  }

  function adicionarLandingPageServico() {
    setLandingPageServicos((servicosAtuais) => {
      if (servicosAtuais.length >= 6) return servicosAtuais;

      return [
        ...servicosAtuais,
        {
          titulo: "",
          descricao: "",
        },
      ];
    });
  }

  function removerLandingPageServico(indice: number) {
    setLandingPageServicos((servicosAtuais) => {
      if (servicosAtuais.length <= 1) return servicosAtuais;

      return servicosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function atualizarLandingPageGaleriaImagem(
    indice: number,
    campo: keyof LandingPageGaleriaImagemConfig,
    valor: string
  ) {
    setLandingPageGaleria((galeriaAtual) =>
      galeriaAtual.map((imagem, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...imagem,
              [campo]: valor,
            }
          : imagem
      )
    );
  }

  function adicionarLandingPageGaleriaImagem() {
    setLandingPageGaleria((galeriaAtual) => {
      if (galeriaAtual.length >= 6) return galeriaAtual;

      return [
        ...galeriaAtual,
        {
          url: "",
          alt: "",
        },
      ];
    });
  }

  function removerLandingPageGaleriaImagem(indice: number) {
    setLandingPageGaleria((galeriaAtual) => {
      if (galeriaAtual.length <= 1) return galeriaAtual;

      return galeriaAtual.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function atualizarLandingPageDepoimento(
    indice: number,
    campo: keyof LandingPageDepoimentoConfig,
    valor: string
  ) {
    setLandingPageDepoimentos((depoimentosAtuais) =>
      depoimentosAtuais.map((depoimento, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...depoimento,
              [campo]: valor,
            }
          : depoimento
      )
    );
  }

  function adicionarLandingPageDepoimento() {
    setLandingPageDepoimentos((depoimentosAtuais) => {
      if (depoimentosAtuais.length >= 6) return depoimentosAtuais;

      return [
        ...depoimentosAtuais,
        {
          nome: "",
          cargoEmpresa: "",
          texto: "",
        },
      ];
    });
  }

  function removerLandingPageDepoimento(indice: number) {
    setLandingPageDepoimentos((depoimentosAtuais) => {
      if (depoimentosAtuais.length <= 1) return depoimentosAtuais;

      return depoimentosAtuais.filter(
        (_, indiceAtual) => indiceAtual !== indice
      );
    });
  }

  function atualizarLandingPageVideo(
    indice: number,
    campo: keyof LandingPageVideoConfig,
    valor: string | boolean
  ) {
    setLandingPageVideos((videosAtuais) =>
      videosAtuais.map((video, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...video,
              [campo]: valor,
            }
          : video
      )
    );
  }

  function adicionarLandingPageVideo() {
    setLandingPageVideos((videosAtuais) => {
      if (videosAtuais.length >= 8) return videosAtuais;

      return [
        ...videosAtuais,
        { ...landingPageVideosPadrao[0] },
      ];
    });
  }

  function removerLandingPageVideo(indice: number) {
    setLandingPageVideos((videosAtuais) => {
      if (videosAtuais.length <= 1) return videosAtuais;

      return videosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverLandingPageVideo(indice: number, direcao: "up" | "down") {
    setLandingPageVideos((videosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= videosAtuais.length) {
        return videosAtuais;
      }

      const videosOrdenados = [...videosAtuais];
      const [videoMovido] = videosOrdenados.splice(indice, 1);
      videosOrdenados.splice(novoIndice, 0, videoMovido);

      return videosOrdenados;
    });
  }

  function atualizarLandingPageAudio(
    indice: number,
    campo: keyof LandingPageAudioConfig,
    valor: string | boolean
  ) {
    setLandingPageAudios((audiosAtuais) =>
      audiosAtuais.map((audio, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...audio,
              [campo]: valor,
            }
          : audio
      )
    );
  }

  function adicionarLandingPageAudio() {
    setLandingPageAudios((audiosAtuais) => {
      if (audiosAtuais.length >= 10) return audiosAtuais;

      return [
        ...audiosAtuais,
        { ...landingPageAudiosPadrao[0] },
      ];
    });
  }

  function removerLandingPageAudio(indice: number) {
    setLandingPageAudios((audiosAtuais) => {
      if (audiosAtuais.length <= 1) return audiosAtuais;

      return audiosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverLandingPageAudio(indice: number, direcao: "up" | "down") {
    setLandingPageAudios((audiosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= audiosAtuais.length) {
        return audiosAtuais;
      }

      const audiosOrdenados = [...audiosAtuais];
      const [audioMovido] = audiosOrdenados.splice(indice, 1);
      audiosOrdenados.splice(novoIndice, 0, audioMovido);

      return audiosOrdenados;
    });
  }

  function atualizarLandingPageProdutoDigital(
    indice: number,
    campo: keyof LandingPageProdutoDigitalConfig,
    valor: string | boolean
  ) {
    setLandingPageProdutosDigitais((produtosAtuais) =>
      produtosAtuais.map((produto, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...produto,
              [campo]: valor,
            }
          : produto
      )
    );
  }

  function adicionarLandingPageProdutoDigital() {
    setLandingPageProdutosDigitais((produtosAtuais) => {
      if (produtosAtuais.length >= 20) return produtosAtuais;

      return [
        ...produtosAtuais,
        { ...landingPageProdutosDigitaisPadrao[0] },
      ];
    });
  }

  function removerLandingPageProdutoDigital(indice: number) {
    setLandingPageProdutosDigitais((produtosAtuais) => {
      if (produtosAtuais.length <= 1) return produtosAtuais;

      return produtosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverLandingPageProdutoDigital(
    indice: number,
    direcao: "up" | "down"
  ) {
    setLandingPageProdutosDigitais((produtosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= produtosAtuais.length) {
        return produtosAtuais;
      }

      const produtosOrdenados = [...produtosAtuais];
      const [produtoMovido] = produtosOrdenados.splice(indice, 1);
      produtosOrdenados.splice(novoIndice, 0, produtoMovido);

      return produtosOrdenados;
    });
  }

  function adicionarLandingPageProdutoCategoria(categoria: string) {
    const categoriaNormalizada = categoria.trim();

    if (!categoriaNormalizada) return;

    setLandingPageCategoriasProdutosDigitais((categoriasAtuais) => {
      const categoriaJaExiste = categoriasAtuais.some(
        (categoriaAtual) =>
          categoriaAtual.toLowerCase() === categoriaNormalizada.toLowerCase()
      );

      if (categoriaJaExiste) {
        return categoriasAtuais;
      }

      return [...categoriasAtuais, categoriaNormalizada];
    });
  }

  function removerLandingPageProdutoCategoria(categoria: string) {
    if (
      !window.confirm(
        `Remover a categoria "${categoria}"? Os produtos vinculados ficarao sem categoria.`
      )
    ) {
      return;
    }

    setLandingPageCategoriasProdutosDigitais((categoriasAtuais) =>
      categoriasAtuais.filter((categoriaAtual) => categoriaAtual !== categoria)
    );
    setLandingPageProdutosDigitais((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.categoria === categoria
          ? {
              ...produto,
              categoria: "",
            }
          : produto
      )
    );
  }

  function atualizarLandingPageContato(
    campo: keyof LandingPageContatoConfig,
    valor: string
  ) {
    setLandingPageContato((contatoAtual) => ({
      ...contatoAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageFormularioContato(
    campo: LandingPageFormularioCampoId,
    propriedade: keyof LandingPageFormularioCampoConfig,
    valor: boolean
  ) {
    setLandingPageFormularioContato((formularioAtual) => ({
      ...formularioAtual,
      [campo]: {
        ...formularioAtual[campo],
        [propriedade]: valor,
      },
    }));
  }

  function atualizarLandingPageCta(
    campo: keyof LandingPageCtaConfig,
    valor: string
  ) {
    setLandingPageCta((ctaAtual) => ({
      ...ctaAtual,
      [campo]: valor,
    }));
  }

  function atualizarLandingPageSeo(
    campo: keyof LandingPageSeoConfig,
    valor: string
  ) {
    setLandingPageSeo((seoAtual) => ({
      ...seoAtual,
      [campo]: valor,
    }));
  }

  function landingPageTemplatePodeSobrescrever() {
    const heroPreenchido = Object.values(landingPageHero).some((valor) =>
      valor.trim()
    );
    const sobrePreenchido = Object.values(landingPageSobre).some((valor) =>
      valor.trim()
    );
    const servicosPreenchidos = landingPageServicos.some((servico) =>
      Object.values(servico).some((valor) => valor.trim())
    );
    const ctaPreenchido = Object.values(landingPageCta).some((valor) =>
      valor.trim()
    );

    return heroPreenchido || sobrePreenchido || servicosPreenchidos || ctaPreenchido;
  }

  function aplicarLandingPageTemplate(template: LandingPageTemplateConfig) {
    const possuiDados = landingPageTemplatePodeSobrescrever();
    const mensagem = possuiDados
      ? `Aplicar o template "${template.nome}" vai substituir os dados atuais de Hero, Sobre, Servicos e CTA. Deseja continuar?`
      : `Deseja aplicar o template "${template.nome}" na Landing Page?`;

    if (!window.confirm(mensagem)) return;

    setLandingPageHero({ ...template.hero });
    setLandingPageSobre({ ...template.sobre });
    setLandingPageServicos(template.servicos.map((servico) => ({ ...servico })));
    setLandingPageCta({ ...template.cta });
    setLandingPageSecaoAtiva("hero");
  }

  function moverLandingPageSecao(
    secao: LandingPageSecaoConteudoId,
    direcao: "up" | "down"
  ) {
    setLandingPageOrdemSecoes((ordemAtual) => {
      const indiceAtual = ordemAtual.indexOf(secao);
      const novoIndice = direcao === "up" ? indiceAtual - 1 : indiceAtual + 1;

      if (
        indiceAtual < 0 ||
        novoIndice < 0 ||
        novoIndice >= ordemAtual.length
      ) {
        return ordemAtual;
      }

      const novaOrdem = [...ordemAtual];
      const [secaoMovida] = novaOrdem.splice(indiceAtual, 1);
      novaOrdem.splice(novoIndice, 0, secaoMovida);

      return novaOrdem;
    });
  }

  function atualizarLandingPageSecaoVisibilidade(
    secao: LandingPageSecaoConteudoId,
    visivel: boolean
  ) {
    setLandingPageVisibilidadeSecoes((visibilidadeAtual) => ({
      ...visibilidadeAtual,
      [secao]: visivel,
    }));
  }

  function montarLandingPageRascunho(): LandingPagePublicavelConfig {
    return {
      publicada: landingPagePublicada,
      hero: landingPageHero,
      sobre: landingPageSobre,
      servicos: landingPageServicos.slice(0, 6),
      galeria: landingPageGaleria.slice(0, 6),
      depoimentos: landingPageDepoimentos.slice(0, 6),
      videos: landingPageVideos.slice(0, 8),
      audios: landingPageAudios.slice(0, 10),
      produtosDigitais: landingPageProdutosDigitais.slice(0, 20),
      categoriasProdutosDigitais: landingPageCategoriasProdutosDigitais,
      contato: landingPageContato,
      formularioContato: landingPageFormularioContato,
      cta: landingPageCta,
      seo: landingPageSeo,
      ordemSecoes: landingPageOrdemSecoes,
      visibilidadeSecoes: landingPageVisibilidadeSecoes,
    };
  }

  function montarLandingPageConfig(
    versaoPublicada = landingPageVersaoPublicada,
    historicoVersoes = landingPageHistoricoVersoes
  ): LandingPageConfig {
    const rascunho = montarLandingPageRascunho();

    return {
      ...rascunho,
      versaoPublicada,
      alteracoesNaoPublicadas:
        JSON.stringify(rascunho) !== JSON.stringify(versaoPublicada),
      historicoVersoes,
    };
  }

  function aplicarLandingPagePublicavel(config: LandingPagePublicavelConfig) {
    setLandingPagePublicada(config.publicada);
    setLandingPageHero(config.hero);
    setLandingPageSobre(config.sobre);
    setLandingPageServicos(config.servicos);
    setLandingPageGaleria(config.galeria);
    setLandingPageDepoimentos(config.depoimentos);
    setLandingPageVideos(config.videos);
    setLandingPageAudios(config.audios);
    setLandingPageProdutosDigitais(config.produtosDigitais);
    setLandingPageCategoriasProdutosDigitais(config.categoriasProdutosDigitais);
    setLandingPageContato(config.contato);
    setLandingPageFormularioContato(config.formularioContato);
    setLandingPageCta(config.cta);
    setLandingPageSeo(config.seo);
    setLandingPageOrdemSecoes(config.ordemSecoes);
    setLandingPageVisibilidadeSecoes(config.visibilidadeSecoes);
  }

  function atualizarErpPdvProdutoForm(
    campo: keyof ErpPdvProdutoForm,
    valor: string | boolean
  ) {
    setErpPdvProdutoForm((formAtual) => {
      const proximoForm = {
        ...formAtual,
        [campo]: valor,
      };

      if (
        proximoForm.formacaoPrecoTipo === "percentual_custo" &&
        (campo === "custo" ||
          campo === "percentualPreco" ||
          campo === "formacaoPrecoTipo")
      ) {
        const precoCalculado = calcularPrecoPorPercentualErpPdv(
          parseNumeroErpPdv(proximoForm.custo),
          parseNumeroErpPdv(proximoForm.percentualPreco)
        );

        proximoForm.precoVenda = formatarNumeroErpPdv(precoCalculado);
      }

      return proximoForm;
    });
  }

  function atualizarErpPdvMovimentacaoForm(
    campo: keyof ErpPdvMovimentacaoForm,
    valor: string
  ) {
    setErpPdvMovimentacaoForm((formAtual) => ({
      ...formAtual,
      [campo]: valor,
    }));
  }

  function atualizarErpPdvImpressaoConfig(
    campo: keyof ErpPdvImpressaoConfig,
    valor: string | boolean | number
  ) {
    setErpPdvImpressaoConfig((configAtual) => ({
      ...configAtual,
      [campo]: valor,
    }));

    if (campo === "largura") {
      setErpPdvCupomLayout(valor as ErpPdvCupomLayout);
    }
  }

  function montarErpPdvConfig(): ErpPdvImpressaoConfig {
    return {
      ...erpPdvImpressaoConfig,
      nomeImpressora: erpPdvImpressaoConfig.nomeImpressora.trim(),
      marca: erpPdvImpressaoConfig.marca.trim(),
      modelo: erpPdvImpressaoConfig.modelo.trim(),
      numeroVias: Math.min(
        Math.max(Number(erpPdvImpressaoConfig.numeroVias) || 1, 1),
        5
      ),
      conectorLocalPreparado: true,
    };
  }

  function limparErpPdvProdutoForm() {
    setErpPdvProdutoForm({ ...erpPdvProdutoFormPadrao });
  }

  function editarErpPdvProduto(produto: ErpPdvProduto) {
    setErpPdvProdutoForm(criarErpPdvProdutoForm(produto));
    setErpPdvFeedback({
      tipo: "info",
      texto: "Produto carregado para edicao.",
    });
  }

  function adicionarProdutoAoCarrinhoErpPdv(produto: ErpPdvProduto) {
    if (!produto.ativo) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Produto inativo nao pode ser adicionado ao carrinho.",
      });
      return;
    }

    if (produto.estoque_atual <= 0) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Produto sem estoque disponivel para o PDV.",
      });
      return;
    }

    setErpPdvCarrinho((itensAtuais) => {
      const itemAtual = itensAtuais.find(
        (item) => item.produtoId === produto.id
      );

      if (itemAtual) {
        return itensAtuais.map((item) =>
          item.produtoId === produto.id
            ? {
                ...item,
                quantidade: Math.min(item.quantidade + 1, produto.estoque_atual),
              }
            : item
        );
      }

      return [
        ...itensAtuais,
        {
          produtoId: produto.id,
          quantidade: 1,
        },
      ];
    });
    setErpPdvPdvBusca("");
    setErpPdvFeedback({
      tipo: "sucesso",
      texto: "Produto adicionado ao carrinho.",
    });
  }

  function adicionarProdutoDaBuscaErpPdv() {
    const produtoEncontrado = erpPdvPdvProdutosEncontrados[0];

    if (!produtoEncontrado) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Nenhum produto encontrado para adicionar ao carrinho.",
      });
      return;
    }

    adicionarProdutoAoCarrinhoErpPdv(produtoEncontrado);
  }

  function atualizarQuantidadeCarrinhoErpPdv(
    produto: ErpPdvProduto,
    valor: string
  ) {
    const quantidade = parseNumeroErpPdv(valor);

    if (quantidade <= 0) {
      setErpPdvCarrinho((itensAtuais) =>
        itensAtuais.filter((item) => item.produtoId !== produto.id)
      );
      return;
    }

    setErpPdvCarrinho((itensAtuais) =>
      itensAtuais.map((item) =>
        item.produtoId === produto.id
          ? {
              ...item,
              quantidade: Math.min(quantidade, produto.estoque_atual),
            }
          : item
      )
    );
  }

  function removerItemCarrinhoErpPdv(produtoId: string) {
    setErpPdvCarrinho((itensAtuais) =>
      itensAtuais.filter((item) => item.produtoId !== produtoId)
    );
  }

  function limparCarrinhoErpPdv() {
    setErpPdvCarrinho([]);
    setErpPdvFeedback({
      tipo: "info",
      texto: "Carrinho limpo.",
    });
  }

  function cancelarVendaErpPdv() {
    setErpPdvCarrinho([]);
    setErpPdvPdvBusca("");
    setErpPdvFeedback({
      tipo: "info",
      texto: "Venda cancelada antes da finalizacao. Nenhum registro foi gravado.",
    });
  }

  async function atualizarResumoCaixaErpPdv(caixa = erpPdvCaixaAberto) {
    if (!caixa) {
      setErpPdvResumoCaixa(null);
      return;
    }

    const { data, error } = await calcularErpPdvResumoCaixa(caixa);
    if (error) throw error;

    setErpPdvResumoCaixa(data);
    setErpPdvCaixaValorFechamento(
      formatarNumeroErpPdv(data?.totalEsperado || 0)
    );
  }

  async function abrirCaixaErpPdv() {
    if (!empresaId) return;

    try {
      setErpPdvSalvando(true);

      const { data, error } = await abrirErpPdvCaixa({
        empresaId,
        operador: erpPdvCaixaOperador,
        saldoInicial: parseNumeroErpPdv(erpPdvCaixaSaldoInicial),
      });

      if (error) throw error;
      if (!data) throw new Error("Caixa nao retornado pelo Supabase.");

      setErpPdvCaixaAberto(data);
      setErpPdvOperadorVenda(data.operador);
      setErpPdvCaixaSaldoInicial("");
      await atualizarResumoCaixaErpPdv(data);
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Caixa aberto. PDV liberado para vendas.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel abrir o caixa.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function registrarMovimentoCaixaErpPdv() {
    if (!empresaId || !erpPdvCaixaAberto) return;

    try {
      setErpPdvSalvando(true);

      const { error } = await registrarErpPdvCaixaMovimentacao({
        empresaId,
        caixaId: erpPdvCaixaAberto.id,
        tipo: erpPdvCaixaMovimentoForm.tipo,
        valor: parseNumeroErpPdv(erpPdvCaixaMovimentoForm.valor),
        operador: erpPdvOperadorVenda || erpPdvCaixaAberto.operador,
        observacao: erpPdvCaixaMovimentoForm.observacao,
      });

      if (error) throw error;

      setErpPdvCaixaMovimentoForm({ ...erpPdvCaixaMovimentoFormPadrao });
      await atualizarResumoCaixaErpPdv();
      setErpPdvFeedback({
        tipo: "sucesso",
        texto:
          erpPdvCaixaMovimentoForm.tipo === "suprimento"
            ? "Suprimento registrado."
            : "Sangria registrada.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel registrar a movimentacao do caixa.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function fecharCaixaErpPdv() {
    if (!empresaId || !erpPdvCaixaAberto) return;

    try {
      setErpPdvSalvando(true);

      const { data, error } = await fecharErpPdvCaixa({
        empresaId,
        caixaId: erpPdvCaixaAberto.id,
        valorInformado: parseNumeroErpPdv(erpPdvCaixaValorFechamento),
        observacao: erpPdvCaixaObservacaoFechamento,
      });

      if (error) throw error;
      if (!data) throw new Error("Fechamento nao retornado pelo Supabase.");

      setErpPdvResumoCaixa(data);
      setErpPdvCaixaAberto(null);
      setErpPdvCaixaObservacaoFechamento("");
      setErpPdvCarrinho([]);
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: `Caixa fechado. Diferenca: R$ ${data.diferenca.toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}.`,
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel fechar o caixa.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  function obterLabelFormaPagamentoErpPdv(forma: ErpPdvFormaPagamento | string) {
    return (
      erpPdvFormasPagamento.find((formaPagamento) => formaPagamento.id === forma)
        ?.label || forma
    );
  }

  async function carregarRelatorioErpPdv(empresaIdAtual = empresaId) {
    if (!empresaIdAtual) return;

    try {
      const { data, error } = await gerarErpPdvRelatorioOperacional(
        empresaIdAtual,
        {
          dataInicio: erpPdvRelatorioInicio,
          dataFim: erpPdvRelatorioFim,
          operador: erpPdvRelatorioOperador,
          clienteId: erpPdvRelatorioClienteId,
          formaPagamento: erpPdvRelatorioFormaPagamento,
        }
      );

      if (error) throw error;
      setErpPdvRelatorio(data);
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os relatorios do PDV.",
      });
    }
  }

  function gerarHtmlRelatorioErpPdv() {
    if (!erpPdvRelatorio) return "";

    const linhasVendas = erpPdvRelatorio.vendas
      .map(
        (venda) => `<tr>
          <td>#${venda.numero}</td>
          <td>${new Date(venda.finalizada_em).toLocaleString("pt-BR")}</td>
          <td>${escaparHtmlCupomErpPdv(venda.operador || "-")}</td>
          <td>${escaparHtmlCupomErpPdv(venda.cliente_nome || "-")}</td>
          <td>${escaparHtmlCupomErpPdv(
            obterLabelFormaPagamentoErpPdv(venda.forma_pagamento)
          )}</td>
          <td>${formatarNumeroErpPdv(venda.quantidade_itens) || "0"}</td>
          <td>R$ ${formatarMoedaErpPdv(venda.total)}</td>
          <td>R$ ${formatarMoedaErpPdv(venda.lucro_bruto)}</td>
        </tr>`
      )
      .join("");

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Relatorio ERP PDV</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
      .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
      .label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; }
      .value { font-size: 18px; font-weight: 800; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
      th { background: #f8fafc; }
      @media print { body { margin: 12mm; } }
    </style>
  </head>
  <body>
    <h1>Relatorio operacional ERP/PDV</h1>
    <p>Mikatech - gerado em ${new Date().toLocaleString("pt-BR")}</p>
    <div class="grid">
      <div class="card"><div class="label">Vendas</div><div class="value">${erpPdvRelatorio.totalVendas}</div></div>
      <div class="card"><div class="label">Faturamento</div><div class="value">R$ ${formatarMoedaErpPdv(erpPdvRelatorio.faturamento)}</div></div>
      <div class="card"><div class="label">Lucro bruto</div><div class="value">R$ ${formatarMoedaErpPdv(erpPdvRelatorio.lucroBruto)}</div></div>
      <div class="card"><div class="label">Ticket medio</div><div class="value">R$ ${formatarMoedaErpPdv(erpPdvRelatorio.ticketMedio)}</div></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Venda</th><th>Data</th><th>Operador</th><th>Cliente</th><th>Pagamento</th><th>Itens</th><th>Total</th><th>Lucro</th>
        </tr>
      </thead>
      <tbody>${linhasVendas || "<tr><td colspan='8'>Sem vendas no periodo.</td></tr>"}</tbody>
    </table>
  </body>
</html>`;
  }

  function exportarRelatorioPdfErpPdv() {
    if (!erpPdvRelatorio) return;

    const janela = window.open("", "_blank", "width=1024,height=720");
    if (!janela) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Nao foi possivel abrir a janela do relatorio.",
      });
      return;
    }

    janela.document.open();
    janela.document.write(gerarHtmlRelatorioErpPdv());
    janela.document.close();
    janela.focus();
    janela.print();
  }

  function exportarRelatorioExcelErpPdv() {
    if (!erpPdvRelatorio) return;

    const linhas = [
      [
        "Venda",
        "Data",
        "Operador",
        "Cliente",
        "Forma de pagamento",
        "Quantidade de itens",
        "Total",
        "Lucro bruto",
      ],
      ...erpPdvRelatorio.vendas.map((venda) => [
        venda.numero,
        new Date(venda.finalizada_em).toLocaleString("pt-BR"),
        venda.operador,
        venda.cliente_nome,
        obterLabelFormaPagamentoErpPdv(venda.forma_pagamento),
        venda.quantidade_itens,
        venda.total.toFixed(2).replace(".", ","),
        venda.lucro_bruto.toFixed(2).replace(".", ","),
      ]),
    ];
    const csv = linhas
      .map((linha) =>
        linha
          .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\n");
    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-erp-pdv-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function atualizarClienteFormErpPdv(
    campo: keyof ErpPdvClienteForm,
    valor: string
  ) {
    setErpPdvClienteForm((formAtual) => ({
      ...formAtual,
      [campo]: valor,
    }));
  }

  function selecionarClienteVendaErpPdv(clienteErp: ErpPdvCliente) {
    setErpPdvClienteSelecionadoId(clienteErp.id);
    setErpPdvClienteBusca(clienteErp.nome);
    setErpPdvExibirCadastroCliente(false);
  }

  function limparClienteVendaErpPdv() {
    setErpPdvClienteSelecionadoId("");
    setErpPdvClienteBusca("");
  }

  async function buscarClientesVendaErpPdv() {
    if (!empresaId) return;

    try {
      setErpPdvSalvando(true);
      const { data, error } = await buscarErpPdvClientes(
        empresaId,
        erpPdvClienteBusca
      );

      if (error) throw error;

      setErpPdvClientes(data);
      setErpPdvFeedback({
        tipo: "info",
        texto:
          data.length > 0
            ? `${data.length} cliente(s) encontrado(s).`
            : "Nenhum cliente encontrado. Cadastre sem sair do PDV.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel buscar clientes.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function salvarClienteVendaErpPdv() {
    if (!empresaId) return;

    if (!erpPdvClienteForm.nome.trim()) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe o nome do cliente.",
      });
      return;
    }

    try {
      setErpPdvSalvando(true);
      const payload: ErpPdvClientePayload = {
        empresaId,
        nome: erpPdvClienteForm.nome,
        cpfCnpj: erpPdvClienteForm.cpfCnpj,
        telefone: erpPdvClienteForm.telefone,
        whatsapp: erpPdvClienteForm.whatsapp,
        email: erpPdvClienteForm.email,
        endereco: erpPdvClienteForm.endereco,
        observacoes: erpPdvClienteForm.observacoes,
        ativo: true,
      };
      const { data, error } = await salvarErpPdvCliente(payload);

      if (error) throw error;
      if (!data) throw new Error("Cliente nao retornado pelo Supabase.");

      setErpPdvClientes((clientesAtuais) => {
        const demaisClientes = clientesAtuais.filter(
          (clienteAtual) => clienteAtual.id !== data.id
        );

        return [data, ...demaisClientes].sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
      });
      selecionarClienteVendaErpPdv(data);
      setErpPdvClienteForm({ ...erpPdvClienteFormPadrao });
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Cliente cadastrado e vinculado a venda.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar o cliente.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  function gerarTextoCupomErpPdv(cupom: ErpPdvCupomNaoFiscal) {
    const linhas = [
      `${cupom.empresa}`,
      "CUPOM NAO FISCAL",
      `Venda: #${cupom.vendaNumero}`,
      `Data: ${new Date(cupom.dataHora).toLocaleString("pt-BR")}`,
      `Operador: ${cupom.operador}`,
      `Pagamento: ${cupom.pagamento}`,
      `Cliente: ${cupom.cliente}`,
      cupom.clienteDocumento ? `Documento: ${cupom.clienteDocumento}` : "",
      cupom.clienteContato ? `Contato: ${cupom.clienteContato}` : "",
      "",
      "Itens:",
      ...cupom.itens.map(
        (item) =>
          `${formatarNumeroErpPdv(item.quantidade)} x ${item.descricao} (${obterLabelTabelaPrecoErpPdv(
            item.tabelaPreco
          )}) - R$ ${item.subtotal.toLocaleString(
            "pt-BR",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`
      ),
      "",
      `Total: R$ ${cupom.total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "",
      "Documento sem valor fiscal.",
    ];

    return linhas.join("\n");
  }

  function escaparHtmlCupomErpPdv(valor: string) {
    return valor
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function gerarHtmlCupomErpPdv(
    cupom: ErpPdvCupomNaoFiscal,
    layout: ErpPdvCupomLayout
  ) {
    const largura =
      layout === "58mm" ? "58mm" : layout === "80mm" ? "80mm" : "190mm";
    const fonte = layout === "a4" ? "12px" : "10px";

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cupom nao fiscal #${cupom.vendaNumero}</title>
    <style>
      @page { size: ${layout === "a4" ? "A4" : largura} auto; margin: ${layout === "a4" ? "16mm" : "4mm"}; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #f8fafc; color: #0f172a; font-family: Arial, sans-serif; }
      .cupom { width: ${largura}; margin: 0 auto; background: #fff; padding: 12px; }
      .centro { text-align: center; }
      .titulo { font-size: ${layout === "a4" ? "20px" : "13px"}; font-weight: 800; }
      .linha { border-top: 1px dashed #64748b; margin: 8px 0; }
      .texto { font-size: ${fonte}; line-height: 1.45; }
      table { width: 100%; border-collapse: collapse; font-size: ${fonte}; }
      th, td { padding: 4px 0; text-align: left; vertical-align: top; }
      th:last-child, td:last-child { text-align: right; }
      .total { display: flex; justify-content: space-between; font-size: ${layout === "a4" ? "18px" : "13px"}; font-weight: 800; }
      @media print { body { background: #fff; } .cupom { margin: 0; } }
    </style>
  </head>
  <body>
    <main class="cupom texto">
      <section class="centro">
        <div class="titulo">${escaparHtmlCupomErpPdv(cupom.empresa)}</div>
        <div>CNPJ: ${escaparHtmlCupomErpPdv(cupom.cnpj)}</div>
        <div>${escaparHtmlCupomErpPdv(cupom.endereco)}</div>
        <div class="linha"></div>
        <strong>CUPOM NAO FISCAL</strong>
      </section>
      <div class="linha"></div>
      <div>Venda: #${cupom.vendaNumero}</div>
      <div>Data/Hora: ${new Date(cupom.dataHora).toLocaleString("pt-BR")}</div>
      <div>Operador: ${escaparHtmlCupomErpPdv(cupom.operador)}</div>
      <div>Pagamento: ${escaparHtmlCupomErpPdv(cupom.pagamento)}</div>
      <div>Cliente: ${escaparHtmlCupomErpPdv(cupom.cliente)}</div>
      ${
        cupom.clienteDocumento
          ? `<div>Documento: ${escaparHtmlCupomErpPdv(cupom.clienteDocumento)}</div>`
          : ""
      }
      ${
        cupom.clienteContato
          ? `<div>Contato: ${escaparHtmlCupomErpPdv(cupom.clienteContato)}</div>`
          : ""
      }
      <div class="linha"></div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${cupom.itens
            .map(
              (item) => `<tr>
                <td>${escaparHtmlCupomErpPdv(item.descricao)}<br />${escaparHtmlCupomErpPdv(
                  obterLabelTabelaPrecoErpPdv(item.tabelaPreco)
                )}<br />Unit.: R$ ${item.precoUnitario.toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}</td>
                <td>${formatarNumeroErpPdv(item.quantidade)}</td>
                <td>R$ ${item.subtotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <div class="linha"></div>
      <div class="total">
        <span>Total</span>
        <span>R$ ${cupom.total.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</span>
      </div>
      <div class="linha"></div>
      <section class="centro">
        <div>Documento sem valor fiscal.</div>
        <div>Nao substitui NFC-e ou NF-e.</div>
      </section>
    </main>
  </body>
</html>`;
  }

  function imprimirCupomErpPdv(
    layout: ErpPdvCupomLayout,
    cupom = erpPdvCupomNaoFiscal
  ) {
    if (!cupom) return;

    const janela = window.open("", "_blank", "width=420,height=720");
    if (!janela) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Nao foi possivel abrir a janela de impressao.",
      });
      return;
    }

    janela.document.open();
    janela.document.write(gerarHtmlCupomErpPdv(cupom, layout));
    janela.document.close();
    janela.focus();
    const vias = Math.min(Math.max(erpPdvImpressaoConfig.numeroVias || 1, 1), 5);
    Array.from({ length: vias }).forEach(() => janela.print());
  }

  function compartilharCupomWhatsAppErpPdv() {
    if (!erpPdvCupomNaoFiscal) return;

    const texto = encodeURIComponent(
      gerarTextoCupomErpPdv(erpPdvCupomNaoFiscal)
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank", "noopener,noreferrer");
  }

  function executarDestinoCupomConfiguradoErpPdv(cupom: ErpPdvCupomNaoFiscal) {
    if (!erpPdvImpressaoConfig.impressaoAutomatica) return;

    if (erpPdvImpressaoConfig.modo === "whatsapp") {
      const texto = encodeURIComponent(gerarTextoCupomErpPdv(cupom));
      window.open(
        `https://wa.me/?text=${texto}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (
      erpPdvImpressaoConfig.modo === "navegador" ||
      erpPdvImpressaoConfig.modo === "pdf"
    ) {
      imprimirCupomErpPdv(erpPdvImpressaoConfig.largura, cupom);
      return;
    }

    setErpPdvFeedback({
      tipo: "info",
      texto:
        "Venda finalizada. Impressao direta aguardara o Conector de Impressao local.",
    });
  }

  async function finalizarVendaErpPdv() {
    if (!empresaId) return;

    if (!erpPdvCarrinhoDetalhado.length) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Adicione produtos ao carrinho antes de finalizar.",
      });
      return;
    }

    if (!erpPdvOperadorVenda.trim()) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe o operador responsavel pela venda.",
      });
      return;
    }

    if (!erpPdvCaixaAberto) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Abra um caixa antes de finalizar a venda.",
      });
      return;
    }

    try {
      setErpPdvSalvando(true);
      const itensCupom = erpPdvCarrinhoDetalhado.map((item) => ({
        descricao: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
        tabelaPreco: item.tabelaPreco,
      }));

      const { data, error } = await finalizarErpPdvVenda({
        empresaId,
        caixaId: erpPdvCaixaAberto.id,
        clienteId: erpPdvClienteSelecionado?.id,
        clienteNome: erpPdvClienteSelecionado?.nome,
        operador: erpPdvOperadorVenda,
        formaPagamento: erpPdvFormaPagamentoVenda,
        itens: erpPdvCarrinhoDetalhado.map((item) => ({
          produtoId: item.produto.id,
          descricao: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      });

      if (error) throw error;
      if (!data) throw new Error("Venda nao retornada pelo Supabase.");

      setErpPdvProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) => {
          const movimentacaoProduto = data.movimentacoes.find(
            (movimentacao) => movimentacao.produto_id === produto.id
          );

          return movimentacaoProduto
            ? {
                ...produto,
                estoque_atual: movimentacaoProduto.estoque_posterior,
              }
            : produto;
        })
      );
      setErpPdvMovimentacoes((movimentacoesAtuais) => [
        ...data.movimentacoes,
        ...movimentacoesAtuais,
      ]);
      const cupomGerado: ErpPdvCupomNaoFiscal = {
        vendaNumero: data.numero,
        empresa: nome.trim() || "Empresa",
        cnpj: "Nao informado",
        endereco: montarEnderecoCompleto() || endereco.trim() || "Nao informado",
        cliente: data.cliente_nome || "Consumidor nao identificado",
        clienteDocumento: erpPdvClienteSelecionado?.cpf_cnpj || "",
        clienteContato:
          erpPdvClienteSelecionado?.whatsapp ||
          erpPdvClienteSelecionado?.telefone ||
          erpPdvClienteSelecionado?.email ||
          "",
        dataHora: data.finalizada_em,
        operador: data.operador,
        pagamento: obterLabelFormaPagamentoErpPdv(data.forma_pagamento),
        itens: itensCupom,
        total: data.total,
      };
      setErpPdvCupomNaoFiscal(cupomGerado);
      setErpPdvCupomLayout(erpPdvImpressaoConfig.largura);
      setErpPdvCarrinho([]);
      setErpPdvPdvBusca("");
      limparClienteVendaErpPdv();
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: `Venda #${data.numero} finalizada. Cupom nao fiscal gerado.`,
      });
      executarDestinoCupomConfiguradoErpPdv(cupomGerado);
      await atualizarResumoCaixaErpPdv();
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel finalizar a venda.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function salvarConfigImpressaoErpPdv() {
    if (!empresaId) return;

    try {
      setErpPdvSalvando(true);
      const config = montarErpPdvConfig();
      const { error } = await atualizarEmpresa(empresaId, {
        erp_pdv_config: config,
      } as Parameters<typeof atualizarEmpresa>[1]);

      if (error) throw error;

      setErpPdvImpressaoConfig(config);
      setErpPdvCupomLayout(config.largura);
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Configuracao de impressao salva.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar a configuracao de impressao.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function adicionarErpPdvCategoria() {
    const nomeCategoria = erpPdvCategoriaNome.trim();

    if (!empresaId || !nomeCategoria) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe o nome da categoria antes de salvar.",
      });
      return;
    }

    try {
      setErpPdvSalvando(true);

      const { data, error } = await criarErpPdvCategoria(
        empresaId,
        nomeCategoria
      );

      if (error) throw error;

      if (data) {
        setErpPdvCategorias((categoriasAtuais) => [
          ...categoriasAtuais,
          data,
        ]);
      }

      setErpPdvCategoriaNome("");
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Categoria criada no ERP/PDV.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel criar a categoria.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function salvarProdutoErpPdv() {
    if (!empresaId) return;

    if (!erpPdvProdutoForm.nome.trim()) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe o nome do produto.",
      });
      return;
    }

    if (erpPdvProdutoFormIndicadores.abaixoDoCusto) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "O preco de venda esta abaixo do custo. Ajuste antes de salvar.",
      });
      return;
    }

    const payload: ErpPdvProdutoPayload = {
      id: erpPdvProdutoForm.id || undefined,
      empresaId,
      categoriaId: erpPdvProdutoForm.categoriaId,
      nome: erpPdvProdutoForm.nome,
      codigoBarras: erpPdvProdutoForm.codigoBarras,
      sku: erpPdvProdutoForm.sku,
      marca: erpPdvProdutoForm.marca,
      custo: parseNumeroErpPdv(erpPdvProdutoForm.custo),
      precoVenda: erpPdvProdutoFormPrecoCalculado,
      precoAtacado: parseNumeroErpPdv(erpPdvProdutoForm.precoAtacado),
      precoRevenda: parseNumeroErpPdv(erpPdvProdutoForm.precoRevenda),
      precoPersonalizado: parseNumeroErpPdv(
        erpPdvProdutoForm.precoPersonalizado
      ),
      formacaoPrecoTipo: erpPdvProdutoForm.formacaoPrecoTipo,
      percentualPreco: parseNumeroErpPdv(erpPdvProdutoForm.percentualPreco),
      unidade: erpPdvProdutoForm.unidade,
      localizacao: erpPdvProdutoForm.localizacao,
      ncm: erpPdvProdutoForm.ncm,
      observacoes: erpPdvProdutoForm.observacoes,
      imagemUrl: erpPdvProdutoForm.imagemUrl,
      estoqueAtual: parseNumeroErpPdv(erpPdvProdutoForm.estoqueAtual),
      estoqueMinimo: parseNumeroErpPdv(erpPdvProdutoForm.estoqueMinimo),
      ativo: erpPdvProdutoForm.ativo,
    };

    try {
      setErpPdvSalvando(true);

      const { data, error } = await salvarErpPdvProduto(payload);

      if (error) throw error;
      if (!data) throw new Error("Produto nao retornado pelo Supabase.");

      setErpPdvProdutos((produtosAtuais) => {
        const existe = produtosAtuais.some((produto) => produto.id === data.id);

        return existe
          ? produtosAtuais.map((produto) =>
              produto.id === data.id ? data : produto
            )
          : [...produtosAtuais, data].sort((a, b) =>
              a.nome.localeCompare(b.nome)
            );
      });
      setErpPdvProdutoForm(criarErpPdvProdutoForm(data));
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Produto salvo no ERP/PDV.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar o produto.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  async function registrarMovimentacaoErpPdv() {
    if (!empresaId) return;

    const quantidade = parseNumeroErpPdv(erpPdvMovimentacaoForm.quantidade);

    if (!erpPdvMovimentacaoForm.produtoId) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Selecione o produto da movimentacao.",
      });
      return;
    }

    if (quantidade <= 0) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe uma quantidade maior que zero.",
      });
      return;
    }

    if (!erpPdvMovimentacaoForm.motivo.trim()) {
      setErpPdvFeedback({
        tipo: "erro",
        texto: "Informe o motivo da movimentacao.",
      });
      return;
    }

    const payload: ErpPdvMovimentacaoPayload = {
      empresaId,
      produtoId: erpPdvMovimentacaoForm.produtoId,
      tipo: erpPdvMovimentacaoForm.tipo,
      quantidade,
      motivo: erpPdvMovimentacaoForm.motivo,
      observacao: erpPdvMovimentacaoForm.observacao,
      usuarioResponsavel: erpPdvMovimentacaoForm.usuarioResponsavel,
    };

    try {
      setErpPdvSalvando(true);

      const { data, error } = await registrarErpPdvMovimentacao(payload);

      if (error) throw error;
      if (!data) throw new Error("Movimentacao nao retornada pelo Supabase.");

      setErpPdvProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === data.produto_id
            ? {
                ...produto,
                estoque_atual: data.estoque_posterior,
              }
            : produto
        )
      );
      setErpPdvMovimentacoes((movimentacoesAtuais) => [
        data,
        ...movimentacoesAtuais,
      ]);
      setErpPdvMovimentacaoForm((formAtual) => ({
        ...erpPdvMovimentacaoFormPadrao,
        usuarioResponsavel: formAtual.usuarioResponsavel,
      }));
      setErpPdvFeedback({
        tipo: "sucesso",
        texto: "Movimentacao registrada e estoque atualizado.",
      });
    } catch (error) {
      setErpPdvFeedback({
        tipo: "erro",
        texto:
          error instanceof Error
            ? error.message
            : "Nao foi possivel registrar a movimentacao.",
      });
    } finally {
      setErpPdvSalvando(false);
    }
  }

  function montarCardapioConfig(): CardapioConfig {
    return {
      categorias: cardapioCategorias.slice(0, 30),
      produtos: cardapioProdutos.slice(0, 100),
    };
  }

  function atualizarCardapioCategoria(
    indice: number,
    campo: keyof CardapioCategoriaConfig,
    valor: string | boolean
  ) {
    setCardapioCategorias((categoriasAtuais) =>
      categoriasAtuais.map((categoriaAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...categoriaAtual,
              [campo]: valor,
            }
          : categoriaAtual
      )
    );
  }

  function adicionarCardapioCategoria() {
    setCardapioCategorias((categoriasAtuais) => {
      if (categoriasAtuais.length >= 30) return categoriasAtuais;

      return [
        ...categoriasAtuais,
        {
          ...cardapioCategoriaPadrao,
          id: `categoria-${Date.now()}`,
        },
      ];
    });
  }

  function removerCardapioCategoria(indice: number) {
    setCardapioCategorias((categoriasAtuais) => {
      if (categoriasAtuais.length <= 1) return categoriasAtuais;

      const categoriaRemovida = categoriasAtuais[indice];

      setCardapioProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.categoriaId === categoriaRemovida.id
            ? {
                ...produto,
                categoriaId: "",
              }
            : produto
        )
      );

      return categoriasAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverCardapioCategoria(indice: number, direcao: "up" | "down") {
    setCardapioCategorias((categoriasAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= categoriasAtuais.length) {
        return categoriasAtuais;
      }

      const categoriasOrdenadas = [...categoriasAtuais];
      const [categoriaMovida] = categoriasOrdenadas.splice(indice, 1);
      categoriasOrdenadas.splice(novoIndice, 0, categoriaMovida);

      return categoriasOrdenadas;
    });
  }

  function atualizarCardapioProduto(
    indice: number,
    campo: keyof CardapioProdutoConfig,
    valor: string | boolean
  ) {
    setCardapioProdutos((produtosAtuais) =>
      produtosAtuais.map((produtoAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...produtoAtual,
              [campo]: valor,
            }
          : produtoAtual
      )
    );
  }

  function adicionarCardapioProduto() {
    setCardapioProdutos((produtosAtuais) => {
      if (produtosAtuais.length >= 100) return produtosAtuais;

      return [
        ...produtosAtuais,
        {
          ...cardapioProdutoPadrao,
          id: `produto-${Date.now()}`,
        },
      ];
    });
  }

  function removerCardapioProduto(indice: number) {
    setCardapioProdutos((produtosAtuais) => {
      if (produtosAtuais.length <= 1) return produtosAtuais;

      return produtosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverCardapioProduto(indice: number, direcao: "up" | "down") {
    setCardapioProdutos((produtosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= produtosAtuais.length) {
        return produtosAtuais;
      }

      const produtosOrdenados = [...produtosAtuais];
      const [produtoMovido] = produtosOrdenados.splice(indice, 1);
      produtosOrdenados.splice(novoIndice, 0, produtoMovido);

      return produtosOrdenados;
    });
  }

  function montarCatalogoConfig(): CatalogoConfig {
    return {
      categorias: catalogoCategorias.slice(0, 30),
      produtos: catalogoProdutos.slice(0, 100),
    };
  }

  function atualizarCatalogoCategoria(
    indice: number,
    campo: keyof CatalogoCategoriaConfig,
    valor: string | boolean
  ) {
    setCatalogoCategorias((categoriasAtuais) =>
      categoriasAtuais.map((categoriaAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...categoriaAtual,
              [campo]: valor,
            }
          : categoriaAtual
      )
    );
  }

  function adicionarCatalogoCategoria() {
    setCatalogoCategorias((categoriasAtuais) => {
      if (categoriasAtuais.length >= 30) return categoriasAtuais;

      return [
        ...categoriasAtuais,
        {
          ...catalogoCategoriaPadrao,
          id: `categoria-${Date.now()}`,
        },
      ];
    });
  }

  function removerCatalogoCategoria(indice: number) {
    setCatalogoCategorias((categoriasAtuais) => {
      if (categoriasAtuais.length <= 1) return categoriasAtuais;

      const categoriaRemovida = categoriasAtuais[indice];

      setCatalogoProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.categoriaId === categoriaRemovida.id
            ? {
                ...produto,
                categoriaId: "",
              }
            : produto
        )
      );

      return categoriasAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverCatalogoCategoria(indice: number, direcao: "up" | "down") {
    setCatalogoCategorias((categoriasAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= categoriasAtuais.length) {
        return categoriasAtuais;
      }

      const categoriasOrdenadas = [...categoriasAtuais];
      const [categoriaMovida] = categoriasOrdenadas.splice(indice, 1);
      categoriasOrdenadas.splice(novoIndice, 0, categoriaMovida);

      return categoriasOrdenadas;
    });
  }

  function atualizarCatalogoProduto(
    indice: number,
    campo: keyof CatalogoProdutoConfig,
    valor: string | boolean
  ) {
    setCatalogoProdutos((produtosAtuais) =>
      produtosAtuais.map((produtoAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...produtoAtual,
              [campo]: valor,
            }
          : produtoAtual
      )
    );
  }

  function adicionarCatalogoProduto() {
    setCatalogoProdutos((produtosAtuais) => {
      if (produtosAtuais.length >= 100) return produtosAtuais;

      return [
        ...produtosAtuais,
        {
          ...catalogoProdutoPadrao,
          id: `produto-${Date.now()}`,
        },
      ];
    });
  }

  function removerCatalogoProduto(indice: number) {
    setCatalogoProdutos((produtosAtuais) => {
      if (produtosAtuais.length <= 1) return produtosAtuais;

      return produtosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverCatalogoProduto(indice: number, direcao: "up" | "down") {
    setCatalogoProdutos((produtosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= produtosAtuais.length) {
        return produtosAtuais;
      }

      const produtosOrdenados = [...produtosAtuais];
      const [produtoMovido] = produtosOrdenados.splice(indice, 1);
      produtosOrdenados.splice(novoIndice, 0, produtoMovido);

      return produtosOrdenados;
    });
  }

  function montarAgendamentoConfig(): AgendamentoConfig {
    return {
      servicos: agendamentoServicos.slice(0, 100),
    };
  }

  function atualizarAgendamentoServico(
    indice: number,
    campo: keyof AgendamentoServicoConfig,
    valor: string | boolean
  ) {
    setAgendamentoServicos((servicosAtuais) =>
      servicosAtuais.map((servicoAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...servicoAtual,
              [campo]: valor,
            }
          : servicoAtual
      )
    );
  }

  function adicionarAgendamentoServico() {
    setAgendamentoServicos((servicosAtuais) => {
      if (servicosAtuais.length >= 100) return servicosAtuais;

      return [
        ...servicosAtuais,
        {
          ...agendamentoServicoPadrao,
          id: `servico-${Date.now()}`,
        },
      ];
    });
  }

  function removerAgendamentoServico(indice: number) {
    setAgendamentoServicos((servicosAtuais) => {
      if (servicosAtuais.length <= 1) return servicosAtuais;

      return servicosAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  function moverAgendamentoServico(indice: number, direcao: "up" | "down") {
    setAgendamentoServicos((servicosAtuais) => {
      const novoIndice = direcao === "up" ? indice - 1 : indice + 1;

      if (novoIndice < 0 || novoIndice >= servicosAtuais.length) {
        return servicosAtuais;
      }

      const servicosOrdenados = [...servicosAtuais];
      const [servicoMovido] = servicosOrdenados.splice(indice, 1);
      servicosOrdenados.splice(novoIndice, 0, servicoMovido);

      return servicosOrdenados;
    });
  }

  function montarWifiMarketingConfig(): WifiMarketingConfig {
    return {
      ...wifiMarketingConfig,
    };
  }

  function atualizarWifiMarketingConfig(
    campo: keyof WifiMarketingConfig,
    valor: string | boolean
  ) {
    setWifiMarketingConfig((configAtual) => ({
      ...configAtual,
      [campo]: valor,
    }));
  }

  function montarFidelidadeConfig(): FidelidadeConfig {
    return {
      ...fidelidadeConfig,
    };
  }

  function atualizarFidelidadeConfig(
    campo: keyof FidelidadeConfig,
    valor: string | boolean
  ) {
    setFidelidadeConfig((configAtual) => ({
      ...configAtual,
      [campo]: valor,
    }));
  }

  function montarIaConfig(): IaConfig {
    const contexto = criarIaContextoUnificado();
    const promptMestre = gerarIaPromptMestre(contexto);

    return {
      ...iaConfig,
      contexto,
      promptMestre,
    };
  }

  function atualizarIaConfig(
    campo: IaConfigCampoEditavel,
    valor: string | boolean
  ) {
    setIaConfig((configAtual) => ({
      ...configAtual,
      [campo]:
        campo === "tomComunicacao"
          ? normalizarIaTomComunicacao(valor)
          : valor,
    }));
  }

  function atualizarIaContextoFonte(fonte: IaContextoFonte, ativo: boolean) {
    setIaConfig((configAtual) => ({
      ...configAtual,
      contexto: {
        ...configAtual.contexto,
        fontes: {
          ...configAtual.contexto.fontes,
          [fonte]: ativo,
        },
      },
    }));
  }

  function atualizarIaBaseConhecimento(
    campo: "politicasEmpresa" | "informacoesImportantes",
    valor: string
  ) {
    setIaConfig((configAtual) => ({
      ...configAtual,
      baseConhecimento: {
        ...configAtual.baseConhecimento,
        [campo]: valor,
      },
    }));
  }

  function atualizarIaFaqRascunho(campo: keyof IaFaqRascunho, valor: string) {
    setIaFaqRascunho((rascunhoAtual) => ({
      ...rascunhoAtual,
      [campo]: valor,
    }));
  }

  function adicionarIaPerguntaFrequente() {
    const pergunta = iaFaqRascunho.pergunta.trim();
    const resposta = iaFaqRascunho.resposta.trim();

    if (!pergunta || !resposta) {
      return;
    }

    setIaConfig((configAtual) => ({
      ...configAtual,
      baseConhecimento: {
        ...configAtual.baseConhecimento,
        perguntasFrequentes: [
          ...configAtual.baseConhecimento.perguntasFrequentes,
          {
            id: `faq-${Date.now()}`,
            pergunta,
            resposta,
          },
        ].slice(0, 50),
      },
    }));
    setIaFaqRascunho({ pergunta: "", resposta: "" });
  }

  function atualizarIaPerguntaFrequente(
    indice: number,
    campo: keyof Omit<IaPerguntaFrequenteConfig, "id">,
    valor: string
  ) {
    setIaConfig((configAtual) => ({
      ...configAtual,
      baseConhecimento: {
        ...configAtual.baseConhecimento,
        perguntasFrequentes:
          configAtual.baseConhecimento.perguntasFrequentes.map(
            (perguntaFrequente, indiceAtual) =>
              indiceAtual === indice
                ? {
                    ...perguntaFrequente,
                    [campo]: valor,
                  }
                : perguntaFrequente
          ),
      },
    }));
  }

  function removerIaPerguntaFrequente(indice: number) {
    setIaConfig((configAtual) => ({
      ...configAtual,
      baseConhecimento: {
        ...configAtual.baseConhecimento,
        perguntasFrequentes:
          configAtual.baseConhecimento.perguntasFrequentes.filter(
            (_, indiceAtual) => indiceAtual !== indice
          ),
      },
    }));
  }

  function gerarIaPromptMestre(contexto: IaContextoConfig): IaPromptMestreConfig {
    const tomSelecionado =
      iaTonsComunicacao.find((tom) => tom.id === iaConfig.tomComunicacao) ||
      iaTonsComunicacao[0];
    const baseConhecimento = iaConfig.baseConhecimento;
    const perguntasFrequentes = baseConhecimento.perguntasFrequentes
      .filter(
        (perguntaFrequente) =>
          perguntaFrequente.pergunta.trim() ||
          perguntaFrequente.resposta.trim()
      )
      .slice(0, 50);
    const fontesAtivas = iaContextoFontes
      .filter((fonte) => contexto.fontes[fonte.id])
      .map((fonte) => fonte.nome)
      .join(", ");
    const linhasFaq =
      perguntasFrequentes.length > 0
        ? perguntasFrequentes
            .map(
              (perguntaFrequente, indice) =>
                `${indice + 1}. Pergunta: ${
                  perguntaFrequente.pergunta || "Nao informada"
                }\n   Resposta: ${
                  perguntaFrequente.resposta || "Nao informada"
                }`
            )
            .join("\n")
        : "Nenhuma pergunta frequente cadastrada.";
    const conteudo = [
      "# Prompt Mestre do Assistente de IA",
      "",
      "## Identidade",
      `Voce e ${iaConfig.nomeAssistente || iaConfigPadrao.nomeAssistente}, assistente comercial da empresa ${nome || "Nao informada"}.`,
      `Plataforma: ${BrandConfig.platformName}.`,
      "",
      "## Objetivo",
      "Atender clientes com clareza, usar os dados da empresa como fonte principal e orientar o proximo passo comercial sem inventar informacoes.",
      "",
      "## Tom de comunicacao",
      `${tomSelecionado.nome}: ${tomSelecionado.descricao}`,
      "",
      "## Regras de atendimento",
      "- Responda em portugues do Brasil.",
      "- Seja objetivo, educado e util.",
      "- Quando faltar informacao, diga que precisa confirmar com a empresa.",
      "- Nao prometa prazos, valores ou condicoes que nao estejam no contexto.",
      "- Direcione oportunidades para os canais de contato configurados.",
      "",
      "## Instrucoes personalizadas",
      iaConfig.instrucoesPersonalizadas.trim() ||
        "Nenhuma instrucao personalizada cadastrada.",
      "",
      "## Fontes ativas do contexto",
      fontesAtivas || "Nenhuma fonte selecionada.",
      "",
      "## Resumo do contexto",
      contexto.resumo || "Nenhum resumo disponivel.",
      "",
      "## Base de conhecimento",
      "",
      "### Perguntas frequentes",
      linhasFaq,
      "",
      "### Politicas da empresa",
      baseConhecimento.politicasEmpresa.trim() ||
        "Nenhuma politica cadastrada.",
      "",
      "### Informacoes importantes",
      baseConhecimento.informacoesImportantes.trim() ||
        "Nenhuma informacao importante cadastrada.",
      "",
      "## Contexto estruturado",
      JSON.stringify(contexto.dados, null, 2),
      "",
      "## Orientacao para integracao futura",
      "Use este prompt como mensagem de sistema ou contexto principal ao integrar um provedor de IA. Nao ha chamada externa nesta versao.",
    ].join("\n");

    return {
      conteudo,
      geradoEm: new Date().toISOString(),
      versao: "1.0",
    };
  }

  function criarIaContextoUnificado(): IaContextoConfig {
    const fontes = iaConfig.contexto.fontes;
    const dados: Record<string, unknown> = {};
    const resumo: string[] = [];
    const basePublica = BrandConfig.publicAppUrl.replace(/\/$/, "");
    const slugContexto = slugPublico || slugAdmin || slug;
    const recursosAtivos = Object.entries(recursosContratados)
      .filter(([, ativo]) => ativo)
      .map(([recurso]) => recurso);

    if (fontes.dados_empresa) {
      dados.dados_empresa = {
        nome,
        slug: slugContexto,
        categoria,
        descricao,
        contatos: {
          telefone,
          whatsapp,
          email,
          site,
          endereco,
          horarioAtendimento,
        },
        identidadeVisual: {
          logo,
          banner,
          corPrincipal,
          corSecundaria,
          corBotoes,
        },
      };
      resumo.push(`Empresa: ${nome || "Nao informado"}.`);
    }

    if (fontes.pagina_publica) {
      dados.pagina_publica = {
        url: slugContexto ? `${basePublica}/${slugContexto}` : "",
        redesSociais: {
          instagram,
          facebook,
          tiktok,
          youtube,
          kwai,
        },
        conectividade: {
          wifiNome,
          googleReviewUrl,
          pixNome,
        },
        recursosAtivos,
      };
      resumo.push(`Pagina publica com ${recursosAtivos.length} recurso(s) ativo(s).`);
    }

    if (fontes.landing_page) {
      const landingPageConfig = montarLandingPageConfig();

      dados.landing_page = {
        publicada: landingPageConfig.publicada,
        hero: landingPageConfig.hero,
        sobre: landingPageConfig.sobre,
        servicos: landingPageConfig.servicos.slice(0, 10),
        contato: landingPageConfig.contato,
        cta: landingPageConfig.cta,
        seo: landingPageConfig.seo,
      };
      resumo.push(
        `Landing Page ${landingPageConfig.publicada ? "publicada" : "em rascunho"}.`
      );
    }

    if (fontes.cardapio_digital) {
      dados.cardapio_digital = {
        categorias: cardapioCategorias.slice(0, 20),
        produtos: cardapioProdutos.slice(0, 50),
      };
      resumo.push(`${cardapioProdutos.length} item(ns) no Cardapio Digital.`);
    }

    if (fontes.catalogo) {
      dados.catalogo = {
        categorias: catalogoCategorias.slice(0, 20),
        produtos: catalogoProdutos.slice(0, 50),
      };
      resumo.push(`${catalogoProdutos.length} produto(s) no Catalogo.`);
    }

    if (fontes.agendamento) {
      dados.agendamento = {
        servicos: agendamentoServicos.slice(0, 30),
        horariosAtendimento,
      };
      resumo.push(`${agendamentoServicos.length} servico(s) de Agendamento.`);
    }

    if (fontes.fidelidade) {
      dados.fidelidade = {
        ...fidelidadeConfig,
      };
      resumo.push(
        fidelidadeConfig.ativo
          ? "Programa de Fidelidade ativo."
          : "Programa de Fidelidade inativo."
      );
    }

    if (fontes.crm) {
      const pipelineResumo = crmPipelineEtapas.map((etapa) => ({
        etapa: etapa.nome,
        total: crmClientes.filter(
          (cliente) =>
            normalizarCrmPipelineEtapa(cliente.etapaPipeline) === etapa.id
        ).length,
      }));

      dados.crm = {
        totalLeads: crmClientes.length,
        pipeline: pipelineResumo,
        automacoes: crmAutomacoes,
        leads: crmClientes.slice(0, 50).map((cliente) => ({
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email,
          status: cliente.status,
          etapaPipeline: normalizarCrmPipelineEtapa(cliente.etapaPipeline),
          tags: cliente.tags,
          totalTarefas: cliente.tarefas.length,
          tarefasPendentes: cliente.tarefas.filter(
            (tarefa) => tarefa.status === "pendente"
          ).length,
          totalInteracoes: cliente.interacoes.length,
        })),
      };
      resumo.push(`${crmClientes.length} lead(s) no CRM.`);
    }

    const baseConhecimento = iaConfig.baseConhecimento;
    const totalFaqs = baseConhecimento.perguntasFrequentes.filter(
      (perguntaFrequente) =>
        perguntaFrequente.pergunta.trim() || perguntaFrequente.resposta.trim()
    ).length;
    const possuiPoliticas = Boolean(baseConhecimento.politicasEmpresa.trim());
    const possuiInformacoes = Boolean(
      baseConhecimento.informacoesImportantes.trim()
    );

    dados.base_conhecimento = {
      perguntasFrequentes: baseConhecimento.perguntasFrequentes.slice(0, 50),
      politicasEmpresa: baseConhecimento.politicasEmpresa,
      informacoesImportantes: baseConhecimento.informacoesImportantes,
    };

    if (totalFaqs || possuiPoliticas || possuiInformacoes) {
      resumo.push(
        `Base de conhecimento com ${totalFaqs} pergunta(s) frequente(s).`
      );
    }

    return {
      fontes: { ...fontes },
      ultimaAtualizacao: new Date().toISOString(),
      resumo: resumo.join(" "),
      dados,
    };
  }

  function montarCrmConfig(): CrmConfig {
    return {
      clientes: crmClientes,
      automacoes: crmAutomacoes,
    };
  }

  function atualizarCrmCliente(
    indice: number,
    campo: CrmClienteCampoEditavel,
    valor: string | string[]
  ) {
    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual, indiceAtual) =>
        indiceAtual === indice
          ? {
              ...clienteAtual,
              [campo]: valor,
            }
          : clienteAtual
      )
    );
  }

  function atualizarCrmAutomacao(
    automacaoId: string,
    campo: keyof CrmAutomacaoConfig,
    valor: string | boolean
  ) {
    setCrmAutomacoes((automacoesAtuais) =>
      automacoesAtuais.map((automacaoAtual) =>
        automacaoAtual.id === automacaoId
          ? {
              ...automacaoAtual,
              [campo]:
                campo === "evento"
                  ? normalizarCrmAutomacaoEvento(valor)
                  : campo === "acao"
                    ? normalizarCrmAutomacaoAcao(valor)
                    : valor,
            }
          : automacaoAtual
      )
    );
  }

  function criarCrmInteracoesAutomacao(
    evento: CrmAutomacaoEvento,
    contexto: string
  ): CrmInteracaoConfig[] {
    const agora = new Date().toISOString();

    return crmAutomacoes
      .filter((automacao) => automacao.ativa && automacao.evento === evento)
      .map((automacao, indice) => ({
        id: `interacao-automacao-${Date.now()}-${indice}`,
        texto: `[Automacao: ${automacao.titulo}] ${automacao.mensagem} ${contexto}`.trim(),
        origem: "sistema" as CrmInteracaoOrigem,
        dataHora: agora,
      }));
  }

  function moverCrmClienteParaEtapa(
    clienteId: string,
    etapaPipeline: CrmPipelineEtapa
  ) {
    const agora = new Date().toISOString();

    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual) =>
        clienteAtual.id === clienteId &&
        clienteAtual.etapaPipeline !== etapaPipeline
          ? {
              ...clienteAtual,
              etapaPipeline,
              movimentadoEm: agora,
              interacoes: [
                ...clienteAtual.interacoes,
                {
                  id: `interacao-${Date.now()}`,
                  texto: `Lead movido para ${obterCrmPipelineEtapaNome(
                    etapaPipeline
                  )}.`,
                  origem: "sistema" as CrmInteracaoOrigem,
                  dataHora: agora,
                },
                ...criarCrmInteracoesAutomacao(
                  "mudanca_etapa",
                  `Nova etapa: ${obterCrmPipelineEtapaNome(etapaPipeline)}.`
                ),
              ].slice(-100),
            }
          : clienteAtual
      )
    );
  }

  function adicionarCrmInteracao(clienteId: string) {
    const texto = (crmInteracoesRascunho[clienteId] || "").trim();

    if (!texto) {
      alert("Informe a anotacao antes de adicionar ao historico.");
      return;
    }

    const origem = crmInteracoesOrigemRascunho[clienteId] || "manual";
    const agora = new Date().toISOString();

    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual) =>
        clienteAtual.id === clienteId
          ? {
              ...clienteAtual,
              atualizadoEm: agora,
              interacoes: [
                ...clienteAtual.interacoes,
                {
                  id: `interacao-${Date.now()}`,
                  texto,
                  origem,
                  dataHora: agora,
                },
              ].slice(-100),
            }
          : clienteAtual
      )
    );
    setCrmInteracoesRascunho((rascunhosAtuais) => ({
      ...rascunhosAtuais,
      [clienteId]: "",
    }));
    setCrmInteracoesOrigemRascunho((origensAtuais) => ({
      ...origensAtuais,
      [clienteId]: "manual",
    }));
  }

  function obterCrmTarefaRascunho(clienteId: string): CrmTarefaRascunho {
    return (
      crmTarefasRascunho[clienteId] || {
        titulo: "",
        descricao: "",
        vencimento: "",
        prioridade: "media",
      }
    );
  }

  function atualizarCrmTarefaRascunho(
    clienteId: string,
    campo: keyof CrmTarefaRascunho,
    valor: string
  ) {
    setCrmTarefasRascunho((rascunhosAtuais) => {
      const rascunhoAtual = rascunhosAtuais[clienteId] || {
        titulo: "",
        descricao: "",
        vencimento: "",
        prioridade: "media" as CrmTarefaPrioridade,
      };

      return {
        ...rascunhosAtuais,
        [clienteId]: {
          ...rascunhoAtual,
          [campo]:
            campo === "prioridade"
              ? normalizarCrmTarefaPrioridade(valor)
              : valor,
        },
      };
    });
  }

  function adicionarCrmTarefa(clienteId: string) {
    const rascunho = obterCrmTarefaRascunho(clienteId);
    const titulo = rascunho.titulo.trim();

    if (!titulo) {
      alert("Informe o titulo da tarefa antes de adicionar.");
      return;
    }

    if (!rascunho.vencimento) {
      alert("Informe a data de vencimento da tarefa.");
      return;
    }

    const agora = new Date().toISOString();
    const novaTarefa: CrmTarefaConfig = {
      id: `tarefa-${Date.now()}`,
      titulo,
      descricao: rascunho.descricao.trim(),
      vencimento: rascunho.vencimento,
      prioridade: rascunho.prioridade,
      status: "pendente",
      criadoEm: agora,
      concluidoEm: "",
    };

    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual) =>
        clienteAtual.id === clienteId
          ? {
              ...clienteAtual,
              atualizadoEm: agora,
              tarefas: ordenarCrmTarefas([
                ...clienteAtual.tarefas,
                novaTarefa,
              ]).slice(0, 100),
              interacoes: [
                ...clienteAtual.interacoes,
                {
                  id: `interacao-${Date.now()}`,
                  texto: `Tarefa criada: ${titulo}.`,
                  origem: "sistema" as CrmInteracaoOrigem,
                  dataHora: agora,
                },
              ].slice(-100),
            }
          : clienteAtual
      )
    );
    setCrmTarefasRascunho((rascunhosAtuais) => ({
      ...rascunhosAtuais,
      [clienteId]: {
        titulo: "",
        descricao: "",
        vencimento: "",
        prioridade: "media",
      },
    }));
  }

  function alternarCrmTarefaStatus(
    clienteId: string,
    tarefaId: string,
    status: CrmTarefaStatus
  ) {
    const agora = new Date().toISOString();

    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual) => {
        if (clienteAtual.id !== clienteId) return clienteAtual;

        const tarefaAlterada = clienteAtual.tarefas.find(
          (tarefa) => tarefa.id === tarefaId
        );

        if (!tarefaAlterada || tarefaAlterada.status === status) {
          return clienteAtual;
        }

        return {
          ...clienteAtual,
          atualizadoEm: agora,
          tarefas: ordenarCrmTarefas(
            clienteAtual.tarefas.map((tarefa) =>
              tarefa.id === tarefaId
                ? {
                    ...tarefa,
                    status,
                    concluidoEm: status === "concluida" ? agora : "",
                  }
                : tarefa
            )
          ),
          interacoes: [
            ...clienteAtual.interacoes,
            {
              id: `interacao-${Date.now()}`,
              texto:
                status === "concluida"
                  ? `Tarefa concluida: ${tarefaAlterada.titulo}.`
                  : `Tarefa reaberta: ${tarefaAlterada.titulo}.`,
              origem: "sistema" as CrmInteracaoOrigem,
              dataHora: agora,
            },
          ].slice(-100),
        };
      })
    );
  }

  function verificarCrmTarefasVencidas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const tarefasVencidasPorCliente = new Map<string, CrmTarefaConfig[]>();

    crmClientes.forEach((clienteAtual) => {
      const tarefasVencidas = clienteAtual.tarefas.filter((tarefa) => {
        if (tarefa.status === "concluida" || !tarefa.vencimento) return false;

        const vencimento = new Date(`${tarefa.vencimento}T00:00:00`);

        if (Number.isNaN(vencimento.getTime()) || vencimento >= hoje) {
          return false;
        }

        const jaRegistrada = clienteAtual.interacoes.some((interacao) =>
          interacao.texto.includes(`Tarefa vencida: ${tarefa.titulo}.`)
        );

        return !jaRegistrada;
      });

      if (tarefasVencidas.length > 0) {
        tarefasVencidasPorCliente.set(clienteAtual.id, tarefasVencidas);
      }
    });

    const totalRegistrado = Array.from(tarefasVencidasPorCliente.values()).reduce(
      (total, tarefas) => total + tarefas.length,
      0
    );

    setCrmClientes((clientesAtuais) =>
      clientesAtuais.map((clienteAtual) => {
        const tarefasVencidas =
          tarefasVencidasPorCliente.get(clienteAtual.id) || [];

        if (tarefasVencidas.length === 0) return clienteAtual;

        const agora = new Date().toISOString();

        return {
          ...clienteAtual,
          atualizadoEm: agora,
          interacoes: [
            ...clienteAtual.interacoes,
            ...tarefasVencidas.flatMap((tarefa) => [
              {
                id: `interacao-tarefa-vencida-${Date.now()}-${tarefa.id}`,
                texto: `Tarefa vencida: ${tarefa.titulo}.`,
                origem: "sistema" as CrmInteracaoOrigem,
                dataHora: agora,
              },
              ...criarCrmInteracoesAutomacao(
                "tarefa_vencida",
                `Tarefa: ${tarefa.titulo}. Vencimento: ${formatarDataVencimentoCrm(
                  tarefa.vencimento
                )}.`
              ),
            ]),
          ].slice(-100),
        };
      })
    );

    alert(
      totalRegistrado > 0
        ? `${totalRegistrado} tarefa(s) vencida(s) registrada(s) no historico.`
        : "Nenhuma nova tarefa vencida encontrada."
    );
  }

  function adicionarCrmCliente() {
    setCrmClientes((clientesAtuais) => {
      if (clientesAtuais.length >= 500) return clientesAtuais;
      const agora = new Date().toISOString();

      return [
        ...clientesAtuais,
        {
          ...crmClientePadrao,
          id: `cliente-${Date.now()}`,
          criadoEm: agora,
          atualizadoEm: agora,
          movimentadoEm: agora,
          interacoes: [
            {
              id: `interacao-${Date.now()}`,
              texto: "Lead criado manualmente no CRM.",
              origem: "manual",
              dataHora: agora,
            },
            ...criarCrmInteracoesAutomacao(
              "novo_lead",
              "Lead criado manualmente."
            ),
          ],
        },
      ];
    });
  }

  function removerCrmCliente(indice: number) {
    setCrmClientes((clientesAtuais) => {
      if (clientesAtuais.length <= 1) return clientesAtuais;

      return clientesAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  async function publicarLandingPageAlteracoes() {
    if (!empresaId) {
      alert("Empresa ainda nao foi carregada. Tente novamente.");
      return;
    }

    const novaVersaoPublicada = criarLandingPagePublicavel(
      montarLandingPageRascunho()
    );
    novaVersaoPublicada.publicadaEm = new Date().toISOString();
    const novoHistorico = [
      landingPageVersaoPublicada,
      ...landingPageHistoricoVersoes,
    ].slice(0, 10);
    const landingPageConfig = montarLandingPageConfig(
      novaVersaoPublicada,
      novoHistorico
    );
    const { error } = await atualizarEmpresa(empresaId, {
      landing_page_config: landingPageConfig,
    } as Parameters<typeof atualizarEmpresa>[1]);

    if (error) {
      alert(error.message || "Erro ao publicar alteracoes.");
      return;
    }

    setLandingPageVersaoPublicada(novaVersaoPublicada);
    setLandingPageHistoricoVersoes(novoHistorico);
    setLandingPageVersaoHistoricoVisualizada(null);
    alert("Alteracoes publicadas com sucesso!");
  }

  async function descartarLandingPageAlteracoes() {
    if (!window.confirm("Descartar as alteracoes do rascunho e voltar para a versao publicada?")) {
      return;
    }

    aplicarLandingPagePublicavel(landingPageVersaoPublicada);

    if (!empresaId) return;

    const landingPageConfig: LandingPageConfig = {
      ...landingPageVersaoPublicada,
      versaoPublicada: landingPageVersaoPublicada,
      alteracoesNaoPublicadas: false,
      historicoVersoes: landingPageHistoricoVersoes,
    };
    const { error } = await atualizarEmpresa(empresaId, {
      landing_page_config: landingPageConfig,
    } as Parameters<typeof atualizarEmpresa>[1]);

    if (error) {
      alert(error.message || "Erro ao descartar alteracoes.");
    }
  }

  async function restaurarLandingPageVersaoHistorico(
    versao: LandingPagePublicavelConfig
  ) {
    if (!window.confirm("Restaurar esta versao como rascunho atual? A versao publica continuara igual ate publicar novamente.")) {
      return;
    }

    aplicarLandingPagePublicavel(versao);
    setLandingPageVersaoHistoricoVisualizada(null);

    if (!empresaId) return;

    const landingPageConfig: LandingPageConfig = {
      ...versao,
      versaoPublicada: landingPageVersaoPublicada,
      alteracoesNaoPublicadas:
        JSON.stringify(versao) !== JSON.stringify(landingPageVersaoPublicada),
      historicoVersoes: landingPageHistoricoVersoes,
    };
    const { error } = await atualizarEmpresa(empresaId, {
      landing_page_config: landingPageConfig,
    } as Parameters<typeof atualizarEmpresa>[1]);

    if (error) {
      alert(error.message || "Erro ao restaurar versao.");
      return;
    }

    alert("Versao restaurada no rascunho.");
  }

  async function salvar() {
    if (salvandoEmpresa) return;

    const slugFinal = gerarSlug(slugAdmin || slug);

    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente.");
      return;
    }

    if (!slugFinal) {
      alert("Informe um slug válido antes de salvar.");
      return;
    }

    const whatsappLocal = obterTelefoneLocal(whatsapp);
    const telefoneLocal = obterTelefoneLocal(telefone);
    const landingPageConfig = montarLandingPageConfig();
    const cardapioConfig = montarCardapioConfig();
    const catalogoConfig = montarCatalogoConfig();
    const agendamentoConfig = montarAgendamentoConfig();
    const wifiMarketingPayload = montarWifiMarketingConfig();
    const fidelidadePayload = montarFidelidadeConfig();
    const iaPayload = montarIaConfig();
    const crmConfig = montarCrmConfig();
    const erpPdvConfig = montarErpPdvConfig();

    if (whatsappLocal && whatsappLocal.length < 10) {
      alert("Informe um WhatsApp válido com DDD.");
      return;
    }

    if (telefoneLocal && telefoneLocal.length < 10) {
      alert("Informe um telefone válido com DDD.");
      return;
    }

    const dadosEmpresa: Record<string, unknown> = {
      nome,
      slug: slugFinal,
      tipo: tipoGerenciamento,
      categoria,
      descricao,

      telefone: telefoneLocal,
      whatsapp: whatsappLocal ? `55${whatsappLocal}` : "",
      email,

      site,
      instagram: normalizarUsuarioRedeSocial(instagram),
      facebook: normalizarUsuarioRedeSocial(facebook),
      endereco,
      horario_atendimento: horarioAtendimento,
      google_review_url: googleReviewUrl,

      pix,
      pix_nome: pixNome,
      pix_chave: pixChave,

      wifi_nome: wifiNome,
      wifi_senha: wifiSenha,

      logo,
      banner,
      logo_exibicao: logoExibicao,
      cor_principal: corPrincipal,
      cor_secundaria: corSecundaria,
      cor_botoes: corBotoes,
      cor_texto_botoes: corTextoBotoes,
      cor_fundo_pagina: corFundoPagina,
      cor_area_principal: corAreaPrincipal,
      tipo_fundo: "solida",
      gradiente_inicio: gradienteInicio,
      gradiente_fim: gradienteFim,
      gradiente_direcao: gradienteDirecao,
      tiktok: normalizarUsuarioRedeSocial(tiktok),
      youtube: normalizarUsuarioRedeSocial(youtube),
      kwai: normalizarUsuarioRedeSocial(kwai),
      landing_page_config: landingPageConfig,
      cardapio_config: cardapioConfig,
      catalogo_config: catalogoConfig,
      agendamento_config: agendamentoConfig,
      wifi_marketing_config: wifiMarketingPayload,
      fidelidade_config: fidelidadePayload,
      ia_config: iaPayload,
      crm_config: crmConfig,
      erp_pdv_config: erpPdvConfig,
    };

    if (suportaCorFundoHero) {
      dadosEmpresa.cor_fundo_hero = corFundoHero;
    }

    if (!modoCliente) {
      dadosEmpresa.plano = plano;
      dadosEmpresa.recursos_contratados = recursosContratados;
    }

    console.log("[Diagnóstico UPDATE] Antes de chamar atualizarEmpresa:", {
      idRecebidoNoFormulario: empresaInicialId,
      idEnviadoAoService: empresaId,
      slugUsado: slugFinal,
      payloadEnviado: dadosEmpresa,
    });

    setSalvandoEmpresa(true);
    setFeedbackSalvamento({
      tipo: "info",
      texto: "Salvando alteracoes...",
    });

    const { error } = await atualizarEmpresa(
      empresaId,
      dadosEmpresa as Parameters<typeof atualizarEmpresa>[1]
    );

    if (error) {
      console.error("Erro completo ao salvar empresa:", error);
      console.error("Contexto do update da empresa:", {
        idUsado: empresaId,
        slugUsado: slugFinal,
        payloadEnviado: dadosEmpresa,
      });
      setSalvandoEmpresa(false);
      setFeedbackSalvamento({
        tipo: "erro",
        texto: error.message || "Erro ao salvar. Revise os dados e tente novamente.",
      });
      alert(error.message || "Erro ao salvar.");
      return;
    }

    setSlug(slugFinal);
    setSlugAdmin(slugFinal);
    setAparenciaSalva({
      logoExibicao,
      corPrincipal,
      corSecundaria,
      corBotoes,
      corTextoBotoes,
      corFundoPagina,
      corAreaPrincipal,
      corFundoHero,
      tipoFundo,
      gradienteInicio,
      gradienteFim,
      gradienteDirecao,
    });
    onEmpresaAtualChange?.({
      nome,
      logo,
    });

    setSalvandoEmpresa(false);
    setFeedbackSalvamento({
      tipo: "sucesso",
      texto: "Dados salvos com sucesso. Recarregue a empresa para conferir os dados persistidos.",
    });
    alert("Dados salvos com sucesso!");
    onSalvar?.();
  }

  async function salvarLogo(url: string) {
    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente antes de alterar a logo.");
      return;
    }

    setLogo(url);

    const { error } = await atualizarEmpresa(empresaId, {
      logo: url,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `código ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar logo no Supabase:", error);

      alert(`Erro ao salvar logo no Supabase: ${mensagemErro}`);
      return;
    }

    onEmpresaAtualChange?.({
      nome,
      logo: url,
    });
  }

  async function salvarBanner(url: string) {
    if (!empresaId) {
      alert("Empresa ainda não foi carregada. Tente novamente antes de alterar o banner.");
      return;
    }

    const bannerAtualizado = url ? adicionarVersaoImagem(url) : "";

    setBanner(bannerAtualizado);

    const { error } = await atualizarEmpresa(empresaId, {
      banner: bannerAtualizado,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `código ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar banner no Supabase:", error);

      alert(`Erro ao salvar banner no Supabase: ${mensagemErro}`);
    }
  }

  function aplicarTemaPronto(tema: TemaOficial) {
    aplicarAparencia({
      ...tema.aparencia,
      logoExibicao,
    });
  }

  function aplicarAparencia(aparencia: AparenciaConfig) {
    setLogoExibicao(aparencia.logoExibicao);
    setCorPrincipal(aparencia.corPrincipal);
    setCorSecundaria(aparencia.corSecundaria);
    setCorBotoes(aparencia.corBotoes);
    setCorTextoBotoes(aparencia.corTextoBotoes);
    setCorFundoPagina(aparencia.corFundoPagina);
    setCorAreaPrincipal(aparencia.corAreaPrincipal);
    setCorFundoHero(aparencia.corFundoHero);
    setTipoFundo(aparencia.tipoFundo);
    setGradienteInicio(aparencia.gradienteInicio);
    setGradienteFim(aparencia.gradienteFim);
    setGradienteDirecao(aparencia.gradienteDirecao);
  }

  function obterEstiloPreview(): CSSProperties {
    const estilo = {} as CSSProperties & Record<string, string>;
    const tema = {
      corPrincipal: corPrincipal || TemaPadraoMikatech.corPrincipal,
      corSecundaria: corSecundaria || TemaPadraoMikatech.corSecundaria,
      corBotoes: corBotoes || TemaPadraoMikatech.corBotoes,
      corTextoBotoes:
        corTextoBotoes || TemaPadraoMikatech.corTextoBotoes,
      corFundoPagina:
        corFundoPagina || TemaPadraoMikatech.corFundoPagina,
      corAreaPrincipal:
        corAreaPrincipal || TemaPadraoMikatech.corAreaPrincipal,
      corFundoHero: corFundoHero || TemaPadraoMikatech.corFundoHero,
      tipoFundo: tipoFundo || TemaPadraoMikatech.tipoFundo,
      gradienteInicio:
        gradienteInicio || TemaPadraoMikatech.gradienteInicio,
      gradienteFim: gradienteFim || TemaPadraoMikatech.gradienteFim,
      gradienteDirecao:
        gradienteDirecao || TemaPadraoMikatech.gradienteDirecao,
    };
    const direcaoGradiente = {
      horizontal: "90deg",
      vertical: "180deg",
      diagonal: "135deg",
    }[tema.gradienteDirecao];

    estilo["--mc-primary"] = tema.corPrincipal;
    estilo["--mc-text"] = tema.corPrincipal;
    estilo["--mc-secondary"] = tema.corSecundaria;
    estilo["--mc-accent"] = tema.corSecundaria;
    estilo["--mc-button-background"] = tema.corBotoes;
    estilo["--mc-button-text"] = tema.corTextoBotoes;
    estilo["--mc-background"] = tema.corFundoPagina;
    estilo["--mc-background-soft"] = tema.corFundoPagina;
    estilo["--mc-hero-background"] = tema.corFundoHero;
    estilo["--mc-content-background"] = tema.corAreaPrincipal;
    estilo["--mc-card"] = tema.corAreaPrincipal;
    estilo["--mc-surface"] = tema.corAreaPrincipal;
    estilo["--mc-page-background"] = tema.corFundoPagina;
    estilo["--mc-border"] = `color-mix(in srgb, ${tema.corPrincipal} 16%, transparent)`;
    estilo["--mc-border-strong"] = `color-mix(in srgb, ${tema.corPrincipal} 28%, transparent)`;

    if (tema.tipoFundo === "gradiente") {
      estilo["--mc-page-background"] =
        `linear-gradient(${direcaoGradiente}, ${tema.gradienteInicio} 0%, ${tema.gradienteFim} 100%)`;
    }

    return estilo;
  }

  function montarContextoLandingPageIa(): LandingPageIaContexto {
    const servicosPreenchidos = landingPageServicos.filter((servico) =>
      servico.titulo.trim() || servico.descricao.trim()
    );

    return {
      nomeEmpresa: nome.trim(),
      categoria: categoria.trim(),
      descricao: descricao.trim(),
      servicos:
        servicosPreenchidos.length > 0
          ? servicosPreenchidos
          : landingPageServicosExemplo,
      contatos: {
        telefone: landingPageContato.telefone.trim() || telefone.trim(),
        whatsapp: landingPageContato.whatsapp.trim() || whatsapp.trim(),
        email: landingPageContato.email.trim() || email.trim(),
        endereco: landingPageContato.endereco.trim() || endereco.trim(),
      },
    };
  }

  const contextoLandingPageIa = montarContextoLandingPageIa();
  const landingPageRascunhoAtual = montarLandingPageRascunho();
  const possuiAlteracoesNaoPublicadas =
    JSON.stringify(landingPageRascunhoAtual) !==
    JSON.stringify(landingPageVersaoPublicada);
  const landingPagePublicadaEfetiva = landingPageVersaoPublicada.publicada;
  const landingPagePreviewConfig = montarLandingPageConfig();
  const iaContextoPreview = criarIaContextoUnificado();
  const iaPromptMestrePreview = gerarIaPromptMestre(iaContextoPreview);
  const pastaUploadLanding = `landing-page/${slugPublico || empresaId || "rascunho"}`;
  const empresaLandingPreview: EmpresaLanding = {
    id: empresaId || "preview",
    nome: nome || "Landing Page",
    slug: slugPublico || "preview",
    categoria,
    tipo: tipoGerenciamento,
    descricao,
    telefone,
    whatsapp,
    email,
    instagram,
    tiktok,
    youtube,
    kwai,
    facebook,
    site,
    endereco,
    horario_atendimento: horarioAtendimento,
    google_review_url: googleReviewUrl,
    pix,
    pix_nome: pixNome,
    pix_chave: pixChave,
    wifi_nome: wifiNome,
    wifi_senha: wifiSenha,
    landing_page_config: landingPagePreviewConfig,
    logo,
    banner,
    ativo: true,
    logo_exibicao: logoExibicao,
    cor_principal: corPrincipal,
    cor_secundaria: corSecundaria,
    cor_botoes: corBotoes,
    cor_texto_botoes: corTextoBotoes,
    cor_fundo_pagina: corFundoPagina,
    cor_fundo_hero: corFundoHero,
    cor_area_principal: corAreaPrincipal,
    tipo_fundo: tipoFundo,
    gradiente_inicio: gradienteInicio,
    gradiente_fim: gradienteFim,
    gradiente_direcao: gradienteDirecao,
    recursos_contratados: recursosContratados,
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
      <div className="flex max-w-full flex-wrap gap-2 overflow-x-auto rounded-2xl border bg-white p-2 shadow-sm">
        {abasEmpresa
          .filter((aba) => !aba.adminOnly || !modoCliente)
          .map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={
              abaAtiva === aba.id
                ? "shrink-0 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white"
                : "shrink-0 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
            }
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "informacoes" && (
        <>
          <Card
        title="Identidade da Empresa"
        subtitle="Dados principais exibidos no painel e na página pública."
      >
        <div className="grid lg:grid-cols-3 gap-5">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <div>
            <label className="block mb-2 font-medium">
              Categoria
            </label>

            <select
              className="w-full border rounded-xl p-3 bg-white"
              value={categoriaSelecionada}
              onChange={(e) => {
                if (e.target.value === "Outra") {
                  setCategoria(categoriasEmpresa.includes(categoria) ? "" : categoria);
                  return;
                }

                setCategoria(e.target.value);
              }}
            >
              {categoriasEmpresa.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}

              <option value="Outra">
                Outra
              </option>
            </select>
          </div>

          {categoriaSelecionada === "Outra" && (
            <Input
              label="Categoria personalizada"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          )}

          {!modoCliente && (
            <>
              <div className="hidden">
                <Input
                  label="Slug administrativo"
                  value={slugAdmin}
                  onChange={(e) => setSlugAdmin(gerarSlug(e.target.value))}
                />

                <p className="mt-2 text-sm text-slate-500">
                  Campo reservado para o administrador {BrandConfig.developerCompany}.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Tipo de gerenciamento
                </label>

                <select
                  className="w-full border rounded-xl p-3 bg-white"
                  value={tipoGerenciamento}
                  onChange={(e) => setTipoGerenciamento(e.target.value)}
                >
                  <option value="mikatech">
                    Administrada pela {BrandConfig.developerCompany}
                  </option>

                  <option value="cliente">
                    Cliente administra
                  </option>
                </select>
              </div>
            </>
          )}

          <div className="lg:col-span-3">
            <label className="block mb-2 font-medium">
              Descrição
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-24"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte em poucas palavras o que sua empresa oferece."
            />
          </div>
        </div>
      </Card>

          <QRCodeEmpresa
            slug={slugPublico}
            nomeEmpresa={nome}
            landingPageContratada={recursosContratados.landing_page}
            landingPagePublicada={landingPagePublicadaEfetiva}
          />

        </>
      )}

      {abaAtiva === "plano" && !modoCliente && (
        <Card
          title="Plano e Recursos"
          subtitle="Controle quais funcionalidades esta empresa possui contratadas."
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Plano contratado
              </h3>

              <div className="grid gap-3 md:grid-cols-3">
                {planosEmpresa.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setPlano(opcao.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      plano === opcao.id
                        ? "border-green-600 bg-green-50 ring-4 ring-green-100"
                        : "border-slate-200 bg-white hover:border-green-200"
                    }`}
                  >
                    <span className="block font-bold text-slate-900">
                      {opcao.nome}
                    </span>

                    <span className="mt-2 block text-sm leading-6 text-slate-500">
                      {opcao.descricao}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3">
                <h3 className="font-bold text-slate-800">
                  Recursos contratados
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ative apenas os modulos liberados para esta empresa. Modulos futuros podem ser cadastrados aqui sem alterar a logica do painel.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recursosEmpresa.map((recurso) => {
                  const ativo = recursosContratados[recurso.id];

                  return (
                    <button
                      key={recurso.id}
                      type="button"
                      onClick={() => alternarRecurso(recurso.id)}
                      className={`flex min-h-32 flex-col justify-between rounded-2xl border p-4 text-left transition ${
                        ativo
                          ? "border-green-600 bg-green-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span>
                        <span className="flex items-start justify-between gap-3">
                          <span>
                            <span className="block font-bold text-slate-900">
                              {recurso.nome}
                            </span>

                            <span className="mt-1 block text-sm leading-6 text-slate-500">
                              {recurso.descricao}
                            </span>
                          </span>

                          <span
                            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                              ativo ? "bg-green-600" : "bg-slate-300"
                            }`}
                            aria-hidden="true"
                          >
                            <span
                              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                ativo ? "left-6" : "left-1"
                              }`}
                            />
                          </span>
                        </span>
                      </span>

                      <span
                        className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          ativo
                            ? "bg-green-700 text-white"
                            : recurso.statusInativo === "Em breve"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ativo ? "Ativo" : recurso.statusInativo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800">
                    Monitoramento de Storage
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Leitura basica do bucket empresas para acompanhar arquivos, espaco usado e consumo por empresa quando a estrutura de pastas permite identificar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={carregarResumoStorage}
                  disabled={storageCarregando}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  {storageCarregando ? "Atualizando..." : "Atualizar"}
                </button>
              </div>

              {storageErro && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                  Nao foi possivel ler o Storage agora: {storageErro}
                </p>
              )}

              {storageResumo ? (
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Espaco utilizado
                      </span>
                      <strong className="mt-2 block text-2xl text-slate-900">
                        {formatarBytesStorage(storageResumo.bytes)}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Arquivos
                      </span>
                      <strong className="mt-2 block text-2xl text-slate-900">
                        {storageResumo.arquivos}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Empresas/pastas
                      </span>
                      <strong className="mt-2 block text-2xl text-slate-900">
                        {storageResumo.porEmpresa.length}
                      </strong>
                    </div>
                  </div>

                  {storageResumo.porEmpresa.length > 0 && (
                    <div className="rounded-2xl border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <h4 className="font-bold text-slate-800">
                          Consumo por empresa
                        </h4>
                      </div>

                      <div className="divide-y divide-slate-200">
                        {storageResumo.porEmpresa.slice(0, 8).map((empresa) => (
                          <div
                            key={empresa.empresa}
                            className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_120px_120px]"
                          >
                            <span className="truncate font-semibold text-slate-700">
                              {empresa.empresa}
                            </span>
                            <span className="text-slate-500">
                              {empresa.arquivos} arquivo(s)
                            </span>
                            <span className="font-semibold text-slate-700">
                              {formatarBytesStorage(empresa.bytes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                    {storageResumo.avisoPlanoGratuito}
                  </p>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  {storageCarregando
                    ? "Carregando resumo de Storage..."
                    : "Abra ou atualize este painel para consultar o Storage."}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {abaAtiva === "erpPdv" && (
        <Card
          title="ERP/PDV"
          subtitle="Base inicial online para produtos, estoque, vendas e caixa."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.erp_pdv
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.erp_pdv
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.erp_pdv ? "Ativo" : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    ERP/PDV online
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Cadastro inicial de categorias, produtos e estoque. Fiscal, emissao de documentos e modo offline ficam fora desta Sprint.
                  </p>

                  {!erpPdvPilotoMikatech && (
                    <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-amber-700">
                      Piloto inicial previsto para a empresa Mikatech.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => carregarErpPdvDados()}
                  disabled={erpPdvCarregando || !empresaId}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {erpPdvCarregando ? "Atualizando..." : "Atualizar dados"}
                </button>
              </div>
            </div>

            {erpPdvFeedback && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  erpPdvFeedback.tipo === "sucesso"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : erpPdvFeedback.tipo === "erro"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {erpPdvFeedback.texto}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Impressao
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Configuracao de cupons
                  </h4>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                    Defina o destino padrao do cupom. A impressao direta fica
                    preparada para o futuro Conector de Impressao local; o
                    navegador continua funcionando como compatibilidade atual.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={salvarConfigImpressaoErpPdv}
                  disabled={!recursosContratados.erp_pdv || erpPdvSalvando}
                  className="rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {erpPdvSalvando ? "Salvando..." : "Salvar impressao"}
                </button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="block font-medium text-slate-700">
                    Destino padrao
                  </label>

                  <select
                    value={erpPdvImpressaoConfig.modo}
                    onChange={(e) =>
                      atualizarErpPdvImpressaoConfig(
                        "modo",
                        e.target.value as ErpPdvModoImpressao
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    {erpPdvModosImpressao.map((modo) => (
                      <option key={modo.id} value={modo.id}>
                        {modo.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {
                      erpPdvModosImpressao.find(
                        (modo) => modo.id === erpPdvImpressaoConfig.modo
                      )?.descricao
                    }
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Perfil
                  </label>

                  <select
                    value={erpPdvImpressaoConfig.perfil}
                    onChange={(e) =>
                      atualizarErpPdvImpressaoConfig(
                        "perfil",
                        e.target.value as ErpPdvPerfilImpressao
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    {erpPdvPerfisImpressao.map((perfil) => (
                      <option key={perfil.id} value={perfil.id}>
                        {perfil.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {
                      erpPdvPerfisImpressao.find(
                        (perfil) => perfil.id === erpPdvImpressaoConfig.perfil
                      )?.descricao
                    }
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Largura
                  </label>

                  <select
                    value={erpPdvImpressaoConfig.largura}
                    onChange={(e) =>
                      atualizarErpPdvImpressaoConfig(
                        "largura",
                        e.target.value as ErpPdvCupomLayout
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="58mm">58 mm</option>
                    <option value="80mm">80 mm</option>
                    <option value="a4">A4</option>
                  </select>
                </div>

                <Input
                  label="Nome da impressora"
                  value={erpPdvImpressaoConfig.nomeImpressora}
                  onChange={(e) =>
                    atualizarErpPdvImpressaoConfig(
                      "nomeImpressora",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Caixa 01, Epson, Bematech"
                />

                <Input
                  label="Marca"
                  value={erpPdvImpressaoConfig.marca}
                  onChange={(e) =>
                    atualizarErpPdvImpressaoConfig("marca", e.target.value)
                  }
                  placeholder="Ex.: Epson, Elgin, Bematech"
                />

                <Input
                  label="Modelo"
                  value={erpPdvImpressaoConfig.modelo}
                  onChange={(e) =>
                    atualizarErpPdvImpressaoConfig("modelo", e.target.value)
                  }
                  placeholder="Ex.: TM-T20, i9, MP-4200"
                />

                <Input
                  label="Numero de vias"
                  value={String(erpPdvImpressaoConfig.numeroVias)}
                  onChange={(e) =>
                    atualizarErpPdvImpressaoConfig(
                      "numeroVias",
                      Math.min(Math.max(Number(e.target.value) || 1, 1), 5)
                    )
                  }
                  placeholder="1"
                />

                <label className="flex min-h-[74px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={erpPdvImpressaoConfig.impressaoAutomatica}
                    onChange={(e) =>
                      atualizarErpPdvImpressaoConfig(
                        "impressaoAutomatica",
                        e.target.checked
                      )
                    }
                  />
                  Imprimir automaticamente apos finalizar venda
                </label>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p className="font-bold">Conector local</p>
                  <p className="mt-1">
                    Estrutura preparada. O instalador e a comunicacao direta
                    com impressoras ficam para sprint futura.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Caixa
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Operacao do caixa
                  </h4>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                    Abra o caixa antes de vender. O fechamento consolida vendas,
                    suprimentos, sangrias e diferenca informada.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                    erpPdvCaixaAberto
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {erpPdvCaixaAberto ? "Caixa aberto" : "Caixa fechado"}
                </span>
              </div>

              {!erpPdvCaixaAberto ? (
                <>
                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <Input
                      label="Operador"
                      value={erpPdvCaixaOperador}
                      onChange={(e) => setErpPdvCaixaOperador(e.target.value)}
                      placeholder="Nome do operador"
                    />

                    <Input
                      label="Valor inicial"
                      value={erpPdvCaixaSaldoInicial}
                      onChange={(e) =>
                        setErpPdvCaixaSaldoInicial(e.target.value)
                      }
                      placeholder="0,00"
                    />

                    <button
                      type="button"
                      onClick={abrirCaixaErpPdv}
                      disabled={
                        !recursosContratados.erp_pdv ||
                        erpPdvSalvando ||
                        !erpPdvCaixaOperador.trim()
                      }
                      className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {erpPdvSalvando ? "Abrindo..." : "Abrir caixa"}
                    </button>
                  </div>

                  {erpPdvResumoCaixa?.caixa.status === "fechado" && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                        Ultimo fechamento
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                        <span>
                          Esperado: R${" "}
                          {erpPdvResumoCaixa.totalEsperado.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                        <span>
                          Informado: R${" "}
                          {erpPdvResumoCaixa.valorInformado.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                        <span>
                          Diferenca: R${" "}
                          {erpPdvResumoCaixa.diferenca.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Operador
                        </p>
                        <p className="mt-1 font-black text-slate-900">
                          {erpPdvCaixaAberto.operador}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Aberto em
                        </p>
                        <p className="mt-1 font-black text-slate-900">
                          {new Date(erpPdvCaixaAberto.aberto_em).toLocaleString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Valor inicial
                        </p>
                        <p className="mt-1 font-black text-slate-900">
                          R${" "}
                          {erpPdvCaixaAberto.saldo_inicial.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                      <div>
                        <label className="block font-medium text-slate-700">
                          Tipo
                        </label>
                        <select
                          value={erpPdvCaixaMovimentoForm.tipo}
                          onChange={(e) =>
                            setErpPdvCaixaMovimentoForm((formAtual) => ({
                              ...formAtual,
                              tipo: e.target
                                .value as ErpPdvCaixaMovimentacaoTipo,
                            }))
                          }
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        >
                          <option value="suprimento">Suprimento</option>
                          <option value="sangria">Sangria</option>
                        </select>
                      </div>

                      <Input
                        label="Valor"
                        value={erpPdvCaixaMovimentoForm.valor}
                        onChange={(e) =>
                          setErpPdvCaixaMovimentoForm((formAtual) => ({
                            ...formAtual,
                            valor: e.target.value,
                          }))
                        }
                        placeholder="0,00"
                      />

                      <Input
                        label="Observacao"
                        value={erpPdvCaixaMovimentoForm.observacao}
                        onChange={(e) =>
                          setErpPdvCaixaMovimentoForm((formAtual) => ({
                            ...formAtual,
                            observacao: e.target.value,
                          }))
                        }
                        placeholder="Opcional"
                      />

                      <button
                        type="button"
                        onClick={registrarMovimentoCaixaErpPdv}
                        disabled={
                          erpPdvSalvando ||
                          !erpPdvCaixaMovimentoForm.valor.trim()
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Registrar
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <span>
                        Inicial: R${" "}
                        {(erpPdvResumoCaixa?.caixa.saldo_inicial || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                      <span>
                        Vendas: R${" "}
                        {(erpPdvResumoCaixa?.totalVendas || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                      <span>
                        Suprimentos: R${" "}
                        {(erpPdvResumoCaixa?.suprimentos || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                      <span>
                        Sangrias: R${" "}
                        {(erpPdvResumoCaixa?.sangrias || 0).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p className="font-bold text-slate-900">
                        Vendas por pagamento
                      </p>
                      {Object.entries(
                        erpPdvResumoCaixa?.vendasPorFormaPagamento || {}
                      ).length ? (
                        Object.entries(
                          erpPdvResumoCaixa?.vendasPorFormaPagamento || {}
                        ).map(([forma, valor]) => (
                          <div
                            key={forma}
                            className="mt-1 flex justify-between gap-2"
                          >
                            <span>{obterLabelFormaPagamentoErpPdv(forma)}</span>
                            <span>
                              R${" "}
                              {valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="mt-1">Nenhuma venda neste caixa.</p>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
                      <Input
                        label="Valor informado"
                        value={erpPdvCaixaValorFechamento}
                        onChange={(e) =>
                          setErpPdvCaixaValorFechamento(e.target.value)
                        }
                        placeholder="0,00"
                      />

                      <Input
                        label="Observacao fechamento"
                        value={erpPdvCaixaObservacaoFechamento}
                        onChange={(e) =>
                          setErpPdvCaixaObservacaoFechamento(e.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-500">
                          Total esperado
                        </p>
                        <p className="text-2xl font-black text-slate-950">
                          R${" "}
                          {(erpPdvResumoCaixa?.totalEsperado || 0).toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={fecharCaixaErpPdv}
                        disabled={erpPdvSalvando}
                        className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {erpPdvSalvando ? "Fechando..." : "Fechar caixa"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex min-w-0 flex-col gap-4 xl:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-green-300">
                        Frente de caixa
                      </p>

                      <h4 className="mt-2 text-2xl font-black">
                        PDV rapido
                      </h4>
                    </div>

                    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-green-100">
                      Finalizacao real sem fiscal e sem TEF
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                    <Input
                      label="Buscar por nome, SKU ou codigo de barras"
                      value={erpPdvPdvBusca}
                      onChange={(e) => setErpPdvPdvBusca(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          adicionarProdutoDaBuscaErpPdv();
                        }
                      }}
                      placeholder="Digite ou leia o codigo de barras"
                      className="border-white/20 bg-white text-slate-900"
                    />

                    <div>
                      <label className="block text-sm font-bold text-slate-200">
                        Tabela
                      </label>
                      <select
                        value={erpPdvTabelaPrecoVenda}
                        onChange={(e) =>
                          setErpPdvTabelaPrecoVenda(
                            e.target.value as ErpPdvTabelaPreco
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-900/40"
                      >
                        {erpPdvTabelasPreco.map((tabela) => (
                          <option key={tabela.id} value={tabela.id}>
                            {tabela.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={adicionarProdutoDaBuscaErpPdv}
                      disabled={
                        !recursosContratados.erp_pdv ||
                        erpPdvPdvProdutosEncontrados.length === 0
                      }
                      className="mt-7 rounded-2xl bg-green-500 px-6 py-4 text-base font-black text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {erpPdvPdvProdutosEncontrados.length > 0 ? (
                      erpPdvPdvProdutosEncontrados.map((produto) => {
                        const precoTabela = obterPrecoProdutoPorTabelaErpPdv(
                          produto,
                          erpPdvTabelaPrecoVenda
                        );
                        const indicadores = calcularIndicadoresPrecoErpPdv(
                          produto.custo,
                          precoTabela
                        );

                        return (
                        <button
                          type="button"
                          key={produto.id}
                          onClick={() => adicionarProdutoAoCarrinhoErpPdv(produto)}
                          disabled={
                            !recursosContratados.erp_pdv ||
                            produto.estoque_atual <= 0 ||
                            indicadores.abaixoDoCusto
                          }
                          className="min-h-32 rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition hover:border-green-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                              {produto.imagem_url ? (
                                <img
                                  src={produto.imagem_url}
                                  alt={produto.nome}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">
                                  Foto
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-black">
                                {produto.nome}
                              </p>
                              <p className="mt-1 text-xs text-slate-300">
                                SKU: {produto.sku || "nao informado"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                            <span className="font-black text-green-200">
                              R${" "}
                              {formatarMoedaErpPdv(precoTabela)}
                            </span>
                            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-slate-200">
                              Est.: {formatarNumeroErpPdv(produto.estoque_atual)}
                            </span>
                          </div>
                          {indicadores.abaixoDoCusto && (
                            <p className="mt-2 rounded-lg bg-red-500/20 px-2 py-1 text-xs font-bold text-red-100">
                              Preco abaixo do custo
                            </p>
                          )}
                        </button>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl bg-white/10 px-4 py-4 text-sm font-semibold text-slate-300 md:col-span-2 xl:col-span-4">
                        Nenhum produto ativo encontrado para o termo informado.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-col rounded-2xl bg-white p-4 text-slate-900 xl:w-[420px]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                        Carrinho
                      </p>
                      <h4 className="mt-2 text-xl font-black">
                        {erpPdvCarrinhoQuantidadeItens} item(ns)
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={limparCarrinhoErpPdv}
                      disabled={erpPdvCarrinho.length === 0}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Limpar
                    </button>
                  </div>

                  <div className="mt-4 max-h-[520px] flex-1 space-y-3 overflow-y-auto pr-1">
                    {erpPdvCarrinhoDetalhado.length > 0 ? (
                      erpPdvCarrinhoDetalhado.map((item) => (
                        <div
                          key={item.produto.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                              {item.produto.imagem_url ? (
                                <img
                                  src={item.produto.imagem_url}
                                  alt={item.produto.nome}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                                  Foto
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-2 font-black text-slate-900">
                                    {item.produto.nome}
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-slate-500">
                                    Unit.: R${" "}
                                    {formatarMoedaErpPdv(item.precoUnitario)}
                                  </p>
                                  <p className="mt-1 text-xs font-bold text-green-700">
                                    {obterLabelTabelaPrecoErpPdv(item.tabelaPreco)}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removerItemCarrinhoErpPdv(item.produto.id)
                                  }
                                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-black text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                >
                                  Remover
                                </button>
                              </div>

                              <div className="mt-3 grid grid-cols-[1fr_1fr] items-end gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-slate-600">
                                    Qtd.
                                  </label>
                                  <input
                                    value={formatarNumeroErpPdv(item.quantidade)}
                                    onChange={(e) =>
                                      atualizarQuantidadeCarrinhoErpPdv(
                                        item.produto,
                                        e.target.value
                                      )
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-black outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                  />
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-500">
                                    Subtotal
                                  </p>
                                  <p className="text-lg font-black text-slate-950">
                                    R${" "}
                                    {item.subtotal.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                        Carrinho vazio. Busque ou toque em um produto para iniciar.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Cliente da venda
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {erpPdvClienteSelecionado
                            ? erpPdvClienteSelecionado.nome
                            : "Consumidor nao identificado"}
                        </p>
                        {erpPdvClienteSelecionado && (
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {[
                              erpPdvClienteSelecionado.cpf_cnpj,
                              erpPdvClienteSelecionado.telefone,
                            ]
                              .filter(Boolean)
                              .join(" | ") || "Sem documento/telefone"}
                          </p>
                        )}
                      </div>

                      {erpPdvClienteSelecionado && (
                        <button
                          type="button"
                          onClick={limparClienteVendaErpPdv}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={erpPdvClienteBusca}
                        onChange={(e) => setErpPdvClienteBusca(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            buscarClientesVendaErpPdv();
                          }
                        }}
                        placeholder="Buscar por nome, CPF/CNPJ ou telefone"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                      <button
                        type="button"
                        onClick={buscarClientesVendaErpPdv}
                        disabled={erpPdvSalvando}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Buscar
                      </button>
                    </div>

                    {erpPdvClientesEncontrados.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {erpPdvClientesEncontrados.map((clienteErp) => (
                          <button
                            type="button"
                            key={clienteErp.id}
                            onClick={() => selecionarClienteVendaErpPdv(clienteErp)}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              erpPdvClienteSelecionadoId === clienteErp.id
                                ? "border-green-500 bg-green-50 text-green-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50"
                            }`}
                          >
                            <span className="block font-black">
                              {clienteErp.nome}
                            </span>
                            <span className="mt-1 block text-xs font-semibold text-slate-500">
                              {[
                                clienteErp.cpf_cnpj,
                                clienteErp.telefone,
                                clienteErp.whatsapp,
                              ]
                                .filter(Boolean)
                                .join(" | ") || "Sem contato cadastrado"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setErpPdvExibirCadastroCliente((exibir) => !exibir)
                      }
                      className="mt-3 rounded-xl border border-dashed border-green-300 bg-white px-4 py-3 text-sm font-black text-green-700 transition hover:bg-green-50"
                    >
                      {erpPdvExibirCadastroCliente
                        ? "Ocultar cadastro rapido"
                        : "Cadastrar cliente sem sair do PDV"}
                    </button>

                    {erpPdvExibirCadastroCliente && (
                      <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-white p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            label="Nome"
                            value={erpPdvClienteForm.nome}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv("nome", e.target.value)
                            }
                            placeholder="Nome do cliente"
                          />
                          <Input
                            label="CPF/CNPJ"
                            value={erpPdvClienteForm.cpfCnpj}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv(
                                "cpfCnpj",
                                e.target.value
                              )
                            }
                            placeholder="Documento"
                          />
                          <Input
                            label="Telefone"
                            value={erpPdvClienteForm.telefone}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv(
                                "telefone",
                                e.target.value
                              )
                            }
                            placeholder="Telefone"
                          />
                          <Input
                            label="WhatsApp"
                            value={erpPdvClienteForm.whatsapp}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv(
                                "whatsapp",
                                e.target.value
                              )
                            }
                            placeholder="WhatsApp"
                          />
                          <Input
                            label="E-mail"
                            value={erpPdvClienteForm.email}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv("email", e.target.value)
                            }
                            placeholder="cliente@email.com"
                          />
                          <Input
                            label="Endereco"
                            value={erpPdvClienteForm.endereco}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv(
                                "endereco",
                                e.target.value
                              )
                            }
                            placeholder="Endereco completo"
                          />
                        </div>

                        <label className="block text-sm font-medium text-slate-700">
                          Observacoes
                          <textarea
                            value={erpPdvClienteForm.observacoes}
                            onChange={(e) =>
                              atualizarClienteFormErpPdv(
                                "observacoes",
                                e.target.value
                              )
                            }
                            placeholder="Preferencias, referencias ou detalhes importantes"
                            className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={salvarClienteVendaErpPdv}
                          disabled={erpPdvSalvando || !erpPdvClienteForm.nome.trim()}
                          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {erpPdvSalvando
                            ? "Salvando cliente..."
                            : "Salvar e vincular cliente"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                          Pagamento
                        </label>

                        <select
                          value={erpPdvFormaPagamentoVenda}
                          onChange={(e) =>
                            setErpPdvFormaPagamentoVenda(
                              e.target.value as ErpPdvFormaPagamento
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-900/40"
                        >
                          {erpPdvFormasPagamento.map((forma) => (
                            <option key={forma.id} value={forma.id}>
                              {forma.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                          Operador
                        </label>

                        <input
                          value={erpPdvOperadorVenda}
                          onChange={(e) =>
                            setErpPdvOperadorVenda(e.target.value)
                          }
                          placeholder="Nome"
                          className="mt-2 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-900/40"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-300">
                        Total geral
                      </span>
                      <span className="text-3xl font-black text-green-300">
                        R${" "}
                        {erpPdvCarrinhoTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={cancelarVendaErpPdv}
                        disabled={erpPdvCarrinho.length === 0}
                        className="rounded-xl border border-white/20 px-4 py-4 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancelar venda
                      </button>

                      <button
                        type="button"
                        onClick={finalizarVendaErpPdv}
                        disabled={
                          erpPdvCarrinho.length === 0 ||
                          erpPdvSalvando ||
                          !erpPdvCaixaAberto ||
                          !erpPdvOperadorVenda.trim()
                        }
                        className="rounded-xl bg-green-500 px-4 py-4 text-sm font-black text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {erpPdvSalvando
                          ? "Finalizando..."
                          : erpPdvCaixaAberto
                          ? "Finalizar venda"
                          : "Abra o caixa"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {erpPdvCupomNaoFiscal && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Cupom nao fiscal
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Comprovante da venda #{erpPdvCupomNaoFiscal.vendaNumero}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Documento sem valor fiscal. Use a impressao do navegador
                      para imprimir ou salvar em PDF.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["58mm", "80mm", "a4"] as ErpPdvCupomLayout[]).map(
                      (layout) => (
                        <button
                          type="button"
                          key={layout}
                          onClick={() => setErpPdvCupomLayout(layout)}
                          className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                            erpPdvCupomLayout === layout
                              ? "border-green-600 bg-green-50 text-green-700"
                              : "border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50"
                          }`}
                        >
                          {layout === "a4" ? "A4" : layout}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
                  <div className="overflow-x-auto rounded-2xl bg-slate-100 p-4">
                    <div
                      className={`mx-auto bg-white p-4 font-mono text-xs text-slate-900 shadow-sm ${
                        erpPdvCupomLayout === "58mm"
                          ? "w-[220px]"
                          : erpPdvCupomLayout === "80mm"
                          ? "w-[300px]"
                          : "w-full max-w-3xl"
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-black">{erpPdvCupomNaoFiscal.empresa}</p>
                        <p>CNPJ: {erpPdvCupomNaoFiscal.cnpj}</p>
                        <p>{erpPdvCupomNaoFiscal.endereco}</p>
                        <div className="my-2 border-t border-dashed border-slate-400" />
                        <p className="font-black">CUPOM NAO FISCAL</p>
                      </div>

                      <div className="my-2 border-t border-dashed border-slate-400" />

                      <div className="space-y-1">
                        <p>Venda: #{erpPdvCupomNaoFiscal.vendaNumero}</p>
                        <p>
                          Data/Hora:{" "}
                          {new Date(
                            erpPdvCupomNaoFiscal.dataHora
                          ).toLocaleString("pt-BR")}
                        </p>
                        <p>Operador: {erpPdvCupomNaoFiscal.operador}</p>
                        <p>Pagamento: {erpPdvCupomNaoFiscal.pagamento}</p>
                        <p>Cliente: {erpPdvCupomNaoFiscal.cliente}</p>
                        {erpPdvCupomNaoFiscal.clienteDocumento && (
                          <p>
                            Documento:{" "}
                            {erpPdvCupomNaoFiscal.clienteDocumento}
                          </p>
                        )}
                        {erpPdvCupomNaoFiscal.clienteContato && (
                          <p>Contato: {erpPdvCupomNaoFiscal.clienteContato}</p>
                        )}
                      </div>

                      <div className="my-2 border-t border-dashed border-slate-400" />

                      <div className="space-y-2">
                        {erpPdvCupomNaoFiscal.itens.map((item, indice) => (
                          <div key={`${item.descricao}-${indice}`}>
                            <p className="font-bold">{item.descricao}</p>
                            <p className="text-[11px] text-slate-500">
                              {obterLabelTabelaPrecoErpPdv(item.tabelaPreco)}
                            </p>
                            <div className="flex justify-between gap-2">
                              <span>
                                {formatarNumeroErpPdv(item.quantidade)} x R${" "}
                                {item.precoUnitario.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span>
                                R${" "}
                                {item.subtotal.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="my-2 border-t border-dashed border-slate-400" />

                      <div className="flex justify-between text-base font-black">
                        <span>Total</span>
                        <span>
                          R${" "}
                          {erpPdvCupomNaoFiscal.total.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="my-2 border-t border-dashed border-slate-400" />

                      <div className="text-center">
                        <p>Documento sem valor fiscal.</p>
                        <p>Nao substitui NFC-e ou NF-e.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 xl:w-56 xl:grid-cols-1">
                    <button
                      type="button"
                      onClick={() => imprimirCupomErpPdv(erpPdvCupomLayout)}
                      className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      Imprimir
                    </button>

                    <button
                      type="button"
                      onClick={() => imprimirCupomErpPdv(erpPdvCupomLayout)}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:border-green-300 hover:bg-green-50"
                    >
                      Salvar PDF
                    </button>

                    <button
                      type="button"
                      onClick={compartilharCupomWhatsAppErpPdv}
                      className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-black text-green-700 transition hover:bg-green-100"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Relatorios operacionais
                  </p>
                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Gestao de vendas e margem
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Acompanhe faturamento, lucro bruto, ticket medio, produtos
                    mais vendidos e estoque critico.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => carregarRelatorioErpPdv()}
                    disabled={erpPdvSalvando}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Atualizar
                  </button>
                  <button
                    type="button"
                    onClick={exportarRelatorioPdfErpPdv}
                    disabled={!erpPdvRelatorio}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Exportar PDF
                  </button>
                  <button
                    type="button"
                    onClick={exportarRelatorioExcelErpPdv}
                    disabled={!erpPdvRelatorio}
                    className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Exportar Excel
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <Input
                  label="Data inicial"
                  type="date"
                  value={erpPdvRelatorioInicio}
                  onChange={(e) => setErpPdvRelatorioInicio(e.target.value)}
                />
                <Input
                  label="Data final"
                  type="date"
                  value={erpPdvRelatorioFim}
                  onChange={(e) => setErpPdvRelatorioFim(e.target.value)}
                />
                <Input
                  label="Operador"
                  value={erpPdvRelatorioOperador}
                  onChange={(e) => setErpPdvRelatorioOperador(e.target.value)}
                  placeholder="Todos"
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Cliente
                  </label>
                  <select
                    value={erpPdvRelatorioClienteId}
                    onChange={(e) => setErpPdvRelatorioClienteId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="todos">Todos</option>
                    <option value="sem_cliente">Consumidor nao identificado</option>
                    {erpPdvClientes.map((clienteErp) => (
                      <option key={clienteErp.id} value={clienteErp.id}>
                        {clienteErp.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Pagamento
                  </label>
                  <select
                    value={erpPdvRelatorioFormaPagamento}
                    onChange={(e) =>
                      setErpPdvRelatorioFormaPagamento(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="todos">Todas</option>
                    {erpPdvFormasPagamento.map((forma) => (
                      <option key={forma.id} value={forma.id}>
                        {forma.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {erpPdvRelatorio ? (
                <>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      ["Vendas do dia", String(erpPdvRelatorio.vendasHoje)],
                      [
                        "Faturamento",
                        `R$ ${formatarMoedaErpPdv(erpPdvRelatorio.faturamento)}`,
                      ],
                      [
                        "Lucro bruto",
                        `R$ ${formatarMoedaErpPdv(erpPdvRelatorio.lucroBruto)}`,
                      ],
                      [
                        "Ticket medio",
                        `R$ ${formatarMoedaErpPdv(erpPdvRelatorio.ticketMedio)}`,
                      ],
                      [
                        "Itens vendidos",
                        formatarNumeroErpPdv(erpPdvRelatorio.quantidadeItens) ||
                          "0",
                      ],
                    ].map(([label, valor]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        <p className="mt-2 text-xl font-black text-slate-950">
                          {valor}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <h5 className="font-black text-slate-900">
                        Produtos mais vendidos
                      </h5>
                      <div className="mt-3 space-y-2">
                        {erpPdvRelatorio.maisVendidos.length > 0 ? (
                          erpPdvRelatorio.maisVendidos.map((produto) => (
                            <div
                              key={produto.chave}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm"
                            >
                              <span className="font-bold text-slate-800">
                                {produto.label}
                              </span>
                              <span className="font-black text-green-700">
                                {formatarNumeroErpPdv(produto.quantidadeItens) ||
                                  "0"}{" "}
                                un.
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            Sem vendas no periodo.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <h5 className="font-black text-slate-900">
                        Estoque critico
                      </h5>
                      <div className="mt-3 space-y-2">
                        {erpPdvRelatorio.estoqueCritico.length > 0 ? (
                          erpPdvRelatorio.estoqueCritico.slice(0, 8).map(
                            (produto) => (
                              <div
                                key={produto.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm"
                              >
                                <span className="font-bold text-red-800">
                                  {produto.nome}
                                </span>
                                <span className="font-black text-red-700">
                                  {formatarNumeroErpPdv(produto.estoque_atual) ||
                                    "0"}{" "}
                                  / min.{" "}
                                  {formatarNumeroErpPdv(produto.estoque_minimo) ||
                                    "0"}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-slate-500">
                            Nenhum produto abaixo do minimo.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    {[
                      ["Por operador", erpPdvRelatorio.porOperador],
                      ["Por produto", erpPdvRelatorio.porProduto.slice(0, 8)],
                      ["Por pagamento", erpPdvRelatorio.porFormaPagamento],
                    ].map(([titulo, itens]) => (
                      <div
                        key={String(titulo)}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <h5 className="font-black text-slate-900">
                          {String(titulo)}
                        </h5>
                        <div className="mt-3 space-y-2">
                          {(itens as typeof erpPdvRelatorio.porOperador).length >
                          0 ? (
                            (itens as typeof erpPdvRelatorio.porOperador).map(
                              (item) => (
                                <div
                                  key={item.chave}
                                  className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                                >
                                  <div className="flex justify-between gap-2">
                                    <span className="font-bold text-slate-800">
                                      {titulo === "Por pagamento"
                                        ? obterLabelFormaPagamentoErpPdv(
                                            item.label
                                          )
                                        : item.label}
                                    </span>
                                    <span className="font-black text-slate-900">
                                      R$ {formatarMoedaErpPdv(item.faturamento)}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {item.quantidadeVendas} venda(s) |{" "}
                                    {formatarNumeroErpPdv(item.quantidadeItens) ||
                                      "0"}{" "}
                                    item(ns) | lucro R${" "}
                                    {formatarMoedaErpPdv(item.lucroBruto)}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-sm text-slate-500">
                              Sem dados no periodo.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {[
                            "Venda",
                            "Data",
                            "Operador",
                            "Cliente",
                            "Pagamento",
                            "Itens",
                            "Total",
                            "Lucro",
                          ].map((cabecalho) => (
                            <th
                              key={cabecalho}
                              className="px-3 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500"
                            >
                              {cabecalho}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {erpPdvRelatorio.vendas.length > 0 ? (
                          erpPdvRelatorio.vendas.slice(0, 80).map((venda) => (
                            <tr key={venda.id}>
                              <td className="px-3 py-3 font-bold text-slate-900">
                                #{venda.numero}
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                {new Date(venda.finalizada_em).toLocaleString(
                                  "pt-BR"
                                )}
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                {venda.operador || "-"}
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                {venda.cliente_nome || "-"}
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                {obterLabelFormaPagamentoErpPdv(
                                  venda.forma_pagamento
                                )}
                              </td>
                              <td className="px-3 py-3 text-slate-600">
                                {formatarNumeroErpPdv(venda.quantidade_itens) ||
                                  "0"}
                              </td>
                              <td className="px-3 py-3 font-bold text-slate-900">
                                R$ {formatarMoedaErpPdv(venda.total)}
                              </td>
                              <td className="px-3 py-3 font-bold text-green-700">
                                R$ {formatarMoedaErpPdv(venda.lucro_bruto)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-3 py-6 text-center text-sm text-slate-500"
                            >
                              Sem vendas para os filtros atuais.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                  Atualize o relatorio para carregar os indicadores.
                </p>
              )}
            </div>

            <fieldset
              disabled={!recursosContratados.erp_pdv || erpPdvSalvando}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end">
                  <div className="min-w-0 flex-1">
                    <Input
                      label="Nova categoria"
                      value={erpPdvCategoriaNome}
                      onChange={(e) => setErpPdvCategoriaNome(e.target.value)}
                      placeholder="Ex.: Comunicacao visual, Materiais, Servicos"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={adicionarErpPdvCategoria}
                    disabled={
                      !recursosContratados.erp_pdv ||
                      erpPdvSalvando ||
                      !erpPdvCategoriaNome.trim()
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar categoria
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {erpPdvCategorias.length > 0 ? (
                    erpPdvCategorias.map((categoriaErp) => (
                      <span
                        key={categoriaErp.id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                      >
                        {categoriaErp.nome}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Nenhuma categoria cadastrada ainda.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Produto
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Cadastro inicial
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={limparErpPdvProdutoForm}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50"
                  >
                    Novo produto
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nome"
                    value={erpPdvProdutoForm.nome}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("nome", e.target.value)
                    }
                    placeholder="Ex.: Banner lona 90x60"
                  />

                  <div>
                    <label className="block font-medium text-slate-700">
                      Categoria
                    </label>

                    <select
                      value={erpPdvProdutoForm.categoriaId}
                      onChange={(e) =>
                        atualizarErpPdvProdutoForm(
                          "categoriaId",
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    >
                      <option value="">Sem categoria</option>
                      {erpPdvCategorias.map((categoriaErp) => (
                        <option key={categoriaErp.id} value={categoriaErp.id}>
                          {categoriaErp.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Codigo de barras"
                    value={erpPdvProdutoForm.codigoBarras}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "codigoBarras",
                        e.target.value
                      )
                    }
                    placeholder="Opcional"
                  />

                  <Input
                    label="SKU"
                    value={erpPdvProdutoForm.sku}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("sku", e.target.value)
                    }
                    placeholder="Ex.: BANNER-LONA-90X60"
                  />

                  <Input
                    label="Marca"
                    value={erpPdvProdutoForm.marca}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("marca", e.target.value)
                    }
                    placeholder="Ex.: Mikatech, 3M, Epson"
                  />

                  <Input
                    label="Custo"
                    value={erpPdvProdutoForm.custo}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("custo", e.target.value)
                    }
                    placeholder="0,00"
                  />

                  <Input
                    label="Preco de venda"
                    value={erpPdvProdutoForm.precoVenda}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("precoVenda", e.target.value)
                    }
                    disabled={
                      erpPdvProdutoForm.formacaoPrecoTipo ===
                      "percentual_custo"
                    }
                    placeholder="0,00"
                  />

                  <div>
                    <label className="block font-medium text-slate-700">
                      Formacao de preco
                    </label>
                    <select
                      value={erpPdvProdutoForm.formacaoPrecoTipo}
                      onChange={(e) =>
                        atualizarErpPdvProdutoForm(
                          "formacaoPrecoTipo",
                          e.target.value as ErpPdvFormacaoPrecoTipo
                        )
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    >
                      <option value="manual">Valor manual</option>
                      <option value="percentual_custo">
                        Percentual sobre custo
                      </option>
                    </select>
                  </div>

                  <Input
                    label="% sobre custo"
                    value={erpPdvProdutoForm.percentualPreco}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "percentualPreco",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: 60"
                  />

                  <Input
                    label="Preco atacado"
                    value={erpPdvProdutoForm.precoAtacado}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "precoAtacado",
                        e.target.value
                      )
                    }
                    placeholder="0,00"
                  />

                  <Input
                    label="Preco revenda"
                    value={erpPdvProdutoForm.precoRevenda}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "precoRevenda",
                        e.target.value
                      )
                    }
                    placeholder="0,00"
                  />

                  <Input
                    label="Preco personalizado"
                    value={erpPdvProdutoForm.precoPersonalizado}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "precoPersonalizado",
                        e.target.value
                      )
                    }
                    placeholder="0,00"
                  />

                  <Input
                    label="Unidade"
                    value={erpPdvProdutoForm.unidade}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("unidade", e.target.value)
                    }
                    placeholder="un, m2, kg, cx"
                  />

                  <Input
                    label="Estoque atual"
                    value={erpPdvProdutoForm.estoqueAtual}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "estoqueAtual",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    label="Estoque minimo"
                    value={erpPdvProdutoForm.estoqueMinimo}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "estoqueMinimo",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />

                  <Input
                    label="Localizacao"
                    value={erpPdvProdutoForm.localizacao}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm(
                        "localizacao",
                        e.target.value
                      )
                    }
                    placeholder="Ex.: Rua A / Prateleira 2"
                  />

                  <Input
                    label="NCM"
                    value={erpPdvProdutoForm.ncm}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("ncm", e.target.value)
                    }
                    placeholder="Preparado para fiscal futuro"
                  />
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Lucro
                    </p>
                    <p
                      className={`mt-1 text-lg font-black ${
                        erpPdvProdutoFormIndicadores.lucro < 0
                          ? "text-red-600"
                          : "text-green-700"
                      }`}
                    >
                      R$ {formatarMoedaErpPdv(erpPdvProdutoFormIndicadores.lucro)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Margem
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {erpPdvProdutoFormIndicadores.margemPercentual.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Markup
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {erpPdvProdutoFormIndicadores.markupPercentual.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <p
                      className={`mt-1 rounded-full px-3 py-2 text-xs font-black ${
                        erpPdvProdutoFormIndicadores.abaixoDoCusto
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {erpPdvProdutoFormIndicadores.abaixoDoCusto
                        ? "Abaixo do custo"
                        : "Preco valido"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4">
                  <UploadImagem
                    titulo="Foto principal do produto"
                    imagem={erpPdvProdutoForm.imagemUrl}
                    accept="image/*"
                    formatosPermitidos="PNG, JPG, JPEG ou WEBP ate 5 MB"
                    tamanhoMaximoMb={5}
                    pasta={`erp-pdv/${slugPublico || empresaId || "rascunho"}/produtos/${erpPdvProdutoForm.id || erpPdvProdutoForm.sku || "novo"}`}
                    onUpload={async (url) =>
                      atualizarErpPdvProdutoForm("imagemUrl", url)
                    }
                  />

                  <div>
                    <label className="block font-medium text-slate-700">
                      Observacoes
                    </label>

                    <textarea
                      value={erpPdvProdutoForm.observacoes}
                      onChange={(e) =>
                        atualizarErpPdvProdutoForm(
                          "observacoes",
                          e.target.value
                        )
                      }
                      placeholder="Detalhes internos do produto, fornecedor, variacoes ou cuidados."
                      rows={4}
                      className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>
                </div>

                <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={erpPdvProdutoForm.ativo}
                    onChange={(e) =>
                      atualizarErpPdvProdutoForm("ativo", e.target.checked)
                    }
                  />
                  Produto ativo
                </label>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={salvarProdutoErpPdv}
                    disabled={
                      !recursosContratados.erp_pdv ||
                      erpPdvSalvando ||
                      !erpPdvProdutoForm.nome.trim()
                    }
                    className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {erpPdvSalvando ? "Salvando..." : "Salvar produto"}
                  </button>
                </div>
              </div>
            </fieldset>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0 flex-1">
                  <Input
                    label="Buscar produtos"
                    value={erpPdvBusca}
                    onChange={(e) => setErpPdvBusca(e.target.value)}
                    placeholder="Busque por nome, SKU ou codigo de barras"
                  />
                </div>

                <div className="min-w-0 md:w-56">
                  <label className="block font-medium text-slate-700">
                    Ordenar por
                  </label>

                  <select
                    value={erpPdvOrdenacao}
                    onChange={(e) =>
                      setErpPdvOrdenacao(
                        e.target.value as ErpPdvOrdenacaoProdutos
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="nome">Nome</option>
                    <option value="estoque">Estoque</option>
                    <option value="preco">Preco</option>
                  </select>
                </div>

                <span className="text-sm font-semibold text-slate-500">
                  {erpPdvProdutosFiltrados.length} produto(s)
                </span>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {erpPdvProdutosFiltrados.length > 0 ? (
                  erpPdvProdutosFiltrados.map((produto) => {
                    const categoriaProduto = erpPdvCategorias.find(
                      (categoriaErp) => categoriaErp.id === produto.categoria_id
                    );
                    const indicadores = calcularIndicadoresPrecoErpPdv(
                      produto.custo,
                      produto.preco_venda
                    );

                    return (
                      <button
                        type="button"
                        key={produto.id}
                        onClick={() => editarErpPdvProduto(produto)}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
                      >
                        <div className="mb-4 h-32 overflow-hidden rounded-xl border border-slate-200 bg-white">
                          {produto.imagem_url ? (
                            <img
                              src={produto.imagem_url}
                              alt={produto.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                              Sem foto
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900">
                              {produto.nome}
                            </h5>

                            <p className="mt-1 text-sm text-slate-500">
                              {categoriaProduto?.nome || "Sem categoria"} · SKU:{" "}
                              {produto.sku || "nao informado"} · Cod.:{" "}
                              {produto.codigo_barras || "nao informado"}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                              produto.ativo
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                          <span>
                            Custo: R$ {formatarMoedaErpPdv(produto.custo)}
                          </span>
                          <span>
                            Venda: R$ {formatarMoedaErpPdv(produto.preco_venda)}
                          </span>
                          <span>
                            Lucro: R$ {formatarMoedaErpPdv(indicadores.lucro)}
                          </span>
                          <span>
                            Margem:{" "}
                            {indicadores.margemPercentual.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            %
                          </span>
                          <span>
                            Markup:{" "}
                            {indicadores.markupPercentual.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            %
                          </span>
                          <span>Estoque: {produto.estoque_atual}</span>
                          <span>Minimo: {produto.estoque_minimo}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                          <span className="rounded-full bg-white px-3 py-1">
                            Atacado: R${" "}
                            {formatarMoedaErpPdv(
                              produto.preco_atacado || produto.preco_venda
                            )}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            Revenda: R${" "}
                            {formatarMoedaErpPdv(
                              produto.preco_revenda || produto.preco_venda
                            )}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1">
                            Personalizada: R${" "}
                            {formatarMoedaErpPdv(
                              produto.preco_personalizado ||
                                produto.preco_venda
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Nenhum produto encontrado para a busca atual.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Estoque
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Movimentacao operacional
                  </h4>
                </div>

                {erpPdvProdutoMovimentacaoSelecionado && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Estoque atual:{" "}
                    {formatarNumeroErpPdv(
                      erpPdvProdutoMovimentacaoSelecionado.estoque_atual
                    )}
                  </span>
                )}
              </div>

              <fieldset
                disabled={!recursosContratados.erp_pdv || erpPdvSalvando}
                className="mt-4 grid gap-4 disabled:opacity-60 lg:grid-cols-3"
              >
                <div>
                  <label className="block font-medium text-slate-700">
                    Produto
                  </label>

                  <select
                    value={erpPdvMovimentacaoForm.produtoId}
                    onChange={(e) =>
                      atualizarErpPdvMovimentacaoForm(
                        "produtoId",
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="">Selecione um produto</option>
                    {erpPdvProdutos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Tipo
                  </label>

                  <select
                    value={erpPdvMovimentacaoForm.tipo}
                    onChange={(e) =>
                      atualizarErpPdvMovimentacaoForm(
                        "tipo",
                        e.target.value as ErpPdvMovimentacaoForm["tipo"]
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="entrada">Entrada de mercadorias</option>
                    <option value="saida">Saida manual</option>
                    <option value="ajuste">Ajuste de estoque</option>
                  </select>
                </div>

                <Input
                  label={
                    erpPdvMovimentacaoForm.tipo === "ajuste"
                      ? "Novo estoque"
                      : "Quantidade"
                  }
                  value={erpPdvMovimentacaoForm.quantidade}
                  onChange={(e) =>
                    atualizarErpPdvMovimentacaoForm(
                      "quantidade",
                      e.target.value
                    )
                  }
                  placeholder={
                    erpPdvMovimentacaoForm.tipo === "ajuste"
                      ? "Estoque final"
                      : "0"
                  }
                />

                <Input
                  label="Motivo"
                  value={erpPdvMovimentacaoForm.motivo}
                  onChange={(e) =>
                    atualizarErpPdvMovimentacaoForm("motivo", e.target.value)
                  }
                  placeholder="Ex.: Compra, perda, inventario"
                />

                <Input
                  label="Usuario responsavel"
                  value={erpPdvMovimentacaoForm.usuarioResponsavel}
                  onChange={(e) =>
                    atualizarErpPdvMovimentacaoForm(
                      "usuarioResponsavel",
                      e.target.value
                    )
                  }
                  placeholder="Nome do operador"
                />

                <div className="lg:col-span-3">
                  <label className="block font-medium text-slate-700">
                    Observacoes
                  </label>

                  <textarea
                    value={erpPdvMovimentacaoForm.observacao}
                    onChange={(e) =>
                      atualizarErpPdvMovimentacaoForm(
                        "observacao",
                        e.target.value
                      )
                    }
                    placeholder="Detalhes da nota, fornecedor, inventario ou justificativa interna."
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </fieldset>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Em ajustes, a quantidade informada passa a ser o estoque final
                  do produto.
                </p>

                <button
                  type="button"
                  onClick={registrarMovimentacaoErpPdv}
                  disabled={
                    !recursosContratados.erp_pdv ||
                    erpPdvSalvando ||
                    !erpPdvMovimentacaoForm.produtoId ||
                    !erpPdvMovimentacaoForm.quantidade.trim()
                  }
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {erpPdvSalvando
                    ? "Registrando..."
                    : "Registrar movimentacao"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Historico
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Movimentacoes de estoque
                  </h4>
                </div>

                <span className="text-sm font-semibold text-slate-500">
                  {erpPdvMovimentacoesFiltradas.length} registro(s)
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block font-medium text-slate-700">
                    Produto
                  </label>

                  <select
                    value={erpPdvMovimentacaoProdutoFiltro}
                    onChange={(e) =>
                      setErpPdvMovimentacaoProdutoFiltro(e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="todos">Todos</option>
                    {erpPdvProdutos.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Tipo
                  </label>

                  <select
                    value={erpPdvMovimentacaoTipoFiltro}
                    onChange={(e) =>
                      setErpPdvMovimentacaoTipoFiltro(
                        e.target.value as ErpPdvMovimentacaoFiltroTipo
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  >
                    <option value="todos">Todos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saida</option>
                    <option value="ajuste">Ajuste</option>
                    <option value="venda">Venda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Inicio
                  </label>

                  <input
                    type="date"
                    value={erpPdvMovimentacaoInicio}
                    onChange={(e) =>
                      setErpPdvMovimentacaoInicio(e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700">
                    Fim
                  </label>

                  <input
                    type="date"
                    value={erpPdvMovimentacaoFim}
                    onChange={(e) => setErpPdvMovimentacaoFim(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {erpPdvMovimentacoesFiltradas.length > 0 ? (
                  erpPdvMovimentacoesFiltradas.map((movimentacao) => {
                    const produtoMovimentado = erpPdvProdutosPorId.get(
                      movimentacao.produto_id
                    );
                    const tipoMovimentacao =
                      movimentacao.tipo === "entrada"
                        ? "Entrada"
                        : movimentacao.tipo === "saida"
                        ? "Saida"
                        : movimentacao.tipo === "ajuste"
                        ? "Ajuste"
                        : "Venda";

                    return (
                      <div
                        key={movimentacao.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900">
                              {produtoMovimentado?.nome || "Produto removido"}
                            </h5>

                            <p className="mt-1 text-sm text-slate-500">
                              {new Date(
                                movimentacao.created_at
                              ).toLocaleString("pt-BR")}{" "}
                              por{" "}
                              {movimentacao.usuario_responsavel ||
                                "usuario nao informado"}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                              movimentacao.tipo === "entrada"
                                ? "bg-green-100 text-green-700"
                                : movimentacao.tipo === "saida"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {tipoMovimentacao}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-4">
                          <span>
                            Quantidade:{" "}
                            {formatarNumeroErpPdv(movimentacao.quantidade)}
                          </span>
                          <span>
                            Anterior:{" "}
                            {formatarNumeroErpPdv(
                              movimentacao.estoque_anterior
                            )}
                          </span>
                          <span>
                            Atual:{" "}
                            {formatarNumeroErpPdv(
                              movimentacao.estoque_posterior
                            )}
                          </span>
                          <span>
                            Motivo: {movimentacao.motivo || "Nao informado"}
                          </span>
                        </div>

                        {movimentacao.observacao && (
                          <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                            {movimentacao.observacao}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Nenhuma movimentacao encontrada para os filtros atuais.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {abaAtiva === "cardapio" && (
        <Card
          title="Cardapio Digital"
          subtitle="Estrutura inicial para organizar categorias e produtos do cardapio da empresa."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.cardapio_digital
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.cardapio_digital
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.cardapio_digital
                      ? "Ativo"
                      : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Estrutura do Cardapio Digital
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Cadastre categorias, produtos, ordem de exibicao e status de disponibilidade. A publicacao do cardapio e pedidos serao conectados em etapas futuras.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.cardapio_digital}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Categorias
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Organizacao do cardapio
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarCardapioCategoria}
                    disabled={
                      !recursosContratados.cardapio_digital ||
                      cardapioCategorias.length >= 30
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar categoria
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {cardapioCategorias.map((categoriaCardapio, indice) => (
                    <div
                      key={categoriaCardapio.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-2">
                          <Input
                            label={`Categoria ${indice + 1}`}
                            value={categoriaCardapio.nome}
                            onChange={(e) =>
                              atualizarCardapioCategoria(
                                indice,
                                "nome",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Entradas, Pizzas, Bebidas"
                          />

                          <Input
                            label="Descricao curta"
                            value={categoriaCardapio.descricao}
                            onChange={(e) =>
                              atualizarCardapioCategoria(
                                indice,
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Opcional"
                          />
                        </div>

                        <div className="grid gap-2 sm:flex lg:shrink-0">
                          <button
                            type="button"
                            disabled={indice === 0}
                            onClick={() => moverCardapioCategoria(indice, "up")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>

                          <button
                            type="button"
                            disabled={indice === cardapioCategorias.length - 1}
                            onClick={() =>
                              moverCardapioCategoria(indice, "down")
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>

                          {cardapioCategorias.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerCardapioCategoria(indice)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={categoriaCardapio.visivel}
                          onChange={(e) =>
                            atualizarCardapioCategoria(
                              indice,
                              "visivel",
                              e.target.checked
                            )
                          }
                        />
                        Exibir categoria
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Produtos
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Itens do cardapio
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarCardapioProduto}
                    disabled={
                      !recursosContratados.cardapio_digital ||
                      cardapioProdutos.length >= 100
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar produto
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {cardapioProdutos.map((produtoCardapio, indice) => (
                    <div
                      key={produtoCardapio.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900">
                            Produto {indice + 1}
                          </h5>

                          <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={produtoCardapio.disponivel}
                              onChange={(e) =>
                                atualizarCardapioProduto(
                                  indice,
                                  "disponivel",
                                  e.target.checked
                                )
                              }
                            />
                            Disponivel
                          </label>
                        </div>

                        <div className="grid gap-2 sm:flex sm:shrink-0">
                          <button
                            type="button"
                            disabled={indice === 0}
                            onClick={() => moverCardapioProduto(indice, "up")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>

                          <button
                            type="button"
                            disabled={indice === cardapioProdutos.length - 1}
                            onClick={() => moverCardapioProduto(indice, "down")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>

                          {cardapioProdutos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerCardapioProduto(indice)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Nome do produto"
                            value={produtoCardapio.nome}
                            onChange={(e) =>
                              atualizarCardapioProduto(
                                indice,
                                "nome",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Pizza marguerita"
                          />

                          <Input
                            label="Preco"
                            value={produtoCardapio.preco}
                            onChange={(e) =>
                              atualizarCardapioProduto(
                                indice,
                                "preco",
                                e.target.value
                              )
                            }
                            placeholder="R$ 39,90"
                          />

                          <div>
                            <label className="block font-medium text-slate-700">
                              Categoria
                            </label>

                            <select
                              value={produtoCardapio.categoriaId}
                              onChange={(e) =>
                                atualizarCardapioProduto(
                                  indice,
                                  "categoriaId",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            >
                              <option value="">Sem categoria</option>
                              {cardapioCategorias.map((categoriaCardapio) => (
                                <option
                                  key={categoriaCardapio.id}
                                  value={categoriaCardapio.id}
                                >
                                  {categoriaCardapio.nome ||
                                    "Categoria sem nome"}
                                </option>
                              ))}
                            </select>
                          </div>

                        </div>

                        <UploadImagem
                          titulo={`Imagem do produto ${indice + 1}`}
                          imagem={produtoCardapio.imagemUrl}
                          accept="image/*"
                          formatosPermitidos="PNG, JPG, JPEG ou WEBP ate 5 MB"
                          tamanhoMaximoMb={5}
                          pasta={`cardapio/${slugPublico || empresaId || "rascunho"}/produtos/${produtoCardapio.id || indice + 1}`}
                          onUpload={async (url) =>
                            atualizarCardapioProduto(indice, "imagemUrl", url)
                          }
                        />

                        {produtoCardapio.imagemUrl.trim() && (
                          <p className="break-all text-xs text-slate-500">
                            URL atual da imagem: {produtoCardapio.imagemUrl}
                          </p>
                        )}

                        <div>
                          <label className="block font-medium text-slate-700">
                            Descricao
                          </label>

                          <textarea
                            value={produtoCardapio.descricao}
                            onChange={(e) =>
                              atualizarCardapioProduto(
                                indice,
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Ingredientes, tamanho, observacoes ou diferenciais."
                            rows={4}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700">
                            Observacoes
                          </label>

                          <textarea
                            value={produtoCardapio.observacoes}
                            onChange={(e) =>
                              atualizarCardapioProduto(
                                indice,
                                "observacoes",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: contem gluten, serve 2 pessoas, ponto da carne, adicionais ou restricoes."
                            rows={3}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </div>

                        {!produtoCardapio.disponivel && (
                          <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "catalogo" && (
        <Card
          title="Catalogo"
          subtitle="Estrutura inicial para organizar categorias e produtos do catalogo da empresa."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.catalogo
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.catalogo
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.catalogo ? "Ativo" : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Estrutura do Catalogo
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Cadastre categorias, produtos, imagens, ordem de exibicao e status ativo/inativo. A exibicao publica sera conectada em etapas futuras.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.catalogo}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Categorias
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Organizacao do catalogo
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarCatalogoCategoria}
                    disabled={
                      !recursosContratados.catalogo ||
                      catalogoCategorias.length >= 30
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar categoria
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {catalogoCategorias.map((categoriaCatalogo, indice) => (
                    <div
                      key={categoriaCatalogo.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-2">
                          <Input
                            label={`Categoria ${indice + 1}`}
                            value={categoriaCatalogo.nome}
                            onChange={(e) =>
                              atualizarCatalogoCategoria(
                                indice,
                                "nome",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Produtos, Servicos, Promocoes"
                          />

                          <Input
                            label="Descricao curta"
                            value={categoriaCatalogo.descricao}
                            onChange={(e) =>
                              atualizarCatalogoCategoria(
                                indice,
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Opcional"
                          />
                        </div>

                        <div className="grid gap-2 sm:flex lg:shrink-0">
                          <button
                            type="button"
                            disabled={indice === 0}
                            onClick={() => moverCatalogoCategoria(indice, "up")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>

                          <button
                            type="button"
                            disabled={indice === catalogoCategorias.length - 1}
                            onClick={() =>
                              moverCatalogoCategoria(indice, "down")
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>

                          {catalogoCategorias.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerCatalogoCategoria(indice)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={categoriaCatalogo.ativo}
                          onChange={(e) =>
                            atualizarCatalogoCategoria(
                              indice,
                              "ativo",
                              e.target.checked
                            )
                          }
                        />
                        Categoria ativa
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Produtos
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Itens do catalogo
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarCatalogoProduto}
                    disabled={
                      !recursosContratados.catalogo ||
                      catalogoProdutos.length >= 100
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar produto
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {catalogoProdutos.map((produtoCatalogo, indice) => (
                    <div
                      key={produtoCatalogo.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900">
                            Produto {indice + 1}
                          </h5>

                          <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={produtoCatalogo.ativo}
                              onChange={(e) =>
                                atualizarCatalogoProduto(
                                  indice,
                                  "ativo",
                                  e.target.checked
                                )
                              }
                            />
                            Produto ativo
                          </label>
                        </div>

                        <div className="grid gap-2 sm:flex sm:shrink-0">
                          <button
                            type="button"
                            disabled={indice === 0}
                            onClick={() => moverCatalogoProduto(indice, "up")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>

                          <button
                            type="button"
                            disabled={indice === catalogoProdutos.length - 1}
                            onClick={() => moverCatalogoProduto(indice, "down")}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>

                          {catalogoProdutos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removerCatalogoProduto(indice)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Nome do produto"
                            value={produtoCatalogo.nome}
                            onChange={(e) =>
                              atualizarCatalogoProduto(
                                indice,
                                "nome",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Produto premium"
                          />

                          <Input
                            label="Preco"
                            value={produtoCatalogo.preco}
                            onChange={(e) =>
                              atualizarCatalogoProduto(
                                indice,
                                "preco",
                                e.target.value
                              )
                            }
                            placeholder="R$ 99,90"
                          />

                          <div>
                            <label className="block font-medium text-slate-700">
                              Categoria
                            </label>

                            <select
                              value={produtoCatalogo.categoriaId}
                              onChange={(e) =>
                                atualizarCatalogoProduto(
                                  indice,
                                  "categoriaId",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            >
                              <option value="">Sem categoria</option>
                              {catalogoCategorias.map((categoriaCatalogo) => (
                                <option
                                  key={categoriaCatalogo.id}
                                  value={categoriaCatalogo.id}
                                >
                                  {categoriaCatalogo.nome ||
                                    "Categoria sem nome"}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <UploadImagem
                          titulo={`Imagem do produto do catalogo ${indice + 1}`}
                          imagem={produtoCatalogo.imagemUrl}
                          accept="image/*"
                          formatosPermitidos="PNG, JPG, JPEG ou WEBP ate 5 MB"
                          tamanhoMaximoMb={5}
                          pasta={`catalogo/${slugPublico || empresaId || "rascunho"}/produtos/${produtoCatalogo.id || indice + 1}`}
                          onUpload={async (url) =>
                            atualizarCatalogoProduto(indice, "imagemUrl", url)
                          }
                        />

                        {produtoCatalogo.imagemUrl.trim() && (
                          <p className="break-all text-xs text-slate-500">
                            URL atual da imagem: {produtoCatalogo.imagemUrl}
                          </p>
                        )}

                        <div>
                          <label className="block font-medium text-slate-700">
                            Descricao
                          </label>

                          <textarea
                            value={produtoCatalogo.descricao}
                            onChange={(e) =>
                              atualizarCatalogoProduto(
                                indice,
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Detalhes do produto, diferenciais ou condicoes comerciais."
                            rows={4}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </div>

                        {!produtoCatalogo.ativo && (
                          <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "agendamento" && (
        <Card
          title="Agendamento"
          subtitle="Estrutura inicial para organizar servicos, duracao e valores opcionais."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.agendamento
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.agendamento
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.agendamento
                      ? "Ativo"
                      : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Estrutura de Agendamento
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Cadastre os servicos que poderao ser usados em uma agenda
                    futura, incluindo duracao, valor opcional, ordem de
                    exibicao e status ativo/inativo.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.agendamento}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Servicos
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Cadastro inicial do agendamento
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarAgendamentoServico}
                    disabled={
                      !recursosContratados.agendamento ||
                      agendamentoServicos.length >= 100
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Adicionar servico
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {agendamentoServicos.map((servicoAgendamento, indice) => (
                    <div
                      key={servicoAgendamento.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h5 className="font-bold text-slate-900">
                            Servico {indice + 1}
                          </h5>

                          <label className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={servicoAgendamento.ativo}
                              onChange={(e) =>
                                atualizarAgendamentoServico(
                                  indice,
                                  "ativo",
                                  e.target.checked
                                )
                              }
                            />
                            Servico ativo
                          </label>
                        </div>

                        <div className="grid gap-2 sm:flex sm:shrink-0">
                          <button
                            type="button"
                            disabled={indice === 0}
                            onClick={() =>
                              moverAgendamentoServico(indice, "up")
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>

                          <button
                            type="button"
                            disabled={indice === agendamentoServicos.length - 1}
                            onClick={() =>
                              moverAgendamentoServico(indice, "down")
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>

                          {agendamentoServicos.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removerAgendamentoServico(indice)
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <Input
                            label="Nome do servico"
                            value={servicoAgendamento.nome}
                            onChange={(e) =>
                              atualizarAgendamentoServico(
                                indice,
                                "nome",
                                e.target.value
                              )
                            }
                            placeholder="Ex.: Consulta inicial"
                          />

                          <Input
                            label="Duracao (minutos)"
                            value={servicoAgendamento.duracaoMinutos}
                            onChange={(e) =>
                              atualizarAgendamentoServico(
                                indice,
                                "duracaoMinutos",
                                e.target.value
                              )
                            }
                            placeholder="60"
                          />

                          <Input
                            label="Valor (opcional)"
                            value={servicoAgendamento.valor}
                            onChange={(e) =>
                              atualizarAgendamentoServico(
                                indice,
                                "valor",
                                e.target.value
                              )
                            }
                            placeholder="R$ 120,00"
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-slate-700">
                            Descricao
                          </label>

                          <textarea
                            value={servicoAgendamento.descricao}
                            onChange={(e) =>
                              atualizarAgendamentoServico(
                                indice,
                                "descricao",
                                e.target.value
                              )
                            }
                            placeholder="Resumo do atendimento, preparacao ou orientacoes."
                            rows={3}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </div>

                        {!servicoAgendamento.ativo && (
                          <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                            Inativo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "wifiMarketing" && (
        <Card
          title="Wi-Fi Marketing"
          subtitle="Estrutura inicial para campanhas exibidas em experiencias conectadas ao Wi-Fi."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.wifi_marketing
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.wifi_marketing
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.wifi_marketing
                      ? "Ativo"
                      : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Campanha de Wi-Fi Marketing
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Configure a chamada que podera ser usada em telas de
                    captacao, pos-login do Wi-Fi ou experiencias futuras de
                    relacionamento com clientes.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.wifi_marketing}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Campanha
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Conteudo promocional
                    </h4>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={wifiMarketingConfig.ativo}
                      onChange={(e) =>
                        atualizarWifiMarketingConfig("ativo", e.target.checked)
                      }
                    />
                    Campanha ativa
                  </label>
                </div>

                <div className="mt-4 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Titulo"
                      value={wifiMarketingConfig.titulo}
                      onChange={(e) =>
                        atualizarWifiMarketingConfig("titulo", e.target.value)
                      }
                      placeholder="Ex.: Bem-vindo ao nosso Wi-Fi"
                    />

                    <Input
                      label="Texto do botao"
                      value={wifiMarketingConfig.botaoTexto}
                      onChange={(e) =>
                        atualizarWifiMarketingConfig(
                          "botaoTexto",
                          e.target.value
                        )
                      }
                      placeholder="Ex.: Conhecer oferta"
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Link de destino"
                        value={wifiMarketingConfig.botaoLink}
                        onChange={(e) =>
                          atualizarWifiMarketingConfig(
                            "botaoLink",
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700">
                      Mensagem
                    </label>

                    <textarea
                      value={wifiMarketingConfig.mensagem}
                      onChange={(e) =>
                        atualizarWifiMarketingConfig("mensagem", e.target.value)
                      }
                      placeholder="Texto curto para apresentar a campanha ao cliente conectado."
                      rows={4}
                      className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <UploadImagem
                    titulo="Imagem da campanha"
                    imagem={wifiMarketingConfig.imagemUrl}
                    accept="image/*"
                    formatosPermitidos="PNG, JPG, JPEG ou WEBP ate 5 MB"
                    tamanhoMaximoMb={5}
                    pasta={`wifi-marketing/${slugPublico || empresaId || "rascunho"}/campanha`}
                    onUpload={async (url) =>
                      atualizarWifiMarketingConfig("imagemUrl", url)
                    }
                  />

                  {wifiMarketingConfig.imagemUrl.trim() && (
                    <p className="break-all text-xs text-slate-500">
                      URL atual da imagem: {wifiMarketingConfig.imagemUrl}
                    </p>
                  )}

                  {!wifiMarketingConfig.ativo && (
                    <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Inativa
                    </span>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "fidelidade" && (
        <Card
          title="Programa de Fidelidade"
          subtitle="Estrutura inicial para campanhas de pontos, carimbos e recompensas."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.fidelidade
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.fidelidade
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.fidelidade
                      ? "Ativo"
                      : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Campanha de fidelidade
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Cadastre a regra base do programa para campanhas futuras de
                    pontos, carimbos, beneficios e recompensas para clientes.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.fidelidade}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Configuracao
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Regras do programa
                    </h4>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={fidelidadeConfig.ativo}
                      onChange={(e) =>
                        atualizarFidelidadeConfig("ativo", e.target.checked)
                      }
                    />
                    Programa ativo
                  </label>
                </div>

                <div className="mt-4 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Titulo da campanha"
                      value={fidelidadeConfig.titulo}
                      onChange={(e) =>
                        atualizarFidelidadeConfig("titulo", e.target.value)
                      }
                      placeholder="Ex.: Clube de Vantagens"
                    />

                    <Input
                      label="Recompensa"
                      value={fidelidadeConfig.recompensa}
                      onChange={(e) =>
                        atualizarFidelidadeConfig("recompensa", e.target.value)
                      }
                      placeholder="Ex.: Ganhe um brinde exclusivo"
                    />

                    <Input
                      label="Quantidade de pontos/carimbos"
                      value={fidelidadeConfig.quantidade}
                      onChange={(e) =>
                        atualizarFidelidadeConfig("quantidade", e.target.value)
                      }
                      placeholder="Ex.: 10"
                    />

                    <label className="block font-medium text-slate-700">
                      Tipo de acumulador
                      <select
                        value={fidelidadeConfig.tipoAcumulo}
                        onChange={(e) =>
                          atualizarFidelidadeConfig(
                            "tipoAcumulo",
                            e.target.value
                          )
                        }
                        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      >
                        <option value="carimbos">Carimbos</option>
                        <option value="pontos">Pontos</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700">
                      Descricao da campanha
                    </label>

                    <textarea
                      value={fidelidadeConfig.descricao}
                      onChange={(e) =>
                        atualizarFidelidadeConfig("descricao", e.target.value)
                      }
                      placeholder="Explique como o cliente acumula pontos ou carimbos e como resgata a recompensa."
                      rows={4}
                      className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  {!fidelidadeConfig.ativo && (
                    <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Inativo
                    </span>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "crm" && (
        <Card
          title="CRM"
          subtitle="Estrutura inicial para cadastro e organizacao de clientes."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.crm
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.crm
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.crm ? "Ativo" : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Cadastro de clientes
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Organize contatos, status, tags e observacoes para futuras
                    acoes comerciais, relacionamento e automacoes.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.crm}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Automacoes
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Regras basicas do CRM
                    </h4>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      Configure acoes internas para novos leads, mudancas de
                      etapa e tarefas vencidas. Nesta sprint, as automacoes
                      registram no historico e deixam integracoes futuras
                      preparadas.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={verificarCrmTarefasVencidas}
                  >
                    Verificar tarefas vencidas
                  </Button>
                </div>

                <div className="mt-4 grid gap-4">
                  {crmAutomacoes.map((automacao) => {
                    const evento = obterCrmAutomacaoEvento(automacao.evento);

                    return (
                      <div
                        key={automacao.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">
                              {evento.nome}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {evento.descricao}
                            </p>
                          </div>

                          <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                            <input
                              type="checkbox"
                              checked={automacao.ativa}
                              onChange={(e) =>
                                atualizarCrmAutomacao(
                                  automacao.id,
                                  "ativa",
                                  e.target.checked
                                )
                              }
                            />
                            Ativa
                          </label>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <Input
                            label="Titulo"
                            value={automacao.titulo}
                            onChange={(e) =>
                              atualizarCrmAutomacao(
                                automacao.id,
                                "titulo",
                                e.target.value
                              )
                            }
                            placeholder="Nome da automacao"
                          />

                          <label className="block text-sm font-medium text-slate-700">
                            Acao preparada
                            <select
                              value={automacao.acao}
                              onChange={(e) =>
                                atualizarCrmAutomacao(
                                  automacao.id,
                                  "acao",
                                  e.target.value
                                )
                              }
                              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            >
                              {crmAutomacaoAcoes.map((acao) => (
                                <option key={acao.id} value={acao.id}>
                                  {acao.nome}
                                </option>
                              ))}
                            </select>
                          </label>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">
                              Mensagem registrada
                            </label>
                            <textarea
                              value={automacao.mensagem}
                              onChange={(e) =>
                                atualizarCrmAutomacao(
                                  automacao.id,
                                  "mensagem",
                                  e.target.value
                                )
                              }
                              rows={2}
                              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                              placeholder="Mensagem usada no historico quando a automacao executar."
                            />
                          </div>

                          <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">
                            Execucao atual:{" "}
                            {obterCrmAutomacaoAcao(automacao.acao).nome}. Envio
                            real por WhatsApp ou e-mail fica preparado para
                            futuras integracoes.
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                    Pipeline
                  </p>

                  <h4 className="mt-2 text-lg font-bold text-slate-900">
                    Funil comercial
                  </h4>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Mova leads entre as colunas para acompanhar o atendimento e
                    registrar automaticamente a data da ultima movimentacao.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-5">
                  {crmPipelineEtapas.map((etapa) => {
                    const clientesDaEtapa = crmClientes.filter(
                      (clienteCrm) =>
                        normalizarCrmPipelineEtapa(
                          clienteCrm.etapaPipeline
                        ) === etapa.id
                    );

                    return (
                      <div
                        key={etapa.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h5 className="text-sm font-bold text-slate-900">
                              {etapa.nome}
                            </h5>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {etapa.descricao}
                            </p>
                          </div>

                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-green-100 px-2 text-xs font-bold text-green-700">
                            {clientesDaEtapa.length}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-3">
                          {clientesDaEtapa.map((clienteCrm) => (
                            <article
                              key={`${etapa.id}-${clienteCrm.id}`}
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <h6 className="text-sm font-bold text-slate-900">
                                {clienteCrm.nome || "Lead sem nome"}
                              </h6>

                              <p className="mt-1 text-xs text-slate-500">
                                {clienteCrm.telefone ||
                                  clienteCrm.email ||
                                  "Contato nao informado"}
                              </p>

                              <label className="mt-3 block text-xs font-bold text-slate-600">
                                Mover para
                                <select
                                  value={normalizarCrmPipelineEtapa(
                                    clienteCrm.etapaPipeline
                                  )}
                                  onChange={(e) =>
                                    moverCrmClienteParaEtapa(
                                      clienteCrm.id,
                                      e.target.value as CrmPipelineEtapa
                                    )
                                  }
                                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                >
                                  {crmPipelineEtapas.map((opcao) => (
                                    <option key={opcao.id} value={opcao.id}>
                                      {opcao.nome}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <p className="mt-2 text-xs text-slate-500">
                                Movimentacao:{" "}
                                {formatarDataMovimentacaoCrm(
                                  clienteCrm.movimentadoEm
                                )}
                              </p>
                            </article>
                          ))}

                          {clientesDaEtapa.length === 0 && (
                            <p className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500">
                              Nenhum lead nesta etapa.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Clientes
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Base inicial do CRM
                    </h4>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={adicionarCrmCliente}
                  >
                    Adicionar cliente
                  </Button>
                </div>

                <div className="mt-4 grid gap-4">
                  {crmClientes.map((clienteCrm, indice) => (
                    <div
                      key={clienteCrm.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            Cliente {indice + 1}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Dados preparados para futura evolucao do CRM.
                          </p>
                          {clienteCrm.origem && (
                            <span className="mt-2 inline-flex rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                              Origem: {clienteCrm.origem}
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => removerCrmCliente(indice)}
                          disabled={crmClientes.length <= 1}
                        >
                          Remover
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Input
                          label="Nome"
                          value={clienteCrm.nome}
                          onChange={(e) =>
                            atualizarCrmCliente(indice, "nome", e.target.value)
                          }
                          placeholder="Nome do cliente"
                        />

                        <Input
                          label="Telefone"
                          value={clienteCrm.telefone}
                          onChange={(e) =>
                            atualizarCrmCliente(
                              indice,
                              "telefone",
                              e.target.value
                            )
                          }
                          placeholder="(00) 00000-0000"
                        />

                        <Input
                          label="E-mail"
                          value={clienteCrm.email}
                          onChange={(e) =>
                            atualizarCrmCliente(indice, "email", e.target.value)
                          }
                          placeholder="cliente@email.com"
                        />

                        <label className="block font-medium text-slate-700">
                          Status
                          <select
                            value={clienteCrm.status}
                            onChange={(e) =>
                              atualizarCrmCliente(
                                indice,
                                "status",
                                e.target.value
                              )
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          >
                            <option value="prospect">Prospect</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </label>

                        <label className="block font-medium text-slate-700">
                          Etapa do pipeline
                          <select
                            value={normalizarCrmPipelineEtapa(
                              clienteCrm.etapaPipeline
                            )}
                            onChange={(e) =>
                              moverCrmClienteParaEtapa(
                                clienteCrm.id,
                                e.target.value as CrmPipelineEtapa
                              )
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          >
                            {crmPipelineEtapas.map((etapa) => (
                              <option key={etapa.id} value={etapa.id}>
                                {etapa.nome}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                          <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                            Ultima movimentacao
                          </span>
                          {formatarDataMovimentacaoCrm(
                            clienteCrm.movimentadoEm
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <Input
                            label="Tags"
                            value={clienteCrm.tags.join(", ")}
                            onChange={(e) =>
                              atualizarCrmCliente(
                                indice,
                                "tags",
                                normalizarTagsCrm(e.target.value)
                              )
                            }
                            placeholder="Ex.: vip, recorrente, orcamento"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-medium text-slate-700">
                            Observacoes
                          </label>

                          <textarea
                            value={clienteCrm.observacoes}
                            onChange={(e) =>
                              atualizarCrmCliente(
                                indice,
                                "observacoes",
                                e.target.value
                              )
                            }
                            placeholder="Preferencias, historico de contato ou proximos passos."
                            rows={3}
                            className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          />
                        </div>

                        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900">
                                Tarefas e lembretes
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Controle proximos passos com vencimento,
                                prioridade e status.
                              </p>
                            </div>

                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {
                                clienteCrm.tarefas.filter(
                                  (tarefa) => tarefa.status === "pendente"
                                ).length
                              }{" "}
                              pendente(s)
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <Input
                              label="Titulo da tarefa"
                              value={obterCrmTarefaRascunho(clienteCrm.id).titulo}
                              onChange={(e) =>
                                atualizarCrmTarefaRascunho(
                                  clienteCrm.id,
                                  "titulo",
                                  e.target.value
                                )
                              }
                              placeholder="Ex.: Enviar proposta revisada"
                            />

                            <div className="grid gap-3 md:grid-cols-3">
                              <Input
                                label="Data de vencimento"
                                type="date"
                                value={
                                  obterCrmTarefaRascunho(clienteCrm.id)
                                    .vencimento
                                }
                                onChange={(e) =>
                                  atualizarCrmTarefaRascunho(
                                    clienteCrm.id,
                                    "vencimento",
                                    e.target.value
                                  )
                                }
                              />

                              <label className="block text-sm font-medium text-slate-700">
                                Prioridade
                                <select
                                  value={
                                    obterCrmTarefaRascunho(clienteCrm.id)
                                      .prioridade
                                  }
                                  onChange={(e) =>
                                    atualizarCrmTarefaRascunho(
                                      clienteCrm.id,
                                      "prioridade",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                >
                                  {crmTarefaPrioridades.map((prioridade) => (
                                    <option
                                      key={prioridade.id}
                                      value={prioridade.id}
                                    >
                                      {prioridade.nome}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() =>
                                    adicionarCrmTarefa(clienteCrm.id)
                                  }
                                >
                                  Adicionar tarefa
                                </Button>
                              </div>
                            </div>

                            <label className="block text-sm font-medium text-slate-700">
                              Descricao opcional
                              <textarea
                                value={
                                  obterCrmTarefaRascunho(clienteCrm.id)
                                    .descricao
                                }
                                onChange={(e) =>
                                  atualizarCrmTarefaRascunho(
                                    clienteCrm.id,
                                    "descricao",
                                    e.target.value
                                  )
                                }
                                placeholder="Detalhes, combinados ou contexto da tarefa."
                                rows={2}
                                className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                              />
                            </label>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {clienteCrm.tarefas.length > 0 ? (
                              clienteCrm.tarefas.map((tarefa) => {
                                const prioridade = obterCrmTarefaPrioridade(
                                  tarefa.prioridade
                                );

                                return (
                                  <article
                                    key={tarefa.id}
                                    className={`rounded-xl border p-3 ${
                                      tarefa.status === "concluida"
                                        ? "border-green-200 bg-green-50"
                                        : "border-slate-200 bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h6 className="text-sm font-bold text-slate-900">
                                            {tarefa.titulo}
                                          </h6>
                                          <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${prioridade.classes}`}
                                          >
                                            {prioridade.nome}
                                          </span>
                                          <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                              tarefa.status === "concluida"
                                                ? "bg-green-700 text-white"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {tarefa.status === "concluida"
                                              ? "Concluida"
                                              : "Pendente"}
                                          </span>
                                        </div>

                                        <p className="mt-2 text-xs font-medium text-slate-500">
                                          Vencimento:{" "}
                                          {formatarDataVencimentoCrm(
                                            tarefa.vencimento
                                          )}
                                        </p>

                                        {tarefa.descricao && (
                                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                            {tarefa.descricao}
                                          </p>
                                        )}
                                      </div>

                                      <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                          alternarCrmTarefaStatus(
                                            clienteCrm.id,
                                            tarefa.id,
                                            tarefa.status === "concluida"
                                              ? "pendente"
                                              : "concluida"
                                          )
                                        }
                                      >
                                        {tarefa.status === "concluida"
                                          ? "Reabrir"
                                          : "Concluir"}
                                      </Button>
                                    </div>
                                  </article>
                                );
                              })
                            ) : (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                                Nenhuma tarefa registrada para este lead.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900">
                                Historico de interacoes
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Registre contatos, retornos e observacoes em
                                ordem cronologica.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <textarea
                              value={crmInteracoesRascunho[clienteCrm.id] || ""}
                              onChange={(e) =>
                                setCrmInteracoesRascunho(
                                  (rascunhosAtuais) => ({
                                    ...rascunhosAtuais,
                                    [clienteCrm.id]: e.target.value,
                                  })
                                )
                              }
                              placeholder="Ex.: Cliente pediu retorno amanha com proposta revisada."
                              rows={3}
                              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            />

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                              <label className="block text-sm font-medium text-slate-700">
                                Origem da interacao
                                <select
                                  value={
                                    crmInteracoesOrigemRascunho[
                                      clienteCrm.id
                                    ] || "manual"
                                  }
                                  onChange={(e) =>
                                    setCrmInteracoesOrigemRascunho(
                                      (origensAtuais) => ({
                                        ...origensAtuais,
                                        [clienteCrm.id]: e.target
                                          .value as CrmInteracaoOrigem,
                                      })
                                    )
                                  }
                                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                >
                                  {crmInteracaoOrigens
                                    .filter(
                                      (origem) => origem.id !== "sistema"
                                    )
                                    .map((origem) => (
                                      <option
                                        key={origem.id}
                                        value={origem.id}
                                      >
                                        {origem.nome}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                  adicionarCrmInteracao(clienteCrm.id)
                                }
                              >
                                Adicionar anotacao
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {clienteCrm.interacoes.length > 0 ? (
                              clienteCrm.interacoes.map((interacao) => (
                                <article
                                  key={interacao.id}
                                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full bg-green-100 px-2.5 py-1 font-bold text-green-700">
                                      {obterCrmInteracaoOrigemNome(
                                        interacao.origem
                                      )}
                                    </span>
                                    <span className="font-medium text-slate-500">
                                      {formatarDataMovimentacaoCrm(
                                        interacao.dataHora
                                      )}
                                    </span>
                                  </div>

                                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                                    {interacao.texto}
                                  </p>
                                </article>
                              ))
                            ) : (
                              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                                Nenhuma interacao registrada para este lead.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "ia" && (
        <Card
          title="IA"
          subtitle="Estrutura inicial do Assistente Comercial da MikaON."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.ia
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.ia
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.ia ? "Ativo" : "Nao contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    Assistente Comercial
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Configure a identidade e o comportamento inicial do
                    assistente. Nesta sprint, a estrutura e salva em
                    ia_config, sem chamadas para APIs externas.
                  </p>
                </div>
              </div>
            </div>

            <fieldset
              disabled={!recursosContratados.ia}
              className="grid gap-5 disabled:opacity-60"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Configuracao
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-slate-900">
                      Assistente da empresa
                    </h4>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={iaConfig.ativa}
                      onChange={(e) =>
                        atualizarIaConfig("ativa", e.target.checked)
                      }
                    />
                    Ativar IA
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nome do assistente"
                    value={iaConfig.nomeAssistente}
                    onChange={(e) =>
                      atualizarIaConfig("nomeAssistente", e.target.value)
                    }
                    placeholder="Ex.: Assistente MikaON"
                  />

                  <label className="block text-sm font-medium text-slate-700">
                    Tom de comunicacao
                    <select
                      value={iaConfig.tomComunicacao}
                      onChange={(e) =>
                        atualizarIaConfig("tomComunicacao", e.target.value)
                      }
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    >
                      {iaTonsComunicacao.map((tom) => (
                        <option key={tom.id} value={tom.id}>
                          {tom.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="md:col-span-2 grid gap-3 md:grid-cols-4">
                    {iaTonsComunicacao.map((tom) => (
                      <div
                        key={tom.id}
                        className={`rounded-xl border p-3 text-sm ${
                          iaConfig.tomComunicacao === tom.id
                            ? "border-green-300 bg-green-50 text-green-900"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        <p className="font-bold">{tom.nome}</p>
                        <p className="mt-1 text-xs leading-5">
                          {tom.descricao}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Instrucoes personalizadas
                    </label>
                    <textarea
                      value={iaConfig.instrucoesPersonalizadas}
                      onChange={(e) =>
                        atualizarIaConfig(
                          "instrucoesPersonalizadas",
                          e.target.value
                        )
                      }
                      rows={6}
                      className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      placeholder="Ex.: Priorize respostas curtas, pergunte o melhor horario de contato e direcione interessados para o WhatsApp."
                    />
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          Base de conhecimento
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Cadastre respostas frequentes, politicas e detalhes
                          importantes para uso futuro pelo assistente.
                        </p>
                      </div>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                        {iaConfig.baseConhecimento.perguntasFrequentes.length}
                        /50 FAQs
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Input
                        label="Pergunta frequente"
                        value={iaFaqRascunho.pergunta}
                        onChange={(e) =>
                          atualizarIaFaqRascunho("pergunta", e.target.value)
                        }
                        placeholder="Ex.: Qual e o prazo de entrega?"
                      />

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Resposta
                        </label>
                        <textarea
                          value={iaFaqRascunho.resposta}
                          onChange={(e) =>
                            atualizarIaFaqRascunho("resposta", e.target.value)
                          }
                          rows={3}
                          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          placeholder="Ex.: O prazo medio e de 3 dias uteis apos a confirmacao."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={adicionarIaPerguntaFrequente}
                          disabled={
                            !iaFaqRascunho.pergunta.trim() ||
                            !iaFaqRascunho.resposta.trim() ||
                            iaConfig.baseConhecimento.perguntasFrequentes
                              .length >= 50
                          }
                        >
                          Adicionar pergunta
                        </Button>
                      </div>
                    </div>

                    {iaConfig.baseConhecimento.perguntasFrequentes.length > 0 ? (
                      <div className="mt-4 grid gap-3">
                        {iaConfig.baseConhecimento.perguntasFrequentes.map(
                          (perguntaFrequente, indice) => (
                            <div
                              key={perguntaFrequente.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                              <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <p className="text-sm font-bold text-slate-900">
                                  FAQ {indice + 1}
                                </p>

                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() =>
                                    removerIaPerguntaFrequente(indice)
                                  }
                                >
                                  Remover
                                </Button>
                              </div>

                              <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <Input
                                  label="Pergunta"
                                  value={perguntaFrequente.pergunta}
                                  onChange={(e) =>
                                    atualizarIaPerguntaFrequente(
                                      indice,
                                      "pergunta",
                                      e.target.value
                                    )
                                  }
                                />

                                <div>
                                  <label className="block text-sm font-medium text-slate-700">
                                    Resposta
                                  </label>
                                  <textarea
                                    value={perguntaFrequente.resposta}
                                    onChange={(e) =>
                                      atualizarIaPerguntaFrequente(
                                        indice,
                                        "resposta",
                                        e.target.value
                                      )
                                    }
                                    rows={3}
                                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Nenhuma pergunta frequente cadastrada ainda.
                      </div>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Politicas da empresa
                        </label>
                        <textarea
                          value={iaConfig.baseConhecimento.politicasEmpresa}
                          onChange={(e) =>
                            atualizarIaBaseConhecimento(
                              "politicasEmpresa",
                              e.target.value
                            )
                          }
                          rows={5}
                          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          placeholder="Ex.: Politica de troca, garantia, cancelamento, prazos e regras de atendimento."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Informacoes importantes
                        </label>
                        <textarea
                          value={
                            iaConfig.baseConhecimento.informacoesImportantes
                          }
                          onChange={(e) =>
                            atualizarIaBaseConhecimento(
                              "informacoesImportantes",
                              e.target.value
                            )
                          }
                          rows={5}
                          className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                          placeholder="Ex.: Diferenciais, perguntas sensiveis, instrucoes de atendimento e observacoes internas."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        Contexto da empresa
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Selecione quais fontes serao consolidadas para o
                        assistente utilizar em consultas futuras.
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {iaContextoFontes.map((fonte) => (
                        <label
                          key={fonte.id}
                          className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={iaConfig.contexto.fontes[fonte.id]}
                            onChange={(e) =>
                              atualizarIaContextoFonte(
                                fonte.id,
                                e.target.checked
                              )
                            }
                            className="mt-1"
                          />
                          <span>
                            <span className="block font-bold text-slate-900">
                              {fonte.nome}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {fonte.descricao}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-bold text-slate-900">
                          Previa do contexto unificado
                        </p>
                        <span className="text-xs font-medium text-slate-500">
                          {Object.keys(iaContextoPreview.dados).length} fonte(s)
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {iaContextoPreview.resumo ||
                          "Nenhuma fonte selecionada para o contexto."}
                      </p>

                      <textarea
                        value={JSON.stringify(iaContextoPreview, null, 2)}
                        readOnly
                        rows={10}
                        className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-green-900">
                          Prompt Mestre
                        </p>
                        <p className="mt-1 text-xs leading-5 text-green-800">
                          Gerado automaticamente com configuracoes da IA,
                          contexto da empresa e base de conhecimento.
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">
                        v{iaPromptMestrePreview.versao}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs font-bold uppercase text-green-700">
                          Caracteres
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {iaPromptMestrePreview.conteudo.length}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs font-bold uppercase text-green-700">
                          FAQs
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {
                            iaConfig.baseConhecimento.perguntasFrequentes
                              .length
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs font-bold uppercase text-green-700">
                          Fontes
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {Object.keys(iaContextoPreview.dados).length}
                        </p>
                      </div>
                    </div>

                    <textarea
                      value={iaPromptMestrePreview.conteudo}
                      readOnly
                      rows={18}
                      className="mt-4 w-full resize-none rounded-xl border border-green-200 bg-white px-4 py-3 font-mono text-xs text-slate-700 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Estrutura preparada para futuras integracoes com provedores
                    de IA, CRM, WhatsApp e e-mail. Nenhum conteudo e gerado
                    automaticamente nesta sprint.
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </Card>
      )}

      {abaAtiva === "landing" && (
        <Card
          title="Landing Page"
          subtitle="Estrutura base para uma landing independente, preparada para planos, IA, dominio e analytics."
        >
          <div className="space-y-5">
            <div
              className={`rounded-2xl border p-4 ${
                recursosContratados.landing_page && landingPagePublicada
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      recursosContratados.landing_page && landingPagePublicada
                        ? "bg-green-700 text-white"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {recursosContratados.landing_page ? "Ativo" : "Não contratado"}
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-slate-900">
                    {recursosContratados.landing_page
                      ? "Landing Page liberada"
                      : "Landing Page ainda nao contratada"}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Este modulo foi preparado para funcionar separado da Pagina Publica, com estrutura propria para campanhas, dominios personalizados e leitura de resultados.
                  </p>

                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-3">
                    <input
                      type="checkbox"
                      checked={landingPagePublicada}
                      disabled={!recursosContratados.landing_page}
                      onChange={(e) => setLandingPagePublicada(e.target.checked)}
                      className="h-5 w-5"
                    />

                    <span>
                      <span className="block font-bold text-slate-900">
                        Publicar Landing Page
                      </span>

                      <span className="block text-sm leading-6 text-slate-600">
                        Quando desligada, o link publico mostra "Landing Page não publicada".
                      </span>
                    </span>
                  </label>

                  {possuiAlteracoesNaoPublicadas && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-white/80 p-3">
                      <p className="text-sm font-bold text-amber-800">
                        Existem alteracoes nao publicadas.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        O preview mostra o rascunho. A Landing Page publica continua usando a ultima versao publicada.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={!recursosContratados.landing_page}
                      onClick={publicarLandingPageAlteracoes}
                      className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      Publicar alteracoes
                    </button>

                    <button
                      type="button"
                      disabled={!possuiAlteracoesNaoPublicadas}
                      onClick={descartarLandingPageAlteracoes}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Descartar alteracoes
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLandingPagePlaceholderAberto(true)}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white md:w-auto ${
                    recursosContratados.landing_page
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {recursosContratados.landing_page
                    ? "Configurar Landing Page"
                    : "Conhecer recurso"}
                </button>
              </div>
            </div>

            {landingPagePlaceholderAberto && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                      Editor da Landing Page
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      Estrutura de configuracao
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      O editor ainda nao publica a landing. Esta base prepara secoes independentes, preview em tempo real, ordenacao futura e integracoes de crescimento.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                    <button
                      type="button"
                      onClick={() => setLandingPageIaModalAberto(true)}
                      className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 md:w-auto"
                    >
                      Gerar Landing Page com IA
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandingPagePlaceholderAberto(false)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 md:w-auto"
                    >
                      Fechar
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
                  <aside className="rounded-2xl bg-slate-50 p-3">
                    <h4 className="font-bold text-slate-900">
                      Seções
                    </h4>

                    <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:flex xl:flex-col">
                      {landingPageSectionRegistry.map((secao) => (
                        <button
                          key={secao.id}
                          type="button"
                          onClick={() => setLandingPageSecaoAtiva(secao.id)}
                          className={`min-w-0 rounded-xl border px-3 py-2 text-left text-sm font-bold transition xl:w-full ${
                            landingPageSecaoAtiva === secao.id
                              ? "border-green-600 bg-green-700 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:border-green-200"
                          }`}
                        >
                          {secao.nome}
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="min-w-0 space-y-4">
                    {landingPageSectionRegistry
                      .filter((secao) => secao.id === landingPageSecaoAtiva)
                      .map((secao) => {
                        const SecaoLanding = secao.Component;
                        const secaoConteudoAtiva =
                          landingPageOrdemSecoesPadrao.includes(
                            secao.id as LandingPageSecaoConteudoId
                          )
                            ? (secao.id as LandingPageSecaoConteudoId)
                            : null;

                        return (
                          <div key={secao.id} className="space-y-4">
                            {secaoConteudoAtiva && (
                              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <LandingSecaoVisibilitySwitch
                                  secao={secaoConteudoAtiva}
                                  visivel={
                                    landingPageVisibilidadeSecoes[
                                      secaoConteudoAtiva
                                    ]
                                  }
                                  desabilitado={
                                    !recursosContratados.landing_page
                                  }
                                  onChange={
                                    atualizarLandingPageSecaoVisibilidade
                                  }
                                />
                              </div>
                            )}

                            <SecaoLanding
                              nome={secao.nome}
                              descricao={secao.descricao}
                              landingPageContratada={
                                recursosContratados.landing_page
                              }
                              pastaUploadLanding={pastaUploadLanding}
                              hero={landingPageHero}
                              sobre={landingPageSobre}
                              servicos={landingPageServicos}
                              galeria={landingPageGaleria}
                              depoimentos={landingPageDepoimentos}
                              videos={landingPageVideos}
                              audios={landingPageAudios}
                              produtosDigitais={landingPageProdutosDigitais}
                              categoriasProdutosDigitais={
                                landingPageCategoriasProdutosDigitais
                              }
                              contato={landingPageContato}
                              formularioContato={landingPageFormularioContato}
                              cta={landingPageCta}
                              seo={landingPageSeo}
                              ordemSecoes={landingPageOrdemSecoes}
                              visibilidadeSecoes={
                                landingPageVisibilidadeSecoes
                              }
                              historicoVersoes={landingPageHistoricoVersoes}
                              versaoHistoricoVisualizada={
                                landingPageVersaoHistoricoVisualizada
                              }
                              onHeroChange={atualizarLandingPageHero}
                              onSobreChange={atualizarLandingPageSobre}
                              onServicoChange={atualizarLandingPageServico}
                              onServicoAdd={adicionarLandingPageServico}
                              onServicoRemove={removerLandingPageServico}
                              onGaleriaImagemChange={
                                atualizarLandingPageGaleriaImagem
                              }
                              onGaleriaImagemAdd={
                                adicionarLandingPageGaleriaImagem
                              }
                              onGaleriaImagemRemove={
                                removerLandingPageGaleriaImagem
                              }
                              onDepoimentoChange={
                                atualizarLandingPageDepoimento
                              }
                              onDepoimentoAdd={adicionarLandingPageDepoimento}
                              onDepoimentoRemove={
                                removerLandingPageDepoimento
                              }
                              onVideoChange={atualizarLandingPageVideo}
                              onVideoAdd={adicionarLandingPageVideo}
                              onVideoRemove={removerLandingPageVideo}
                              onVideoMove={moverLandingPageVideo}
                              onAudioChange={atualizarLandingPageAudio}
                              onAudioAdd={adicionarLandingPageAudio}
                              onAudioRemove={removerLandingPageAudio}
                              onAudioMove={moverLandingPageAudio}
                              onProdutoDigitalChange={
                                atualizarLandingPageProdutoDigital
                              }
                              onProdutoDigitalAdd={
                                adicionarLandingPageProdutoDigital
                              }
                              onProdutoDigitalRemove={
                                removerLandingPageProdutoDigital
                              }
                              onProdutoDigitalMove={
                                moverLandingPageProdutoDigital
                              }
                              onProdutoCategoriaAdd={
                                adicionarLandingPageProdutoCategoria
                              }
                              onProdutoCategoriaRemove={
                                removerLandingPageProdutoCategoria
                              }
                              onContatoChange={atualizarLandingPageContato}
                              onFormularioContatoChange={
                                atualizarLandingPageFormularioContato
                              }
                              onCtaChange={atualizarLandingPageCta}
                              onSeoChange={atualizarLandingPageSeo}
                              onTemplateApply={aplicarLandingPageTemplate}
                              onSecaoMove={moverLandingPageSecao}
                              onSecaoVisibilityChange={
                                atualizarLandingPageSecaoVisibilidade
                              }
                              onHistoricoView={
                                setLandingPageVersaoHistoricoVisualizada
                              }
                              onHistoricoRestore={
                                restaurarLandingPageVersaoHistorico
                              }
                              onHistoricoClose={() =>
                                setLandingPageVersaoHistoricoVisualizada(null)
                              }
                            />
                          </div>
                        );
                      })}

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="font-bold text-slate-900">
                        Base preparada
                      </h4>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {landingPageArquiteturaFutura.map((item) => (
                          <span
                            key={item}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <LandingPagePreviewReal
                    empresa={empresaLandingPreview}
                    landingPage={landingPagePreviewConfig}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {abaAtiva === "aparencia" && (
        <Card
          title="Personalizar Página"
          subtitle="Escolha um tema pronto para a página pública desta empresa."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] xl:items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 font-bold text-slate-800">
                  Logo e Banner
                </h3>

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      valor: "normal",
                      titulo: "Exibir logo",
                      descricao: "Mostra o logo na página pública.",
                    },
                    {
                      valor: "hidden",
                      titulo: "Não exibir logo",
                      descricao: "Mostra a página apenas com o banner.",
                    },
                  ].map((opcao) => (
                    <label
                      key={opcao.valor}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        logoExibicao === opcao.valor
                          ? "border-green-600 bg-green-50"
                          : "border-slate-200 bg-white hover:border-green-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="logoExibicao"
                        value={opcao.valor}
                        checked={logoExibicao === opcao.valor}
                        onChange={() =>
                          setLogoExibicao(opcao.valor as LogoExibicao)
                        }
                        className="mr-2"
                      />

                      <span className="font-bold text-slate-800">
                        {opcao.titulo}
                      </span>

                      <p className="mt-2 text-sm text-slate-500">
                        {opcao.descricao}
                      </p>
                    </label>
                  ))}
                </div>

                <div className="grid gap-4">
                  <UploadImagem
                    titulo="Logo"
                    imagem={logo}
                    pasta={empresaId ? `${empresaId}/logo` : undefined}
                    onUpload={salvarLogo}
                  />

                  <UploadImagem
                    titulo="Banner"
                    imagem={banner}
                    pasta={empresaId ? `${empresaId}/banner` : undefined}
                    onUpload={salvarBanner}
                  />
                </div>
              </div>
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Temas
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                {temasProntos.map((tema) => {
                  const aparenciaTema = tema.aparencia;
                  const temaSelecionado =
                    corPrincipal === aparenciaTema.corPrincipal &&
                    corSecundaria === aparenciaTema.corSecundaria &&
                    corBotoes === aparenciaTema.corBotoes &&
                    corTextoBotoes === aparenciaTema.corTextoBotoes &&
                    corFundoPagina === aparenciaTema.corFundoPagina &&
                    corAreaPrincipal === aparenciaTema.corAreaPrincipal &&
                    corFundoHero === aparenciaTema.corFundoHero &&
                    tipoFundo === aparenciaTema.tipoFundo &&
                    gradienteInicio === aparenciaTema.gradienteInicio &&
                    gradienteFim === aparenciaTema.gradienteFim &&
                    gradienteDirecao === aparenciaTema.gradienteDirecao;

                  return (
                    <button
                      key={tema.id}
                      type="button"
                      data-theme-id={tema.id}
                      onClick={() => aplicarTemaPronto(tema)}
                      className={`rounded-2xl border bg-white p-4 text-left transition hover:border-green-300 hover:shadow-sm ${
                        temaSelecionado
                          ? "border-green-600 shadow-sm ring-4 ring-green-100"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="font-bold text-slate-800">
                        {tema.nome}
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        {tema.descricao}
                      </span>

                      <span
                        className="mt-4 grid grid-cols-5 overflow-hidden rounded-xl border border-slate-200"
                        aria-hidden="true"
                        data-theme-thumbnail={tema.miniatura.tipo}
                      >
                        {[
                          aparenciaTema.corFundoPagina,
                          aparenciaTema.corAreaPrincipal,
                          aparenciaTema.corPrincipal,
                          aparenciaTema.corSecundaria,
                          aparenciaTema.corBotoes,
                        ].map((cor, indice) => (
                          <span
                            key={`${tema.id}-${cor}-${indice}`}
                            className="h-9"
                            style={{ backgroundColor: cor }}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {possuiAlteracoesAparencia && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                Você possui alterações não salvas.
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const confirmado = window.confirm(
                    `Deseja restaurar o tema padrao definido pela ${BrandConfig.developerCompany}?`
                  );

                  if (confirmado) {
                    aplicarAparencia(TemaPadraoMikatech);
                  }
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
              >
                Restaurar padrao {BrandConfig.developerCompany}
              </button>

              <Button
                variant="primary"
                size="lg"
                onClick={salvar}
                disabled={salvandoEmpresa}
                className={
                  possuiAlteracoesAparencia
                    ? "shadow-lg ring-4 ring-green-100"
                    : "opacity-80"
                }
              >
                Salvar alterações
              </Button>
            </div>
            </div>

            <div className="xl:sticky xl:top-6">
              <h3 className="mb-3 font-bold text-slate-800">
                Preview em Tempo Real
              </h3>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner">
                <div
                  className="public-empresa-page public-empresa-page--preview"
                  style={obterEstiloPreview()}
                >
                  <section className="public-empresa-card">
                    <HeroEmpresa
                      banner={banner}
                      logo={logo}
                      nome={nome || "Empresa"}
                      logoExibicao={logoExibicao}
                      corFundoHero={corFundoHero || corFundoPagina}
                    />

                    <div className="public-empresa-content">
                      <section className="public-empresa-profile-card">
                        <InformacoesEmpresa
                          nome={nome || "Empresa"}
                          descricao={descricao}
                        />
                      </section>

                      <ContatosEmpresa
                        nome={nome || "Empresa"}
                        whatsapp={whatsapp}
                        telefone={telefone}
                        email={email}
                        instagram={instagram}
                        tiktok={tiktok}
                        youtube={youtube}
                        kwai={kwai}
                        site={site}
                        endereco={endereco}
                        horarioAtendimento={horarioAtendimento}
                        googleReviewUrl={googleReviewUrl}
                        wifiNome={wifiNome}
                        wifiSenha={wifiSenha}
                        pixNome={pixNome}
                        pixChave={pixChave || pix}
                      />
                    </div>
                  </section>
                </div>
              </div>
            </div>

          </div>
        </Card>
      )}

      {abaAtiva === "contato" && (
        <Card
        title="Contato"
        subtitle="Canais utilizados pelos clientes para falar com a empresa."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
            placeholder="(15) 99741-4078"
            helperText="Digite apenas os números."
          />

          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="(15) 3333-4444"
            helperText="Digite apenas os números."
          />

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
          />
        </div>
      </Card>
      )}

      {abaAtiva === "endereco" && (
        <Card
        title="Endereço"
        subtitle="Localização e horário de atendimento exibidos para o cliente."
      >
        <div className="grid lg:grid-cols-2 gap-5">
          <div>
            <Input
              label="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
            />

            {buscandoCep && (
              <p className="mt-2 text-sm text-slate-500">
                Buscando endereço...
              </p>
            )}

            {cepErro && (
              <p className="mt-2 text-sm text-red-600">
                {cepErro}
              </p>
            )}
          </div>

          <Input
            label="Numero"
            value={numeroEndereco}
            onChange={(e) => setNumeroEndereco(e.target.value)}
          />

          <Input
            label="Complemento"
            value={complementoEndereco}
            onChange={(e) => setComplementoEndereco(e.target.value)}
          />

          <Input
            label="Rua"
            value={rua}
            onChange={(e) => {
              setRua(e.target.value);
              setEndereco(montarEnderecoCompleto(e.target.value));
            }}
          />

          <Input
            label="Bairro"
            value={bairro}
            onChange={(e) => {
              setBairro(e.target.value);
              setEndereco(
                montarEnderecoCompleto(
                  rua,
                  e.target.value
                )
              );
            }}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Cidade"
                value={cidade}
                onChange={(e) => {
                  setCidade(e.target.value);
                  setEndereco(
                    montarEnderecoCompleto(
                      rua,
                      bairro,
                      e.target.value
                    )
                  );
                }}
              />
            </div>

            <Input
              label="Estado"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setEndereco(
                  montarEnderecoCompleto(
                    rua,
                    bairro,
                    cidade,
                    e.target.value
                  )
                );
              }}
            />
          </div>

          <Input
            label="Endereço atual"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <div className="lg:col-span-2">
            <div className="mb-3">
              <label className="block font-medium">
                Horário de atendimento
              </label>
              <p className="text-sm text-slate-500">
                Configure os dias ativos e os horários de abertura e fechamento.
              </p>
            </div>

            <div className="space-y-3">
              {diasAtendimento.map((dia) => {
                const horario = horariosAtendimento[dia.id];

                return (
                  <div
                    key={dia.id}
                    className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_120px_120px]"
                  >
                    <label className="flex items-center gap-3 font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={horario.ativo}
                        onChange={(e) =>
                          atualizarHorarioDia(
                            dia.id,
                            "ativo",
                            e.target.checked
                          )
                        }
                      />
                      {dia.label}
                    </label>

                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={horario.abertura}
                      disabled={!horario.ativo}
                      onChange={(e) =>
                        atualizarHorarioDia(
                          dia.id,
                          "abertura",
                          e.target.value
                        )
                      }
                    />

                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2"
                      value={horario.fechamento}
                      disabled={!horario.ativo}
                      onChange={(e) =>
                        atualizarHorarioDia(
                          dia.id,
                          "fechamento",
                          e.target.value
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>

            {horarioAtendimento && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-line">
                {horarioAtendimento}
              </div>
            )}
          </div>
        </div>
      </Card>
      )}

      {abaAtiva === "conectividade" && (
        <Card
        title="Conectividade"
        subtitle="Dados rápidos para Wi-Fi, PIX e avaliações no Google."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Nome da Rede Wi-Fi"
            value={wifiNome}
            onChange={(e) => setWifiNome(e.target.value)}
          />

          <Input
            label="Senha Wi-Fi"
            value={wifiSenha}
            onChange={(e) => setWifiSenha(e.target.value)}
          />

          <Input
            label="Nome do recebedor PIX"
            value={pixNome}
            onChange={(e) => setPixNome(e.target.value)}
          />

          <Input
            label="Chave PIX"
            value={pixChave}
            onChange={(e) => setPixChave(e.target.value)}
          />

          <Input
            label="PIX legado"
            value={pix}
            onChange={(e) => setPix(e.target.value)}
          />

          <Input
            label="Link para Avaliação Google"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
          />
        </div>
      </Card>
      )}

      {abaAtiva === "redes" && (
        <Card
        title="Redes Sociais"
        subtitle="Perfis sociais usados para relacionamento e divulgação."
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setInstagram(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="TikTok"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setTiktok(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="YouTube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setYoutube(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="Kwai"
            value={kwai}
            onChange={(e) => setKwai(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setKwai(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <Input
            label="Facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            onBlur={(e) => {
              const valorNormalizado = normalizarUsuarioRedeSocial(e.target.value);

              setFacebook(valorNormalizado);
            }}
            helperText="Digite apenas o usuário, sem @ e sem link."
          />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Vitrine Digital será preparada em uma sprint futura.
          </div>
        </div>
      </Card>
      )}

      {feedbackSalvamento && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            feedbackSalvamento.tipo === "sucesso"
              ? "bg-green-50 text-green-700"
              : feedbackSalvamento.tipo === "erro"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}
          role="status"
        >
          {feedbackSalvamento.texto}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={salvar}
          disabled={salvandoEmpresa}
        >
          Salvar alterações
        </Button>
      </div>

      {!modoCliente && onExcluir && (
        <Card
          title="Zona de Perigo"
          subtitle="Ações irreversíveis para esta empresa."
        >
          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-red-800">
                Excluir empresa
              </h3>

              <p className="mt-1 text-sm text-red-700">
                Esta ação remove a empresa e não poderá ser desfeita.
              </p>
            </div>

            <button
              type="button"
              onClick={onExcluir}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Excluir empresa
            </button>
          </div>
        </Card>
      )}

      {landingPageIaModalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-page-ia-titulo"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  IA para Landing Page
                </p>

                <h3
                  id="landing-page-ia-titulo"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  Geracao automatica em breve
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Esta funcionalidade ainda nao gera conteudo. A estrutura abaixo mostra os dados que serao usados na futura integracao com IA.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLandingPageIaModalAberto(false)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 md:w-auto"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">
                  Dados da empresa
                </h4>

                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold text-slate-700">
                      Nome da empresa
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {contextoLandingPageIa.nomeEmpresa || "Nao informado"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-bold text-slate-700">
                      Categoria
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {contextoLandingPageIa.categoria || "Nao informada"}
                    </dd>
                  </div>

                  <div className="md:col-span-2">
                    <dt className="font-bold text-slate-700">
                      Descricao
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-600">
                      {contextoLandingPageIa.descricao || "Nao informada"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="font-bold text-slate-900">
                  Servicos
                </h4>

                <div className="mt-3 grid gap-2">
                  {contextoLandingPageIa.servicos.map((servico, indice) => (
                    <div
                      key={`${servico.titulo}-${indice}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="font-bold text-slate-900">
                        {servico.titulo.trim() || `Servico ${indice + 1}`}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {servico.descricao.trim() || "Descricao nao informada"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="font-bold text-slate-900">
                  Contatos
                </h4>

                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  {[
                    ["Telefone", contextoLandingPageIa.contatos.telefone],
                    ["WhatsApp", contextoLandingPageIa.contatos.whatsapp],
                    ["E-mail", contextoLandingPageIa.contatos.email],
                    ["Endereco", contextoLandingPageIa.contatos.endereco],
                  ].map(([label, valor]) => (
                    <div key={label}>
                      <dt className="font-bold text-slate-700">
                        {label}
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {valor || "Nao informado"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">
                  Arquitetura futura
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Este ponto fica preparado para enviar o contexto acima a um provedor de IA e preencher as secoes da Landing Page em uma proxima sprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
