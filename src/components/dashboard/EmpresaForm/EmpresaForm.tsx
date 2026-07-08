import {
  useEffect,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  buscarEmpresaPorId,
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../../../services/empresa/empresa.service";

import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import UploadImagem from "../UploadImagem";
import QRCodeEmpresa from "../QRCodeEmpresa/QRCodeEmpresa";
import HeroEmpresa from "../../public/HeroEmpresa/HeroEmpresa";
import InformacoesEmpresa from "../../public/InformacoesEmpresa/InformacoesEmpresa";
import ContatosEmpresa from "../../public/ContatosEmpresa/ContatosEmpresa";

import "../../../pages/PublicEmpresaPage/PublicEmpresaPage.css";

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
  | "visual"
  | "aparencia"
  | "contato"
  | "endereco"
  | "redes"
  | "conectividade";

type LogoExibicao = "normal" | "hidden";
type TipoFundo = "solida" | "gradiente";
type DirecaoGradiente = "horizontal" | "vertical" | "diagonal";
type AparenciaConfig = {
  corPrincipal: string;
  corSecundaria: string;
  corBotoes: string;
  corTextoBotoes: string;
  corFundoPagina: string;
  corAreaPrincipal: string;
  tipoFundo: TipoFundo;
  gradienteInicio: string;
  gradienteFim: string;
  gradienteDirecao: DirecaoGradiente;
};

const abasEmpresa: Array<{
  id: AbaEmpresa;
  label: string;
}> = [
  { id: "informacoes", label: "Informações" },
  { id: "visual", label: "Identidade Visual" },
  { id: "aparencia", label: "Personalizar Página" },
  { id: "contato", label: "Contato" },
  { id: "endereco", label: "Endereço" },
  { id: "redes", label: "Redes Sociais" },
  { id: "conectividade", label: "Conectividade" },
];

const paletasAparencia = [
  {
    nome: "Verde Mikatech",
    corPrincipal: "#1f3d36",
    corSecundaria: "#32bcad",
    corBotoes: "#ffffff",
    corTextoBotoes: "#1f3d36",
    corFundo: "#f1eee8",
    corAreaPrincipal: "#ffffff",
    gradienteInicio: "#fbfaf8",
    gradienteFim: "#f1eee8",
  },
  {
    nome: "Preto Premium",
    corPrincipal: "#111827",
    corSecundaria: "#d4af37",
    corBotoes: "#ffffff",
    corTextoBotoes: "#111827",
    corFundo: "#f4f4f5",
    corAreaPrincipal: "#ffffff",
    gradienteInicio: "#ffffff",
    gradienteFim: "#e7e5e4",
  },
  {
    nome: "Azul Profissional",
    corPrincipal: "#1d4ed8",
    corSecundaria: "#38bdf8",
    corBotoes: "#ffffff",
    corTextoBotoes: "#1e3a8a",
    corFundo: "#eff6ff",
    corAreaPrincipal: "#ffffff",
    gradienteInicio: "#ffffff",
    gradienteFim: "#dbeafe",
  },
  {
    nome: "Dourado Luxo",
    corPrincipal: "#6b4e16",
    corSecundaria: "#c9a227",
    corBotoes: "#ffffff",
    corTextoBotoes: "#6b4e16",
    corFundo: "#faf6e8",
    corAreaPrincipal: "#fffaf0",
    gradienteInicio: "#fffdf5",
    gradienteFim: "#f3e7bd",
  },
  {
    nome: "Rosa Elegante",
    corPrincipal: "#9d174d",
    corSecundaria: "#f472b6",
    corBotoes: "#ffffff",
    corTextoBotoes: "#9d174d",
    corFundo: "#fdf2f8",
    corAreaPrincipal: "#ffffff",
    gradienteInicio: "#ffffff",
    gradienteFim: "#fce7f3",
  },
  {
    nome: "Neutro Claro",
    corPrincipal: "#334155",
    corSecundaria: "#94a3b8",
    corBotoes: "#ffffff",
    corTextoBotoes: "#334155",
    corFundo: "#f8fafc",
    corAreaPrincipal: "#ffffff",
    gradienteInicio: "#ffffff",
    gradienteFim: "#f1f5f9",
  },
];

const aparenciaPadraoMikatech: AparenciaConfig = {
  corPrincipal: paletasAparencia[0].corPrincipal,
  corSecundaria: paletasAparencia[0].corSecundaria,
  corBotoes: paletasAparencia[0].corBotoes,
  corTextoBotoes: paletasAparencia[0].corTextoBotoes,
  corFundoPagina: paletasAparencia[0].corFundo,
  corAreaPrincipal: paletasAparencia[0].corAreaPrincipal,
  tipoFundo: "solida",
  gradienteInicio: paletasAparencia[0].gradienteInicio,
  gradienteFim: paletasAparencia[0].gradienteFim,
  gradienteDirecao: "vertical",
};

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
  const [tipoFundo, setTipoFundo] = useState<TipoFundo>("solida");
  const [gradienteInicio, setGradienteInicio] = useState("");
  const [gradienteFim, setGradienteFim] = useState("");
  const [gradienteDirecao, setGradienteDirecao] =
    useState<DirecaoGradiente>("vertical");
  const [aparenciaSalva, setAparenciaSalva] =
    useState<AparenciaConfig>(aparenciaPadraoMikatech);
  const categoriaSelecionada = categoriasEmpresa.includes(categoria)
    ? categoria
    : "Outra";
  const slugPublico = slugAdmin || slug;
  const aparenciaAtual: AparenciaConfig = {
    corPrincipal,
    corSecundaria,
    corBotoes,
    corTextoBotoes,
    corFundoPagina,
    corAreaPrincipal,
    tipoFundo,
    gradienteInicio,
    gradienteFim,
    gradienteDirecao,
  };
  const possuiAlteracoesAparencia =
    JSON.stringify(aparenciaAtual) !== JSON.stringify(aparenciaSalva);

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

    setNome(data.nome || "");
    setTipoGerenciamento(data.tipo || "mikatech");
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
    const aparenciaCarregada: AparenciaConfig = {
      corPrincipal: data.cor_principal || "",
      corSecundaria: data.cor_secundaria || "",
      corBotoes: data.cor_botoes || "",
      corTextoBotoes: data.cor_texto_botoes || "",
      corFundoPagina: data.cor_fundo_pagina || "",
      corAreaPrincipal: data.cor_area_principal || "",
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
    setTipoFundo(aparenciaCarregada.tipoFundo);
    setGradienteInicio(aparenciaCarregada.gradienteInicio);
    setGradienteFim(aparenciaCarregada.gradienteFim);
    setGradienteDirecao(aparenciaCarregada.gradienteDirecao);
    setAparenciaSalva(aparenciaCarregada);
    onEmpresaAtualChange?.({
      nome: data.nome || "",
      logo: data.logo || "",
    });
  }

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

  async function salvar() {
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

    if (whatsappLocal && whatsappLocal.length < 10) {
      alert("Informe um WhatsApp válido com DDD.");
      return;
    }

    if (telefoneLocal && telefoneLocal.length < 10) {
      alert("Informe um telefone válido com DDD.");
      return;
    }

    const dadosEmpresa = {
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
      tipo_fundo: tipoFundo,
      gradiente_inicio: gradienteInicio,
      gradiente_fim: gradienteFim,
      gradiente_direcao: gradienteDirecao,
      tiktok: normalizarUsuarioRedeSocial(tiktok),
      youtube: normalizarUsuarioRedeSocial(youtube),
      kwai: normalizarUsuarioRedeSocial(kwai),
    };

    console.log("[Diagnóstico UPDATE] Antes de chamar atualizarEmpresa:", {
      idRecebidoNoFormulario: empresaInicialId,
      idEnviadoAoService: empresaId,
      slugUsado: slugFinal,
      payloadEnviado: dadosEmpresa,
    });

    const { error } = await atualizarEmpresa(empresaId, dadosEmpresa);

    if (error) {
      console.error("Erro completo ao salvar empresa:", error);
      console.error("Contexto do update da empresa:", {
        idUsado: empresaId,
        slugUsado: slugFinal,
        payloadEnviado: dadosEmpresa,
      });
      alert(error.message || "Erro ao salvar.");
      return;
    }

    setSlug(slugFinal);
    setSlugAdmin(slugFinal);
    setAparenciaSalva({
      corPrincipal,
      corSecundaria,
      corBotoes,
      corTextoBotoes,
      corFundoPagina,
      corAreaPrincipal,
      tipoFundo,
      gradienteInicio,
      gradienteFim,
      gradienteDirecao,
    });
    onEmpresaAtualChange?.({
      nome,
      logo,
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

  function aplicarPaletaAparencia(paleta: (typeof paletasAparencia)[number]) {
    setCorPrincipal(paleta.corPrincipal);
    setCorSecundaria(paleta.corSecundaria);
    setCorBotoes(paleta.corBotoes);
    setCorTextoBotoes(paleta.corTextoBotoes);
    setCorFundoPagina(paleta.corFundo);
    setCorAreaPrincipal(paleta.corAreaPrincipal);
    setGradienteInicio(paleta.gradienteInicio);
    setGradienteFim(paleta.gradienteFim);
  }

  function aplicarAparencia(aparencia: AparenciaConfig) {
    setCorPrincipal(aparencia.corPrincipal);
    setCorSecundaria(aparencia.corSecundaria);
    setCorBotoes(aparencia.corBotoes);
    setCorTextoBotoes(aparencia.corTextoBotoes);
    setCorFundoPagina(aparencia.corFundoPagina);
    setCorAreaPrincipal(aparencia.corAreaPrincipal);
    setTipoFundo(aparencia.tipoFundo);
    setGradienteInicio(aparencia.gradienteInicio);
    setGradienteFim(aparencia.gradienteFim);
    setGradienteDirecao(aparencia.gradienteDirecao);
  }

  function obterDirecaoGradiente() {
    if (gradienteDirecao === "horizontal") return "90deg";
    if (gradienteDirecao === "diagonal") return "135deg";

    return "180deg";
  }

  function obterEstiloPreview(): CSSProperties {
    const estilo = {} as CSSProperties & Record<string, string>;

    if (corPrincipal) {
      estilo["--mc-primary"] = corPrincipal;
      estilo["--mc-text"] = corPrincipal;
    }

    if (corSecundaria) {
      estilo["--mc-secondary"] = corSecundaria;
      estilo["--mc-accent"] = corSecundaria;
    }

    if (corBotoes) {
      estilo["--mc-button-background"] = corBotoes;
    }

    if (corTextoBotoes) {
      estilo["--mc-button-text"] = corTextoBotoes;
    }

    if (corFundoPagina) {
      estilo["--mc-background"] = corFundoPagina;
      estilo["--mc-background-soft"] = corFundoPagina;
    }

    if (corAreaPrincipal) {
      estilo["--mc-content-background"] = corAreaPrincipal;
      estilo["--mc-card"] = corAreaPrincipal;
      estilo["--mc-surface"] = corAreaPrincipal;
    }

    if (tipoFundo === "gradiente") {
      estilo["--mc-page-background"] = `linear-gradient(${obterDirecaoGradiente()}, ${
        gradienteInicio || "#fbfaf8"
      } 0%, ${gradienteFim || "#f1eee8"} 100%)`;
    } else if (corFundoPagina) {
      estilo["--mc-page-background"] = corFundoPagina;
    }

    return estilo;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        {abasEmpresa.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setAbaAtiva(aba.id)}
            className={
              abaAtiva === aba.id
                ? "rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white"
                : "rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
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
              <div>
                <Input
                  label="Slug administrativo"
                  value={slugAdmin}
                  onChange={(e) => setSlugAdmin(gerarSlug(e.target.value))}
                />

                <p className="mt-2 text-sm text-slate-500">
                  Campo reservado para o administrador Mikatech.
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
                    Administrada pela Mikatech
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
          />

        </>
      )}

      {abaAtiva === "visual" && (
        <Card
        title="Identidade Visual"
        subtitle="Configure a logo e o banner que aparecem na página pública."
      >
        <div className="mb-5">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Exibição do logo na página
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                valor: "normal",
                titulo: "Exibir logo",
                descricao: "Mantém o logo em destaque sobre o banner.",
              },
              {
                valor: "hidden",
                titulo: "Não exibir logo",
                descricao: "Mostra apenas o banner na página pública.",
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
                  onChange={() => setLogoExibicao(opcao.valor as LogoExibicao)}
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
        </div>

        <div className="grid xl:grid-cols-2 gap-4 max-w-5xl">
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
      </Card>
      )}

      {abaAtiva === "aparencia" && (
        <Card
          title="Personalizar Página"
          subtitle="Personalize as cores da página pública desta empresa."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,1.08fr)] xl:items-start">
            <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Paletas rápidas
              </h3>

              <div className="grid gap-3 md:grid-cols-3">
                {paletasAparencia.map((paleta) => (
                  <button
                    key={paleta.nome}
                    type="button"
                    onClick={() => aplicarPaletaAparencia(paleta)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-green-300 hover:shadow-sm"
                  >
                    <span className="font-bold text-slate-800">
                      {paleta.nome}
                    </span>

                    <span className="mt-3 flex gap-2">
                      {[
                        paleta.corPrincipal,
                        paleta.corSecundaria,
                        paleta.corFundo,
                      ].map((cor) => (
                        <span
                          key={cor}
                          className="h-7 w-7 rounded-full border border-slate-200"
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Cor principal", corPrincipal, setCorPrincipal],
                ["Cor secundaria", corSecundaria, setCorSecundaria],
                ["Cor dos botões", corBotoes, setCorBotoes],
                ["Cor do texto dos botões", corTextoBotoes, setCorTextoBotoes],
                ["Cor de fundo da página", corFundoPagina, setCorFundoPagina],
                ["Cor da área principal", corAreaPrincipal, setCorAreaPrincipal],
              ].map(([label, valor, alterar]) => (
                <label key={label as string} className="block">
                  <span className="mb-2 block font-medium">
                    {label as string}
                  </span>

                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={(valor as string) || "#ffffff"}
                      onChange={(e) =>
                        (alterar as Dispatch<SetStateAction<string>>)(
                          e.target.value
                        )
                      }
                      className="h-12 w-14 rounded-xl border bg-white p-1"
                    />

                    <input
                      value={valor as string}
                      onChange={(e) =>
                        (alterar as Dispatch<SetStateAction<string>>)(
                          e.target.value
                        )
                      }
                      placeholder="#1f3d36"
                      className="w-full rounded-xl border p-3"
                    />
                  </div>
                </label>
              ))}

              <div>
                <label className="mb-2 block font-medium">
                  Tipo de fundo
                </label>

                <select
                  className="w-full rounded-xl border bg-white p-3"
                  value={tipoFundo}
                  onChange={(e) => setTipoFundo(e.target.value as TipoFundo)}
                >
                  <option value="solida">
                    Cor sólida
                  </option>

                  <option value="gradiente">
                    Gradiente
                  </option>
                </select>
              </div>
            </div>

            {tipoFundo === "gradiente" && (
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  ["Cor inicial", gradienteInicio, setGradienteInicio],
                  ["Cor final", gradienteFim, setGradienteFim],
                ].map(([label, valor, alterar]) => (
                  <label key={label as string} className="block">
                    <span className="mb-2 block font-medium">
                      {label as string}
                    </span>

                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={(valor as string) || "#ffffff"}
                        onChange={(e) =>
                          (alterar as Dispatch<SetStateAction<string>>)(
                            e.target.value
                          )
                        }
                        className="h-12 w-14 rounded-xl border bg-white p-1"
                      />

                      <input
                        value={valor as string}
                        onChange={(e) =>
                          (alterar as Dispatch<SetStateAction<string>>)(
                            e.target.value
                          )
                        }
                        placeholder="#ffffff"
                        className="w-full rounded-xl border p-3"
                      />
                    </div>
                  </label>
                ))}

                <div>
                  <label className="mb-2 block font-medium">
                    Direção
                  </label>

                  <select
                    className="w-full rounded-xl border bg-white p-3"
                    value={gradienteDirecao}
                    onChange={(e) =>
                      setGradienteDirecao(e.target.value as DirecaoGradiente)
                    }
                  >
                    <option value="horizontal">
                      Horizontal
                    </option>

                    <option value="vertical">
                      Vertical
                    </option>

                    <option value="diagonal">
                      Diagonal
                    </option>
                  </select>
                </div>
              </div>
            )}

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
                    "Deseja restaurar o tema padrão definido pela Mikatech?"
                  );

                  if (confirmado) {
                    aplicarAparencia(aparenciaPadraoMikatech);
                  }
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
              >
                Restaurar padrão da empresa
              </button>

              <button
                type="button"
                onClick={() => aplicarAparencia(aparenciaSalva)}
                className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700"
              >
                Cancelar alterações
              </button>

              <Button
                variant="primary"
                size="lg"
                onClick={salvar}
                className={
                  possuiAlteracoesAparencia
                    ? "shadow-lg ring-4 ring-green-100"
                    : "opacity-80"
                }
              >
                Salvar
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

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={salvar}
        >
          Salvar alterações
        </Button>
      </div>

      {onExcluir && (
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
    </div>
  );
}
