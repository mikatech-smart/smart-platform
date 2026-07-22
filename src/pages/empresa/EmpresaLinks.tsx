import { Copy, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { getEmpresaRoutes } from "../../navigation/empresaRoutes";

export default function EmpresaLinks() {
  const { slug = "" } = useParams(); const [copied, setCopied] = useState(""); const links = getEmpresaRoutes(slug).filter((route) => ["pdv", "caixa", "estoque"].includes(route.key));
  async function copy(key: string, path: string) { await navigator.clipboard.writeText(`${window.location.origin}${path}`); setCopied(key); window.setTimeout(() => setCopied(""), 1600); }
  return <section className="space-y-6"><div><span className="empresa-kicker">ERP da empresa</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Links</h2><p className="mt-1 text-slate-500">Central de acesso aos módulos oficiais do ERP.</p></div><div className="grid gap-4 md:grid-cols-2">{links.map((link) => <article key={link.key} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><link.icon size={20} className="text-emerald-700" /><h3 className="font-bold">{link.label}</h3><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Ativo</span></div><p className="mt-3 break-all text-sm text-slate-500">{link.to}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => void copy(link.key, link.to)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"><Copy size={16} />{copied === link.key ? "Copiado" : "Copiar"}</button><Link to={link.to} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"><ExternalLink size={16} />Abrir</Link></div></article>)}</div></section>;
}
