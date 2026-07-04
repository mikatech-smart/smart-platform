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

      console.error(
        "Erro ao salvar logo no Supabase:",
        error
      );

      alert(
        `Erro ao salvar logo no Supabase: ${mensagemErro}`
      );
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

      console.error(
        "Erro ao salvar banner no Supabase:",
        error
      );

      alert(
        `Erro ao salvar banner no Supabase: ${mensagemErro}`
      );
    }
  }

  return (
    <div className="space-y-8">

      <Card
        title="Identidade Visual"
        subtitle="Logo e Banner"
      >

        <div className="grid md:grid-cols-2 gap-8">

          <div>

            <UploadImagem
              titulo="Logo"
              imagem={logo}
              pasta={`${empresaId || "mikatech"}/logo`}
              onUpload={salvarLogo}
            />

          </div>

          <div>

            <UploadImagem
              titulo="Banner"
              imagem={banner}
              pasta={empresaId ? `${empresaId}/banner` : undefined}
              onUpload={salvarBanner}
            />

          </div>

        </div>

      </Card>

      {slug && (
        <QRCodeEmpresa
          slug={slug}
          nomeEmpresa={nome}
        />
      )}

      <Card
        title="Identidade"
      >

        <div className="grid md:grid-cols-2 gap-6">

          <Input
            label="Nome"
            value={nome}
            onChange={(e)=>setNome(e.target.value)}
          />

          <Input
            label="Categoria"
            value={categoria}
            onChange={(e)=>setCategoria(e.target.value)}
          />

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium">
              Descrição
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-36"
              value={descricao}
              onChange={(e)=>setDescricao(e.target.value)}
            />

          </div>

        </div>

      </Card>

      <Card title="Contato">

        <div className="grid md:grid-cols-2 gap-6">

          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e)=>setWhatsapp(e.target.value)}
          />

          <Input
            label="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <Input
            label="Site"
            value={site}
            onChange={(e)=>setSite(e.target.value)}
          />

        </div>

      </Card>

      <Card title="Redes Sociais">

        <div className="grid md:grid-cols-2 gap-6">

          <Input
            label="Instagram"
            value={instagram}
            onChange={(e)=>setInstagram(e.target.value)}
          />

        </div>

      </Card>

      <Card title="Localização">

        <div className="grid gap-6">

          <Input
            label="Endereço"
            value={endereco}
            onChange={(e)=>setEndereco(e.target.value)}
          />

          <div>

            <label className="block mb-2 font-medium">
              Horario de Atendimento
            </label>

            <textarea
              className="w-full border rounded-xl p-3 h-28"
              value={horarioAtendimento}
              onChange={(e)=>setHorarioAtendimento(e.target.value)}
              placeholder={"Segunda a Sexta\n08:00 as 18:00"}
            />

          </div>

        </div>

      </Card>

      <Card title="Google">

        <div className="grid gap-6">

          <Input
            label="Link para Avaliacao Google"
            value={googleReviewUrl}
            onChange={(e)=>setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
          />

        </div>

      </Card>

      <Card title="Conectividade">

        <div className="grid md:grid-cols-2 gap-6">

          <Input
            label="Wi-Fi"
            value={wifiNome}
            onChange={(e)=>setWifiNome(e.target.value)}
          />

          <Input
            label="Senha Wi-Fi"
            value={wifiSenha}
            onChange={(e)=>setWifiSenha(e.target.value)}
          />

          <div className="md:col-span-2">

            <Input
              label="PIX"
              value={pix}
              onChange={(e)=>setPix(e.target.value)}
            />

          </div>

        </div>

      </Card>

      <div className="flex justify-end">

        <Button
          variant="primary"
          size="lg"
          onClick={salvar}
        >
          Salvar alterações
        </Button>

      </div>

    </div>
  );
}
// teste
