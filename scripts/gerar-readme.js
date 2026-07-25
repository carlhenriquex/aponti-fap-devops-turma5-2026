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
  } catch (erro) {
    console.error(erro.message);
    process.exit(1);
  }
}

module.exports = { gerarReadme };