# GUIA DE CONTINUIDADE DO PROJETO MIKAON

> Documento oficial para retomada do projeto em uma nova conversa, por outro desenvolvedor, por outra IA ou após troca de plano.
>
> Este arquivo existe para impedir perda de contexto e garantir que o MikaON continue exatamente do ponto em que parou.

---

# Objetivo

Permitir a continuidade do projeto mesmo quando:

- a conversa atual não estiver mais disponível;
- houver troca de plano;
- o Codex ficar indisponível;
- outro desenvolvedor assumir;
- outra IA precisar continuar;
- houver mudança de computador ou ambiente.

A documentação oficial do projeto deve ser suficiente para recuperar o contexto essencial.

---

# Fonte Oficial de Verdade

A memória principal do MikaON está em:

`docs/mikaon/`

Nenhuma conversa isolada deve ser tratada como fonte principal.

Antes de qualquer desenvolvimento, ler obrigatoriamente:

1. `00_LEIA_PRIMEIRO.md`
2. `01_DOCUMENTO_MESTRE.md`
3. `07_ROADMAP_OFICIAL.md`
4. `09_DECISOES_TECNICAS.md`
5. `08_HISTORICO_DAS_SPRINTS.md`
6. O documento específico do módulo que será alterado

Exemplos:

- PDV: `04_ESPECIFICACAO_PDV.md`
- ERP: `05_ESPECIFICACAO_ERP.md`
- CRM: `06_ESPECIFICACAO_CRM.md`

---

# Local do Projeto

Projeto local principal:

`C:\Projetos\Mikatech\smart-platform`

Branch de desenvolvimento atual:

`connect-v1`

Produção:

`https://smart.mikaon.com.br`

PDV da empresa piloto:

`https://smart.mikaon.com.br/pdv/mikatech`

---

# Como Retomar em uma Nova Conversa

Na nova conversa, enviar esta mensagem:

> Este é o projeto MikaON.
>
> A documentação oficial está na pasta `docs/mikaon` do repositório.
>
> Antes de responder, planejar ou criar qualquer Sprint, leia:
>
> - `docs/mikaon/00_LEIA_PRIMEIRO.md`
> - `docs/mikaon/01_DOCUMENTO_MESTRE.md`
> - `docs/mikaon/07_ROADMAP_OFICIAL.md`
> - `docs/mikaon/08_HISTORICO_DAS_SPRINTS.md`
> - `docs/mikaon/09_DECISOES_TECNICAS.md`
>
> Depois leia o documento do módulo em que vamos trabalhar.
>
> Use essa documentação como fonte oficial e não dependa de conversas anteriores.

Se a nova conversa não tiver acesso ao computador, anexar os documentos principais.

---

# Como Retomar no Codex

Com o projeto aberto no Codex, enviar:

> Antes de iniciar, leia toda a documentação oficial em `docs/mikaon`.
>
> Comece por:
>
> - `00_LEIA_PRIMEIRO.md`
> - `01_DOCUMENTO_MESTRE.md`
> - `09_DECISOES_TECNICAS.md`
> - `07_ROADMAP_OFICIAL.md`
> - `08_HISTORICO_DAS_SPRINTS.md`
>
> Depois leia o documento específico do módulo.
>
> Não implemente nada antes de verificar impactos, dependências e compatibilidade.

---

# Como Retomar no VS Code

1. Abrir o VS Code.
2. Clicar em `Arquivo`.
3. Clicar em `Abrir Pasta`.
4. Selecionar:

`C:\Projetos\Mikatech\smart-platform`

5. Abrir:

`docs/mikaon/00_LEIA_PRIMEIRO.md`

6. Ler a documentação necessária.
7. Abrir o terminal do VS Code.
8. Confirmar a branch com:

```bash
git branch