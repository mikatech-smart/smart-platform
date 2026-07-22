import { Copy, ExternalLink, Link2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function EmpresaLinks() {
  const { slug = "" } = useParams(); const [copied, setCopied] = useState(""); const base = `${window.location.origin}/empresa/${slug}`;
  const links = [{ id: "erp", name: "ERP", url: base }, { id: "pdv", name: "PDV", url: `${base}/pdv` }, { id: "caixa", name: "Caixa", url: `${base}/caixa` }, { id: "estoque", name: "Estoque", url: `${base}/movimentacoes` }];
  async function copy(id: string, url: string) { await navigator.clipboard.writeText(url); setCopied(id); window.setTimeout(() => setCopied(""), 1600); }
  return <section className="space-y-6"><div><span className="empresa-kicker">ERP da empresa</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Links</h2><p className="mt-1 text-slate-500">Central de acesso aos módulos da empresa.</p></div><div className="grid gap-4 md:grid-cols-2">{links.map((link) => <article key={link.id} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Link2 size={20} className="text-emerald-700" /><h3 className="font-bold">{link.name}</h3><span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Ativo</span></div><p className="mt-3 break-all text-sm text-slate-500">{link.url}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => void copy(link.id, link.url)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"><Copy size={16} />{copied === link.id ? "Copiado" : "Copiar"}</button><a href={link.url} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"><ExternalLink size={16} />Abrir</a></div></article>)}</div></section>;
}
