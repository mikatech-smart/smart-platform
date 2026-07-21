# MikaON v0.10.0 - Plataforma e ERP

## Ambientes

- `admin.mikaon.com.br`: autentica exclusivamente em `platform_admin_users`.
- `erp.mikaon.com.br`: autentica exclusivamente em `erp_pdv_usuarios` e exige empresa ativa.
- `localhost`: modo de desenvolvimento legado/controlado.

## Identidades

Administradores globais nao possuem `empresa_id` e nao sao registros de `erp_pdv_usuarios`. Usuarios ERP sempre possuem empresa e perfil operacional. O `AuthContext` escolhe a fonte conforme o hostname, evitando consulta cruzada entre os ambientes.

## Migration

`20260720140000_create_platform_admin_users.sql` cria a estrutura global com FK para `auth.users`, roles `super_admin` e `platform_admin`, indices unicos e RLS de leitura do proprio registro ativo. A migration nao cria credenciais.

## Login e logout

O login Admin valida o registro global antes de abrir o Painel Master. O login ERP valida o usuario da empresa e redireciona diretamente para o slug vinculado. Cada layout encerra a sessao e retorna a raiz do proprio hostname.

## Estado de publicacao

Build local aprovado. Migration, DNS, criacao de `admin@mikaon.com.br`, commit, push e deploy dependem de validacao e execucao administrativa separadas.
