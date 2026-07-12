# PLANO OFICIAL DE TESTES DO MIKAON

> Documento oficial do Plano de Testes do MikaON.
>
> Nenhuma Sprint será considerada concluída sem passar pelos testes definidos neste documento.

---

# Objetivo

Garantir estabilidade, confiabilidade e qualidade do MikaON.

Todo desenvolvimento deverá ser validado antes da publicação.

A prioridade é evitar regressões.

---

# Filosofia

Uma Sprint somente estará concluída quando:

- implementar;
- compilar;
- testar;
- validar;
- documentar;
- publicar.

---

# Tipos de Teste

## Teste Funcional

Validar:

- regra de negócio;
- fluxo operacional;
- permissões;
- mensagens;
- navegação.

---

## Teste Visual

Validar:

- alinhamentos;
- responsividade;
- espaçamentos;
- fontes;
- botões;
- ícones;
- consistência visual.

---

## Teste Responsivo

Obrigatório validar:

Desktop

Notebook

Tablet

Mobile

Prioridade:

Desktop Comercial.

---

## Teste de Build

Executar obrigatoriamente:

```bash
git diff --check
```

Depois:

```bash
npm run build
```

A Sprint não poderá ser publicada caso ocorra erro.

---

## Teste de Produção

Após deploy validar:

- HTTP 200;
- bundle atualizado;
- CSS atualizado;
- rota carregando;
- console sem erros críticos.

---

# Testes Obrigatórios do PDV

Sempre validar:

- abertura do PDV;
- seleção de operador;
- troca de operador;
- permissões;
- pesquisa de cliente;
- pesquisa de produto;
- Enter adicionando produto;
- foco automático;
- carrinho;
- alteração de quantidade;
- remoção de item;
- venda suspensa;
- retomada;
- pagamento;
- pagamento misto;
- dinheiro;
- troco;
- PIX;
- débito;
- crédito;
- parcelamento;
- cupom;
- impressão;
- PDF;
- WhatsApp.

---

# Testes Obrigatórios do ERP

Sempre validar:

- cadastro;
- edição;
- exclusão (quando permitido);
- filtros;
- pesquisa;
- paginação;
- permissões.

---

# Testes Obrigatórios do CRM

Sempre validar:

- cadastro;
- pipeline;
- agenda;
- histórico;
- pesquisa;
- integrações.

---

# Testes de Banco

Quando houver migration:

Validar:

- criação;
- atualização;
- compatibilidade;
- rollback (quando aplicável).

---

# Testes de Permissão

Validar sempre:

Administrador

Gerente

Caixa

Vendedor

Usuário sem permissão

Nenhuma permissão poderá depender apenas da interface.

---

# Testes de Performance

Observar:

- carregamento inicial;
- pesquisas;
- renderização;
- troca de telas;
- consultas.

---

# Testes de Regressão

Toda Sprint deverá validar que funcionalidades antigas continuam funcionando.

Nunca assumir que uma alteração localizada não afeta outros módulos.

---

# Checklist Obrigatório

Antes do commit:

☐ Código compilando

☐ Build OK

☐ TypeScript OK

☐ ESLint OK

☐ Sem overflow

☐ Sem erros críticos

☐ Fluxo principal validado

☐ Documentação atualizada

---

# Registro dos Testes

Toda Sprint deverá informar:

- ambiente;
- testes executados;
- limitações;
- resultado.

---

# Ambientes

Local

Desenvolvimento

Produção

Sempre informar em qual ambiente os testes foram realizados.

---

# Casos em que NÃO testar em Produção

Nunca executar em produção:

- baixa real de estoque;
- fechamento real de caixa;
- emissão fiscal real;
- operações financeiras reais.

Sempre utilizar ambiente controlado quando houver impacto operacional.

---

# Objetivo Final

Garantir que cada nova Sprint aumente a qualidade do MikaON, reduzindo regressões e mantendo estabilidade para uso comercial.