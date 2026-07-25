# Testes Automatizados no Projeto da Turma — Grupo 1

**Turma:** DevOps Turma 5 — Aponti Academy

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

## Parte 1 — Comportamentos identificados

O script `scripts/gerar-readme.js` lê os arquivos `.json` da pasta `alunos`, valida se cada um tem `nome` e `github`, remove usuários do GitHub duplicados (sem diferenciar maiúsculas/minúsculas), ordena os alunos por nome e substitui a tabela e as estatísticas do `README.md` entre os marcadores `<!-- TABELA-INICIO -->`/`<!-- TABELA-FIM -->` e `<!-- ESTATISTICAS-INICIO -->`/`<!-- ESTATISTICAS-FIM -->`.

Comportamentos esperados identificados:
- JSON com `nome` e `github` válidos → aluno entra na tabela.
- JSON sem `nome` ou sem `github` → registro ignorado.
- Dois JSONs com o mesmo `github` (mesmo com capitalização diferente) → mantém só um.
- Arquivos que não terminam em `.json` → ignorados.
- JSON mal formado (erro de sintaxe) → ignorado, sem interromper a geração do README.
- Pasta `alunos` inexistente → o script encerra com erro.
- Lista final sempre ordenada por nome (localidade `pt-BR`).

## Parte 2 — Casos de teste

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

## Parte 3 — Implementação

Testes implementados em `tests/gerar-readme.test.js`, usando o **test runner nativo do Node.js** (`node:test` + `node:assert`, disponível a partir da v18, estável desde a v20) — sem dependências externas, conforme orientação do professor.

Para viabilizar os testes sem depender dos arquivos reais do repositório, `scripts/gerar-readme.js` foi levemente ajustado: a lógica foi movida para uma função `gerarReadme(pastaAlunos, readmePath)` exportada via `module.exports`, mantendo exatamente o mesmo comportamento quando executado diretamente (`node scripts/gerar-readme.js`, como faz a Action `atualizar-readme.yaml`). Isso permite rodar os testes contra pastas temporárias, sem tocar nos dados reais da turma.

**Como rodar (nenhuma instalação necessária):**
```bash
node --test
```
O Node encontra sozinho o arquivo `tests/gerar-readme.test.js` (ele já segue o padrão de nome que o test runner busca automaticamente). Opcionalmente, pode-se adicionar em `package.json`: `"scripts": { "test": "node --test" }` e rodar `npm test`.

## Parte 4 — Classificação e justificativa

**Smoke Test (T01, T07)** — verificam se o script roda de ponta a ponta sem erro e atualiza o README, tanto no caso normal quanto no caso extremo de não haver nenhum aluno válido. São o primeiro filtro: se falharem, nem faz sentido rodar o resto.

**Teste de Sanidade (T02, T03, T04, T06, T08, T09)** — cada um valida isoladamente uma regra específica do script (nome obrigatório, github obrigatório, remoção de duplicado, filtro de extensão, tolerância a JSON malformado, tratamento de pasta ausente). São rápidos e direcionados a um comportamento pontual.

**Teste de Regressão (T05, T08)** — cobrem, em conjunto, várias regras ao mesmo tempo (ordenação combinada com múltiplos alunos; validação de JSON combinada com leitura de múltiplos arquivos), garantindo que mudanças futuras no script não quebrem o que já funciona.

## Parte 5 — Execução local e resultados

| Teste | Tipo | O que valida | Resultado |
|---|---|---|---|
| T01 | Smoke | Execução completa com dado válido | _preencher após rodar `npm test`_ |
| T02 | Sanidade | Nome ausente é ignorado | _preencher_ |
| T03 | Sanidade | GitHub ausente é ignorado | _preencher_ |
| T04 | Sanidade | GitHub duplicado é filtrado | _preencher_ |
| T05 | Regressão | Ordenação por nome | _preencher_ |
| T06 | Sanidade | Arquivo não-JSON é ignorado | _preencher_ |
| T07 | Smoke | Nenhum aluno válido | _preencher_ |
| T08 | Regressão | JSON malformado não quebra o script | _preencher_ |
| T09 | Sanidade | Pasta ausente lança erro | _preencher_ |

> Milton e Gabriela: (OBS: depois de rodar `node --test`, colocar aqui o resumo do terminal (quantos testes passaram/falharam) e marcar cada linha como PASSOU/FALHOU.)

## Entregáveis

- [ ] Arquivos de teste no repositório (`tests/gerar-readme.test.js`)
- [x] Script ajustado (`scripts/gerar-readme.js`)
- [ ] Pull Request aberto para o repositório principal da turma
- [x] Esta documentação preenchida
- [ ] Slides para a apresentação (10 min, 2 integrantes)

### Possíveis melhorias futuras

- Validação real de `github` e `linkedin` via status **HTTP**: foi levantada a ideia de, além de checar se os campos `github` e `linkedin` existem no JSON, verificar se esses links realmente funcionam (ex: pegar erros de digitação no usuário do Github, que hoje geram um link quebrado sem que o script perceba). É uma verificação que agrega qualidade real ao projeto, então vale considerar para uma próxima etapa. Por depender de acesso a internet e a serviços externos, esse tipo de checagem costuma ficar melhor separada da suíte principal (que hoje roda rápido sem depender de rede), assim ela pode ser feito sob demanda, sem risco de travar ou atrasar a pipeline CI/CD por instabilidade externa. Fica como sugestão registrada para quando o grupo tiver espaço para evoluir os testes.

## Colaboradores
 
| Nome | GitHub |
|---|---|
| Gabriela Pires Silva do Nascimento | [@Gabriela Pires](https://github.com/gavvdev) |
| Ricardo Silva | [@Ricardo Santana](https://github.com/ricardosantanadev4) |
| Emanuel de Andrade Gondim | [@Emanuel Gondim](https://github.com/egondimjraws)|
| Lucas Madureiro Matias | [@Lucas Madureiro Matias](https://github.com/LucasMadureiro) |
| Sergio Ricardo Feitosa | [@Sérgio Feitosa](https://github.com/SergioFeitosaa) |
| Felipe Sabino de Oliveira | [@Felipe Sabino](https://github.com/Felipe-Sabino-d-Oliveira) |
| Milton Magalhaes | [@Milton Magalhães](https://github.com/miltonmagalhaesv) |
