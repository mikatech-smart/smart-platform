# MÓDULOS E PLANOS OFICIAIS DO MIKAON

> Documento oficial da estrutura funcional do MikaON.
>
> Este documento define todos os módulos existentes, planejados e futuros da plataforma.

---

# Objetivo

Organizar toda a estrutura funcional do MikaON.

Nenhum módulo deverá ser desenvolvido sem estar registrado neste documento.

---

# Filosofia

O MikaON será composto por módulos independentes, porém totalmente integrados.

Cada módulo possuirá:

- responsabilidades próprias;
- telas próprias;
- permissões próprias;
- documentação própria.

Todos compartilharão a mesma base de dados.

---

# Estrutura Geral

O MikaON será dividido em quatro grandes áreas:

- Gestão Empresarial (ERP)
- Relacionamento (CRM)
- Operação (PDV)
- Inteligência (IA)

---

# Módulos Atuais

## Dashboard

Responsável por apresentar indicadores gerais do sistema.

Funções:

- indicadores;
- gráficos;
- atalhos;
- alertas;
- tarefas.

---

## Empresas

Cadastro das empresas da plataforma.

Funções:

- dados da empresa;
- logotipo;
- configurações;
- planos;
- parâmetros.

---

## Usuários

Controle de acesso.

Funções:

- cadastro;
- perfis;
- permissões;
- operadores;
- autenticação.

---

## Clientes

Cadastro único compartilhado.

Utilizado por:

- ERP;
- CRM;
- PDV;
- Financeiro.

---

## Fornecedores

Cadastro único.

Compartilhado com:

- Compras;
- Produtos;
- Financeiro.

---

## Produtos

Cadastro inteligente.

Recursos:

- GTIN;
- Código de Barras;
- SKU;
- XML;
- Câmera;
- Imagens;
- Estoque.

---

## Estoque

Controle completo.

Planejado:

- entradas;
- saídas;
- ajustes;
- inventário;
- múltiplos depósitos;
- transferências.

---

## PDV

Módulo operacional.

Responsável por:

- vendas;
- caixa;
- pagamentos;
- cupom;
- operadores.

---

## CRM

Relacionamento.

Responsável por:

- leads;
- oportunidades;
- pipeline;
- agenda;
- histórico.

---

## Financeiro

Planejado.

Funções:

- contas a pagar;
- contas a receber;
- fluxo de caixa;
- centros de custo;
- DRE.

---

## Compras

Planejado.

Fluxo:

Fornecedor

↓

Pedido

↓

Recebimento

↓

Estoque

↓

Financeiro

---

## Relatórios

Todos os módulos deverão possuir relatórios próprios.

Exportações:

- PDF;
- Excel.

---

# Módulos Planejados

## Comercial

Controle de:

- orçamentos;
- pedidos;
- negociações;
- contratos.

---

## Ordem de Serviço

Planejada para:

- assistência técnica;
- manutenção;
- serviços.

---

## Produção

Planejada especialmente para empresas gráficas.

Recursos:

- ordens de produção;
- etapas;
- matéria-prima;
- custos;
- apontamentos.

---

## Fiscal

Planejado.

Funções:

- NF-e;
- NFC-e;
- SAT;
- MDF-e;
- SPED.

---

## Agenda

Controle de:

- compromissos;
- visitas;
- tarefas;
- lembretes.

---

## BI

Business Intelligence.

Dashboards:

- financeiro;
- vendas;
- estoque;
- CRM;
- produção.

---

## Portal do Cliente

Planejado.

Recursos:

- pedidos;
- boletos;
- notas;
- produção;
- atendimento.

---

## Portal do Vendedor

Planejado.

Recursos:

- carteira;
- metas;
- pedidos;
- visitas;
- agenda.

---

## Aplicativo Mobile

Perfis:

Administrador

Gerente

Vendedor

Cliente

---

## API Pública

Planejada para integração com sistemas externos.

---

## Marketplace de Integrações

Integrações previstas:

- Mercado Livre;
- Shopee;
- Amazon;
- Nuvemshop;
- Shopify;
- WooCommerce.

---

# Inteligência Artificial

Será um módulo próprio.

Responsável por:

- responder perguntas;
- gerar relatórios;
- prever vendas;
- prever estoque;
- resumir informações;
- sugerir ações;
- automatizar processos.

---

# Módulo Comercial da MiKATECH

Planejamento aprovado.

O sistema deverá possuir futuramente um módulo comercial completo contendo:

- PDV avançado;
- cadastro de produtos;
- estoque;
- vendas;
- caixa;
- leitura de código de barras;
- controle financeiro;
- relatórios;
- gestão comercial.

Este módulo surgiu a partir das necessidades reais da MiKATECH e servirá como referência para futuras implantações em outros clientes.

---

# Prioridades Atuais

Ordem oficial de desenvolvimento:

1. Documentação oficial
2. Ergonomia do PDV
3. Consolidação do ERP
4. CRM
5. Financeiro
6. Compras
7. Relatórios
8. Produção
9. Fiscal
10. Inteligência Artificial

---

# Regra Permanente

Nenhum novo módulo poderá ser iniciado sem:

- documentação;
- definição de objetivo;
- regras de negócio;
- impacto arquitetural;
- atualização deste documento.

---

# Objetivo Final

Transformar o MikaON em uma plataforma empresarial completa, modular e escalável, capaz de atender empresas de diferentes segmentos sem perder simplicidade operacional, desempenho e facilidade de manutenção.