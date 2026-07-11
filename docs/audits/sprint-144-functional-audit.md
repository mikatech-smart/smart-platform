# Sprint 144 - Auditoria Funcional Completa da Plataforma

Data: 2026-07-11  
Empresa auditada: Teste mikaON  
Slug: teste-mikaon  
Escopo: auditoria funcional sem correcao de codigo, sem refatoracao, sem alteracao de autenticacao e sem inicio de ERP/PDV.

## Resumo executivo

A empresa Teste mikaON esta carregando os dados persistidos nas colunas JSONB dos modulos principais. As paginas publicas auditadas responderam HTTP 200, com metadados SEO, canonical, Open Graph, JSON-LD e manifest apontando para `https://smart.mikaon.com.br`. O painel administrativo carregou os modulos contratados e confirmou persistencia visual dos dados de Cardapio, Catalogo, Agendamento, Wi-Fi Marketing, Fidelidade, CRM e IA.

Foram encontradas inconsistencias relevantes principalmente no fluxo de Storage: a remocao via API retornou sucesso, mas os arquivos continuaram no bucket, gerando arquivos orfaos. Tambem foram registradas lacunas de UX/acessibilidade no feedback de salvamento e na navegacao do editor.

## Fluxos testados

- Dashboard administrativo e listagem de empresas.
- Edicao da empresa Teste mikaON.
- Central de Compartilhamento.
- Salvamento sem alteracao de dados.
- Recarregamento do dashboard.
- Persistencia administrativa de Cardapio Digital.
- Persistencia administrativa de Catalogo.
- Persistencia administrativa de Agendamento.
- Persistencia administrativa de Wi-Fi Marketing.
- Persistencia administrativa de Programa de Fidelidade.
- Persistencia administrativa de CRM.
- Persistencia administrativa de IA.
- Configuracao resumida da Landing Page.
- Subconfiguracoes da Landing Page: Hero, Sobre, Servicos, Galeria, Depoimentos, Videos, Audios, Produtos Digitais, Contato.
- Upload, preview tecnico, troca e tentativa de exclusao no Storage.
- Validacao HTTP/HTML das paginas publicas.
- Validacao de robots.txt e sitemap.xml.

## Fluxos aprovados

- Dashboard carregou com 5 empresas e exibiu a empresa Teste mikaON.
- Editor da Teste mikaON abriu corretamente.
- Dados basicos persistidos:
  - nome: Teste mikaON;
  - categoria personalizada: Empresa de Testes;
  - slug: teste-mikaon;
  - tipo: cliente;
  - descricao preenchida.
- Central de Compartilhamento exibiu:
  - pagina publica: `https://smart.mikaon.com.br/teste-mikaon`;
  - painel cliente: `https://smart.mikaon.com.br/painel/teste-mikaon`;
  - landing: `https://smart.mikaon.com.br/landing/teste-mikaon`;
  - status da landing: Publicada.
- Cardapio Digital persistiu categorias e produtos:
  - Bebidas;
  - Lanches;
  - Suco Teste;
  - Sanduiche Teste.
- Catalogo persistiu categorias e produtos:
  - Servicos;
  - Materiais;
  - Pacote Consultoria Teste;
  - Kit Demonstrativo.
- Agendamento persistiu servicos:
  - Consulta demonstrativa;
  - Retorno de teste.
- Wi-Fi Marketing persistiu campanha ativa:
  - Conecte-se com a Teste mikaON;
  - CTA para `https://smart.mikaon.com.br/teste-mikaon`.
- Fidelidade persistiu campanha:
  - Clube Teste mikaON;
  - meta de 10 carimbos;
  - recompensa ficticia.
- CRM persistiu:
  - clientes Ana Cliente Teste e Bruno Exemplo;
  - pipeline;
  - automacoes Registrar novo lead, Preparar WhatsApp e Avisar tarefa vencida.
- IA persistiu:
  - assistente Mika Teste;
  - tom consultivo;
  - instrucoes personalizadas;
  - base de conhecimento;
  - Prompt Mestre.
- Landing Page exibiu estrutura de configuracao com:
  - rascunho/publicacao;
  - historico;
  - ordenacao;
  - templates;
  - blocos extras;
  - Hero, Sobre, Servicos, Galeria, Depoimentos, Videos, Audios, Produtos Digitais, Contato, CTA e SEO.
- Subconfiguracoes da Landing Page carregaram dados em Hero, Sobre, Servicos, Galeria, Depoimentos, Videos, Audios, Produtos Digitais e Contato.
- Upload no bucket `empresas` aceitou arquivos de teste:
  - imagem PNG;
  - PDF;
  - documento TXT;
  - audio OGG.
- Troca de imagem via upload com upsert foi aceita.

## Paginas publicas validadas

| Rota | HTTP | Canonical | Robots | JSON-LD | Manifest | Dominio antigo |
| --- | --- | --- | --- | --- | --- | --- |
| `/teste-mikaon` | 200 | `https://smart.mikaon.com.br/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/landing/teste-mikaon` | 200 | `https://smart.mikaon.com.br/landing/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/cardapio/teste-mikaon` | 200 | `https://smart.mikaon.com.br/cardapio/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/catalogo/teste-mikaon` | 200 | `https://smart.mikaon.com.br/catalogo/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/agendamento/teste-mikaon` | 200 | `https://smart.mikaon.com.br/agendamento/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/wifi/teste-mikaon` | 200 | `https://smart.mikaon.com.br/wifi/teste-mikaon` | `index,follow` | 1 | sim | nao |
| `/fidelidade/teste-mikaon` | 200 | `https://smart.mikaon.com.br/fidelidade/teste-mikaon` | `index,follow` | 1 | sim | nao |

Outros endpoints:

- `/robots.txt`: HTTP 200, dominio oficial presente e bloqueios privados detectados.
- `/sitemap.xml`: HTTP 200, `Cache-Control: public, max-age=0, must-revalidate`, sem rotas privadas detectadas.

## Storage

Bucket utilizado: `empresas`.

Arquivos ja existentes da empresa em `teste-mikaon/sprint-142`:

- `apresentacao.pdf`
- `banner.png`
- `cardapio-produto-1.png`
- `cardapio-produto-2.png`
- `catalogo-produto-1.png`
- `catalogo-produto-2.png`
- `logo.png`
- `politica.txt`
- `wifi-campanha.png`

Arquivos temporarios enviados na auditoria para `teste-mikaon/sprint-144-audit`:

- `arquivo.pdf`
- `audio.ogg`
- `documento.txt`
- `imagem.png`

Resultado: upload e troca funcionaram, mas a exclusao via API retornou sucesso sem remover os arquivos. Tentativa de limpeza direta por SQL foi bloqueada pelo Supabase com a mensagem de protecao de Storage.

## Videos

- Link comum do YouTube carregado na configuracao: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.
- Playlist do YouTube carregada na configuracao.
- Preview/embed foi validado pela presenca dos dados no editor e pela pagina landing publicada.
- Nao havia Shorts cadastrado na empresa Teste mikaON no momento da auditoria; esse caso ficou como lacuna de cobertura, sem alteracao de dados nesta Sprint.

## Bugs encontrados

### Alto - Exclusao de arquivos do Storage retorna sucesso, mas nao remove objetos

Evidencia:

- Uploads em `teste-mikaon/sprint-144-audit` foram criados com sucesso.
- Chamada de remocao via API retornou `{ data: [], error: null }`.
- Listagem posterior continuou exibindo os 4 arquivos.
- Nova checagem apos espera manteve os arquivos.
- SQL direto para remover objetos do Storage foi bloqueado por protecao do Supabase.

Impacto:

- Pode gerar arquivos orfaos.
- Fluxos de troca/remocao de imagens, documentos e audios podem indicar sucesso ao usuario sem concluir a remocao fisica.
- Monitoramento de Storage pode superestimar consumo.

Recomendacao:

- Investigar politica/permissao de delete no bucket `empresas`, formato dos paths enviados para remocao e retorno da API de Storage.

### Medio - Landing Page possui alteracoes nao publicadas na empresa de teste

Evidencia:

- Aba Landing Page exibiu aviso: "Existem alteracoes nao publicadas".
- Preview mostra rascunho, enquanto a pagina publica usa a ultima versao publicada.

Impacto:

- Auditorias podem divergir entre editor e pagina publica.
- Cliente pode acreditar que alteracoes recentes ja estao publicas.

Recomendacao:

- Na proxima Sprint de correcao, decidir se a empresa de teste deve publicar as alteracoes ou se o aviso esta correto para manter validacao de rascunho/publicado.

### Medio - Cobertura incompleta para YouTube Shorts na empresa Teste mikaON

Evidencia:

- Editor possui video comum e playlist.
- Nao foi encontrado Shorts cadastrado para validacao real.

Impacto:

- O requisito de validar Shorts nao foi comprovado com dado real da empresa de teste.

Recomendacao:

- Cadastrar um link Shorts seguro em uma Sprint de preparacao de massa de teste ou incluir caso automatizado especifico.

### Baixo - Feedback de salvamento usa alerta nativo pouco rastreavel

Evidencia:

- Ao salvar sem alteracoes, foi exibido um alerta nativo.
- A automacao capturou o evento, mas a mensagem veio vazia/nula.

Impacto:

- Pior rastreabilidade em testes automatizados.
- Experiencia menos consistente do que mensagens inline de sucesso/erro.

Recomendacao:

- Padronizar feedback de salvamento com componente visual persistente e texto acessivel.

### Baixo - Recarregamento com editor aberto fecha o modal

Evidencia:

- Recarregar o dashboard com o editor aberto retornou para a listagem de empresas.

Impacto:

- O usuario perde o contexto de edicao ao atualizar a pagina.

Recomendacao:

- Avaliar se deve haver restauracao de contexto via URL/estado em Sprint futura. Nao e bloqueante para beta.

## Fluxos reprovados ou incompletos

- Exclusao de arquivos do Storage: reprovado.
- Validacao real de Shorts: incompleta por falta de dado cadastrado.
- Teste visual mobile por navegador automatizado dedicado: limitado pelo ambiente desta auditoria; foram usados dados de producao, validacao HTTP/HTML e verificacao de overflow no editor.

## Prioridades

- Critico: nenhum bloqueio critico confirmado.
- Alto: exclusao de arquivos no Storage nao remove objetos.
- Medio: Landing Page com alteracoes nao publicadas; Shorts sem dado real para validacao.
- Baixo: alerta nativo de salvamento; perda de contexto do editor apos reload.

## Resultado

A plataforma esta funcional para os fluxos principais da empresa Teste mikaON apos a criacao das colunas JSONB. A principal correcao recomendada antes do beta e o fluxo de remocao de arquivos no Storage, porque afeta uploads, troca/exclusao e monitoramento de consumo. As demais ocorrencias sao de cobertura, UX e consistencia operacional.
