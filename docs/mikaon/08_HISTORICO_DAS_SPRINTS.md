# HISTÓRICO OFICIAL DAS SPRINTS

> Documento oficial de rastreabilidade do MikaON.
>
> Este documento registra a evolução funcional do sistema.
> Toda Sprint concluída deverá ser adicionada aqui.

---

# Objetivo

Registrar cronologicamente todas as Sprints do MikaON.

Este histórico servirá para:

- auditoria;
- manutenção;
- onboarding de novos desenvolvedores;
- rastreamento de decisões;
- consulta rápida da evolução do sistema.

---

# Padrão de Registro

Cada Sprint deverá conter:

- Número
- Objetivo
- Módulo
- Principais implementações
- Arquivos alterados
- Migration (quando houver)
- Build
- Testes
- Commit
- Resultado

---

# Sprint 163

## Objetivo

Preparar a estrutura operacional inicial do novo PDV.

## Implementações

- Base do operador.
- Estrutura inicial de permissões.
- Preparação da abertura operacional.

## Status

Concluída.

---

# Sprint 164

## Objetivo

Criar a seleção obrigatória do operador antes da abertura do PDV.

## Implementações

- Modal obrigatório.
- Persistência do operador.
- Carregamento de permissões.
- Cabeçalho operacional.
- Troca de operador.

Commit:

d37bced

Status:

Concluída.

---

# Sprint 165

## Objetivo

Transformar o PDV em modo operacional.

## Implementações

- Modo Caixa.
- Atalhos.
- Menu secundário.
- Tela cheia.
- Navegação por teclado.

Commit:

734c8f8

Status:

Concluída.

---

# Sprint 166

## Objetivo

Aprimorar velocidade da operação.

## Implementações

- Carrinho fixo.
- Quantidade rápida.
- Suspender venda.
- Retomar venda.
- Venda compacta.

Commit:

1b2e2f9

Status:

Concluída.

---

# Sprint 167

## Objetivo

Criar assistente inteligente de cadastro de produtos.

## Implementações

- Cadastro por etapas.
- Código de barras.
- XML.
- Câmera.
- Busca inteligente.
- Sugestões automáticas.

Commit:

d3555b1

Status:

Concluída.

---

# Sprint 168

## Objetivo

Simplificar definitivamente a interface do PDV.

## Implementações

- Fluxo reorganizado.
- Menu recolhível.
- Permissões por operador.
- Interface focada na venda.

Commit:

96a5b37

Status:

Concluída.

---

# Sprint 169

## Objetivo

Profissionalizar a frente de caixa.

## Implementações

- Novo cabeçalho.
- Busca em destaque.
- Carrinho maior.
- Pagamentos compactos.
- Sem rolagem da página.

Commit:

05283ff

Status:

Concluída.

---

# Sprint 170

## Objetivo

Adequar o fluxo natural de venda.

## Implementações

Fluxo:

Cliente

↓

Produto

↓

Carrinho

↓

Pagamento

↓

Finalização

Também foram removidos:

- produtos sugeridos;
- tabela de preço da tela principal.

Commit:

b99a29e

Status:

Concluída.

---

# Sprint 171

## Objetivo

Profissionalizar o fechamento financeiro.

## Implementações

- Troco automático.
- Pagamento misto.
- Parcelamento.
- Bloqueios inteligentes.

Commit:

7d8b78d

Status:

Concluída.

---

# Sprint 172

## Objetivo

Melhorar experiência operacional.

## Implementações

- Pesquisa automática.
- Foco automático.
- Navegação por teclado.
- Feedback visual.

Commit:

c1c6be5

Status:

Concluída.

---

# Sprint 173

## Objetivo

Refinar ergonomia do PDV.

## Implementações

- Ajustes visuais.
- Compactação da interface.
- Melhor distribuição dos elementos.
- Continuidade da simplificação operacional.

Status:

Concluída.

---

# Sprint 174

## Objetivo

Compactar definitivamente o carrinho e melhorar o cupom.

## Implementações

- Carrinho em linha única.
- Envio por WhatsApp.
- Modal de atalhos funcional.
- Ajustes visuais.

Commit:

9297b10

Status:

Concluída.

---

# Sprint 175

## Objetivo

Corrigir a regressão visual do carrinho introduzida na Sprint 174.

## Implementações

- restauração da linha compacta do carrinho;
- alinhamento estável entre nome, valor e controles;
- remoção de comportamento visual expansivo dentro do item;
- preservação do cupom, WhatsApp e ajuda de atalhos.

Status:

Concluída.

---

# Sprint 176

## Objetivo

Corrigir cálculo incorreto do carrinho e eliminar a expansão vertical dos itens em produção.

## Implementações

- criação de uma fonte única de cálculo para subtotal, total, restante e troco;
- correção do valor de cada linha para preço unitário × quantidade;
- atualização imediata dos totais ao alterar quantidade ou remover item;
- restauração da lista compacta com itens agrupados no topo.

Status:

Concluída.

---

# Sprint 177

## Objetivo

Exibir valor unitário no carrinho e corrigir o acesso operacional do perfil de estoque.

## Implementações

- separação visual entre valor unitário e total da linha no carrinho;
- criação de área operacional de Produtos/Estoque na rota pública do ERP/PDV;
- correção do bloqueio “Nenhum módulo operacional liberado” para o perfil de estoque.

Status:

Concluída.

---

# Próximas Sprints

A partir deste ponto todas as novas Sprints deverão ser registradas neste documento imediatamente após validação.

Modelo:

---

# Sprint XXX

## Objetivo

...

## Implementações

...

## Arquivos alterados

...

## Commit

...

## Resultado

...

## Status

Concluída.

---

# Observações

Este documento nunca deverá ser resumido.

Ele representa a linha do tempo oficial do MikaON.

Nenhuma Sprint poderá ser perdida.

---

# Sprint 178

## Objetivo

Reestruturar a area operacional de Produtos/Estoque com listagem compacta, filtros, paginacao e formacao de precos profissional.

## Implementacoes

- substituicao dos cards grandes por tabela compacta;
- pesquisa fixa e filtros operacionais;
- paginacao do catalogo operacional;
- painel lateral de edicao;
- custo, varejo, atacado, markup e margem organizados na operacao;
- aplicacao automatica da tabela de preco liberada ao operador.

Status:

Concluida.

---

# Sprint 179

## Objetivo

Refinar visualmente a area de Produtos/Estoque para alinhar a interface ao padrao aprovado do PDV.

## Implementacoes

- remocao do verde intenso nas linhas da tabela;
- cabecalho moderado e mais consistente com o sistema;
- hover, zebra e selecao suavizados;
- painel lateral padronizado com fundo branco e campos compactos;
- status em selos discretos.

Status:

Concluida.
