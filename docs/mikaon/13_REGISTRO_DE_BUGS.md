# REGISTRO OFICIAL DE BUGS DO MIKAON

> Documento oficial de rastreamento de bugs.
>
> Todo bug identificado deverá ser registrado neste documento antes da correção, sempre que houver relevância funcional.

---

# Objetivo

Centralizar todos os bugs encontrados durante o desenvolvimento do MikaON.

Este documento servirá para:

- evitar regressões;
- registrar causa raiz;
- acompanhar correções;
- facilitar futuras manutenções.

---

# Classificação

Cada bug deverá possuir:

ID

Data

Sprint

Módulo

Prioridade

Status

Descrição

Causa

Solução

---

# Prioridades

## Crítica

Impede utilização do sistema.

Exemplos:

- perda de dados;
- venda incorreta;
- estoque incorreto;
- falha financeira.

---

## Alta

Funcionalidade importante comprometida.

---

## Média

Problema operacional com solução alternativa.

---

## Baixa

Problema visual ou pequeno ajuste.

---

# Status

Aberto

Em andamento

Corrigido

Cancelado

---

# Modelo

ID

BUG-0001

Sprint

000

Módulo

PDV

Prioridade

Alta

Status

Corrigido

Descrição

...

Causa

...

Solução

...

---

# Histórico

## BUG-0001

Sprint

164

Módulo

PDV

Descrição

Operador não permanecia selecionado após atualização da página.

Status

Corrigido.

---

## BUG-0002

Sprint

172

Módulo

PDV

Descrição

Ajuda de atalhos ocultava o menu, mas não abria o painel de atalhos.

Status

Corrigido.

---

## BUG-0003

Sprint

174

Módulo

PDV

Descrição

Carrinho ficou maior do que o esperado após tentativa de compactação.

Status

Corrigido parcialmente.

Observação

A ergonomia continuará sendo refinada nas próximas Sprints.

---

## BUG-0004

Sprint

174

Módulo

PDV

Descrição

Cartões de pagamento mudavam de altura quando eram utilizadas múltiplas formas de pagamento.

Status

Corrigido.

---

# Regras

Nunca apagar um bug.

Caso seja resolvido:

Alterar apenas o Status.

Adicionar observações quando necessário.

---

# Objetivo Final

Construir uma base histórica de qualidade do MikaON, permitindo identificar rapidamente problemas recorrentes e evitar regressões em futuras versões.