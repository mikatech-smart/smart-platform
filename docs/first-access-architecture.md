# Primeiro Acesso da Empresa

O Painel Master gera um convite temporario para a empresa. O convite contem um token aleatorio de uso unico; somente o hash SHA-256 e armazenado no banco.

O link aponta para `https://erp.mikaon.com.br/primeiro-acesso`. O cliente informa nome, e-mail e senha. A Edge Function valida validade, revogacao e uso do convite, cria o usuario no Supabase Auth e cria o vinculo em `erp_pdv_usuarios` com perfil `administrador` e a empresa definida pelo convite.

Protecoes: validade de 7 dias, revogacao no reenvio, claim atomico, segundo uso bloqueado e `service_role` somente nas Edge Functions.

A migration e as Edge Functions precisam ser aplicadas no projeto Supabase antes de habilitar o fluxo em producao.
