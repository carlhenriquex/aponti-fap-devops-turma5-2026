const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  lerAlunos,
  removerDuplicados,
  ordenarAlunos,
  gerarTabela,
  atualizarReadme,
} = require('../scripts/gerar-readme.js');

// --- Helpers de apoio (nao sao testes, so preparam o ambiente) ---

function criarAmbienteTemporario() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gerar-readme-teste-'));
  const caminhoPastaAlunos = path.join(dir, 'alunos');
  fs.mkdirSync(caminhoPastaAlunos);
  const readmePath = path.join(dir, 'README.md');

  const readmeInicial = [
    '# Turma Teste',
    '',
    '<!-- TABELA-INICIO -->',
    '<!-- TABELA-FIM -->',
    '',
    '<!-- ESTATISTICAS-INICIO -->',
    '<!-- ESTATISTICAS-FIM -->',
    '',
  ].join('\n');

  fs.writeFileSync(readmePath, readmeInicial, 'utf-8');

  return { dir, caminhoPastaAlunos, readmePath };
}

function criarAlunoJson(caminhoPastaAlunos, nomeArquivo, conteudo) {
  const caminho = path.join(caminhoPastaAlunos, nomeArquivo);
  const texto = typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo);
  fs.writeFileSync(caminho, texto, 'utf-8');
}

function lerReadme(readmePath) {
  return fs.readFileSync(readmePath, 'utf-8');
}

function limpar(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

// =========================================================================
// T01 — Smoke Test: JSON valido -> aluno incluido e README atualizado
// (fluxo completo, via atualizarReadme)
// =========================================================================
test('T01 - JSON valido: aluno e incluido e listado no README', () => {
  const { dir, caminhoPastaAlunos, readmePath } = criarAmbienteTemporario();
  try {
    criarAlunoJson(caminhoPastaAlunos, 'lucas.json', {
      nome: 'Lucas Madureiro Matias',
      github: 'LucasMadureiro',
    });

    assert.doesNotThrow(() => atualizarReadme(caminhoPastaAlunos, readmePath));

    const readme = lerReadme(readmePath);
    assert.match(readme, /Lucas Madureiro Matias/);
    assert.match(readme, /LucasMadureiro/);
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T02 — Sanidade: nome ausente -> registro ignorado
// (aqui testamos direto a funcao lerAlunos, que e' quem aplica essa regra)
// =========================================================================
test('T02 - Nome ausente: registro e ignorado', () => {
  const { dir, caminhoPastaAlunos } = criarAmbienteTemporario();
  try {
    criarAlunoJson(caminhoPastaAlunos, 'sem-nome.json', {
      github: 'usuario-sem-nome',
    });

    const alunos = lerAlunos(caminhoPastaAlunos);
    assert.equal(alunos.length, 0, 'aluno sem nome nao deveria ser incluido');
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T03 — Sanidade: github ausente -> registro ignorado
// =========================================================================
test('T03 - Github ausente: registro e ignorado', () => {
  const { dir, caminhoPastaAlunos } = criarAmbienteTemporario();
  try {
    criarAlunoJson(caminhoPastaAlunos, 'sem-github.json', {
      nome: 'Aluno Sem Github',
    });

    const alunos = lerAlunos(caminhoPastaAlunos);
    assert.equal(alunos.length, 0, 'aluno sem github nao deveria ser incluido');
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T04 — Sanidade: github duplicado (case-insensitive) -> mantem so um
// (aqui testamos direto a funcao removerDuplicados)
// =========================================================================
test('T04 - Github duplicado (case-insensitive): mantem apenas um registro', () => {
  const alunos = [
    { nome: 'Ricardo Silva', github: 'ricardosantanadev4' },
    { nome: 'Ricardo Silva (duplicado)', github: 'RicardoSantanaDev4' },
  ];

  const resultado = removerDuplicados(alunos);

  assert.equal(resultado.length, 1, 'deveria sobrar apenas um aluno apos remover duplicados');
  assert.equal(resultado[0].nome, 'Ricardo Silva', 'deveria manter o primeiro registro encontrado');
});

// =========================================================================
// T05 — Regressao: alunos fora de ordem -> lista final ordenada por nome
// (aqui testamos direto a funcao ordenarAlunos)
// =========================================================================
test('T05 - Alunos fora de ordem: lista final fica ordenada por nome', () => {
  const alunos = [
    { nome: 'Zeca Alves', github: 'zeca' },
    { nome: 'Ana Beatriz', github: 'ana' },
    { nome: 'Milton Magalhaes', github: 'milton' },
  ];

  const ordenados = ordenarAlunos(alunos);

  assert.deepEqual(
    ordenados.map((a) => a.nome),
    ['Ana Beatriz', 'Milton Magalhaes', 'Zeca Alves']
  );
});

// =========================================================================
// T06 — Sanidade: arquivo que nao e .json -> ignorado, script nao quebra
// =========================================================================
test('T06 - Arquivo nao-JSON na pasta alunos e ignorado', () => {
  const { dir, caminhoPastaAlunos } = criarAmbienteTemporario();
  try {
    criarAlunoJson(caminhoPastaAlunos, 'aluno-valido.json', {
      nome: 'Felipe Sabino de Oliveira',
      github: 'Felipe-Sabino-d-Oliveira',
    });
    // arquivo com extensao errada, nao deve ser processado nem quebrar o script
    fs.writeFileSync(path.join(caminhoPastaAlunos, 'anotacoes.txt'), 'isso nao e um JSON de aluno', 'utf-8');

    const alunos = lerAlunos(caminhoPastaAlunos);
    assert.equal(alunos.length, 1, 'so o arquivo .json valido deveria ser lido');
    assert.equal(alunos[0].nome, 'Felipe Sabino de Oliveira');
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T07 — Smoke Test: nenhum aluno valido -> roda sem erro, README com 0 alunos
// =========================================================================
test('T07 - Nenhum aluno valido: script roda sem erro e README fica com 0 alunos', () => {
  const { dir, caminhoPastaAlunos, readmePath } = criarAmbienteTemporario();
  try {
    criarAlunoJson(caminhoPastaAlunos, 'invalido-1.json', { github: 'sem-nome-1' });
    criarAlunoJson(caminhoPastaAlunos, 'invalido-2.json', { nome: 'Sem Github' });

    assert.doesNotThrow(() => atualizarReadme(caminhoPastaAlunos, readmePath));

    const readme = lerReadme(readmePath);
    assert.match(readme, /Total de alunos cadastrados:\s*0/);
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T08 — Regressao: JSON malformado -> ignorado, nao interrompe os demais
// =========================================================================
test('T08 - JSON malformado e ignorado e nao interrompe o processamento dos demais', () => {
  const { dir, caminhoPastaAlunos } = criarAmbienteTemporario();
  try {
    // JSON com erro de sintaxe proposital (virgula sobrando)
    criarAlunoJson(caminhoPastaAlunos, 'quebrado.json', '{ "nome": "Quebrado", "github": "quebrado", }');
    criarAlunoJson(caminhoPastaAlunos, 'valido.json', {
      nome: 'Sergio Ricardo Feitosa',
      github: 'SergioFeitosaa',
    });

    const alunos = lerAlunos(caminhoPastaAlunos);
    assert.equal(alunos.length, 1, 'apenas o aluno valido deveria ser lido');
    assert.equal(alunos[0].nome, 'Sergio Ricardo Feitosa');
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// T09 — Sanidade: pasta alunos inexistente -> script lanca erro tratavel
// =========================================================================
test('T09 - Pasta alunos inexistente: script lanca erro', () => {
  const { dir } = criarAmbienteTemporario();
  try {
    const pastaInexistente = path.join(dir, 'esta-pasta-nao-existe');
    assert.throws(() => lerAlunos(pastaInexistente));
  } finally {
    limpar(dir);
  }
});

// =========================================================================
// Teste extra (nao numerado na tabela original, mas util): gerarTabela
// confere se a funcao de montagem da tabela markdown inclui os dados certos
// =========================================================================
test('EXTRA - gerarTabela monta a linha da tabela com os dados do aluno', () => {
  const tabela = gerarTabela([
    { nome: 'Gabriela Pires', github: 'gavvdev', cidade: 'Recife' },
  ]);

  assert.match(tabela, /Gabriela Pires/);
  assert.match(tabela, /gavvdev/);
  assert.match(tabela, /Recife/);
});
