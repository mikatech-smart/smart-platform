# PADRÕES OFICIAIS DE DESENVOLVIMENTO DO MIKAON

> Documento oficial dos padrões de desenvolvimento do MikaON.
>
> Todo código implementado deverá seguir estas regras.
> Este documento é obrigatório para qualquer desenvolvedor ou IA que trabalhe no projeto.

---

# Objetivo

Garantir que todo o código do MikaON mantenha:

- organização;
- padronização;
- legibilidade;
- facilidade de manutenção;
- escalabilidade.

Nenhuma Sprint poderá ignorar este documento.

---

# Filosofia

O MikaON será desenvolvido para durar muitos anos.

Portanto:

Sempre pensar primeiro na arquitetura.

Depois na simplicidade.

Depois na implementação.

Nunca o contrário.

---

# Princípios Gerais

Sempre:

- reutilizar componentes;
- reutilizar serviços;
- reutilizar tipos;
- reutilizar utilitários.

Nunca duplicar código.

Nunca criar soluções temporárias permanentes.

Nunca adicionar complexidade desnecessária.

---

# Organização de Pastas

Cada módulo deverá manter estrutura semelhante:

pages/

components/

services/

hooks/

contexts/

types/

utils/

styles/

---

# Componentes React

Cada componente deverá possuir responsabilidade única.

Evitar componentes muito grandes.

Sempre dividir quando necessário.

Preferir composição.

---

# TypeScript

Obrigatório.

Não utilizar:

any

salvo quando extremamente necessário e documentado.

Sempre tipar:

- props;
- estados;
- serviços;
- respostas da API;
- eventos.

---

# CSS

Prioridades:

- reutilização;
- classes organizadas;
- evitar duplicação;
- responsividade.

Evitar estilos inline.

---

# Responsividade

Todo novo componente deverá funcionar em:

- Desktop
- Notebook
- Tablet
- Mobile

A prioridade continua sendo Desktop Comercial.

---

# Serviços

Toda regra de negócio deverá permanecer nos serviços.

Evitar lógica complexa dentro da interface.

---

# Componentes Compartilhados

Sempre verificar se já existe componente semelhante antes de criar outro.

Exemplos:

- Modal
- Input
- Botão
- Select
- Tabela
- Card
- Toast
- Loader

---

# Nomeação

Arquivos:

PascalCase para componentes.

camelCase para utilitários.

Exemplos:

ClienteForm.tsx

ProdutoCard.tsx

erpPdv.service.ts

formatCurrency.ts

---

# Comentários

Evitar comentários desnecessários.

O código deve ser autoexplicativo.

Quando necessário, comentar apenas regras de negócio complexas.

---

# Imports

Organizar na seguinte ordem:

1. Bibliotecas externas

2. Componentes

3. Hooks

4. Contextos

5. Serviços

6. Tipos

7. Utilitários

8. CSS

---

# ESLint

Sempre corrigir erros.

Warnings poderão existir apenas quando previamente conhecidos e aceitos.

---

# TypeScript

Build deverá permanecer sem erros.

Nenhuma Sprint poderá introduzir novos erros.

---

# Build

Antes de concluir qualquer Sprint executar obrigatoriamente:

git diff --check

npm run build

Caso falhe:

Corrigir antes do commit.

---

# Git

Cada Sprint deverá possuir:

Um único commit representando aquela Sprint.

Mensagem curta.

Objetiva.

Exemplos:

Refina ergonomia do PDV

Implementa pagamento misto

Cria assistente de produtos

---

# Commits

Evitar mensagens genéricas como:

update

fix

teste

ajustes

Sempre informar claramente o objetivo.

---

# Deploy

Após push:

Validar produção.

Confirmar:

- HTTP 200
- Bundle atualizado
- Tela funcionando

---

# Testes

Toda Sprint deverá validar:

Desktop

Notebook

Mobile

Build

Permissões

Fluxo principal

Quando aplicável:

Banco

Migration

API

---

# Documentação

Nenhuma Sprint será considerada encerrada enquanto:

- documentação não estiver atualizada;
- decisões permanentes não forem registradas;
- roadmap não refletir a alteração.

---

# Regras para IA

ChatGPT

Responsável por:

- arquitetura;
- documentação;
- revisão técnica;
- planejamento;
- UX;
- organização das Sprints.

Codex

Responsável por:

- implementação;
- build;
- testes;
- commit;
- push;
- deploy.

---

# Critérios de Qualidade

Antes de concluir uma Sprint responder:

O código ficou mais simples?

Está reutilizando componentes?

Quebrou alguma funcionalidade?

Criou duplicação?

Melhorou a experiência do usuário?

Está documentado?

Se qualquer resposta for negativa, revisar a Sprint.

---

# Objetivo Final

Construir um código limpo, consistente e sustentável, permitindo que o MikaON evolua continuamente sem perda de qualidade, independentemente da equipe de desenvolvimento.

---

# Sprint 180 - Data Grid reutilizavel

O componente DataGrid deve receber colunas tipadas, registros, chave estavel, selecao e estado vazio. A grade nao deve conhecer regras de negocio, deve renderizar apenas a pagina atual e deve manter rolagem interna quando a largura exigir.
