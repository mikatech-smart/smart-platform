# Auditoria das migrations do Supabase

Data da auditoria: 2026-07-19.

## Sprint 221 - consolidacao

A cadeia versionada agora possui uma migration-base com timestamp
`20260701000000`, anterior a primeira migration que altera ou referencia
`public.empresas`. A ordem lexicografica foi verificada e nao foi necessario
renomear migrations existentes.

Nenhuma migration antiga foi apagada, combinada ou editada nesta sprint. As
duplicidades de clientes e fornecedores permanecem documentadas para uma
decisao posterior, pois o `if not exists` pode ocultar diferencas de schema.

O principal bloqueio para uma execucao do zero continua sendo a necessidade de
validar a base de `empresas` contra o catalogo administrativo remoto antes de
aplicar a migration. O arquivo preparado e uma proposta local, nao uma prova
de equivalencia com producao.

## Escopo e limitacoes

Esta auditoria foi feita sem aplicar SQL remoto. A API REST publica permite
consultar registros, mas nao expone o catalogo completo de colunas, policies,
triggers e constraints. A chave secreta necessaria para metadados do catalogo
nao esta disponivel no projeto e nao deve ser colocada no frontend.

Confirmado anteriormente por leitura: `public.empresas` existe no projeto
remoto. A quantidade de registros e o catalogo completo precisam ser
confirmados por um acesso administrativo seguro ou pelo dashboard do projeto.

## Migration-base preparada

Arquivo: `supabase/migrations/20260701000000_create_empresas_base.sql`.

A migration cria somente a base inferida pelo codigo atual e pelos payloads de
criacao de empresa: UUID, vinculo opcional com Auth, identificacao, contato,
branding, plano, recursos, status e timestamps. As migrations posteriores
continuam responsaveis por campos comerciais, Wi-Fi/PIX adicionais, landing
page e configuracoes de modulos.

Ela nao insere dados, nao cria policies e nao altera o banco remoto. Antes de
aplicar, e obrigatorio comparar a lista de colunas, tipos e constraints com o
schema real. A constraint de `slug` tambem deve ser confirmada contra o banco
remoto antes de qualquer aplicacao.

## Ordem das 24 migrations

1. `20260701000000_create_empresas_base.sql` - base de empresas preparada nesta sprint.
2. `20260704100000_add_commercial_fields_to_empresas.sql` - campos comerciais.
3. `20260704110000_add_wifi_pix_fields_to_empresas.sql` - Wi-Fi e PIX adicionais.
4. `20260709100000_add_landing_page_config_to_empresas.sql` - landing page.
5. `20260711143000_add_module_configs_to_empresas.sql` - configuracoes de modulos.
6. `20260711170000_allow_delete_empresas_storage_objects.sql` - policy do Storage.
7. `20260711180000_create_erp_pdv_base.sql` - categorias, produtos, estoque, movimentacoes, caixas, vendas e itens.
8. `20260711190000_add_erp_pdv_product_details.sql` - detalhes de produtos.
9. `20260711200000_add_erp_pdv_stock_movements_details.sql` - detalhes de estoque.
10. `20260711210000_add_erp_pdv_venda_operador.sql` - operador e indice de vendas.
11. `20260711220000_add_erp_pdv_config_to_empresas.sql` - configuracao ERP/PDV.
12. `20260711230000_add_erp_pdv_cash_operations.sql` - movimentacoes de caixa.
13. `20260711234000_add_erp_pdv_sale_customers.sql` - clientes ligados a vendas.
14. `20260711235000_add_erp_pdv_product_price_tables.sql` - tabelas de preco.
15. `20260711241000_add_erp_pdv_purchases_suppliers.sql` - fornecedores, entradas e itens.
16. `20260711242000_add_erp_pdv_nfe_xml_import.sql` - campos fiscais/XML.
17. `20260711243000_add_erp_pdv_returns_exchange_vouchers.sql` - devolucoes e vales.
18. `20260711244000_add_erp_pdv_users_permissions.sql` - usuarios e referencias de operador.
19. `20260714190000_add_erp_pdv_colaborador_functions.sql` - funcoes de colaboradores.
20. `20260718120000_add_company_collaborators_and_user_links.sql` - colaboradores e vinculo logico.
21. `20260718121000_add_erp_pdv_auth_user_link.sql` - vinculo opcional com `auth.users`.
22. `20260718143000_add_erp_pdv_clientes.sql` - segunda definicao de clientes.
23. `20260718150000_add_erp_pdv_fornecedores.sql` - segunda definicao de fornecedores.
24. `20260718200000_add_erp_pdv_advanced_product_fields.sql` - campos avancados de produtos.

## Inventario por migration

| Timestamp | Objetivo | Criadas | Alteradas | Dependencias |
|---|---|---|---|---|
| 20260701000000 | Base de empresas | `empresas` | - | `auth.users` do ambiente Supabase |
| 20260704100000 | Campos comerciais | - | `empresas` | `empresas` |
| 20260704110000 | Wi-Fi e PIX | - | `empresas` | `empresas` |
| 20260709100000 | Configuracao da landing page | - | `empresas` | `empresas` |
| 20260711143000 | Configuracoes de modulos | - | `empresas` | `empresas` |
| 20260711170000 | Exclusao de objetos do Storage | - | policy do Storage | bucket `empresas` |
| 20260711180000 | Base ERP/PDV | categorias, produtos, estoques, movimentacoes, caixas, vendas, itens | RLS e policies dessas tabelas; `empresas` | `empresas` |
| 20260711190000 | Detalhes de produtos | - | `erp_pdv_produtos` | ERP base |
| 20260711200000 | Detalhes de estoque | - | estoques, movimentacoes | ERP base |
| 20260711210000 | Operador da venda | - | vendas | ERP base |
| 20260711220000 | Configuracao ERP/PDV | - | `empresas` | `empresas` |
| 20260711230000 | Operacoes de caixa | `erp_pdv_caixa_movimentacoes` | caixas e RLS | ERP base |
| 20260711234000 | Cliente de venda | `erp_pdv_clientes` | vendas, indices, RLS | ERP base |
| 20260711235000 | Tabelas de preco | - | produtos | ERP base |
| 20260711241000 | Compras e fornecedores | fornecedores, entradas, itens | estoques, RLS | ERP base |
| 20260711242000 | Importacao fiscal XML | - | entradas e itens | compras |
| 20260711243000 | Devolucoes e vales | vales, devolucoes, itens, movimentacoes de vale | vendas e itens; RLS | ERP base e clientes |
| 20260711244000 | Usuarios operacionais | `erp_pdv_usuarios` | vendas, caixas, movimentacoes, devolucoes; RLS | ERP base e `empresas` |
| 20260714190000 | Funcoes de colaboradores | - | usuarios | usuarios |
| 20260718120000 | Colaboradores e vinculos | `erp_pdv_colaboradores` | usuarios | empresas e usuarios |
| 20260718121000 | Vinculo Auth | - | usuarios | `auth.users`, usuarios |
| 20260718143000 | Estrutura avancada de clientes | `erp_pdv_clientes` se ausente | indices | migration de clientes anterior |
| 20260718150000 | Estrutura avancada de fornecedores | `erp_pdv_fornecedores` se ausente | indices | migration de compras anterior |
| 20260718200000 | Campos avancados de produtos | - | produtos | produtos e fornecedores |

## Validacao da ordem

A ordem cronologica resolve a dependencia oculta de `empresas`. As demais
dependencias observaveis estao em ordem: produtos/estoque antes de detalhes,
ERP base antes de vendas/caixa, compras antes de XML e usuarios depois das
tabelas operacionais.

Dependencias externas que nao sao criadas por esta cadeia:

- `auth.users`, `gen_random_uuid()` e o schema interno do Supabase Auth;
- tabela e configuracao do Storage/bucket `empresas`;
- qualquer migration que tenha criado originalmente `public.empresas` antes
  deste repositorio;
- triggers ou funcoes de `updated_at`, pois a cadeia nao cria um mecanismo
  global para atualiza-lo automaticamente.

As migrations de clientes e fornecedores sao executaveis apenas por causa do
`if not exists`, mas isso nao valida compatibilidade de colunas ou constraints.
Elas sao riscos de reproducibilidade e devem ser tratadas antes do primeiro
reset local.

## Mapa de dependencias real

O fluxo nao e uma cadeia linear simples:

```text
empresas
  |-- ERP base -- produtos -- estoque -- movimentacoes
  |            |          \-- vendas -- itens
  |            \-- caixas -- movimentacoes de caixa
  |-- usuarios -- operadores de vendas/caixa/movimentacoes
  |-- clientes -- vendas
  |-- fornecedores -- entradas -- itens de entrada -- estoque
  |-- colaboradores -- usuarios
  \-- auth.users -- auth_user_id em usuarios
```

Clientes, fornecedores e compras sao modulos paralelos ao cadastro de
produtos; financeiro nao possui migration nesta cadeia. Portanto, a sequencia
solicitada conceitualmente como `empresas -> usuarios -> produtos -> ...`
nao representa a ordem SQL real: usuarios depende de parte do ERP operacional.

## Padronizacao e inconsistencias

- IDs usam UUID, normalmente com `gen_random_uuid()`.
- Timestamps usam `timestamptz` e defaults `now()` nas tabelas novas.
- `created_at` e `updated_at` existem em varias tabelas, mas nao ha trigger
  global confirmada para atualizar `updated_at`.
- Nomes de indices sao em geral `tabela_empresa_campo_idx`, mas variam entre
  `*_empresa_*_idx`, `*_unique_idx` e nomes longos descritivos.
- Algumas constraints sao anonimas ou criadas por blocos DO; outras recebem
  nomes explicitos. A nomenclatura nao e uniforme.
- Clientes/fornecedores possuem colunas e indices normalizados diferentes
  entre migrations antigas e posteriores.
- As migrations novas de colaboradores/Auth evitam policies abertas, mas as
  migrations operacionais antigas ainda possuem policies permissivas.

## Resultado da validacao de seguranca

Nao foram encontrados `DROP TABLE`, `DELETE FROM` ou `TRUNCATE` nas 24
migrations. `USING (true)` e `WITH CHECK (true)` continuam presentes nas
migrations operacionais listadas na secao de policies abertas; nao aparecem
nas migrations de colaboradores/Auth nem na migration-base.

As migrations 22 e 23 estao em ordem posterior, mas duplicam tabelas criadas
nas migrations 13 e 15. O `if not exists` evita a criacao repetida, mas nao
garante que as duas estruturas sejam equivalentes.

## Dependencias e pontos de falha

- As migrations de `empresas` antigas usam `alter table public.empresas` e
  falham sem a base agora preparada.
- O ERP base depende de `empresas` e cria as tabelas operacionais.
- Detalhes, vendas, caixa, clientes, compras e devolucoes dependem do ERP base.
- Usuarios depende de vendas, caixas, movimentacoes e `empresas`.
- Colaboradores depende de `empresas` e usuarios.
- Auth link depende de `erp_pdv_usuarios` e do schema `auth` fornecido pelo
  Supabase.
- Campos avancados dependem de produtos e fornecedores.

## Duplicidades de clientes e fornecedores

`20260711234000_add_erp_pdv_sale_customers.sql` cria `erp_pdv_clientes` com
`nome`, `cpf_cnpj`, `telefone`, `whatsapp`, `email`, `endereco`,
`observacoes`, `ativo` e timestamps, alem de vincular vendas.

`20260718143000_add_erp_pdv_clientes.sql` cria a mesma tabela com estrutura
mais ampla e indices separados para CPF e CNPJ. Parece uma evolucao posterior,
mas nao e uma migration incremental: usa `create table if not exists` e pode
deixar colunas da primeira versao ausentes.

`20260711241000_add_erp_pdv_purchases_suppliers.sql` cria
`erp_pdv_fornecedores` para compras e tambem entradas/itens.

`20260718150000_add_erp_pdv_fornecedores.sql` cria novamente
`erp_pdv_fornecedores` com PF/PJ, endereco e indices normalizados. Parece uma
estrutura posterior/complementar, mas tambem nao valida a equivalencia da
estrutura anterior.

Nao foram removidas nem combinadas migrations.

## Policies abertas

Foram localizadas policies com `USING (true)` e/ou `WITH CHECK (true)` nos
seguintes pontos:

- `20260711180000_create_erp_pdv_base.sql`: categorias, produtos, estoques,
  movimentacoes, caixas, vendas e itens; acesso `anon, authenticated`, todas
  as operacoes.
- `20260711230000_add_erp_pdv_cash_operations.sql`:
  `erp_pdv_caixa_movimentacoes`, todas as operacoes.
- `20260711234000_add_erp_pdv_sale_customers.sql`:
  `erp_pdv_clientes`, todas as operacoes.
- `20260711241000_add_erp_pdv_purchases_suppliers.sql`: fornecedores,
  entradas e itens, todas as operacoes.
- `20260711243000_add_erp_pdv_returns_exchange_vouchers.sql`: vales,
  devolucoes, itens e movimentacoes de vale, todas as operacoes.
- `20260711244000_add_erp_pdv_users_permissions.sql`:
  `erp_pdv_usuarios`, todas as operacoes.

Essas policies sao inadequadas para producao multiempresa e devem ser
substituidas por policies derivadas de `auth.uid()` antes de autenticar dados
reais. A migration-base de empresas e as migrations 220B de colaboradores/Auth
nao criam policies abertas.

## ON DELETE CASCADE

As cascatas concentram-se em:

- ERP base: filhos de `empresas` em categorias, produtos, estoques,
  movimentacoes, caixas, vendas e itens; itens tambem dependem de vendas.
- Caixa: movimentacoes de caixa dependem de caixa e empresa.
- Clientes: clientes dependem de empresa; cliente em venda usa `set null`.
- Compras: fornecedores, entradas e itens dependem de empresa; itens dependem
  de entrada e produto.
- Devolucoes: vales, devolucoes, itens e movimentacoes dependem de empresa;
  devolucao e itens dependem de venda.
- Usuarios: `erp_pdv_usuarios` depende de empresa; referencias operacionais
  usam `set null`.

Risco: excluir uma empresa pode apagar historico comercial, estoque, caixas,
movimentacoes e documentos. Para dados historicos, recomenda-se bloqueio de
exclusao fisica ou processo administrativo explicito. A migration de
colaboradores usa `RESTRICT`; a de Auth usa `SET NULL` apenas para o vinculo
opcional de identidade.

## Migrations pendentes de autenticacao

Permanecem nao aplicadas no remoto:

- `20260718120000_add_company_collaborators_and_user_links.sql`
- `20260718121000_add_erp_pdv_auth_user_link.sql`

Elas dependem de `empresas`, `erp_pdv_usuarios` e, no segundo caso, de
`auth.users`. O vinculo de colaborador e composto e usa `ON DELETE RESTRICT`;
`auth_user_id` e opcional e possui indice unico parcial. Nenhuma cria policy
aberta.

## Ambiente

`.env.example` contem apenas URL/key ficticias para Supabase local. O
`.gitignore` protege `.env` e `.env.*`, mantendo `!.env.example`. Nenhuma
service role, token, senha ou URL de producao foi adicionada.

## Bloqueios e recomendacao

Ainda nao e seguro afirmar que a migration-base corresponde exatamente ao banco
remoto, pois o catalogo completo de `empresas` nao esta acessivel com a chave
publica. Antes do laboratorio local:

1. obter o schema por acesso administrativo seguro ou export estrutural;
2. comparar a base preparada e ajustar tipos/constraints;
3. instalar Docker Desktop e Supabase CLI com autorizacao explicita;
4. executar reset local e tratar as duplicidades de clientes/fornecedores;
5. substituir as policies abertas antes de qualquer uso multiempresa.

Nenhuma alteracao remota foi feita nesta sprint.

## Sprint 222 - auditoria de Foreign Keys

Inventario estatico: 51 Foreign Keys. Sao 27 `ON DELETE CASCADE`, 20
`ON DELETE SET NULL` e 4 `ON DELETE RESTRICT`. Nenhuma migration declara
`ON UPDATE`; portanto, o comportamento padrao e `NO ACTION`.

### Inventario completo

| Origem.coluna | Destino.coluna | ON DELETE | Migration | Classificacao |
|---|---|---|---|---|
| `empresas.user_id` | `auth.users.id` | SET NULL | 20260701000000 | A - seguro |
| `erp_pdv_categorias.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_produtos.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_produtos.categoria_id` | `erp_pdv_categorias.id` | SET NULL | 20260711180000 | B - revisar |
| `erp_pdv_estoques.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_estoques.produto_id` | `erp_pdv_produtos.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_movimentacoes.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_movimentacoes.produto_id` | `erp_pdv_produtos.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_caixas.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_vendas.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_vendas.caixa_id` | `erp_pdv_caixas.id` | SET NULL | 20260711180000 | B - revisar |
| `erp_pdv_venda_itens.empresa_id` | `empresas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_venda_itens.venda_id` | `erp_pdv_vendas.id` | CASCADE | 20260711180000 | C - critico |
| `erp_pdv_venda_itens.produto_id` | `erp_pdv_produtos.id` | SET NULL | 20260711180000 | B - revisar |
| `erp_pdv_caixa_movimentacoes.empresa_id` | `empresas.id` | CASCADE | 20260711230000 | C - critico |
| `erp_pdv_caixa_movimentacoes.caixa_id` | `erp_pdv_caixas.id` | CASCADE | 20260711230000 | C - critico |
| `erp_pdv_clientes.empresa_id` | `empresas.id` | CASCADE | 20260711234000 | C - critico |
| `erp_pdv_vendas.cliente_id` | `erp_pdv_clientes.id` | SET NULL | 20260711234000 | B - revisar |
| `erp_pdv_fornecedores.empresa_id` | `empresas.id` | CASCADE | 20260711241000 | C - critico |
| `erp_pdv_entradas.empresa_id` | `empresas.id` | CASCADE | 20260711241000 | C - critico |
| `erp_pdv_entradas.fornecedor_id` | `erp_pdv_fornecedores.id` | SET NULL | 20260711241000 | B - revisar |
| `erp_pdv_entrada_itens.empresa_id` | `empresas.id` | CASCADE | 20260711241000 | C - critico |
| `erp_pdv_entrada_itens.entrada_id` | `erp_pdv_entradas.id` | CASCADE | 20260711241000 | C - critico |
| `erp_pdv_entrada_itens.produto_id` | `erp_pdv_produtos.id` | CASCADE | 20260711241000 | C - critico |
| `erp_pdv_vale_trocas.empresa_id` | `empresas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_vale_trocas.venda_origem_id` | `erp_pdv_vendas.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_vale_trocas.cliente_id` | `erp_pdv_clientes.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_devolucoes.empresa_id` | `empresas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_devolucoes.venda_id` | `erp_pdv_vendas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_devolucoes.vale_troca_id` | `erp_pdv_vale_trocas.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_devolucao_itens.empresa_id` | `empresas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_devolucao_itens.devolucao_id` | `erp_pdv_devolucoes.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_devolucao_itens.venda_item_id` | `erp_pdv_venda_itens.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_devolucao_itens.produto_id` | `erp_pdv_produtos.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_vale_troca_movimentacoes.empresa_id` | `empresas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_vale_troca_movimentacoes.vale_troca_id` | `erp_pdv_vale_trocas.id` | CASCADE | 20260711243000 | C - critico |
| `erp_pdv_vale_troca_movimentacoes.vale_troca_id` | `erp_pdv_vale_trocas.id` | SET NULL | 20260711243000 | C - critico |
| `erp_pdv_vale_troca_movimentacoes.venda_id` | `erp_pdv_vendas.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_vale_troca_movimentacoes.devolucao_id` | `erp_pdv_devolucoes.id` | SET NULL | 20260711243000 | B - revisar |
| `erp_pdv_usuarios.empresa_id` | `empresas.id` | CASCADE | 20260711244000 | C - critico |
| `erp_pdv_vendas.operador_usuario_id` | `erp_pdv_usuarios.id` | SET NULL | 20260711244000 | B - revisar |
| `erp_pdv_caixas.operador_usuario_id` | `erp_pdv_usuarios.id` | SET NULL | 20260711244000 | B - revisar |
| `erp_pdv_caixa_movimentacoes.operador_usuario_id` | `erp_pdv_usuarios.id` | SET NULL | 20260711244000 | B - revisar |
| `erp_pdv_devolucoes.erp_pdv_usuario_id` | `erp_pdv_usuarios.id` | SET NULL | 20260711244000 | B - revisar |
| `erp_pdv_colaboradores.empresa_id` | `empresas.id` | RESTRICT | 20260718120000 | A - seguro |
| `erp_pdv_usuarios.(colaborador_id,empresa_id)` | `erp_pdv_colaboradores.(id,empresa_id)` | RESTRICT | 20260718120000 | A - seguro |
| `erp_pdv_usuarios.auth_user_id` | `auth.users.id` | SET NULL | 20260718121000 | A - seguro |
| `erp_pdv_clientes.empresa_id` | `empresas.id` | RESTRICT | 20260718143000 | A - seguro |
| `erp_pdv_fornecedores.empresa_id` | `empresas.id` | RESTRICT | 20260718150000 | A - seguro |
| `erp_pdv_produtos.fornecedor_principal_id` | `erp_pdv_fornecedores.id` | SET NULL | 20260718200000 | B - revisar |

### Matriz de risco e recomendacoes

| Grupo | Impacto | Recomendacao |
|---|---|---|
| Empresa -> dados operacionais em CASCADE | Pode apagar produtos, estoque, vendas, caixas, entradas, devolucoes e movimentacoes | RESTRICT por padrao; exclusao fisica de empresa somente em processo administrativo de retencao aprovado |
| Produto -> estoque, movimentacoes e itens em CASCADE | Pode apagar saldo e historico; itens de documentos podem desaparecer | Inativacao de produto e RESTRICT para historico; preservar registros por SET NULL somente quando a regra fiscal permitir |
| Venda/entrada/devolucao -> itens em CASCADE | Pode apagar documentos e seus detalhes | RESTRICT para documentos emitidos; cancelamento/inativacao logica em vez de delete |
| Caixa -> movimentacoes em CASCADE | Pode apagar fechamento e movimentacao financeira | RESTRICT apos abertura ou movimentacao; manter historico |
| `vale_troca_id` duplicado com CASCADE e SET NULL | Regras conflitantes no mesmo campo; pode falhar na criacao ou produzir comportamento imprevisivel | Remover uma das constraints em migration corretiva futura e escolher RESTRICT ou SET NULL conforme retencao |
| Referencias operacionais em SET NULL | Mantem o documento, mas perde o vinculo com operador, produto, cliente ou fornecedor | Revisar cada campo; preferir inativacao e RESTRICT quando o vinculo for auditoria obrigatoria |

### Classificacao resumida

- Seguras: 6 relacionamentos, principalmente `RESTRICT` e vinculos opcionais
  de identidade/Auth.
- Revisar: 17 relacionamentos `SET NULL`, porque podem produzir registros sem
  a referencia original.
- Criticas: 28 relacionamentos, incluindo 27 `CASCADE` e as duas constraints
  conflitantes de `vale_troca_id`.

Nenhuma migration foi modificada nesta auditoria. As recomendações acima são
plano de saneamento futuro e não foram aplicadas.

## Sprint 223 - auditoria de RLS

Auditoria estaticamente realizada nas migrations. Nenhuma policy foi criada,
alterada ou aplicada.

### Tabelas com RLS habilitado

| Tabela | Migration | Policies declaradas |
|---|---|---:|
| `erp_pdv_categorias` | 20260711180000 | 1 |
| `erp_pdv_produtos` | 20260711180000 | 1 |
| `erp_pdv_estoques` | 20260711180000 | 1 |
| `erp_pdv_movimentacoes` | 20260711180000 | 1 |
| `erp_pdv_caixas` | 20260711180000 | 1 |
| `erp_pdv_vendas` | 20260711180000 | 1 |
| `erp_pdv_venda_itens` | 20260711180000 | 1 |
| `erp_pdv_caixa_movimentacoes` | 20260711230000 | 1 |
| `erp_pdv_clientes` | 20260711234000 | 1 |
| `erp_pdv_fornecedores` | 20260711241000 | 1 |
| `erp_pdv_entradas` | 20260711241000 | 1 |
| `erp_pdv_entrada_itens` | 20260711241000 | 1 |
| `erp_pdv_devolucoes` | 20260711243000 | 1 |
| `erp_pdv_devolucao_itens` | 20260711243000 | 1 |
| `erp_pdv_vale_trocas` | 20260711243000 | 1 |
| `erp_pdv_vale_troca_movimentacoes` | 20260711243000 | 1 |
| `erp_pdv_usuarios` | 20260711244000 | 1 |
| `erp_pdv_colaboradores` | 20260718120000 | 0 |

Total: 18 tabelas com RLS declarado e 18 policies de tabela. A policy de
Storage abaixo nao entra nessa contagem.

### Tabelas sem RLS declarado

`public.empresas` nao possui `ENABLE ROW LEVEL SECURITY` nas migrations
versionadas. Tambem nao ha declaracao de RLS para tabelas externas ao conjunto
ERP, como `auth.users` e metadados do Storage. A ausencia de declaracao aqui
nao prova o estado remoto atual; exige confirmacao no catalogo administrativo.

### Inventario das policies

| Policy | Operacao | USING | WITH CHECK | Tabela | Classificacao |
|---|---|---|---|---|---|
| `Permitir acesso operacional erp_pdv_categorias` | ALL | `true` | `true` | `erp_pdv_categorias` | Critica |
| `Permitir acesso operacional erp_pdv_produtos` | ALL | `true` | `true` | `erp_pdv_produtos` | Critica |
| `Permitir acesso operacional erp_pdv_estoques` | ALL | `true` | `true` | `erp_pdv_estoques` | Critica |
| `Permitir acesso operacional erp_pdv_movimentacoes` | ALL | `true` | `true` | `erp_pdv_movimentacoes` | Critica |
| `Permitir acesso operacional erp_pdv_caixas` | ALL | `true` | `true` | `erp_pdv_caixas` | Critica |
| `Permitir acesso operacional erp_pdv_vendas` | ALL | `true` | `true` | `erp_pdv_vendas` | Critica |
| `Permitir acesso operacional erp_pdv_venda_itens` | ALL | `true` | `true` | `erp_pdv_venda_itens` | Critica |
| `Permitir acesso operacional erp_pdv_caixa_movimentacoes` | ALL | `true` | `true` | `erp_pdv_caixa_movimentacoes` | Critica |
| `Permitir acesso operacional erp_pdv_clientes` | ALL | `true` | `true` | `erp_pdv_clientes` | Critica |
| `Permitir acesso operacional erp_pdv_fornecedores` | ALL | `true` | `true` | `erp_pdv_fornecedores` | Critica |
| `Permitir acesso operacional erp_pdv_entradas` | ALL | `true` | `true` | `erp_pdv_entradas` | Critica |
| `Permitir acesso operacional erp_pdv_entrada_itens` | ALL | `true` | `true` | `erp_pdv_entrada_itens` | Critica |
| `Permitir acesso operacional erp_pdv_devolucoes` | ALL | `true` | `true` | `erp_pdv_devolucoes` | Critica |
| `Permitir acesso operacional erp_pdv_devolucao_itens` | ALL | `true` | `true` | `erp_pdv_devolucao_itens` | Critica |
| `Permitir acesso operacional erp_pdv_vale_trocas` | ALL | `true` | `true` | `erp_pdv_vale_trocas` | Critica |
| `Permitir acesso operacional erp_pdv_vale_troca_movimentacoes` | ALL | `true` | `true` | `erp_pdv_vale_troca_movimentacoes` | Critica |
| `Permitir acesso operacional erp_pdv_usuarios` | ALL | `true` | `true` | `erp_pdv_usuarios` | Critica |
| `Permitir excluir arquivos do bucket empresas` | DELETE | `bucket_id = 'empresas'` | ausente | Storage objects | Revisar |

As policies operacionais concedem acesso a `anon, authenticated` quando essa
clausula aparece na migration. Nao usam `auth.uid()`, `auth.role()` nem
funcao auxiliar de contexto. A policy do Storage restringe somente o bucket,
nao a empresa ou o usuario.

### Matriz de isolamento

| Tabela | empresa_id | RLS | Policy segura | Necessita revisao |
|---|---:|---:|---:|---:|
| `empresas` | nao | nao declarado | nao | sim |
| `erp_pdv_categorias` | sim | sim | nao | sim |
| `erp_pdv_produtos` | sim | sim | nao | sim |
| `erp_pdv_estoques` | sim | sim | nao | sim |
| `erp_pdv_movimentacoes` | sim | sim | nao | sim |
| `erp_pdv_caixas` | sim | sim | nao | sim |
| `erp_pdv_vendas` | sim | sim | nao | sim |
| `erp_pdv_venda_itens` | sim | sim | nao | sim |
| `erp_pdv_caixa_movimentacoes` | sim | sim | nao | sim |
| `erp_pdv_clientes` | sim | sim | nao | sim |
| `erp_pdv_fornecedores` | sim | sim | nao | sim |
| `erp_pdv_entradas` | sim | sim | nao | sim |
| `erp_pdv_entrada_itens` | sim | sim | nao | sim |
| `erp_pdv_devolucoes` | sim | sim | nao | sim |
| `erp_pdv_devolucao_itens` | sim | sim | nao | sim |
| `erp_pdv_vale_trocas` | sim | sim | nao | sim |
| `erp_pdv_vale_troca_movimentacoes` | sim | sim | nao | sim |
| `erp_pdv_usuarios` | sim | sim | nao | sim |
| `erp_pdv_colaboradores` | sim | sim | nao | sim |

### Plano futuro de RLS

O modelo recomendado e:

```text
auth.uid()
  -> erp_pdv_usuarios.auth_user_id
  -> erp_pdv_usuarios.empresa_id
  -> funcao segura de contexto
  -> policy da tabela usando empresa_id
```

Cada tabela operacional deve possuir policies separadas para SELECT, INSERT,
UPDATE e, quando permitido, DELETE. O `empresa_id` deve ser comparado ao
contexto obtido por `auth.uid()`, nunca ao slug ou ao valor enviado pelo
navegador. `WITH CHECK` deve impedir troca arbitraria de empresa.

`erp_pdv_usuarios` requer tratamento especial para evitar recursao de RLS;
uma funcao `SECURITY DEFINER` com `search_path` fixo e grants minimos deve ser
avaliada antes da implementacao. O Painel Master deve usar uma identidade ou
claim administrativa separada, nunca `USING (true)`.

Conclusao: as policies operacionais atuais sao criticas para multiempresa e
devem ser substituidas em etapa propria, com testes de anonimo, usuario
inativo, usuario sem vinculo e acesso cruzado entre empresas.
