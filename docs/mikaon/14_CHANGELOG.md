# CHANGELOG OFICIAL DO MIKAON

> Histórico oficial de evolução do MikaON.
>
> Este documento registra todas as mudanças relevantes do sistema ao longo do desenvolvimento.
> O objetivo é manter uma linha do tempo clara das evoluções funcionais, arquiteturais e visuais.

---

# Objetivo

Registrar a evolução do MikaON.

Este documento NÃO substitui o Git.

Ele registra:

- novas funcionalidades;
- mudanças importantes;
- melhorias de arquitetura;
- melhorias visuais;
- alterações de regras;
- mudanças de comportamento.

---

# Formato

Cada alteração deverá conter:

Data

Sprint

Versão

Módulo

Descrição

Impacto

---

# Versões

## v0.1 — Estrutura Inicial

Status

Concluída

Principais marcos

- criação da estrutura base do projeto;
- definição da arquitetura React + TypeScript;
- integração inicial com Supabase.

---

## v0.2 — Fundação do ERP

Principais marcos

- módulos administrativos;
- autenticação;
- permissões iniciais;
- estrutura do CRM;
- estrutura do ERP.

---

## v0.3 — Fundação do PDV

Principais marcos

- abertura de caixa;
- seleção de operador;
- pesquisa de clientes;
- pesquisa de produtos;
- carrinho;
- pagamentos;
- geração de cupom.

---

## Sprint 169

Principais alterações

- cabeçalho horizontal do PDV;
- carrinho ampliado;
- busca em destaque;
- menu recolhível;
- remoção da rolagem da página.

Impacto

Melhora significativa da ergonomia da frente de caixa.

---

## Sprint 170

Principais alterações

- reorganização do fluxo operacional:

Cliente

↓

Produto

↓

Carrinho

↓

Pagamento

↓

Finalização

- remoção dos produtos sugeridos;
- pesquisa reposicionada;
- tabela de preços removida da operação principal.

Impacto

Fluxo mais próximo da operação real da MiKATECH.

---

## Sprint 171

Principais alterações

- pagamento misto;
- troco automático;
- parcelamento em até 12x;
- validações de pagamento.

Impacto

PDV preparado para operação comercial.

---

## Sprint 172

Principais alterações

- pesquisa automática;
- Enter adicionando produto;
- foco automático;
- navegação por teclado;
- feedback visual discreto.

Impacto

Grande redução de cliques durante a venda.

---

## Sprint 173

Principais alterações

- compactação do carrinho;
- reorganização do resumo financeiro;
- otimização da área útil.

Impacto

Maior quantidade de itens visíveis durante a venda.

---

## Sprint 174

Principais alterações

- modal profissional do cupom;
- impressão;
- salvar PDF;
- envio por WhatsApp;
- painel funcional de atalhos.

Impacto

Fechamento da venda mais profissional.

---

## Sprint 175

Principais alterações

- correção da regressão visual do carrinho;
- restauração da linha única compacta por item;
- alinhamento estável entre nome, valor e controles;
- preservação integral do cupom, WhatsApp e atalhos.

Impacto

Maior densidade visual no PDV sem alterar as regras operacionais da venda.

---

## Sprint 176

Principais alterações

- correção crítica do cálculo do carrinho;
- unificação da regra de subtotal, total, restante e troco;
- correção do valor da linha para preço unitário multiplicado pela quantidade;
- eliminação da expansão vertical dos itens do carrinho.

Impacto

Venda matematicamente consistente e carrinho mais previsível para operação em produção.

---

## Sprint 177

Principais alterações

- valor unitário visível no carrinho junto ao total da linha;
- criação do acesso operacional de Produtos/Estoque para o perfil de estoque;
- correção do bloqueio de módulo não liberado para o estoquista.

Impacto

Maior clareza operacional no carrinho e liberação correta do fluxo de estoque sem ampliar permissões de venda.

---

# Alterações Arquiteturais

Durante o desenvolvimento foi definida uma nova metodologia.

O ChatGPT passou a atuar como:

Arquiteto Técnico Principal.

O Codex passou a atuar como:

Implementador Técnico.

Toda decisão permanente passou a ser documentada.

---

# Mudança de Metodologia

Foi abandonado o uso de prompts extensos.

Toda memória permanente passou a ser armazenada em:

docs/mikaon/

---

# Próximas Versões

Planejadas:

v0.4

Refinamento completo do PDV.

v0.5

CRM Comercial.

v0.6

Ordem de Serviço.

v0.7

Financeiro.

v0.8

Estoque.

v0.9

Automação.

v1.0

Primeira versão comercial do MikaON.

---

# Regra Permanente

Toda Sprint aprovada deverá atualizar este documento.

Nenhuma funcionalidade importante deverá ser implementada sem registro no Changelog.

---

# Objetivo Final

Permitir que qualquer desenvolvedor compreenda rapidamente a evolução do MikaON apenas consultando este documento.

---

# Sprint 178 - Produtos/Estoque profissional

Resumo

- substituicao dos cards grandes por tabela compacta;
- pesquisa fixa, filtros operacionais e paginacao;
- painel lateral para edicao de produto;
- organizacao de custo, varejo, atacado, markup e margem;
- ajuste automatico da tabela de preco permitida ao operador.

Impacto

Melhora significativa da densidade visual e da escalabilidade da area operacional de estoque, sem alterar a frente de caixa validada.

---

# Sprint 179 - Padronizacao visual de Produtos/Estoque

Resumo

- refinamento visual da tabela para fundo claro e leitura prolongada;
- reducao do verde saturado;
- selos de status mais discretos;
- painel lateral alinhado ao padrao do PDV.

Impacto

A area operacional de Produtos/Estoque fica mais consistente com o restante do MikaON, sem alterar comportamento funcional.


---

# Sprint 180 - Data Grid administrativo

- substituida a listagem de Produtos/Estoque por Data Grid reutilizavel;
- linhas horizontais compactas, zebra suave, selecao discreta e status em selo;
- painel lateral e operacao existente preservados.


---

# Sprint 181 - Data Grid e precos

- neutralizado o fundo das linhas e da selecao do Data Grid;
- reorganizado o painel de custos e precos;
- adicionados acrescimo, markup, margem e preco final independentes para varejo e atacado;
- fortalecidas as validacoes de valores numericos.


---

# Sprint 182 - Selecao, edicao e grade

- painel lateral agora entra em `EDITAR PRODUTO` ao selecionar uma linha;
- salvamento de produto existente usa o ID preservado e atualiza a linha;
- grade e estilos legados seguem base neutra, sem fundo verde nas linhas.

## Sprint 183

- Data Grid com linhas neutras e selecao sem verde saturado.
- Produtos existentes abrem em `EDITAR PRODUTO`, com custos e precos carregados e salvos por UPDATE.
- Administradores e gerentes autorizados acessam Produtos / Estoque para a validacao operacional.

## Sprint 184

- Motor de formacao de precos previsivel e independente para varejo e atacado.
- Entradas decimais preservadas durante a digitacao.
- Preco final persistido e indicadores recalculados com protecao contra valores invalidos.

## Sprint 185

- Editor de precos separado em componente proprio.
- Digita��o de custo, acrescimo, markup e preco final estabilizada.
- Varejo e atacado continuam independentes e persistentes.

## Sprint 188

- Selecao de operador reorganizada em perfis e modalidades compactas.
- Vendedores filtrados por tabela autorizada, com suporte a multiplos operadores e tabela fixa durante a sessao.
- Senha e autenticacao individual permanecem planejadas para fase futura.

## Sprint 189

- Corrigida a consulta de caixa aberto para suportar um caixa independente por operador.
- Fechamento da operacao vinculado ao operador atual.
- Mantido o perfil Vendedor separado e o modelo centralizado como evolucao futura.

## Sprint 190

- Criada a area administrativa Colaboradores.
- Adicionados nome de exibicao, funcoes acumulaveis, pesquisa, filtros e lista compacta.
- Integrada a selecao operacional por funcao e tabela autorizada.

## Sprint 191

- Padronizada a entrada de redes sociais para usuario, @usuario ou URL completa.
- Corrigida a abertura do YouTube para usar /@usuario.
- Centralizada a geracao de links canonicos para Instagram, TikTok, YouTube e Kwai.
