# CHECKLIST OFICIAL DE DEPLOY DO MIKAON

> Documento oficial do processo de publicação do MikaON.
>
> Nenhuma Sprint poderá ser considerada concluída sem seguir este checklist.

---

# Objetivo

Padronizar todo o processo de build, validação, commit, push e deploy do MikaON.

O objetivo é reduzir erros humanos, garantir rastreabilidade e assegurar que toda publicação em produção seja confiável.

---

# Filosofia

Toda Sprint deverá seguir exatamente o mesmo fluxo.

Nunca publicar código sem validação.

Nunca realizar deploy sem build.

Nunca realizar push sem documentação atualizada.

---

# Fluxo Oficial

Planejamento

↓

Implementação

↓

Testes

↓

Build

↓

Commit

↓

Push

↓

Deploy

↓

Validação em Produção

↓

Atualização da Documentação

---

# Checklist de Desenvolvimento

Antes do build confirmar:

☐ Objetivo da Sprint concluído

☐ Código revisado

☐ Sem duplicação de código

☐ Componentes reutilizados

☐ Sem comentários desnecessários

☐ Sem arquivos temporários

☐ Sem código morto

☐ Sem console.log de desenvolvimento

☐ TypeScript corrigido

☐ ESLint corrigido

---

# Build

Executar obrigatoriamente:

```bash
git diff --check
```

Depois:

```bash
npm run build
```

Resultado esperado:

✔ Build concluído sem erros.

Warnings conhecidos poderão existir apenas quando previamente aprovados.

---

# Testes

Executar:

☐ Fluxo principal

☐ Fluxos secundários

☐ Permissões

☐ Responsividade

☐ Desktop

☐ Notebook

☐ Mobile

☐ Build

☐ Sem overflow horizontal

☐ Sem erros críticos

---

# Banco de Dados

Quando houver migration:

☐ Migration criada

☐ Migration testada

☐ Compatibilidade validada

☐ Banco atualizado

Caso não exista migration:

Registrar:

"Nenhuma migration necessária."

---

# Commit

Todo commit deverá possuir mensagem clara.

Exemplos:

Refina ergonomia do PDV

Implementa pagamento misto

Cria assistente inteligente de produtos

Nunca utilizar:

update

teste

fix

ajustes

commit

---

# Push

Após o commit:

```bash
git push origin connect-v1
```

Confirmar:

✔ Push realizado.

---

# Deploy

Após o push:

Validar:

☐ Deploy iniciado

☐ Deploy concluído

☐ Produção atualizada

---

# Validação em Produção

Sempre validar:

HTTP 200

Bundle novo

CSS novo

Tela carregando

Sem erro crítico no console

Sem quebra visual

Sem overflow

---

# Quando houver alterações no PDV

Validar:

☐ Operador

☐ Cliente

☐ Produto

☐ Carrinho

☐ Pagamento

☐ Cupom

☐ WhatsApp

☐ Impressão

☐ PDF

---

# Quando houver alterações no ERP

Validar:

☐ Cadastro

☐ Pesquisa

☐ Edição

☐ Exclusão

☐ Permissões

☐ Relatórios

---

# Quando houver alterações no CRM

Validar:

☐ Leads

☐ Pipeline

☐ Agenda

☐ Histórico

☐ WhatsApp

---

# Arquivos Alterados

Toda Sprint deverá informar:

Arquivos alterados

Migration

Build

Testes

Commit

Deploy

Resultado

---

# Documentação

Antes de encerrar a Sprint confirmar:

☐ Documento atualizado

☐ Roadmap atualizado (quando necessário)

☐ Decisões Técnicas atualizadas

☐ Histórico das Sprints atualizado

---

# Modelo Oficial de Encerramento

Toda Sprint deverá finalizar informando:

Objetivo

Arquivos alterados

Implementação

Testes

Commit

Deploy

Resultado

---

# Critério para considerar uma Sprint concluída

Uma Sprint somente será considerada concluída quando:

✔ Código implementado

✔ Build aprovado

✔ Testes executados

✔ Deploy validado

✔ Documentação atualizada

✔ Commit registrado

✔ Push realizado

---

# Objetivo Final

Garantir que toda publicação do MikaON siga um padrão único, seguro, rastreável e reproduzível, reduzindo riscos em produção e facilitando a manutenção do projeto.