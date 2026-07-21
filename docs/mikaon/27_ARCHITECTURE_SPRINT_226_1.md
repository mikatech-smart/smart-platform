# Sprint 226.1 - Separacao Plataforma e ERP

## Ambientes

- `admin.mikaon.com.br`: entrada exclusiva do Painel Master.
- `erp.mikaon.com.br`: entrada exclusiva do ERP de uma empresa.
- Dominios locais ou legados continuam usando o roteamento anterior para testes e compatibilidade.

## Decisao central

`src/auth/RuntimeEnvironment.ts` identifica o ambiente pelo hostname. Os guards usam essa decisao para impedir acesso cruzado: o ambiente de plataforma bloqueia ERP/PDV e o ambiente ERP bloqueia o Painel Master.

## Fluxo ERP

O login real consulta o vinculo do usuario no Supabase, obtem a empresa associada e redireciona diretamente para `/empresa/:slug`. O login mock de Caixa e Estoque segue o mesmo redirecionamento quando usado no dominio ERP. Nenhuma empresa e selecionada pela tela.

## Fluxo Plataforma

O acesso a `/admin` fica reservado ao ambiente de plataforma. O mock `admin / 123456` continua apenas para desenvolvimento local e e recusado no ambiente ERP. O perfil global real ainda depende de um registro de identidade de plataforma, que permanece uma pendencia de autenticacao futura.

## Sessao e logout

O layout ERP oferece saida explicita, remove o estado mock local, encerra a sessao Supabase e retorna a `/` do mesmo hostname.

## Validacao

- `npm.cmd run build`: aprovado.
- `git diff --check`: aprovado, com avisos de conversao LF/CRLF do ambiente Windows.
- Nenhum banco, migration, commit, push ou deploy foi executado.
