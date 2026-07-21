import { useCallback, useEffect, useState } from "react";

import {
  listarErpPdvUsuarios,
  salvarErpPdvUsuario,
  type ErpPdvUsuario,
} from "../../services/erpPdv/erpPdv.service";

export default function EmpresaUsuariosAdministrativos({ empresaId }: { empresaId: string }) {
  const [usuarios, setUsuarios] = useState<ErpPdvUsuario[]>([]);
  const [erro, setErro] = useState("");
  const [salvandoId, setSalvandoId] = useState("");

  const carregar = useCallback(async () => {
    const resultado = await listarErpPdvUsuarios(empresaId);
    setUsuarios(resultado.data || []);
    setErro(resultado.error?.message || "");
  }, [empresaId]);

  useEffect(() => {
    // The list is synchronized with the selected company when the admin opens the editor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, [carregar]);

  async function alternarAtivo(usuario: ErpPdvUsuario) {
    setSalvandoId(usuario.id);
    const resultado = await salvarErpPdvUsuario({
      id: usuario.id,
      empresaId: usuario.empresa_id,
      nome: usuario.nome,
      nomeExibicao: usuario.nome_exibicao,
      email: usuario.email,
      telefone: usuario.telefone,
      perfil: usuario.perfil,
      funcoes: usuario.funcoes,
      moduloInicial: usuario.modulo_inicial,
      permissoes: usuario.permissoes,
      ativo: !usuario.ativo,
    });
    setErro(resultado.error?.message || "");
    if (!resultado.error) await carregar();
    setSalvandoId("");
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Usuários ERP</h3>
        <p className="text-sm text-slate-500">Vínculo, perfil e status de acesso da empresa.</p>
      </div>
      {erro && <p className="mb-3 text-sm font-semibold text-red-700">{erro}</p>}
      <div className="grid gap-2">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <div>
              <strong className="block text-slate-900">{usuario.nome_exibicao || usuario.nome}</strong>
              <span className="text-xs text-slate-500">{usuario.email || "Sem e-mail"} · {usuario.perfil}</span>
            </div>
            <button
              type="button"
              onClick={() => void alternarAtivo(usuario)}
              disabled={salvandoId === usuario.id}
              className={usuario.ativo ? "rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700" : "rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700"}
            >
              {salvandoId === usuario.id ? "Salvando..." : usuario.ativo ? "Bloquear" : "Ativar"}
            </button>
          </div>
        ))}
        {!usuarios.length && <p className="text-sm text-slate-500">Nenhum usuário ERP vinculado.</p>}
      </div>
    </section>
  );
}
