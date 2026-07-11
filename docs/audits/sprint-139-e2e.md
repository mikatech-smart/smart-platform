# Sprint 139 - Auditoria E2E da Plataforma

Data: 2026-07-11
Ambiente: https://smart.mikaon.com.br
Empresa de teste criada: Auditoria E2E 2026-07-11
Slug de teste: auditoria-e2e-1783780399561

## Escopo

- Auditoria sem correcao de funcionalidades.
- Navegacao como usuario real em producao.
- Validacao por navegador automatizado com Playwright do Codex In-app Browser.
- Validacao HTTP com `curl.exe`.
- Consulta direta ao Supabase REST para confirmar persistencia da empresa de teste.
- Desktop e mobile, com viewport mobile de 390 x 844.

## Impacto

Esta sprint nao altera funcionalidade da plataforma. O unico artefato criado e este relatorio de auditoria.

## Fluxos testados

- Acesso direto ao dashboard administrativo.
- Criacao de empresa exclusiva para auditoria.
- Abertura do editor administrativo da empresa.
- Tentativa de salvamento de categoria e descricao.
- Pagina publica da empresa de auditoria.
- Central de compartilhamento, links publicos, NFC e QR Code exibidos no editor.
- Landing Page da empresa de auditoria.
- Cardapio Digital da empresa de auditoria.
- Catalogo da empresa de auditoria.
- Agendamento da empresa de auditoria.
- Wi-Fi Marketing da empresa de auditoria.
- Programa de Fidelidade da empresa de auditoria.
- Painel do cliente da empresa de auditoria.
- Paginas publicas reais: `rjrleds` e `ale-alves-locucoes`.
- Rotas reais de Landing, Catalogo, Agendamento e Fidelidade.
- Rotas reais de Cardapio para `rjrleds` e `ale-alves-locucoes`.
- Responsividade mobile da pagina publica da empresa de auditoria.
- Console do navegador nas rotas testadas.

## Testes aprovados

- Empresa de auditoria criada e listada no dashboard.
- Editor administrativo abriu para a empresa de auditoria.
- Pagina publica `/auditoria-e2e-1783780399561` renderizou sem erro JS capturado.
- Landing Page da empresa de auditoria exibiu mensagem amigavel de nao publicada.
- Cardapio, Catalogo, Agendamento, Wi-Fi Marketing e Fidelidade da empresa de auditoria renderizaram mensagens de indisponibilidade sem erro JS capturado.
- Painel do cliente da empresa de auditoria renderizou sem erro JS capturado.
- Pagina publica mobile da empresa de auditoria nao apresentou overflow horizontal em 390 px.
- Paginas reais `/rjrleds` e `/ale-alves-locucoes` renderizaram sem erro JS capturado.
- Rotas reais `/landing/rjrleds`, `/catalogo/rjrleds`, `/agendamento/rjrleds`, `/landing/ale-alves-locucoes` e `/fidelidade/ale-alves-locucoes` renderizaram sem erro JS capturado.
- Todas as rotas publicas testadas responderam HTTP 200.

## Falhas encontradas

### CRITICA - Dashboard administrativo acessivel sem login

Evidencia:

- URL: `https://smart.mikaon.com.br/dashboard`
- Resultado: abriu diretamente o painel com lista de empresas.
- Havia conteudo de dashboard e empresas.
- Nao havia tela de login.

Risco:

- Qualquer visitante pode acessar a area administrativa.
- O beta nao deve seguir sem bloquear este fluxo.

### CRITICA - Painel do cliente permite editar empresa sem login

Evidencia:

- URL: `https://smart.mikaon.com.br/painel/auditoria-e2e-1783780399561`
- Resultado: abriu editor completo da empresa.
- Conteudo visivel: informacoes, personalizacao, Landing Page, Cardapio, Catalogo, Agendamento, Wi-Fi Marketing, Fidelidade, CRM, IA, Contato, Endereco, Redes Sociais e Conectividade.

Risco:

- Qualquer pessoa com o slug pode acessar a edicao da empresa.
- Deve ser tratado antes do beta.

### ALTA - Salvamento basico nao persistiu categoria/descricao

Evidencia:

- Empresa criada: `auditoria-e2e-1783780399561`.
- Alteracao tentada no editor: categoria personalizada `Auditoria Beta` e descricao `Empresa sintetica criada para auditoria E2E pre-beta da MikaON`.
- Consulta ao Supabase apos tentativa de salvamento retornou `categoria` e `descricao` vazias.

Risco:

- Usuario pode acreditar que salvou dados, mas a alteracao nao fica persistida.
- Requer nova sprint focada em salvar e confirmar feedback de sucesso/erro.

### MEDIA - Pagina publica mostra link de Cardapio, mas rota esta indisponivel

Evidencia:

- `/rjrleds` exibe chamada para Cardapio Digital e botao `Ver cardapio`.
- `/cardapio/rjrleds` retorna `Cardapio indisponivel`.
- `/ale-alves-locucoes` exibe chamada para Cardapio Digital e botao `Ver cardapio`.
- `/cardapio/ale-alves-locucoes` retorna `Cardapio indisponivel`.

Risco:

- Experiencia publica inconsistente.
- O link deve aparecer somente quando houver cardapio ativo/configurado, ou a pagina deve exibir conteudo valido.

## Limitacoes da auditoria

- Criacao de usuario de login nao foi executada porque nao existe fluxo publico de login/cadastro identificado na aplicacao.
- Login e logout nao puderam ser testados como fluxo real pelo mesmo motivo.
- Upload real de arquivo nao foi executado porque o controlador Playwright disponivel nesta sessao nao expoe selecao de arquivo local; a auditoria deve continuar em sprint propria com suporte a `setInputFiles` ou execucao manual assistida.
- Nao foram feitas correcoes nesta sprint, conforme requisito.

## Evidencias resumidas

- Dashboard direto:
  - `bodyHasDashboard: true`
  - `bodyHasEmpresas: true`
  - `bodyHasLogin: false`
  - `url: https://smart.mikaon.com.br/dashboard`
- Empresa criada:
  - `id: 0e77c7a6-7f8a-49f7-9248-b7e5cbb1c9a4`
  - `slug: auditoria-e2e-1783780399561`
  - `tipo: cliente`
- Supabase apos salvamento:
  - `categoria: ""`
  - `descricao: ""`
- Mobile:
  - viewport: 390 x 844
  - `scrollWidth: 390`
  - `hasHorizontalOverflow: false`

## Recomendacao das proximas sprints

1. Sprint 140 - Autenticacao obrigatoria para `/dashboard` e `/painel/:slug`.
2. Sprint 141 - Revisao de permissoes/RLS no Supabase para impedir escrita publica indevida.
3. Sprint 142 - Corrigir persistencia e feedback de salvamento do EmpresaForm.
4. Sprint 143 - Ajustar exibicao de links de modulos publicos somente quando houver recurso ativo e conteudo valido.
5. Sprint 144 - Auditoria de upload com ambiente E2E que suporte selecao real de arquivos.
6. Sprint 145 - Suite Playwright versionada no repositorio, com dados de teste isolados e limpeza automatica.

## Resultado

Beta nao recomendado ainda.

Motivo principal: existem falhas criticas de autenticacao em areas administrativas e de painel do cliente.
