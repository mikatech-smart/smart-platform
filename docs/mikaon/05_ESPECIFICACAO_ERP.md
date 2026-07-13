# ESPECIFICAÇÃO OFICIAL DO ERP MIKAON

> Documento oficial do módulo ERP.
>
> Este documento define a arquitetura funcional, os módulos administrativos e as regras gerais do ERP.
> Toda alteração deverá respeitar esta especificação.

---

# Objetivo

O ERP é o núcleo administrativo do MikaON.

Sua função é controlar toda a gestão operacional e administrativa da empresa utilizando uma única base de dados compartilhada com CRM e PDV.

---

# Filosofia

O ERP deverá priorizar:

- produtividade;
- simplicidade;
- organização;
- rapidez;
- estabilidade;
- alta densidade de informação.

O usuário administrativo permanece muitas horas utilizando o sistema.

A interface deve reduzir cliques e facilitar o trabalho diário.

---

# Estrutura Geral

O ERP será composto pelos seguintes módulos:

- Dashboard
- Comercial
- Clientes
- Fornecedores
- Produtos
- Estoque
- Compras
- Financeiro
- Ordem de Serviço
- Produção (futuro)
- Fiscal (futuro)
- Relatórios
- Configurações
- Administração

Todos compartilharão a mesma base de dados.

---

# Dashboard

Exclusivo para usuários administrativos.

Objetivo:

Apresentar rapidamente a situação da empresa.

Indicadores previstos:

- faturamento do dia;
- faturamento do mês;
- vendas;
- pedidos;
- fluxo de caixa;
- contas a pagar;
- contas a receber;
- produtos sem estoque;
- produtos abaixo do estoque mínimo;
- alertas;
- indicadores comerciais.

---

# Clientes

Cadastro único.

Compartilhado entre:

- ERP
- CRM
- PDV
- Financeiro

Nunca criar cadastros duplicados.

Campos previstos:

- Pessoa Física
- Pessoa Jurídica
- Telefones
- WhatsApp
- E-mail
- Endereço
- Observações

---

# Fornecedores

Cadastro único.

Compartilhado com:

- Compras
- Produtos
- Financeiro

---

# Produtos

Cadastro único.

Campos previstos:

- Código interno
- SKU
- GTIN
- Código de barras
- Nome
- Descrição
- Categoria
- Marca
- Fabricante
- Fornecedor principal
- Unidade
- NCM
- Peso
- Dimensões
- Imagens
- Estoque
- Estoque mínimo
- Estoque máximo
- Localização

---

# Cadastro Inteligente

O cadastro deverá permitir:

- leitura por código de barras;
- leitura pela câmera;
- importação por XML;
- cadastro manual.

Antes de criar um produto, o sistema deverá pesquisar automaticamente por:

- GTIN;
- Código;
- SKU.

Caso exista, abrir o cadastro existente.

Caso não exista, iniciar um novo cadastro.

---

# Estoque

O estoque será único.

Movimentações previstas:

- Entrada
- Saída
- Ajuste
- Inventário
- Produção (futuro)
- Transferência (futuro)

Toda movimentação deverá gerar histórico.

Perfil operacional de Estoque:

- acessar módulo de Produtos/Estoque;
- listar e pesquisar produtos;
- cadastrar e editar produtos permitidos;
- registrar entrada, saída e ajuste;
- consultar estoque atual, mínimo e histórico.

Esse perfil não realiza venda, não opera caixa e não acessa financeiro.

---

# Compras

Fluxo:

Fornecedor

↓

Pedido de Compra

↓

Recebimento

↓

Conferência

↓

Entrada de Estoque

↓

Financeiro

---

# Financeiro

Controlará:

- Contas a Pagar
- Contas a Receber
- Fluxo de Caixa
- Centros de Custo
- Categorias Financeiras
- Conciliação (futuro)

---

# Comercial

Responsável por:

- Orçamentos
- Pedidos
- Conversão em venda
- Histórico

---

# Ordem de Serviço

Preparado para:

- manutenção;
- assistência técnica;
- serviços.

Compartilhará:

- clientes;
- produtos;
- estoque.

---

# Pesquisa

Todas as telas deverão possuir pesquisa em tempo real.

Nunca depender exclusivamente de botão "Buscar".

---

# Listagens

As listagens deverão priorizar:

- muitas linhas visíveis;
- filtros rápidos;
- paginação;
- ações discretas;
- alta produtividade.

---

# Modais

Sempre que possível:

cadastros e edições ocorrerão em modal.

Evitar troca desnecessária de páginas.

---

# Relatórios

Todo relatório deverá permitir:

- filtros;
- impressão;
- exportação PDF;
- exportação Excel.

---

# Permissões

Cada módulo deverá controlar:

- visualizar;
- criar;
- editar;
- excluir;
- imprimir;
- exportar.

As permissões deverão ser granulares.

---

# Auditoria

Registrar obrigatoriamente:

- usuário;
- empresa;
- operação;
- data;
- hora.

---

# Integração com PDV

O ERP será responsável por:

- produtos;
- estoque;
- preços;
- usuários;
- permissões.

O PDV apenas consumirá essas informações.

---

# Integração com CRM

Clientes, produtos e histórico deverão ser compartilhados.

Nunca duplicar informações.

---

# Escalabilidade

O ERP deverá suportar futuramente:

- múltiplas empresas;
- múltiplas filiais;
- múltiplos depósitos;
- múltiplos caixas.

---

# Padrão Visual

O ERP seguirá identidade própria do MikaON.

Características:

- interface moderna;
- poucos ícones grandes;
- alta densidade de informação;
- excelente aproveitamento da tela;
- componentes alinhados;
- produtividade acima da estética.

---

# Objetivo Final

Construir um ERP moderno, rápido e altamente escalável, preparado para atender desde pequenas empresas até operações complexas, mantendo simplicidade para o usuário e uma arquitetura consistente para evolução contínua.

---

# Complemento operacional de Produtos/Estoque

O modulo operacional de Produtos/Estoque deve adotar:

- pesquisa fixa e sempre visivel;
- filtros compactos no topo;
- paginacao da listagem;
- tabela compacta em vez de cards altos;
- edicao em painel lateral;
- formacao de precos com custo, varejo, atacado, markup e margem.

---

# Padrao visual oficial de Produtos/Estoque

A area operacional de Produtos/Estoque deve reutilizar o mesmo padrao visual do PDV.

Diretrizes:

- fundo principal claro;
- linhas brancas ou cinza muito suave;
- selecao em verde-claro discreto;
- cabecalho com destaque moderado;
- selos pequenos para status;
- painel lateral branco, com bordas leves e campos compactos.
