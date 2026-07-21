# Sprint 227.4 - Auditoria e homologacao final

## Parecer atual

**NAO APROVADA - existem bloqueios antes dos novos modulos.**

O inventario foi concluido em uma worktree limpa baseada em `origin/connect-v1`.
O working tree original permanece preservado. Foi encontrada e corrigida uma
falha de isolamento de rotas: antes, qualquer hostname que nao fosse o Admin
podia alcancar `/pdv/:slug`. Agora o acesso ERP exige positivamente o hostname
`erp.mikaon.com.br`, e o acesso empresarial tambem rejeita o ambiente publico.

## Inventario Git

| Item | Estado | Classificacao | Acao |
| --- | --- | --- | --- |
| `origin/connect-v1` | `9ff48d1` | Publicado | Base da auditoria |
| `1848261`, `e088ffa`, `93bfc6d`, `9ff48d1` | Contidos em `connect-v1` | Publicados | Nenhuma incorporacao pendente |
| `codex/sprint-227-2`, `codex/sprint-227-3` | Contem commits ja publicados | Historico | Preservadas |
| `fix/database-migration-audit` | `c5ab706` com alteracoes locais | Working tree de trabalho | Preservado, nao usado para publicar |
| `backup/pre-saneamento-226` | `ea6f126` | Backup | Preservada |
| `backups/`, `.wrangler/`, docs, scripts, migrations e paginas nao rastreadas | Locais | Nao publicados / E3 | Mantidos fora da publicacao |

Nao havia staging nem stash pendente. Nenhum arquivo local foi descartado.

## Matriz de modulos publicados

| Modulo | Admin | ERP | Publico | Rota | Menu | Servico | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Produtos | Nao | Sim | Nao | `/empresa/:slug/produtos` | Sim | ERP/PDV | Publicado e conectado |
| Categorias | Nao | Sim | Nao | `/empresa/:slug/categorias` | Sim | ERP/PDV | Publicado e conectado |
| Estoque | Nao | Sim | Nao | `/empresa/:slug/movimentacoes` | Sim | ERP/PDV | Publicado e conectado |
| PDV | Nao | Sim | Nao | `/empresa/:slug/pdv` | Sim | ERP/PDV | Publicado e conectado |
| Caixa | Nao | Sim | Nao | `/empresa/:slug/caixa` | Sim | ERP/PDV | Publicado; modo dedicado reutiliza o nucleo do PDV |
| Impressoras | Nao | Estrutura | Nao | `/empresa/:slug/impressoras` | Sim | Nenhum engine | Placeholder identificado, nao concluido |
| Configuracoes | Informacoes/plano | Sim | Nao | `/empresa/:slug/configuracoes` | Sim | Empresa | Publicado e conectado |
| Canais | Nao | Sim | Sim | `/empresa/:slug/canais` | Sim | Empresa/publico | Publicado e conectado |
| Compras | Nao | Nao | Nao | Nenhuma | Nao | Arquivo local nao rastreado | Modulo futuro |
| Clientes | Nao | Nao | Nao | Nenhuma ERP publicada | Nao | Servico/paginas locais fora da branch | Nao publicado |
| Fornecedores | Nao | Nao | Nao | Nenhuma | Nao | Arquivo local nao rastreado | Modulo futuro |
| Colaboradores | Nao | Nao | Nao | Nenhuma | Nao | Arquivo local nao rastreado | Modulo futuro |
| Usuarios operacionais | Admin administrativo | Nao operacional | Nao | Sem rota ERP dedicada | Nao | Servicos ERP/PDV | Parcial; operacao de perfis pendente |
| CRM | Nao | Nao | Nao | Nenhuma | Nao | Configuracoes historicas | Modulo futuro |

## Rotas e menus

As rotas ERP publicadas possuem itens correspondentes no `EmpresaLayout`.
As rotas Admin possuem `RequirePlatformAuth`. As rotas empresariais usam
`RequireCompanyAuth` e permissoes RBAC. As paginas publicas usam rotas sem
autenticacao e nao devem acessar dados privados.

Foi identificado um bloqueio corrigido nesta sprint: as rotas `/pdv/:slug` e
`/empresa/:slug` nao exigiam positivamente o hostname ERP. A correcao esta em
`src/auth/RouteGuards.tsx` e deve ser validada em producao antes de considerar
o isolamento concluido.

## Publico versus Admin e ERP

O `MasterLayout` nao apresenta operacoes de PDV, Caixa ou Estoque. O ERP nao
importa layouts administrativos. A pagina `EmpresaImpressoras` e apenas
estrutura, explicitamente pendente de engine e configuracoes reais.

## Lint e tipagem

Estado inicial: 24 erros e 6 warnings.

Foram corrigidos cinco erros seguros de variaveis nao utilizadas em
`empresa.service.ts`, preservando a remocao de campos opcionais durante
fallbacks de compatibilidade. Estado apos a correcao: **19 erros e 6 warnings**.

Erros restantes, por grupo:

- `react-refresh/only-export-components`: exports mistos em `AuthContext.tsx`,
  `PermissionGuard.tsx` e `ProductPricingEditor.tsx`; requer extracao de
  APIs para arquivos proprios.
- `react-hooks/immutability` e `react-hooks/purity`: `EmpresaForm.tsx` usa
  funcoes declaradas apos effects e `Date.now()` durante render; requer
  refatoracao cuidadosa.
- `react-hooks/set-state-in-effect`: effects em `EmpresaForm`,
  `ProductPricingEditor`, `PublicAgendamentoPage`, `PublicPdvPage` e
  `Empresas`; corrigir sem testes de interface pode alterar comportamento.
- `react-hooks/exhaustive-deps`: dependencias incompletas em `EmpresaForm`,
  `ProductPricingEditor` e `PublicPdvPage`.
- `@typescript-eslint/no-unused-vars`: nenhum restante apos a correcao segura.

O typecheck continua aprovado pelo build. Os 19 erros restantes sao divida
tecnica importante, mas nao foram reescritos nesta auditoria por risco de
regressao em formularios e PDV.

## Variaveis e deployment

Variaveis usadas pelo cliente: `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ENABLE_MOCK_LOGIN` e
`VITE_GOOGLE_SITE_VERIFICATION`. O mock deve permanecer desligado em producao.
`wrangler.toml` ainda carrega configuracoes legadas de nome e URL publica;
isso deve ser saneado em sprint de configuracao, sem expor valores sensiveis.

O deployment de producao listado pelo Wrangler aponta para `connect-v1` e
`9ff48d1`. As URLs customizadas respondem HTTP 200. A URL individual de
deployment retornou 404 nas verificacoes anteriores; o Wrangler ainda lista o
deployment, portanto o comportamento deve ser tratado como alias tecnico nao
confiavel ou configuracao de preview, nao como prova de falha dos dominios.

## Testes executados

- teste estrutural de rotas, menu, Caixa e guards: aprovado;
- build/typecheck: aprovado;
- lint: 19 erros e 6 warnings restantes;
- `git diff --check`: aprovado, com avisos LF/CRLF;
- homologacao autenticada Admin/ERP/Mikatech: pendente, pois exige sessao e
  credenciais fornecidas pelo responsavel no navegador;
- testes de multiempresa: pendentes em ambiente controlado autenticado;
- smoke test HTTP: nao substitui homologacao autenticada.

## Pendencias

### CRITICAS

1. Homologacao autenticada do Admin, ERP e Mikatech. Impacto: nao comprova
   login, RBAC, empresa correta ou isolamento em producao. Sprint sugerida:
   homologacao operacional autorizada.
2. Validacao do guard corrigido em producao. Impacto: bloqueia declaracao final
   de isolamento por hostname. Sprint atual, apos deployment.

### IMPORTANTES

1. Remover os 19 erros e 6 warnings de lint com refatoracao controlada.
2. Implementar a engine real de Impressoras; a rota atual e placeholder.
3. Explicar/validar definitivamente a URL tecnica 404 no painel Cloudflare.

### NAO BLOQUEANTES

1. Limpeza de nomes legados em `wrangler.toml` e documentacao.
2. Testes E2E automatizados, inexistentes no projeto atual.

### MODULOS FUTUROS

Compras, Clientes, Fornecedores, Colaboradores, Usuarios Operacionais, CRM,
Financeiro e Fiscal. Estes nao devem ser criados como parte desta sprint.

## Estado de dados e seguranca

Esta auditoria nao cria migration, nao altera schema, RLS, autenticacao, DNS,
Cloudflare ou dados reais. Nenhum estoque, venda, usuario ou empresa foi
alterado. O `SUPER_ADMIN` permanece sem empresa.
