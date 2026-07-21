# Sprint 227.3 - Caixa e homologacao arquitetural

## Regra permanente

Toda operacao financeira operacional pertence ao ERP. O Painel Master jamais
executa operacoes de Caixa; ele administra empresas. O ERP administra a
operacao diaria da empresa.

## Auditoria do Caixa

O Caixa estava renderizado como um painel secundario dentro de
`PublicPdvPage`. A mesma pagina tambem concentra o estado do operador, a
consulta do caixa aberto, o resumo, abertura, fechamento e a exibicao de
movimentacoes. As regras de persistencia permanecem em
`src/services/erpPdv/erpPdv.service.ts`.

Servicos reutilizados sem alteracao:

- `abrirErpPdvCaixa`;
- `registrarErpPdvCaixaMovimentacao`;
- `calcularErpPdvResumoCaixa`;
- `fecharErpPdvCaixa`.

O estado de venda, estoque, trocas e Caixa continua compartilhando o mesmo
componente de dominio para evitar duplicacao de regras. A separacao feita nesta
sprint e de navegacao e apresentacao: o modo Caixa oculta as areas de venda,
trocas e estoque, mantendo somente a operacao de Caixa.

## Rotas oficiais

| Ambiente | Rota | Funcao |
| --- | --- | --- |
| ERP | `/empresa/:slug/pdv` | Operacao de vendas e PDV |
| ERP | `/empresa/:slug/caixa` | Operacao direta de Caixa |
| ERP | `/empresa/:slug/movimentacoes` | Estoque e movimentacoes |

O item Caixa foi adicionado ao `EmpresaLayout` e usa a permissao
`caixa.abrir`. A rota nao passa por navegacao indireta ao caminho do PDV.

## Seguranca e preservacao

Nao houve migration, alteracao de banco, RLS, autenticacao, DNS ou Cloudflare.
O acesso continua condicionado a autenticacao empresarial, permissao RBAC e
empresa vinculada. O `SUPER_ADMIN` permanece sem empresa.

## Homologacao arquitetural

- Painel Master: continua restrito a administracao da plataforma.
- ERP: possui Produtos, Categorias, Estoque, PDV, Caixa, Impressoras,
  Configuracoes e Canais.
- Paginas publicas: nenhum arquivo ou URL foi alterado.
- Dados da Mikatech: nenhum registro foi criado, removido ou atualizado.

## Pendencias preservadas

Compras, Clientes, Fornecedores, Colaboradores, Usuarios Operacionais e CRM
continuam sem rotas independentes na base publicada. A engine de impressao
continua pendente. Essas areas nao foram simuladas nem incorporadas nesta
sprint.
