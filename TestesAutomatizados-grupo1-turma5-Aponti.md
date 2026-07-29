# Testes Automatizados no Projeto da Turma - Grupo 1

**Turma:** DevOps Turma 5 - Aponti Academy

**Repositório (fork do grupo):** https://github.com/gavvdev/teste-automacao-fap-devops-turma5-grupo1-2026

**Líder do grupo:** Gabriela Pires Silva do Nascimento

## Integrantes e divisão de tarefas

| Integrante | Responsabilidade |
|---|---|
| Ricardo Silva | Parte 1 e 2 - análise dos comportamentos e tabela de casos de teste |
| Sergio Ricardo Feitosa | Parte 1 e 2 - análise dos comportamentos e tabela de casos de teste |
| Emanuel de Andrade Gondim | Parte 3 - implementação dos testes (node:test) |
| Lucas Madureiro Matias | Parte 3 - implementação dos testes (node:test) |
| Felipe Sabino de Oliveira | Parte 4 - documentação e justificativa da classificação dos testes |
| Milton Magalhaes | Parte 5 - execução local e registro dos resultados |
| Gabriela Pires Silva do Nascimento (líder) | Parte 5 - execução, coordenação geral e revisão do Pull Request |

## Parte 1 - Comportamentos identificados

O script `scripts/gerar-readme.js` lê os arquivos `.json` da pasta `alunos`, valida se cada um tem `nome` e `github`, remove usuários do GitHub duplicados (sem diferenciar maiúsculas/minúsculas), ordena os alunos por nome e substitui a tabela e as estatísticas do `README.md` entre os marcadores `<!-- TABELA-INICIO -->`/`<!-- TABELA-FIM -->` e `<!-- ESTATISTICAS-INICIO -->`/`<!-- ESTATISTICAS-FIM -->`.

Comportamentos esperados identificados:
- JSON com `nome` e `github` válidos → aluno entra na tabela.
- JSON sem `nome` ou sem `github` → registro ignorado.
- Dois JSONs com o mesmo `github` (mesmo com capitalização diferente) → mantém só um.
- Arquivos que não terminam em `.json` → ignorados.
- JSON mal formado (erro de sintaxe) → ignorado, sem interromper a geração do README.
- Pasta `alunos` inexistente → o script encerra com erro.
- Lista final sempre ordenada por nome (localidade `pt-BR`).

## Parte 2 - Casos de teste

| ID | Situação | Entrada | Resultado esperado |
|---|---|---|---|
| T01 | JSON válido | `{ nome, github }` preenchidos | Aluno incluído e listado no README |
| T02 | Nome ausente | JSON sem `nome` | Registro ignorado |
| T03 | GitHub ausente | JSON sem `github` | Registro ignorado |
| T04 | GitHub duplicado | Dois arquivos com o mesmo `github` | Mantém apenas um registro |
| T05 | Alunos fora de ordem | JSONs em ordem aleatória | Lista final ordenada por nome |
| T06 | Arquivo que não é JSON | Arquivo `.txt` na pasta `alunos` | Ignorado, script não quebra |
| T07 | Nenhum aluno válido | Pasta só com JSONs inválidos | Script roda sem erro, README fica com 0 alunos |
| T08 | JSON malformado | Arquivo `.json` com sintaxe inválida | Ignorado, não interrompe os demais |
| T09 | Pasta `alunos` inexistente | Caminho inválido | Script lança erro tratável |
| EXTRA | Geração da tabela isoladamente | Lista de alunos válida | `gerarTabela` monta a linha corretamente, sem depender de arquivo/pasta |

## Parte 3 - Implementação

Testes implementados em `tests/gerar-readme.test.js`, usando o **test runner nativo do Node.js** (`node:test` + `node:assert`, disponível a partir da v18, estável desde a v20) sem dependências externas, conforme orientação do professor.

Para viabilizar os testes sem depender dos arquivos reais do repositório, `scripts/gerar-readme.js` foi organizado em funções menores e independentes, cada uma responsável por uma etapa do processo:

- `lerAlunos(pasta)` - lê e valida os arquivos `.json` de uma pasta.
- `removerDuplicados(alunos)` - filtra usuários do GitHub repetidos.
- `ordenarAlunos(alunos)` - ordena a lista por nome.
- `gerarTabela(alunos)` - monta a tabela em Markdown.
- `atualizarReadme(pasta, readmePath)` - orquestra as funções acima e escreve o resultado no README.

Todas essas funções são exportadas via `module.exports`, e `atualizarReadme` aceita a pasta de alunos e o caminho do README como parâmetros (com valores padrão apontando para os arquivos reais do projeto), o que permite chamá-la nos testes com pastas temporárias, sem tocar nos dados reais da turma. Quando o script é executado diretamente (`node scripts/gerar-readme.js`, como faz a Action `atualizar-readme.yaml`), ele continua funcionando exatamente como antes.

**Como rodar (nenhuma instalação necessária):**
```bash
node --test
```
O Node encontra sozinho o arquivo `tests/gerar-readme.test.js` (ele já segue o padrão de nome que o test runner busca automaticamente). Opcionalmente, pode adicionar em `package.json`: `"scripts": { "test": "node --test" }` e rodar `npm test`.

## Parte 4 - Classificação e justificativa

**Smoke Test (T01, T07)** - verificam se o script roda de ponta a ponta sem erro e atualiza o README, tanto no caso normal quanto no caso extremo de não haver nenhum aluno válido. São o primeiro filtro: se falharem, nem faz sentido rodar o resto.

**Teste de Sanidade (T02, T03, T04, T06, T09)** - cada um valida isoladamente uma regra específica do script (nome obrigatório, github obrigatório, remoção de duplicado, filtro de extensão, tratamento de pasta ausente). São rápidos e direcionados a um comportamento pontual.

**Teste de Regressão (T05, T08)** - cobrem, em conjunto, várias regras ao mesmo tempo (ordenação combinada com múltiplos alunos; validação de JSON combinada com leitura de múltiplos arquivos), garantindo que mudanças futuras no script não quebrem o que já funciona.

**Teste unitário complementar (EXTRA)** - não se encaixa nas três categorias da aula porque testa uma função auxiliar isolada (gerarTabela) em vez de um comportamento do sistema como um todo. Foi incluído por reforçar a confiabilidade de uma peça central da geração do README, mesmo sem envolver leitura de arquivos.

## Parte 5 - Execução local e resultados

| Teste | Tipo | O que valida | Resultado |
|---|---|---|---|
| T01 | Smoke | Execução completa com dado válido | PASSOU |
| T02 | Sanidade | Nome ausente é ignorado | PASSOU |
| T03 | Sanidade | GitHub ausente é ignorado | PASSOU |
| T04 | Sanidade | GitHub duplicado é filtrado | PASSOU |
| T05 | Regressão | Ordenação por nome | PASSOU |
| T06 | Sanidade | Arquivo não-JSON é ignorado | PASSOU |
| T07 | Smoke | Nenhum aluno válido | PASSOU |
| T08 | Regressão | JSON malformado não quebra o script | PASSOU |
| T09 | Sanidade | Pasta ausente lança erro | PASSOU |
| EXTRA | Unitário | `gerarTabela` monta a linha corretamente | PASSOU |

**Resumo da execução da execução (`node --test`):** 10 testes, 10 passou, 0 falhou.

>Observações sobre mensagens que aparecem no terminal durante a execução (não são falhas):
> - `Erro ao ler quebrado.json: Expected...` - é o próprio script avisando, via `console.log`, que ignorou um arquivo JSON malformado (comportamento esperado do T08).
> - `README atualizado com sucesso.` (pode aparecer mais de uma vez) - é o log de sucesso da função `atualizarReadme`; confirmado com `git status` que nenhum teste alterou o `README.md` real do projeto, então é só saída do log, sem efeito colateral.

### Análise dos resultados
 
Os 10 testes passaram sem nenhuma falha, o que indica que o script cobre corretamente todas as regras de negócio identificadas na Parte 1: validação de campos obrigatórios, remoção de duplicados (inclusive com diferença de maiúsculas/minúsculas), ordenação alfabética, filtro de extensão de arquivo, tolerância a JSON malformado e tratamento de erro quando a pasta não existe.

A suíte combina três níveis de confiança diferentes: os Smoke Tests confirmam que o fluxo completo funciona de ponta a ponta (inclusive no caso extremo de pasta sem nenhum aluno válido); os testes de Sanidade isolam cada regra individualmente, facilitando apontar exatamente qual comportamento quebrou caso algum teste falhe no futuro; e os testes de Regressão, ao combinar múltiplas condições em um mesmo cenário, dão segurança de que mudanças futuras no script (como as feitas para acomodar a refatoração em funções menores) não reintroduzem bugs já corrigidos.

Não foram identificadas falhas, instabilidades (os mesmos 10 testes passaram de forma consistente em execuções repetidas) ou testes lentos, a suíte inteira roda em menos de 1 segundo, o que a torna adequada para ser incorporada a uma pipeline de CI/CD sem impacto perceptível no tempo de build. A principal lacuna identificada não está nos testes em si, mas no que o script valida: como registrado em "Possíveis melhorias futuras", o projeto hoje confirma que os campos github/linkedin existem, mas não que os valores realmente apontam para perfis/links válidos. 

## Entregáveis

- [x] Arquivos de teste no repositório (`tests/gerar-readme.test.js`)
- [x] Script ajustado (`scripts/gerar-readme.js`)
- [ ] Pull Request aberto para o repositório principal da turma
- [x] Esta documentação preenchida
- [ ] Slides para a apresentação (10 min, 2 integrantes)

### Possíveis melhorias futuras

- Validação real de `github` e `linkedin` via status **HTTP**: foi levantada a ideia de, além de checar se os campos `github` e `linkedin` existem no JSON, verificar se esses links realmente funcionam (ex: pegar erros de digitação no usuário do Github, que hoje geram um link quebrado sem que o script perceba). É uma verificação que agrega qualidade real ao projeto, então vale considerar para uma próxima etapa. Por depender de acesso a internet e a serviços externos, esse tipo de checagem costuma ficar melhor separada da suíte principal (que hoje roda rápido sem depender de rede), assim ela pode ser feito sob demanda, sem risco de travar ou atrasar a pipeline CI/CD por instabilidade externa. Fica como sugestão registrada para quando o grupo tiver espaço para evoluir os testes.

## Colaboradores

| Avatar | Nome | GitHub |
|---|---|---|
| <a href="https://github.com/egondimjraws"><img src="https://github.com/egondimjraws.png" width="80"></a> | Emanuel de Andrade Gondim | [@egondimjraws](https://github.com/egondimjraws) |
| <a href="https://github.com/Felipe-Sabino-d-Oliveira"><img src="https://github.com/Felipe-Sabino-d-Oliveira.png" width="80"></a> | Felipe Sabino de Oliveira | [@Felipe-Sabino-d-Oliveira](https://github.com/Felipe-Sabino-d-Oliveira) |
| <a href="https://github.com/gavvdev"><img src="https://github.com/gavvdev.png" width="80"></a> | Gabriela Pires Silva do Nascimento | [@gavvdev](https://github.com/gavvdev) |
| <a href="https://github.com/LucasMadureiro"><img src="https://github.com/LucasMadureiro.png" width="80"></a> | Lucas Madureiro Matias | [@LucasMadureiro](https://github.com/LucasMadureiro) |
| <a href="https://github.com/miltonmagalhaesv"><img src="https://github.com/miltonmagalhaesv.png" width="80"></a> | Milton Magalhaes | [@miltonmagalhaesv](https://github.com/miltonmagalhaesv) |
| <a href="https://github.com/ricardosantanadev4"><img src="https://github.com/ricardosantanadev4.png" width="80"></a> | Ricardo Silva | [@ricardosantanadev4](https://github.com/ricardosantanadev4) |
| <a href="https://github.com/SergioFeitosaa"><img src="https://github.com/SergioFeitosaa.png" width="80"></a> | Sergio Ricardo Feitosa | [@SergioFeitosaa](https://github.com/SergioFeitosaa) |
