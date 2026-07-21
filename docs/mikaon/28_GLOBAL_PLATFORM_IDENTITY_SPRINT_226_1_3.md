# Sprint 226.1.3 - Identidade Global da Plataforma

## Separacao

`erp_pdv_usuarios` permanece exclusivo para usuarios operacionais vinculados a uma empresa. Administradores globais passam a usar `platform_admin_users`, sem `empresa_id`.

## Migration

`supabase/migrations/20260720140000_create_platform_admin_users.sql` cria a tabela com vinculo obrigatorio a `auth.users`, roles `super_admin` e `platform_admin`, unicidade de email/auth user e RLS de leitura somente do proprio registro ativo. Nao ha policy de INSERT, UPDATE ou DELETE para o navegador.

## Primeiro administrador

O usuario `admin@mikaon.com.br` deve ser criado manualmente no Supabase Auth pelo painel administrativo. Depois, um operador autorizado deve inserir o vinculo correspondente em `platform_admin_users` usando backend ou SQL administrativo seguro. Nenhuma senha ou service role pertence ao repositorio ou ao frontend.

## Runtime

O `AuthContext` tenta primeiro o vinculo operacional e, na ausencia dele, valida `platform_admin_users`. O guard de plataforma exige sessao e registro global ativo; o guard do ERP exige empresa vinculada. O login da plataforma tambem valida o registro global antes de abrir `/admin`.

## Estado

Migration preparada, nao aplicada remotamente. Usuario global ainda nao criado. Nenhum DNS, deploy ou push executado nesta sprint.
