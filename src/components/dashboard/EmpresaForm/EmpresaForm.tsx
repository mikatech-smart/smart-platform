import { useEffect, useState } from "react";

import {
  buscarEmpresaPorSlug,
  atualizarEmpresa,
} from "../../../services/empresa/empresa.service";

export default function EmpresaForm() {
  const [empresaId, setEmpresaId] = useState("");

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    async function carregarEmpresa() {
      const { data } = await buscarEmpresaPorSlug("mikatech");

      if (!data) return;

      setEmpresaId(data.id);
      setNome(data.nome || "");
      setCategoria(data.categoria || "");
      setTelefone(data.telefone || "");
      setWhatsapp(data.whatsapp || "");
      setEmail(data.email || "");
      setDescricao(data.descricao || "");
    }

    carregarEmpresa();
  }, []);

  async function salvar() {
    const { error } = await atualizarEmpresa(empresaId, {
      nome,
      categoria,
      telefone,
      whatsapp,
      email,
      descricao,
    });

    if (error) {
      alert("Erro ao salvar.");
      console.error(error);
      return;
    }

    alert("Dados salvos com sucesso!");
  }

  return (
    <div className="bg-white rounded-2xl shadow p-8 mt-8">

      <h2 className="text-2xl font-bold mb-8">
        Dados da empresa
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-2 font-medium">
            Nome
          </label>

          <input
            className="w-full border rounded-xl p-3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Categoria
          </label>

          <input
            className="w-full border rounded-xl p-3"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Telefone
          </label>

          <input
            className="w-full border rounded-xl p-3"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            WhatsApp
          </label>

          <input
            className="w-full border rounded-xl p-3"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            className="w-full border rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 font-medium">
            Descrição
          </label>

          <textarea
            className="w-full border rounded-xl p-3 h-32"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

      </div>

      <button
        onClick={salvar}
        className="mt-8 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition"
      >
        Salvar alterações
      </button>

    </div>
  );
}