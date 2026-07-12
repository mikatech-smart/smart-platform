# REGRAS DE NEGÓCIO DO MIKAON

> Este documento centraliza todas as regras permanentes do sistema.
>
> Nenhuma Sprint poderá alterar qualquer regra descrita aqui sem atualização deste documento.

---

# Objetivo

Definir as regras oficiais de funcionamento do MikaON.

Este documento deverá ser consultado antes de qualquer alteração no sistema.

---

# Princípios Gerais

O MikaON é um sistema único dividido em módulos.

Todos os módulos compartilham a mesma base de dados.

Nunca existirão cadastros duplicados.

Toda informação deverá possuir apenas uma origem.

---

# Multiempresa

O MikaON é um sistema SaaS multiempresa.

Toda informação pertence obrigatoriamente a uma empresa.

Toda consulta deverá considerar:

- empresa
- usuário
- permissões

Jamais misturar informações entre empresas.

---

# Cadastro Único

Clientes

Fornecedores

Produtos

Usuários

Empresas

Categorias

Marcas

Sempre existirão apenas uma vez.

ERP, CRM e PDV utilizarão os mesmos cadastros.

---

# Usuários

Cada usuário possuirá:

- empresa
- perfil
- permissões
- módulos liberados
- operações permitidas

---

# Perfis

Inicialmente:

- Administrador
- Gerente
- Caixa
- Vendedor Varejo
- Vendedor Atacado
- Estoque

Novos perfis poderão ser criados futuramente.

---

# Permissões

Toda permissão deverá controlar:

- visualizar
- criar
- editar
- excluir
- cancelar
- imprimir
- exportar

Nunca controlar permissões apenas escondendo botões.

Toda validação deverá existir também na regra de negócio.

---

# Produtos

Cada produto possuirá cadastro único.

Suportará:

- Código interno
- SKU
- GTIN
- Código de barras
- Nome
- Categoria
- Marca
- Fabricante
- Fornecedor
- Unidade
- NCM
- Peso
- Dimensões
- Estoque
- Estoque mínimo
- Estoque máximo
- Imagens

---

# Estoque

O estoque será único.

Toda movimentação deverá gerar histórico.

Tipos previstos:

- Entrada
- Saída
- Ajuste
- Inventário
- Produção (futuro)
- Transferência (futuro)

---

# Clientes

O cliente poderá ser:

- Consumidor Final
- Cliente cadastrado

O cadastro será compartilhado entre:

- ERP
- CRM
- PDV
- Financeiro

---

# Vendas

Toda venda deverá possuir:

- operador
- empresa
- cliente
- itens
- pagamentos
- histórico
- data
- hora

Nunca apagar uma venda.

Cancelamentos deverão permanecer registrados.

---

# Pagamentos

Formas aprovadas:

- Dinheiro
- PIX
- Débito
- Crédito
- Vale-Troca
- Outros

Permitir pagamento misto.

---

# Dinheiro

Quando houver dinheiro:

Operador informa:

Valor recebido.

Sistema calcula automaticamente:

- troco
- saldo

---

# Crédito

Permitir:

1x até 12x.

Preparado para:

- TEF
- Bandeira
- NSU

---

# PIX

Preparado para:

- QR Code
- Confirmação automática
- Integração bancária

---

# Cupom

Toda venda concluída gera:

Cupom Não Fiscal.

Permitir:

- visualizar
- imprimir
- salvar PDF
- enviar WhatsApp

---

# WhatsApp

Quando houver telefone válido:

Abrir diretamente a conversa.

Caso contrário:

Abrir WhatsApp permitindo escolha do contato.

---

# PDV

O PDV é um módulo operacional.

Nunca deverá possuir funções administrativas.

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

---

# ERP

Responsável por:

- produtos
- estoque
- compras
- financeiro
- relatórios
- administração

---

# CRM

Responsável por:

- leads
- pipeline
- oportunidades
- relacionamento
- pós-venda
- agenda
- automações

---

# Auditoria

Registrar obrigatoriamente:

- usuário
- data
- operação
- empresa

---

# Regras Imutáveis

Nunca:

- duplicar cadastro
- quebrar compatibilidade
- remover regra de negócio sem autorização
- alterar banco sem necessidade

Sempre:

- reutilizar componentes
- manter documentação atualizada
- preservar histórico
- preservar rastreabilidade

---

# Atualização deste documento

Sempre que uma regra permanente for criada ou alterada, este documento deverá ser atualizado antes da conclusão da Sprint.