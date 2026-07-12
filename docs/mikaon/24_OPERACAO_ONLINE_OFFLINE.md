# OPERAÇÃO ONLINE E OFFLINE DO MIKAON

> Documento oficial da estratégia de operação online e offline do MikaON.
>
> Este documento define como o sistema deverá se comportar em cenários com e sem conexão com a internet, garantindo continuidade operacional, segurança e sincronização de dados.

---

# Objetivo

Permitir que o MikaON continue operando mesmo na ausência temporária de conexão com a internet.

A operação deverá ser transparente para o usuário.

Sempre que possível, a sincronização deverá ocorrer automaticamente.

---

# Filosofia

O usuário nunca deverá deixar de vender por falta de internet.

A indisponibilidade da conexão não poderá impedir a continuidade da operação.

---

# Módulos Compatíveis

Inicialmente:

- PDV

Futuramente:

- Ordem de Serviço
- Produção
- Aplicativo Mobile

---

# Modo Online

Quando houver conexão:

- consultas em tempo real;
- sincronização imediata;
- validações online;
- integrações ativas.

---

# Modo Offline

Quando não houver conexão:

Permitir:

- abrir o PDV;
- selecionar operador;
- localizar produtos sincronizados;
- localizar clientes sincronizados;
- realizar vendas;
- emitir cupom não fiscal local;
- registrar pagamentos;
- suspender vendas.

Não permitir:

- emissão fiscal;
- sincronização bancária;
- integração com APIs externas.

---

# Base Local

O PDV deverá possuir uma base local contendo:

- produtos;
- clientes;
- preços;
- operadores autorizados;
- configurações essenciais.

Essa base deverá ser sincronizada periodicamente.

---

# Fila de Operações

Toda operação realizada offline deverá entrar em uma fila local.

Exemplos:

- vendas;
- recebimentos;
- ajustes;
- novos clientes.

---

# Sincronização

Quando a conexão retornar:

1. verificar conexão;
2. validar autenticação;
3. enviar operações pendentes;
4. receber atualizações;
5. confirmar sincronização.

---

# Ordem de Sincronização

Prioridade:

1. vendas;
2. pagamentos;
3. estoque;
4. clientes;
5. cadastros;
6. demais operações.

---

# Conflitos

Quando existir conflito entre dados locais e remotos:

Sempre registrar.

Nunca sobrescrever automaticamente informações críticas.

Quando necessário, solicitar intervenção do usuário.

---

# Estoque

As baixas realizadas offline deverão ser sincronizadas assim que possível.

O sistema deverá impedir duplicidade de movimentações.

---

# Numeração

Cada operação offline deverá possuir um identificador único.

Esse identificador será utilizado para evitar duplicidade após sincronização.

---

# Auditoria

Registrar:

- horário da operação;
- horário da sincronização;
- usuário;
- empresa;
- dispositivo.

---

# Indicador Visual

O sistema deverá informar claramente o estado atual.

Exemplos:

🟢 Online

🟡 Sincronizando

🔴 Offline

---

# Segurança

Mesmo offline:

- autenticação deverá permanecer válida;
- permissões deverão continuar sendo respeitadas;
- dados locais deverão permanecer protegidos.

---

# Recuperação

Caso ocorra falha durante a sincronização:

Nunca perder operações.

Retomar automaticamente a partir do último ponto válido.

---

# Integrações

Enquanto offline:

Suspender:

- PIX automático;
- emissão fiscal;
- WhatsApp automático;
- integrações externas.

Retomar automaticamente quando houver conexão.

---

# Backup Local

Sempre que possível:

Criar cópia temporária das operações pendentes.

Remover automaticamente após sincronização concluída.

---

# Performance

A operação offline deverá possuir desempenho igual ou superior ao modo online.

---

# Testes

Sempre validar:

- queda de internet durante venda;
- retorno da conexão;
- sincronização automática;
- sincronização parcial;
- conflito de dados;
- recuperação após falha.

---

# Evolução Futura

Planejado:

- sincronização incremental;
- múltiplos caixas offline;
- múltiplos dispositivos;
- resolução inteligente de conflitos;
- monitoramento da sincronização.

---

# Regra Permanente

A operação offline nunca poderá comprometer:

- integridade dos dados;
- rastreabilidade;
- auditoria;
- consistência do estoque;
- consistência financeira.

---

# Objetivo Final

Permitir que o MikaON continue operando de forma confiável mesmo em ambientes com internet instável, garantindo continuidade do negócio e sincronização segura quando a conexão for restabelecida.