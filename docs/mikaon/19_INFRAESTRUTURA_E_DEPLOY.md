# INFRAESTRUTURA E DEPLOY DO MIKAON

> Documento oficial da infraestrutura e publicação do MikaON.
>
> Este documento descreve a arquitetura de hospedagem, ambientes, deploy, monitoramento e boas práticas operacionais.

---

# Objetivo

Padronizar toda a infraestrutura do MikaON.

Garantir que qualquer desenvolvedor consiga compreender como o sistema é publicado e mantido.

---

# Filosofia

A infraestrutura deverá ser:

- simples;
- segura;
- escalável;
- automatizada;
- monitorável.

Sempre priorizar estabilidade.

---

# Ambientes

O MikaON deverá possuir três ambientes oficiais.

## Desenvolvimento

Utilizado para implementação das Sprints.

Características:

- banco de desenvolvimento;
- testes locais;
- debug liberado.

---

## Homologação (Futuro)

Ambiente intermediário.

Objetivo:

- validar funcionalidades;
- executar testes finais;
- aprovar antes da produção.

---

## Produção

Ambiente utilizado pelos clientes.

Regras:

- máxima estabilidade;
- monitoramento contínuo;
- backups;
- alta disponibilidade.

---

# Front-end

Tecnologia oficial:

- React
- TypeScript
- Vite

---

# Backend

Atualmente:

Supabase

Arquitetura preparada para futura evolução.

---

# Banco de Dados

Tecnologia oficial:

PostgreSQL (Supabase)

---

# Armazenamento

Utilizar:

Supabase Storage

para:

- imagens;
- documentos;
- anexos;
- logotipos.

---

# Autenticação

Responsabilidade:

Supabase Auth.

Preparado para futuras integrações com:

- Google;
- Microsoft;
- Apple;
- autenticação corporativa.

---

# Deploy

Fluxo oficial:

Desenvolvimento

↓

Commit

↓

Push

↓

Deploy Automático

↓

Validação

↓

Produção

---

# Branch Principal

Atualmente:

connect-v1

Toda Sprint deverá utilizar esta branch até definição de nova estratégia de versionamento.

---

# Build

Executar obrigatoriamente:

```bash
git diff --check
npm run build
```

Antes do commit.

---

# Deploy Automático

Após o push:

Validar:

- HTTP 200;
- bundle atualizado;
- CSS atualizado;
- aplicação carregando corretamente.

---

# Monitoramento

Objetivos futuros:

- monitoramento de erros;
- monitoramento de performance;
- monitoramento de disponibilidade.

Ferramentas poderão ser adicionadas futuramente.

---

# Logs

Registrar:

- erros críticos;
- falhas de integração;
- operações importantes;
- exceções.

---

# Backup

O banco deverá possuir rotina de backup.

Procedimentos de restauração deverão ser documentados.

---

# Segurança

Obrigatório:

- HTTPS;
- autenticação;
- controle de permissões;
- proteção contra acesso não autorizado.

---

# Escalabilidade

A infraestrutura deverá permitir crescimento gradual.

Preparada para:

- milhares de empresas;
- múltiplas filiais;
- aumento de usuários;
- aumento de volume de dados.

---

# Disponibilidade

Objetivo:

Alta disponibilidade.

Sempre minimizar indisponibilidades durante atualizações.

---

# Publicação

Nenhuma Sprint poderá ser publicada sem:

- build aprovado;
- testes executados;
- documentação atualizada;
- validação em produção.

---

# Recuperação

Toda alteração crítica deverá permitir retorno rápido caso seja identificada falha em produção.

---

# Objetivo Final

Manter uma infraestrutura robusta, segura e preparada para suportar a evolução do MikaON como plataforma SaaS comercial de nível internacional.