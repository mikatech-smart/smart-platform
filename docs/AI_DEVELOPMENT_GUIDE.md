# MANUAL OFICIAL DE DESENVOLVIMENTO

## MikaON

### Versão 1.0

**Este documento passa a ser a referência permanente para todas as futuras implementações da MikaON.**

Sempre que iniciar uma nova Sprint, considere este manual como prioridade máxima.

---

# 1. VISÃO DO PRODUTO

A MikaON é uma plataforma SaaS modular desenvolvida para pequenos empreendedores.

Toda implementação deve respeitar estes princípios:

* simplicidade acima de tudo;
* interface intuitiva;
* mobile first;
* arquitetura escalável;
* componentes reutilizáveis;
* poucos cliques para executar qualquer tarefa;
* visual moderno, premium e internacional.

Sempre perguntar antes de implementar:

> Existe uma forma mais simples para o usuário utilizar esta funcionalidade?

Se existir, implementar a solução mais simples.

---

# 2. FILOSOFIA DE DESENVOLVIMENTO

O objetivo nunca será apenas concluir uma Sprint.

O objetivo é construir uma plataforma preparada para milhares de empresas.

Toda implementação deve priorizar:

* arquitetura;
* estabilidade;
* reutilização;
* escalabilidade;
* manutenção futura.

Quando existir conflito entre rapidez e qualidade da arquitetura:

**Sempre priorizar a arquitetura.**

---

# 3. FERRAMENTAS DISPONÍVEIS

O ambiente do Codex possui as seguintes integrações oficiais.

## Desenvolvimento

* GitHub
* Supabase
* Chrome
* Figma
* Cloudflare

## Documentação

* Google Drive
* Documents
* PDF
* Spreadsheets
* Presentations

## Futuras

* Stripe
* Codex Security

Sempre avaliar se alguma dessas ferramentas pode melhorar a Sprint antes de iniciar a implementação.

---

# 4. UTILIZAÇÃO DAS FERRAMENTAS

## GitHub

Utilizar para:

* compreender arquitetura;
* consultar histórico;
* entender componentes compartilhados;
* revisar alterações;
* evitar regressões.

Nunca alterar componentes compartilhados sem antes entender onde são utilizados.

---

## Supabase

Sempre consultar antes de alterar qualquer estrutura do banco.

Verificar:

* tabelas;
* colunas;
* tipos;
* relacionamentos;
* constraints.

Nunca assumir que uma coluna existe.

Caso seja necessária alteração estrutural, informar exatamente:

* nome da coluna;
* tipo;
* valor padrão;
* motivo.

Nunca executar alterações destrutivas sem autorização.

---

## Chrome

Após qualquer Sprint visual, validar:

* Desktop
* Tablet
* Mobile
* Responsividade
* Espaçamentos
* Overflow
* Scroll
* Hero
* Botões
* Preview
* Links
* Performance visual

Nenhuma Sprint visual poderá ser considerada concluída sem essa validação.

---

## Figma

Sempre consultar quando a Sprint envolver:

* Dashboard
* Página Pública
* Painel do Cliente
* Landing Page
* Marketplace de Temas
* UX
* UI
* Componentes visuais

Objetivo:

Manter consistência visual.

---

## Cloudflare

Utilizar quando houver:

* Deploy
* Cloudflare Pages
* DNS
* SSL
* Cache
* Domínio personalizado
* White Label

---

## Google Drive

Consultar quando houver:

* documentos;
* manuais;
* apresentações;
* imagens;
* contratos;
* planilhas.

---

# 5. ARQUITETURA

Antes de implementar qualquer funcionalidade:

1. Analisar a arquitetura existente.

2. Identificar componentes reutilizáveis.

3. Verificar se já existe implementação semelhante.

4. Evitar duplicação.

5. Reutilizar componentes sempre que possível.

6. Centralizar regras de negócio.

7. Pensar na solução como parte da plataforma e não apenas da Sprint atual.

---

# 6. REGRESSÕES

Antes de alterar qualquer componente:

Identificar:

* quais telas utilizam esse componente;
* quais módulos utilizam esse componente;
* quais funcionalidades poderão ser impactadas.

Após implementar:

Validar todas as telas relacionadas.

Nunca reintroduzir código removido.

Nunca voltar padrões antigos aprovados.

Nunca quebrar funcionalidades existentes.

---

# 7. COMPONENTES

Sempre:

* reutilizar;
* modularizar;
* componentizar.

Nunca:

* duplicar componentes;
* duplicar lógica;
* copiar código.

Preferir sempre configuração em vez de duplicação.

---

# 8. EXPERIÊNCIA DO USUÁRIO (UX)

O cliente da Mikatech não é designer.

Portanto:

* evitar excesso de opções;
* evitar excesso de configurações;
* evitar excesso de cores;
* evitar excesso de botões.

Sempre preferir:

* temas prontos;
* configurações automáticas;
* poucos cliques.

A plataforma deve ser intuitiva.

---

# 9. PADRÃO VISUAL

Toda interface deve seguir:

* moderna;
* limpa;
* premium;
* internacional;
* minimalista.

Evitar:

* poluição visual;
* excesso de informações;
* excesso de elementos.

---

# 10. RESPONSIVIDADE

Toda implementação deve funcionar corretamente em:

* Desktop
* Tablet
* Mobile

Sem exceções.

---

# 11. PERFORMANCE

Sempre priorizar:

* componentes leves;
* poucas requisições;
* reutilização;
* lazy loading quando necessário;
* evitar renderizações desnecessárias.

---

# 12. SEGURANÇA

Nunca:

* expor chaves;
* deixar credenciais no código;
* assumir permissões;
* remover validações.

Sempre seguir boas práticas.

---

# 13. BANCO DE DADOS

Antes de solicitar alterações no banco:

Consultar a estrutura existente no Supabase.

Quando precisar alterar:

Informar exatamente:

* nome da coluna;
* tipo;
* valor padrão;
* motivo da alteração.

Nunca criar colunas desnecessárias.

---

# 14. BUILD

Toda Sprint deve terminar obrigatoriamente com:

Build completo.

Caso exista erro:

Corrigir antes da entrega.

---

# 15. ENTREGA DA SPRINT

Toda resposta deverá conter:

* Causa encontrada.
* Solução aplicada.
* Arquivos alterados.
* Alterações no banco (quando houver).
* Dependências instaladas (quando houver).
* Build OK.
* Como testar.

---

# 16. ROADMAP OFICIAL

A arquitetura deve facilitar a implementação dos seguintes módulos:

* Página Pública
* NFC
* QR Code
* Landing Page
* Marketplace de Temas
* Cardápio Digital
* Analytics
* Reviews
* Wi-Fi
* White Label
* Domínio Personalizado
* Fidelidade
* Agendamento
* CRM MikaON
* Marketplace de Aplicativos

Nunca criar soluções que dificultem essas futuras implementações.

---

# 17. DECISÕES DE ARQUITETURA

Sempre perguntar:

Esta solução poderá ser reutilizada por outros módulos?

Se sim:

Criar uma solução genérica.

Nunca desenvolver pensando apenas na Sprint atual.

---

# 18. MEMÓRIA DO PROJETO

Este documento representa a memória permanente da MikaON.

Todas as futuras implementações deverão respeitar:

* arquitetura;
* componentes existentes;
* decisões aprovadas;
* padrões visuais;
* experiência do usuário.

Nunca voltar atrás em decisões já aprovadas sem justificativa técnica.

---

# 19. LEITURA OBRIGATÓRIA

Antes de iniciar qualquer Sprint:

1. Ler este Manual.

2. Ler completamente a Sprint.

3. Consultar a arquitetura existente.

4. Verificar se alguma ferramenta disponível pode melhorar a implementação.

Somente depois iniciar o desenvolvimento.

---

# 20. REGRA FINAL

A MikaON deve evoluir como um produto SaaS profissional.

Toda implementação deve ser:

* simples;
* reutilizável;
* modular;
* escalável;
* consistente.

Em caso de dúvida entre rapidez e qualidade:

**Sempre priorizar a qualidade da arquitetura e da experiência do usuário.**

---

## 📌 MISSÃO EXTRA (executar apenas uma vez)

Após ler este manual:

1. Criar no repositório a pasta:

```text
docs/
```

2. Criar o arquivo:

```text
docs/AI_DEVELOPMENT_GUIDE.md
```

3. Copiar integralmente este manual para esse arquivo.

4. Considerar esse documento como a principal referência de desenvolvimento da MikaON.

5. Em todas as futuras Sprints, consultar esse documento antes de iniciar qualquer implementação.
