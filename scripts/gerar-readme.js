const fs = require("fs");
const path = require("path");

/**
 * Lê todos os arquivos JSON da pasta informada e retorna
 * apenas os alunos válidos.
 *
 * @param {string} pasta Caminho da pasta de alunos.
 * @returns {Array<Object>} Lista de alunos válidos.
 */
function lerAlunos(pasta) {
  if (!fs.existsSync(pasta)) {
    throw new Error("Pasta 'alunos' não encontrada.");
  }

  const arquivos = fs.readdirSync(pasta);
  const alunos = [];

  for (const arquivo of arquivos) {
    if (!arquivo.endsWith(".json")) continue;

    try {
      const conteudo = fs.readFileSync(
        path.join(pasta, arquivo),
        "utf8"
      );

      const aluno = JSON.parse(conteudo);

      if (!aluno.nome || !aluno.github) continue;

      alunos.push(aluno);
    } catch (erro) {
      console.log(`Erro ao ler ${arquivo}: ${erro.message}`);
    }
  }

  return alunos;
}

/**
 * Remove alunos duplicados considerando o GitHub
 * (ignorando diferença entre maiúsculas e minúsculas).
 *
 * @param {Array<Object>} alunos
 * @returns {Array<Object>}
 */
function removerDuplicados(alunos) {
  const githubsUnicos = new Set();

  return alunos.filter((aluno) => {
    const github = aluno.github.toLowerCase();

    if (githubsUnicos.has(github)) {
      return false;
    }

    githubsUnicos.add(github);
    return true;
  });
}

/**
 * Ordena os alunos alfabeticamente pelo nome.
 *
 * @param {Array<Object>} alunos
 * @returns {Array<Object>}
 */
function ordenarAlunos(alunos) {
  return [...alunos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
}

/**
 * Gera a tabela Markdown utilizada no README.
 *
 * @param {Array<Object>} alunos
 * @returns {string}
 */
function gerarTabela(alunos) {
  let tabela = `
| Avatar | Nome | GitHub | Cidade | LinkedIn |
|---------|---------|---------|---------|---------|
`;

  for (const aluno of alunos) {
    const linkedin = aluno.linkedin
      ? `[Perfil](${aluno.linkedin})`
      : "-";

    tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} | ${linkedin} |\n`;
  }

  return tabela;
}

/**
 * Atualiza o README.
 *
 * Os parâmetros possuem valores padrão para manter o
 * funcionamento da GitHub Action. Durante os testes,
 * podem ser utilizados diretórios e arquivos temporários,
 * evitando alterações nos arquivos reais do projeto.
 *
 * @param {string} caminhoPastaAlunos
 * @param {string} readmePath
 * @returns {{ alunos: Array<Object>, tabela: string, total: number }}
 */
function atualizarReadme(
  caminhoPastaAlunos = path.join(__dirname, "../alunos"),
  readmePath = path.join(__dirname, "../README.md")
) {
  const alunos = ordenarAlunos(
    removerDuplicados(
      lerAlunos(caminhoPastaAlunos)
    )
  );

  const tabela = gerarTabela(alunos);

  const dataAtualizacao = new Date().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  let readme = fs.readFileSync(readmePath, "utf8");

  readme = readme.replace(
    /<!-- TABELA-INICIO -->([\s\S]*?)<!-- TABELA-FIM -->/,
    `<!-- TABELA-INICIO -->\n${tabela}\n<!-- TABELA-FIM -->`
  );

  readme = readme.replace(
    /<!-- ESTATISTICAS-INICIO -->([\s\S]*?)<!-- ESTATISTICAS-FIM -->/,
    `<!-- ESTATISTICAS-INICIO -->
Total de alunos cadastrados: ${alunos.length}

Última atualização: ${dataAtualizacao}

<!-- ESTATISTICAS-FIM -->`
  );

  fs.writeFileSync(readmePath, readme, "utf8");

  console.log("README atualizado com sucesso.");

  return {
    alunos,
    tabela,
    total: alunos.length,
  };
}

/**
 * Executa o script apenas quando chamado diretamente.
 * Quando importado pelos testes, apenas disponibiliza
 * as funções exportadas.
 */
if (require.main === module) {
  try {
    atualizarReadme();
  } catch (erro) {
    console.error(erro.message);
    process.exit(1);
  }
}

module.exports = {
  lerAlunos,
  removerDuplicados,
  ordenarAlunos,
  gerarTabela,
  atualizarReadme,
};
