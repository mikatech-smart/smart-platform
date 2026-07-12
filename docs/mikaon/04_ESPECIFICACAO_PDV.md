# ESPECIFICAÇÃO OFICIAL DO PDV MIKAON

> Documento oficial da Frente de Caixa (PDV).
>
> Toda alteração no PDV deverá respeitar esta especificação.
> Nenhuma Sprint poderá modificar o comportamento operacional sem atualização deste documento.

---

# Objetivo

Construir uma Frente de Caixa extremamente rápida, intuitiva e preparada para operação comercial durante todo o dia.

O operador deve conseguir vender praticamente sem utilizar o mouse.

A tela deve priorizar velocidade, simplicidade e produtividade.

---

# Filosofia

O PDV NÃO é um ERP.

O PDV NÃO é um módulo administrativo.

O PDV é exclusivamente operacional.

Tudo o que não contribuir diretamente para realizar uma venda deverá permanecer fora da tela principal.

---

# Fluxo Oficial

Fluxo obrigatório:

Selecionar Operador

↓

Selecionar Cliente

↓

Pesquisar Produto

↓

Adicionar ao Carrinho

↓

Receber Pagamento

↓

Concluir Pagamento

↓

Visualizar Cupom

↓

Nova Venda

---

# Operador

Ao abrir:

/pdv/:slug

O sistema deverá abrir obrigatoriamente um modal para seleção do operador.

O operador será carregado com:

- perfil
- permissões
- tabela de preço
- empresa
- módulo inicial

A sessão permanecerá ativa até:

- trocar operador
- logout
- encerramento da sessão

---

# Layout

O PDV será dividido em duas áreas.

## Coluna Esquerda

Operação.

Contém:

- Cliente
- Produto
- Carrinho

Será sempre a maior área da tela.

---

## Coluna Direita

Financeiro.

Contém:

- Resumo
- Pagamentos
- Total
- Concluir Pagamento

Nunca deverá crescer conforme a venda.

---

# Pesquisa de Cliente

Pesquisa automática.

Sem botão Buscar.

Pesquisar por:

- Nome
- CPF
- CNPJ
- Telefone

Tempo real.

---

# Pesquisa de Produto

Pesquisa automática.

Sem botão Buscar.

Pesquisar por:

- Nome
- Código
- SKU
- GTIN
- Código de barras

Tempo real.

---

# Operação por Teclado

O foco deverá permanecer sempre na pesquisa.

Após adicionar um produto:

- limpar pesquisa
- devolver foco automaticamente

---

# Carrinho

O carrinho representa o centro da operação.

Toda a tela existe para alimentar o carrinho.

---

# Estrutura do Carrinho

Cada produto deverá ocupar apenas uma linha.

Modelo oficial:

Produto................R$ 59,90   - 2 + ×

Padrão visual validado na Sprint 175:

- nome em uma única linha com reticências;
- valor total da linha alinhado à direita;
- controles pequenos e fixos no lado direito;
- remoção apenas por `×`;
- sem botões expansivos;
- sem segunda linha de informações.

Nunca utilizar:

- cards altos
- imagens grandes
- botões grandes
- duas linhas por produto
- excesso de informações

---

# Informações do Item

Exibir apenas:

- Nome
- Valor da linha
- Diminuir
- Quantidade
- Aumentar
- Remover

Não exibir:

- Unitário
- Subtotal
- Cliente
- Categoria

---

# Densidade

Objetivo mínimo:

1366x768

Visualizar entre 10 e 12 itens.

1920x1080

Visualizar entre 14 e 16 itens.

Rolagem apenas dentro do carrinho.

Nunca na página inteira.

---

# Cliente

O cliente poderá ser:

Consumidor Final

ou

Cliente Cadastrado.

---

# Pagamentos

Suportados:

- Dinheiro
- PIX
- Débito
- Crédito
- Vale-Troca
- Outros

---

# Pagamento Misto

Permitir qualquer combinação válida.

Cada forma armazenará:

- tipo
- valor

---

# Dinheiro

Campos:

Valor Recebido

Troco

O troco será calculado automaticamente.

---

# Crédito

Permitir:

1x até 12x.

Preparado para:

- TEF
- NSU
- Bandeira

---

# PIX

Preparado para:

QR Code

Confirmação automática

Integração bancária

---

# Botão Principal

Concluir Pagamento.

Sempre destacado.

Sempre visível.

Nunca sair da área visível do monitor.

---

# Cupom

Ao concluir:

Abrir visualização.

Nunca imprimir automaticamente.

---

# Modal do Cupom

Botões oficiais:

- Imprimir
- Salvar PDF
- Enviar por WhatsApp
- Fechar

---

# WhatsApp

Quando houver telefone:

Abrir diretamente a conversa.

Quando não houver:

Abrir WhatsApp para seleção do contato.

---

# Vendas Suspensas

Permitir:

- suspender
- retomar
- excluir

Sempre preservar:

- operador
- cliente
- itens
- pagamentos iniciados

---

# Atalhos

Atalhos aprovados:

F2

Pesquisar Produto

F4

Concluir Venda

F6

Selecionar Cliente

F7

Reservado para funções futuras compatíveis

F8

Cancelar/Limpar Venda

F9

Abrir Menu

F10

Tela Cheia

Enter

Adicionar Produto

ESC

Fechar modal / cancelar operação

Setas ↑↓

Navegar resultados

---

# Ajuda de Atalhos

A ajuda deverá abrir um painel real.

Nunca apenas alterar o texto do botão.

Listar apenas atalhos realmente implementados.

---

# Interface

A interface deverá seguir:

- alta densidade
- poucos espaços vazios
- componentes compactos
- leitura rápida
- foco na venda

Nunca desperdiçar espaço.

---

# Responsividade

Desktop

Prioridade máxima.

Notebook

Obrigatório.

Tablet

Compatível.

Celular

Uso secundário.

---

# Integrações Futuras

Planejadas:

- NFC-e
- SAT
- Impressora térmica 58 mm
- Impressora térmica 80 mm
- Gaveta
- Display Cliente
- Leitor Código de Barras
- QR Code
- PIX Automático
- TEF
- Operação Offline

---

# Objetivo Final

Construir um PDV capaz de competir com os principais sistemas comerciais do mercado, mantendo operação simples, rápida e extremamente produtiva.

Toda Sprint deverá aproximar o PDV desse objetivo.
