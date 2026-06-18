const fs = require("fs");
const path = require("path");

const pastaAlunos = path.join(__dirname, "../alunos");
const readmePath = path.join(__dirname, "../README.md");

const arquivos = fs.readdirSync(pastaAlunos);

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
    console.log(`Erro ao ler ${arquivo}`);
  }
}

const githubsUnicos = new Set();

const alunosFiltrados = alunos.filter(aluno => {
  if (githubsUnicos.has(aluno.github)) {
    return false;
  }

  githubsUnicos.add(aluno.github);
  return true;
});

alunosFiltrados.sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR")
);

let tabela = `
| Avatar | Nome | GitHub | Cidade |
|---------|---------|---------|---------|
`;

for (const aluno of alunosFiltrados) {
  tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} |\n`;
}

let readme = fs.readFileSync(readmePath, "utf8");

readme = readme.replace(
  /<!-- TABELA-INICIO -->([\s\S]*?)<!-- TABELA-FIM -->/,
  `<!-- TABELA-INICIO -->\n${tabela}\n<!-- TABELA-FIM -->`
);

readme = readme.replace(
  /<!-- ESTATISTICAS-INICIO -->([\s\S]*?)<!-- ESTATISTICAS-FIM -->/,
  `<!-- ESTATISTICAS-INICIO -->\nTotal de alunos cadastrados: ${alunosFiltrados.length}\n<!-- ESTATISTICAS-FIM -->`
);

fs.writeFileSync(readmePath, readme);

console.log("README atualizado com sucesso.");