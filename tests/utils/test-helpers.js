function getLinhaTabela(tabelaMarkdown, linha) {
  const linhas = tabelaMarkdown.trim().split("\n");
  const linhaDados = linhas[2 + linha]; // O número 2 representa 2 linhas: cabeçalho (linha 0) e separador (linha 1)

  if (!linhaDados) {
    throw new Error(`Linha ${linha} não encontrada na tabela`);
  }

  return linhaDados.trim();
}

function getCelulaTabela(tabelaMarkdown, linha, colunaNome) {
  const linhas = tabelaMarkdown.trim().split("\n");

  const cabecalho = linhas[0]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const indiceColuna = cabecalho.indexOf(colunaNome);
  if (indiceColuna === -1) {
    throw new Error(`Coluna "${colunaNome}" não encontrada no cabeçalho`);
  }

  const linhaDados = linhas[2 + linha] // O número 2 representa 2 linhas: cabeçalho (linha 0) e separador (linha 1)
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  return linhaDados[indiceColuna];
}

function getNumeroLinhasTabela(tabelaMarkdown) {
  const linhas = tabelaMarkdown.trim().split("\n");

  return linhas.length - 2; // desconta cabeçalho (linha 0) e separador (linha 1)
}

module.exports = {
  getLinhaTabela,
  getCelulaTabela,
  getNumeroLinhasTabela,
};
