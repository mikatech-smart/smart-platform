# Sprint 227.1 — Núcleo ERP/PDV

## Regra permanente

Nenhuma operação empresarial existe na superfície do Painel Master. O Master administra a conta, os recursos contratados e os vínculos; o ERP opera.

## Extração realizada

- A aba `erpPdv` deixou de ser exibida pelo `EmpresaForm` no escopo administrativo.
- A gestão administrativa de usuários ERP foi extraída para `EmpresaUsuariosAdministrativos`.
- O Master mantém apenas listagem, perfil, ativação e bloqueio do vínculo ERP.
- O PDV foi conectado a `/empresa/:slug/pdv` com autenticação ERP e permissão `venda.criar`.
- A implementação operacional existente em `PublicPdvPage` e `erpPdv.service` foi reutilizada sem alteração de regras ou dados.

## Pendências explícitas

| Área | Situação | Próximo passo |
|---|---|---|
| Caixa | Continua integrado à operação do PDV | Extrair tela própria quando houver superfície funcional independente |
| Estoque | Produtos e movimentações já possuem rotas ERP | Adicionar menu dedicado após validar a página de estoque |
| Impressão | Não há rota independente versionada | Criar integração no ERP em sprint específica |
| Compras, equipe e CRM | Componentes locais não pertencem à base publicada | Auditar e conectar sem incluir arquivos não aprovados |

## Segurança

Nenhuma migration, RLS, usuário, DNS ou regra de autenticação foi alterada. A rota do PDV exige vínculo empresarial, usuário ativo e permissão. O SUPER_ADMIN não recebe empresa nem acesso empresarial.
