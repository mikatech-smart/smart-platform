import { useEffect, useState } from "react";

import {
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../../../services/empresa/empresa.service";

import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import UploadImagem from "../UploadImagem";
import QRCodeEmpresa from "../QRCodeEmpresa/QRCodeEmpresa";

export default function EmpresaForm() {
  const [empresaId, setEmpresaId] = useState("");
  const [slug, setSlug] = useState("");

  const [nome, setNome] = useState("");
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
  const [horarioAtendimento, setHorarioAtendimento] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  const [pix, setPix] = useState("");
  const [pixNome, setPixNome] = useState("");
  const [pixChave, setPixChave] = useState("");

  const [wifiNome, setWifiNome] = useState("");
  const [wifiSenha, setWifiSenha] = useState("");

  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    async function carregarEmpresa() {
      const { data } = await buscarEmpresaPorSlug("mikatech");

      if (!data) return;

      setEmpresaId(data.id);
      setSlug(data.slug || "");

      setNome(data.nome || "");
      setCategoria(data.categoria || "");
      setDescricao(data.descricao || "");

      setTelefone(data.telefone || "");
      setWhatsapp(data.whatsapp || "");
      setEmail(data.email || "");

      setSite(data.site || "");
      setInstagram(data.instagram || "");
      setTiktok(data.tiktok || "");
      setYoutube(data.youtube || "");
      setKwai(data.kwai || "");
      setFacebook(data.facebook || "");
      setEndereco(data.endereco || "");
      setHorarioAtendimento(data.horario_atendimento || "");
      setGoogleReviewUrl(data.google_review_url || "");

      setPix(data.pix || "");
      setPixNome(data.pix_nome || "");
      setPixChave(data.pix_chave || "");

      setWifiNome(data.wifi_nome || "");
      setWifiSenha(data.wifi_senha || "");

      setLogo(data.logo || "");
      setBanner(data.banner || "");
    }

    carregarEmpresa();
  }, []);

  async function salvar() {
    const { error } = await atualizarEmpresa(empresaId, {
      nome,
      categoria,
      descricao,

      telefone,
      whatsapp,
      email,

      site,
      instagram,
      tiktok,
      youtube,
      kwai,
      facebook,
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
    });

    if (error) {
      alert("Erro ao salvar.");
      console.error(error);
      return;
    }

    alert("Dados salvos com sucesso!");
  }

  async function salvarLogo(url: string) {
    setLogo(url);

    if (!empresaId) return;

    const { error } = await atualizarEmpresa(empresaId, {
      logo: url,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `codigo ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar logo no Supabase:", error);

      alert(`Erro ao salvar logo no Supabase: ${mensagemErro}`);
    }
  }

  async function salvarBanner(url: string) {
    setBanner(url);

    if (!empresaId) return;

    const { error } = await atualizarEmpresa(empresaId, {
      banner: url,
    });

    if (error) {
      const mensagemErro = [
        error.message,
        error.code ? `codigo ${error.code}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      console.error("Erro ao salvar banner no Supabase:", error);

      alert(`Erro ao salvar banner no Supabase: ${mensagemErro}`);
    }
  }

  return (
    <div className="space-y-8">
      <Card
        title="Identidade da Empresa"
        subtitle="Dados principais exibidos no painel e na pagina publica."
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Input
            label="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />

          <div className="md:col-span-2">
            <label className="block mb-2 font-medium">
              Descricao
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-36"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte em poucas palavras o que sua empresa oferece."
            />
          </div>
        </div>
      </Card>

      <Card
        title="Identidade Visual"
        subtitle="Configure a logo e o banner que aparecem na pagina publica."
      >
        <div className="grid md:grid-cols-2 gap-8">
          <UploadImagem
            titulo="Logo"
            imagem={logo}
            pasta={`${empresaId || "mikatech"}/logo`}
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

      <Card
        title="Contato"
        subtitle="Canais utilizados pelos clientes para falar com a empresa."
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <Input
            label="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
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

      <Card
        title="Endereco"
        subtitle="Localizacao e horario de atendimento exibidos para o cliente."
      >
        <div className="grid gap-6">
          <Input
            label="Endereco atual"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <div>
            <label className="block mb-2 font-medium">
              Horario de Atendimento
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-28"
              value={horarioAtendimento}
              onChange={(e) => setHorarioAtendimento(e.target.value)}
              placeholder={"Segunda a Sexta\n08:00 as 18:00"}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Conectividade"
        subtitle="Dados rapidos para Wi-Fi, PIX e avaliacoes no Google."
      >
        <div className="grid md:grid-cols-2 gap-6">
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
            label="Link para Avaliacao Google"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
          />
        </div>
      </Card>

      <Card
        title="Redes Sociais"
        subtitle="Perfis sociais usados para relacionamento e divulgacao."
      >
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />

          <Input
            label="TikTok"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
          />

          <Input
            label="YouTube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
          />

          <Input
            label="Kwai"
            value={kwai}
            onChange={(e) => setKwai(e.target.value)}
          />

          <Input
            label="Facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Vitrine Digital sera preparada em uma sprint futura.
          </div>
        </div>
      </Card>

      {slug && (
        <QRCodeEmpresa
          slug={slug}
          nomeEmpresa={nome}
        />
      )}

      {!slug && (
        <Card
          title="Compartilhamento"
          subtitle="O link publico sera exibido assim que a empresa carregar."
        >
          <p className="text-slate-500">
            Carregando informacoes da pagina publica.
          </p>
        </Card>
      )}

      <Card
        title="Proximas melhorias"
        subtitle="Estrutura preparada para a evolucao do painel do cliente."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-600">
          <span className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            Busca por CEP
          </span>

          <span className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            Personalizacao de cores
          </span>

          <span className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            Temas e skins
          </span>

          <span className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            Pre-visualizacao
          </span>

          <span className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            Painel do Cliente
          </span>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={salvar}
        >
          Salvar alteracoes
        </Button>
      </div>
    </div>
  );
}
