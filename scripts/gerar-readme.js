const fs = require("fs");
const path = require("path");

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

  for (const aluno of alunos) {
    const linkedin = aluno.linkedin ? `[Perfil](${aluno.linkedin})` : "-";

    tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} | ${linkedin} |\n`;
  }

  return tabela;
}

function atualizarReadme(pastaAlunos, readmePath) {
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
    atualizarReadme(pastaAlunos, readmePath);
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
