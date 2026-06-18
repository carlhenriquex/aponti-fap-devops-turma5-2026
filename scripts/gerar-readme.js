const fs = require("fs");
const path = require("path");

const pastaAlunos = path.join(__dirname, "../alunos");
const readmePath = path.join(__dirname, "../README.md");

if (!fs.existsSync(pastaAlunos)) {
console.error("Pasta 'alunos' não encontrada.");
process.exit(1);
}

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
console.log(`Erro ao ler ${arquivo}:`, erro.message);
}
}

const githubsUnicos = new Set();

const alunosFiltrados = alunos.filter(aluno => {
const github = aluno.github.toLowerCase();

if (githubsUnicos.has(github)) {
return false;
}

githubsUnicos.add(github);
return true;
});

alunosFiltrados.sort((a, b) =>
a.nome.localeCompare(b.nome, "pt-BR")
);

let tabela = `
| Avatar | Nome | GitHub | Cidade | LinkedIn |
|---------|---------|---------|---------|---------|
`;

for (const aluno of alunosFiltrados) {

const linkedin = aluno.linkedin
? `[Perfil](${aluno.linkedin})`
: "-";

tabela += `| <img src="https://github.com/${aluno.github}.png" width="50"> | ${aluno.nome} | [@${aluno.github}](https://github.com/${aluno.github}) | ${aluno.cidade || "-"} | ${linkedin} |\n`;
}

const dataAtualizacao = new Date().toLocaleString("pt-BR", {
dateStyle: "short",
timeStyle: "short"
});

let readme = fs.readFileSync(readmePath, "utf8");

readme = readme.replace(
/<!-- TABELA-INICIO -->([\s\S]*?)<!-- TABELA-FIM -->/,
`<!-- TABELA-INICIO -->\n${tabela}\n<!-- TABELA-FIM -->`
);

readme = readme.replace(
/<!-- ESTATISTICAS-INICIO -->([\s\S]*?)<!-- ESTATISTICAS-FIM -->/,
`<!-- ESTATISTICAS-INICIO -->
Total de alunos cadastrados: ${alunosFiltrados.length}

Última atualização: ${dataAtualizacao}

<!-- ESTATISTICAS-FIM -->`

);

fs.writeFileSync(readmePath, readme);

console.log("README atualizado com sucesso.");