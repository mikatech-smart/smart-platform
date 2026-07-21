# Sprint 227.0B — Separação Estrutural

## Regra

O Painel Master administra conta, contrato, plano, recursos e vínculos. O ERP administra a operação e as configurações da empresa. As páginas públicas continuam públicas e são configuradas pelo ERP.

## Implementado

- `EmpresaForm` passou a aceitar escopo explícito `admin` ou `erp`.
- O escopo administrativo expõe informações, plano/recursos e a área legada `erpPdv` de usuários, que ainda precisa ser subdividida.
- O escopo ERP expõe as configurações empresariais e os canais públicos sem alterar os contratos de dados.
- O ERP recebeu as rotas protegidas `/empresa/:slug/movimentacoes`, `/configuracoes` e `/canais`.
- Produtos e categorias permanecem conectados às rotas ERP existentes.
- Todas as novas rotas usam autenticação empresarial e permissões existentes.

## Pendências explícitas

| Funcionalidade | Motivo | Próximo passo |
|---|---|---|
| `erpPdv` | Mistura usuários administrativos com operação de PDV, caixa e estoque | Extrair a gestão de usuários antes de remover a aba do Master |
| Clientes e fornecedores | Componentes atuais existem apenas no working tree local, não no commit de produção | Auditar e versionar em sprint própria ou etapa controlada |
| Compras e entradas | Componentes locais não estão presentes na base publicada | Conectar após auditoria dos arquivos e serviços |
| Colaboradores e usuários | Há duplicidade entre telas de usuário e colaborador | Definir fronteira sem alterar schemas |
| CRM | A aba atual é estrutural/placeholder | Não inventar módulo; migrar quando houver implementação funcional |
| PDV e caixa | Permanecem concentrados em `PublicPdvPage` | Criar entrada ERP dedicada sem duplicar a operação |

## Segurança

Nenhuma migration, RLS, usuário, DNS ou regra de autenticação foi alterada. As rotas ERP continuam protegidas por vínculo empresarial, empresa ativa e permissões. O slug não substitui os guards.

## Regra futura

Nenhum novo módulo operacional deve ser adicionado ao `EmpresaForm`. A redução adicional deve ocorrer somente após cada rota equivalente estar validada.
