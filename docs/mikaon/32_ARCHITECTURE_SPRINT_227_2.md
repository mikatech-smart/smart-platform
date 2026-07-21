# Sprint 227.2 — Módulos Operacionais do ERP

## Regra arquitetural

O Painel Master administra a plataforma. O ERP administra a empresa. Toda
operação empresarial deve ocorrer exclusivamente dentro do ERP.

## Auditoria e resultado

| Módulo | Rota | Status | Dependências | Resultado |
| --- | --- | --- | --- | --- |
| PDV | `/empresa/:slug/pdv` | Consolidado | `PublicPdvPage`, serviços ERP/PDV | Acessível somente pelo ERP. |
| Caixa | Integrado ao `/empresa/:slug/pdv` | Pendente | Fluxo de caixa dentro do PDV | A extração para rota própria foi preservada como pendência para evitar alteração de regras operacionais. |
| Estoque | `/empresa/:slug/movimentacoes` | Consolidado | `EmpresaMovimentacoes`, serviços ERP/PDV | Rota e item de menu próprios, sem recálculo de saldo. |
| Produtos | `/empresa/:slug/produtos` | Consolidado | `EmpresaProdutos` | Rota ERP existente. |
| Categorias | `/empresa/:slug/categorias` | Consolidado | `EmpresaCategorias` | Rota ERP existente. |
| Impressoras | `/empresa/:slug/impressoras` | Estrutura preparada | Componente ERP dedicado | Rota e menu criados; engine de impressão não foi criada. |
| Configurações operacionais | `/empresa/:slug/configuracoes` | Consolidado | `EmpresaConfiguracoes`, `EmpresaForm` em escopo ERP | Mantidas no ERP. |
| Canais públicos | `/empresa/:slug/canais` | Consolidado | `EmpresaCanais` | Mantidos no ERP. |
| Compras, clientes, fornecedores e colaboradores | Sem rota versionada na base publicada | Pendente | Não há implementação independente auditada | Nenhum arquivo local não rastreado foi incorporado. |
| Usuários operacionais | Sem rota operacional dedicada | Pendente | Administração de usuários ERP permanece no Painel Master | A operação de perfis operacionais não foi inventada nesta sprint. |
| CRM | Sem rota versionada na base publicada | Pendente | Não identificado na base publicada | Fora da consolidação atual. |

## Painel Master

O formulário administrativo expõe somente informações da empresa e plano. O
bloco operacional `erpPdv` não é exibido no escopo administrativo; usuários ERP
administrativos continuam sendo tratados separadamente.

## Segurança e dados

Não foram criadas migrations nem alterados dados, RLS, autenticação ou guards.
As rotas continuam protegidas por autenticação empresarial e permissões. O
`SUPER_ADMIN` permanece sem vínculo empresarial.

## Pendências

1. Extrair o Caixa para uma rota própria após separar o fluxo de operação do
   componente de PDV com testes de abertura, fechamento, sangria e suprimento.
2. Implementar a integração real de impressoras, modelos, cupons e etiquetas.
3. Criar ou conectar rotas ERP para Compras, Clientes, Fornecedores,
   Colaboradores, Usuários Operacionais e CRM.

Essas pendências não foram mascaradas por telas que simulassem operação.
