# GUIA OFICIAL DO BANCO DE DADOS DO MIKAON

> Documento oficial das diretrizes do banco de dados do MikaON.
>
> Toda alteração estrutural deverá seguir este guia.

---

# Objetivo

Garantir que o banco de dados do MikaON permaneça:

- organizado;
- escalável;
- seguro;
- performático;
- fácil de manter.

---

# Tecnologia

Banco oficial:

Supabase PostgreSQL

Toda evolução deverá ser compatível com PostgreSQL.

---

# Filosofia

O banco deverá representar fielmente as regras de negócio.

Nunca utilizar soluções improvisadas.

Sempre priorizar consistência.

---

# Convenções de Nome

Tabelas

Sempre utilizar:

snake_case

Exemplos:

clientes

produtos

pedidos

usuarios

movimentacoes_estoque

---

# Colunas

Sempre utilizar:

snake_case

Exemplos:

cliente_id

created_at

updated_at

deleted_at

valor_total

---

# Chaves Primárias

Toda tabela deverá possuir:

id UUID

Nunca utilizar IDs incrementais para entidades principais.

---

# Auditoria

Sempre que possível utilizar:

created_at

updated_at

created_by

updated_by

deleted_at (quando houver exclusão lógica)

---

# Exclusão

Prioridade:

Soft Delete

Evitar exclusão física.

---

# Relacionamentos

Sempre utilizar Foreign Keys.

Nunca criar relacionamentos apenas na aplicação.

---

# Integridade

Toda regra possível deverá ser protegida pelo banco.

Exemplos:

NOT NULL

CHECK

UNIQUE

FOREIGN KEY

---

# Índices

Criar índices apenas quando houver necessidade comprovada.

Evitar excesso de índices.

---

# Migrations

Toda alteração estrutural deverá possuir migration.

Nunca alterar banco manualmente em produção.

---

# Versionamento

Cada migration deverá:

- possuir nome descritivo;
- ser reversível quando possível;
- ser registrada no histórico.

---

# Performance

Prioridades:

consultas rápidas;

índices corretos;

evitar SELECT * desnecessário;

paginação sempre que aplicável.

---

# Segurança

Utilizar Row Level Security (RLS) sempre que necessário.

As permissões críticas deverão ser protegidas pelo banco.

---

# Multiempresa

Toda tabela operacional deverá prever isolamento por empresa quando aplicável.

O objetivo é suportar operação SaaS com múltiplos clientes.

---

# Histórico

Operações críticas deverão gerar histórico.

Exemplos:

- vendas;
- estoque;
- financeiro;
- caixa;
- alterações cadastrais.

---

# Backup

O banco deverá possuir estratégia de backup periódico.

Procedimentos de restauração deverão ser documentados.

---

# Regras Permanentes

Nunca remover colunas sem análise de impacto.

Nunca alterar tipos de dados sem migration.

Nunca quebrar compatibilidade com versões anteriores sem planejamento.

---

# Objetivo Final

Manter um banco de dados sólido, consistente e preparado para milhares de empresas utilizando o MikaON em ambiente SaaS.
---

# Diretriz complementar do ERP/PDV

Antes de criar novas colunas em Produtos/Estoque, deve-se verificar:

- se o dado ja existe em `erp_pdv_produtos`;
- se o dado ja existe em `erp_pdv_estoques`;
- se o dado e derivado e pode ser calculado sem persistencia adicional.

Markup e margem nao devem gerar colunas duplicadas sem necessidade comprovada.
