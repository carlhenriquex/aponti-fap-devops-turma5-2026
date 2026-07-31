const path = require("path");
const {
  lerAlunos,
  removerDuplicados,
  ordenarAlunos,
  gerarTabela,
} = require("../scripts/gerar-readme");
const { getCelulaTabela } = require("./utils/test-helpers");

const fixturesPath = path.join(__dirname, "fixtures");

describe("T01 - JSON válido", () => {
  test("deve reconhecer e incluir o aluno na lista", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t01-valido"));

    expect(alunos).toHaveLength(1);
    expect(alunos[0]).toMatchObject({
      nome: "Pedro Delmiro",
      github: "PedroDelmiro13",
    });
  });
});

describe("T02 - Nome ausente", () => {
  test("deve ignorar o registro incompleto", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t02-sem-nome"));

    expect(alunos).toHaveLength(0);
  });
});

describe("T03 - GitHub ausente", () => {
  test("deve ignorar o registro incompleto", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t03-sem-github"));

    expect(alunos).toHaveLength(0);
  });
});

describe("T04 - GitHub duplicado", () => {
  test("deve manter apenas um registro", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t04-duplicado"));
    const semDuplicados = removerDuplicados(alunos);

    expect(semDuplicados).toHaveLength(1);
  });
});

describe("T05 - Alunos fora de ordem", () => {
  test("deve ordenar os alunos por nome (ordem alfabética)", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t05-ordem"));
    const ordenados = ordenarAlunos(alunos);

    expect(ordenados.map((a) => a.nome)).toEqual([
      "Bruna Alves",
      "Carlos Lima",
      "Pedro Delmiro",
    ]);
  });
});

describe("T06 - Arquivo que não é JSON", () => {
  test("não deve incluir arquivos que não estejam no formato JSON", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t06-arquivo-nao-json"));

    expect(alunos).toHaveLength(1);
    expect(alunos[0]).toMatchObject({
      nome: "Pedro Delmiro",
      github: "PedroDelmiro13",
      cidade: "Jaboatão dos Guararapes",
      linkedin: "https://linkedin.com/in/pedrodelmiro",
    });
  });
});

describe("T07 - JSON com formato inválido", () => {
  test("não deve incluir arquivos JSON com formato inválido", () => {
    const alunos = lerAlunos(path.join(fixturesPath, "t07-json-invalido"));

    expect(alunos).toHaveLength(1);
  });
});

describe("T08 - Campos obrigatórios vazios", () => {
  test("não deve incluir alunos com campos obrigatórios vazios", () => {
    const alunos = lerAlunos(
      path.join(fixturesPath, "t08-campos-obrigatorios-vazios"),
    );

    expect(alunos).toHaveLength(1);
    expect(alunos[0]).toMatchObject({
      nome: "Pedro Delmiro",
      github: "PedroDelmiro13",
      cidade: "Jaboatão dos Guararapes",
      linkedin: "https://linkedin.com/in/pedrodelmiro",
    });
  });
});

describe("T09 - Linkedin ausente", () => {
  test("deve incluir aluno com linkedin ausente, exibindo hífen como valor padrão", () => {
    const PRIMEIRA_LINHA = 0;
    const alunos = lerAlunos(path.join(fixturesPath, "t09-linkedin-ausente"));

    const tabela = gerarTabela(alunos);
    const valorLinkedin = getCelulaTabela(tabela, PRIMEIRA_LINHA, "LinkedIn");

    expect(valorLinkedin).toBe("-");
  });
});
