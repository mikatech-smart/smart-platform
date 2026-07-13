# DECISÕES TÉCNICAS DO MIKAON

> Documento oficial das decisões técnicas e arquiteturais do projeto.
>
> Este documento registra o motivo das principais decisões tomadas durante o desenvolvimento.
> Antes de alterar qualquer comportamento importante do sistema, este documento deverá ser consultado.

---

# Objetivo

Preservar o conhecimento arquitetural do MikaON.

Registrar não apenas **o que foi decidido**, mas principalmente **por que foi decidido**.

Isso evita retrabalho, regressões e decisões conflitantes no futuro.

---

# Como utilizar este documento

Cada decisão deverá conter:

- Identificador
- Data
- Sprint
- Contexto
- Decisão
- Justificativa
- Impacto

---

# DEC-001

## Assunto

Documentação oficial dentro do repositório.

## Contexto

As conversas com IA possuem limite de contexto e podem ser perdidas com troca de plano, nova conversa ou mudança de ferramenta.

## Decisão

Toda a memória permanente do MikaON ficará na pasta:

docs/mikaon

## Justificativa

O conhecimento pertence ao projeto e não à conversa.

## Impacto

Todas as futuras Sprints deverão começar pela leitura da documentação oficial.

---

# DEC-002

## Assunto

Arquitetura modular.

## Decisão

O sistema será dividido em módulos independentes.

## Justificativa

Facilita manutenção.

Permite crescimento.

Reduz acoplamento.

---

# DEC-003

## Assunto

Base de dados única.

## Decisão

ERP, CRM e PDV compartilharão os mesmos cadastros.

## Justificativa

Eliminar duplicidade.

Garantir consistência.

---

# DEC-004

## Assunto

Cadastro único de produtos.

## Decisão

Todo produto existirá apenas uma vez.

## Justificativa

Evitar divergências entre módulos.

---

# DEC-005

## Assunto

Cadastro único de clientes.

## Decisão

Cliente compartilhado entre ERP, CRM, PDV e Financeiro.

---

# DEC-006

## Assunto

Fluxo operacional do PDV.

## Decisão

Fluxo oficial:

Operador

↓

Cliente

↓

Produto

↓

Carrinho

↓

Pagamento

↓

Cupom

↓

Nova Venda

## Justificativa

Representa o fluxo natural de atendimento no balcão.

---

# DEC-007

## Assunto

PDV simplificado.

## Decisão

A frente de caixa não deverá conter funções administrativas.

## Justificativa

Maior produtividade.

Menor curva de aprendizado.

---

# DEC-008

## Assunto

Pesquisa automática.

## Decisão

Eliminar botões "Buscar".

## Justificativa

Menos cliques.

Maior velocidade.

---

# DEC-009

## Assunto

Operação por teclado.

## Decisão

Priorizar teclado em toda operação do PDV.

## Justificativa

Maior produtividade para operadores.

---

# DEC-010

## Assunto

Carrinho compacto.

## Decisão

Cada produto deverá ocupar apenas uma linha.

## Justificativa

Maior quantidade de itens visíveis.

Menor rolagem.

---

# DEC-011

## Assunto

Pagamento misto.

## Decisão

Permitir múltiplas formas de pagamento na mesma venda.

## Justificativa

Necessidade operacional real da MiKATECH.

---

# DEC-012

## Assunto

Troco automático.

## Decisão

O sistema calculará automaticamente o troco em pagamentos em dinheiro.

---

# DEC-013

## Assunto

Parcelamento.

## Decisão

Cartão de crédito suportará de 1x a 12x.

Preparado para TEF.

---

# DEC-014

## Assunto

Cupom.

## Decisão

Ao concluir a venda, abrir uma visualização do Cupom Não Fiscal.

## Recursos obrigatórios

- Imprimir
- Salvar PDF
- Enviar por WhatsApp
- Fechar

---

# DEC-015

## Assunto

WhatsApp.

## Decisão

O cupom poderá ser enviado diretamente ao cliente.

---

# DEC-016

## Assunto

Permissões.

## Decisão

Toda permissão será validada na interface e na regra de negócio.

Nunca apenas escondendo botões.

---

# DEC-017

## Assunto

Documentação obrigatória.

## Decisão

Toda decisão permanente deverá ser registrada na pasta docs/mikaon antes do encerramento da Sprint.

---

# DEC-018

## Assunto

Arquitetura antes de velocidade.

## Decisão

Nunca sacrificar arquitetura para entregar funcionalidades mais rapidamente.

---

# DEC-019

## Assunto

Experiência do usuário.

## Decisão

Sempre priorizar produtividade em vez de excesso de elementos visuais.

---

# DEC-020

## Assunto

Referências de mercado.

## Decisão

O MikaON utilizará como inspiração ERPs comerciais consolidados, porém com identidade visual própria.

As referências servirão para ergonomia e produtividade, nunca para cópia de interface.

---

# DEC-021

## Assunto

Linha compacta do carrinho do PDV.

## Data

2026-07-12

## Sprint

175

## Contexto

A Sprint 174 preservou corretamente o cupom, WhatsApp e atalhos, mas o carrinho sofreu regressão visual por acúmulo de estilos que ampliavam a altura da linha e permitiam comportamento expansivo nos controles.

## Decisão

Itens do carrinho do PDV não podem utilizar cards altos, botões expansivos, controles com largura total ou qualquer composição que quebre a linha única oficial.

## Justificativa

O PDV precisa manter alta densidade visual e previsibilidade para operações com muitos produtos, principalmente em 1366x768.

## Impacto

Toda alteração futura no carrinho deverá preservar:

- uma única linha por item;
- valor total alinhado à direita;
- controles pequenos com largura fixa;
- rolagem apenas dentro da lista do carrinho.

---

# DEC-022

## Assunto

Fonte única de cálculo da venda no PDV.

## Data

2026-07-12

## Sprint

176

## Contexto

Foi identificado em produção que o total da venda podia divergir da quantidade exibida no carrinho quando estados derivados eram reaproveitados em trechos diferentes da tela.

## Decisão

Subtotal, desconto, total, valor pago, restante e troco passam a ser calculados a partir de uma única função oficial de resumo da venda.

## Justificativa

Evita duplicação de fórmulas, reduz risco de regressão e garante sincronização imediata entre linha do carrinho, resumo financeiro e finalização da venda.

## Impacto

Toda alteração futura no PDV deverá reutilizar a mesma fonte de cálculo, sem recriar fórmulas isoladas em componentes visuais, pagamentos ou fechamento.

---

# DEC-023

## Assunto

Preço unitário e total da linha no carrinho.

## Data

2026-07-12

## Sprint

177

## Contexto

Após a centralização do cálculo, o carrinho ainda precisava explicitar ao operador a diferença entre preço de uma unidade e total da quantidade.

## Decisão

O carrinho do PDV deverá exibir simultaneamente o valor unitário e o total da linha, mantendo a compactação visual.

## Justificativa

Isso reduz erro operacional, facilita conferência rápida e preserva a regra matemática oficial da venda.

## Impacto

O preço unitário nunca poderá ser confundido com o total da linha em futuras alterações de layout.

---

# Próximas decisões

Toda decisão nova deverá ser adicionada ao final deste documento.

Jamais apagar decisões antigas.

Caso uma decisão seja substituída, marcar a anterior como:

STATUS: SUPERADA

e criar uma nova decisão explicando o motivo da mudança.

---

# Regra Final

Este documento representa a memória arquitetural do MikaON.

Nenhuma decisão importante poderá existir apenas em conversas, mensagens ou commits.

---

# DEC-011

## Assunto

Listagem operacional de Produtos/Estoque.

## Decisao

A listagem operacional deve usar tabela compacta com filtros, busca fixa e paginacao.

## Justificativa

Grandes catalogos exigem alta densidade de informacao e navegacao rapida.

## Impacto

Novas evolucoes do ERP/Estoque nao devem retornar a cards altos como padrao de listagem.

---

# DEC-012

## Assunto

Formacao de precos no ERP/PDV.

## Decisao

Custo, preco varejo e preco atacado sao a base oficial. Markup e margem sao derivados desses valores.

## Justificativa

Evita divergencia de calculo entre cadastro, estoque e venda.

## Impacto

Toda tela que mostrar precos deve preservar a mesma matematica para preco unitario e indicadores.

---

# DEC-013

## Assunto

Uso de verde em tabelas operacionais.

## Decisao

Grandes areas em verde saturado nao devem ser utilizadas em tabelas operacionais do MikaON.

## Justificativa

Causa cansaco visual e reduz conforto em uso prolongado.

## Impacto

Produtos/Estoque e futuras listagens operacionais devem usar base clara, selecao suave e verde apenas como destaque pontual.


---

# Sprint 180 - Separacao visual entre PDV e ERP

O PDV permanece orientado a velocidade operacional. O ERP utiliza Data Grid, linhas compactas e alta densidade para leitura e manutencao de grandes catalogos. Registros administrativos em massa nao devem ser representados por cards.
