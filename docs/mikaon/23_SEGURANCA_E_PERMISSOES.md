# SEGURANÇA E PERMISSÕES DO MIKAON

> Documento oficial de Segurança e Controle de Acesso do MikaON.
>
> Este documento define as diretrizes de autenticação, autorização, auditoria e proteção de dados da plataforma.

---

# Objetivo

Garantir que o MikaON seja uma plataforma segura, preparada para operar em ambiente SaaS com múltiplas empresas.

Toda funcionalidade deverá respeitar as regras de segurança aqui definidas.

---

# Princípios

A segurança deverá ser tratada como parte da arquitetura.

Nunca como uma funcionalidade adicional.

Toda informação deverá possuir:

- autenticação;
- autorização;
- rastreabilidade;
- auditoria.

---

# Autenticação

Tecnologia atual:

Supabase Auth.

Preparado para:

- Login por e-mail;
- Google;
- Microsoft;
- Apple;
- autenticação corporativa (futuro).

---

# Sessão

Toda sessão deverá possuir:

- usuário autenticado;
- empresa ativa;
- perfil;
- permissões carregadas.

Encerrar automaticamente em caso de autenticação inválida.

---

# Multiempresa

Toda consulta deverá respeitar o isolamento entre empresas.

Jamais permitir que um usuário visualize dados de outra empresa.

Esse isolamento é obrigatório em:

- banco de dados;
- APIs;
- interface;
- relatórios.

---

# Perfis Padrão

Perfis iniciais:

- Administrador
- Gerente
- Caixa
- Vendedor Varejo
- Vendedor Atacado
- Estoquista

Perfis personalizados poderão ser criados futuramente.

---

# Permissões

Cada funcionalidade poderá controlar:

- visualizar;
- criar;
- editar;
- excluir;
- cancelar;
- imprimir;
- exportar;
- aprovar;
- reabrir.

Nunca confiar apenas na interface.

Toda validação deverá ocorrer também na camada de serviço.

---

# Controle por Módulo

Cada módulo deverá possuir permissões independentes.

Exemplos:

ERP

CRM

PDV

Financeiro

Compras

Produção

Fiscal

Relatórios

Configurações

---

# Controle por Empresa

Cada empresa poderá definir:

- usuários;
- perfis;
- permissões;
- módulos liberados.

---

# Controle por Operador

No PDV, cada operador poderá possuir permissões específicas.

Exemplos:

- cancelar venda;
- conceder desconto;
- alterar preço;
- vender atacado;
- realizar trocas;
- abrir caixa;
- fechar caixa.

Perfil de estoque:

- pode acessar Produtos/Estoque;
- pode cadastrar e editar produtos permitidos;
- pode registrar entrada, saída e ajuste de estoque;
- pode consultar saldo, mínimo e histórico;
- não pode operar venda;
- não pode abrir ou fechar caixa;
- não pode conceder desconto;
- não pode alterar permissões;
- não pode acessar administração geral por esta rota operacional.

---

# Auditoria

Registrar obrigatoriamente:

- usuário;
- empresa;
- data;
- hora;
- IP (quando disponível);
- operação executada.

---

# Operações Críticas

Sempre registrar:

- login;
- logout;
- alteração de permissões;
- cancelamento de vendas;
- movimentação financeira;
- movimentação de estoque;
- alterações cadastrais importantes.

---

# Senhas

Nunca armazenar senhas em texto.

Utilizar sempre o mecanismo seguro do provedor de autenticação.

---

# Dados Sensíveis

Informações sensíveis deverão possuir proteção adicional.

Exemplos:

- documentos;
- dados financeiros;
- informações pessoais.

---

# Logs

Registrar apenas o necessário.

Nunca registrar:

- senhas;
- tokens;
- chaves privadas.

---

# API

Toda API deverá validar:

- autenticação;
- empresa;
- permissões;
- integridade dos dados.

---

# Rate Limit

Preparar a plataforma para limitar tentativas excessivas de autenticação e chamadas críticas.

---

# LGPD

O MikaON deverá ser desenvolvido respeitando a Lei Geral de Proteção de Dados.

Objetivos:

- minimizar coleta de dados;
- permitir atualização;
- permitir exclusão quando aplicável;
- registrar consentimentos quando necessário.

---

# Backup

Backups deverão ser protegidos.

O acesso deverá ser restrito.

---

# Monitoramento

Eventos de segurança deverão ser monitorados.

Exemplos:

- múltiplas tentativas de login;
- acessos incomuns;
- alterações críticas.

---

# Futuras Melhorias

Planejadas:

- autenticação em dois fatores (2FA);
- autenticação por biometria (aplicativos);
- SSO corporativo;
- logs avançados de auditoria;
- alertas automáticos de segurança.

---

# Regra Permanente

Nenhuma funcionalidade poderá ignorar o sistema de permissões.

Toda nova tela deverá possuir validação de acesso antes de ser disponibilizada ao usuário.

---

# Objetivo Final

Construir uma plataforma segura, confiável e preparada para atender empresas de diferentes portes, garantindo proteção dos dados, rastreabilidade das operações e conformidade com boas práticas de segurança.

---

# Regra complementar de precos e estoque

Na rota operacional do ERP/PDV:

- custo e lucro devem respeitar permissao explicita;
- a tabela de preco do operador deve ser aplicada automaticamente;
- o operador nao pode alternar manualmente para tabela nao autorizada;
- o perfil de estoque continua sem permissao para venda e caixa.
