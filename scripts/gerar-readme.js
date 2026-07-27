const fs = require("fs");
const path = require("path");

/**
 * Lê os JSONs da pasta de alunos, valida, remove duplicados, ordena
 * e atualiza o README com a tabela de integrantes e as estatísticas.
 *
 * Recebe os caminhos como parâmetro (em vez de fixos) para que o
 * script continue funcionando igual na Action, mas também possa
 * ser chamado a partir dos testes com pastas temporárias.
 * A lógica foi encapsulada nesta função para facilitar a manutenção e os testes.
 *
 * Quando o caminho é executado diretamente (pela GitHub Action), utiliza os caminhos padrão do projeto.
 * Quando é importado pelos testes, apenas exporta a função, evitando que o script seja executado automaticamente.
 */
function gerarReadme(pastaAlunos, readmePath) {
  if (!fs.existsSync(pastaAlunos)) {
    throw new Error("Pasta 'alunos' não encontrada.");
  }

  const arquivos = fs.readdirSync(pastaAlunos);
const pastaAlunos = path.join(__dirname, "../alunos");
const readmePath = path.join(__dirname, "../README.md");

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
        path.join(pastaAlunos, arquivo),
        "utf8"
      );
      const aluno = JSON.parse(conteudo);
      if (!aluno.nome || !aluno.github) continue;
      alunos.push(aluno);
    } catch (erro) {
      console.log(`Erro ao ler ${arquivo}:`, erro.message);
    }
  }

  const githubsUnicos = new Set();
  const alunosFiltrados = alunos.filter((aluno) => {
    const github = aluno.github.toLowerCase();
    if (githubsUnicos.has(github)) {
      return false;
    }
    githubsUnicos.add(github);
    return true;
  });

  alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));


    try {
      const conteudo = fs.readFileSync(path.join(pasta, arquivo), "utf8");
      const aluno = JSON.parse(conteudo);

      if (!aluno.nome || !aluno.github) continue;

      alunos.push(aluno);
    } catch (erro) {
      console.log(`Erro ao ler ${arquivo}: ${erro.message}`);
    }
  }

  return alunos;
}

function removerDuplicados(alunos) {
  const githubsUnicos = new Set();

  return alunos.filter((aluno) => {
    const github = String(aluno.github).toLowerCase();

    if (githubsUnicos.has(github)) {
      return false;
    }

    githubsUnicos.add(github);
    return true;
  });
}

function ordenarAlunos(alunos) {
  return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

function gerarTabela(alunos) {
  let tabela = `
| Avatar | Nome | GitHub | Cidade | LinkedIn |
|---------|---------|---------|---------|---------|
`;
  for (const aluno of alunosFiltrados) {
    const linkedin = aluno.linkedin ? `[Perfil](${aluno.linkedin})` : "-";
    tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} | ${linkedin} |\n`;
  }

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
    `<!-- ESTATISTICAS-INICIO -->\nTotal de alunos cadastrados: ${alunosFiltrados.length}\nÚltima atualização: ${dataAtualizacao}\n<!-- ESTATISTICAS-FIM -->`
  );

  fs.writeFileSync(readmePath, readme);

  return { alunos: alunosFiltrados, total: alunosFiltrados.length };
}

// Quando o arquivo é executado diretamente (ex: GitHub Action),
// utiliza os caminhos padrão do projeto.
// Quando é importado pelos testes, apenas exporta a função,
// evitando que o script seja executado automaticamente.
if (require.main === module) {
  const pastaAlunosPadrao = path.join(__dirname, "../alunos");
  const readmePathPadrao = path.join(__dirname, "../README.md");
  try {
    gerarReadme(pastaAlunosPadrao, readmePathPadrao);
    console.log("README atualizado com sucesso.");

  for (const aluno of alunos) {
    const linkedin = aluno.linkedin ? `[Perfil](${aluno.linkedin})` : "-";

    tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} | ${linkedin} |\n`;
  }

  return tabela;
}

function atualizarReadme() {
  const alunos = ordenarAlunos(removerDuplicados(lerAlunos(pastaAlunos)));
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
  return { alunos, tabela, dataAtualizacao };
}

if (require.main === module) {
  try {
    atualizarReadme();
  } catch (erro) {
    console.error(erro.message);
    process.exit(1);
  }
}

module.exports = { gerarReadme };
module.exports = {
  lerAlunos,
  removerDuplicados,
  ordenarAlunos,
  gerarTabela,
  atualizarReadme,
};
