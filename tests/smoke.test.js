// Testes de fumaça sem dependências: validam sintaxe dos scripts e das páginas
// jogáveis, e o comportamento do SaveSystem. Rodar com `npm test`.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

// Arquivos truncados no commit original (código perdido). Ver docs/auditoria.
const TRUNCADOS_JS = [
  'game_menu.js',
  'improved_targeting_system.js',
  'improved_targeting_system_part2.js',
  'optimized_game_launcher.js',
  'space_arm_movement_enhanced.js',
  'space_combat_enhanced.js',
];
const PAGINAS_QUEBRADAS = ['optimized_game.html', 'space_arm_3d.html', 'space_combat_enhanced.html'];

const jsFiles = fs.readdirSync(root).filter((f) => f.endsWith('.js'));
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const paginasJogaveis = htmlFiles.filter((f) => !PAGINAS_QUEBRADAS.includes(f));

const compila = (codigo) => {
  try {
    new vm.Script(codigo);
    return true;
  } catch {
    return false;
  }
};

const scriptsDaPagina = (html) => ({
  externos: [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]),
  inline: [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]),
  aberturas: (html.match(/<script\b/g) || []).length,
  fechamentos: (html.match(/<\/script>/g) || []).length,
});

for (const f of jsFiles.filter((f) => !TRUNCADOS_JS.includes(f))) {
  test(`sintaxe válida: ${f}`, () => assert.ok(compila(read(f))));
}

for (const f of TRUNCADOS_JS) {
  test(`continua truncado (remover da lista quando restaurado): ${f}`, () => assert.ok(!compila(read(f))));
}

for (const f of paginasJogaveis) {
  test(`página jogável íntegra: ${f}`, () => {
    const html = read(f);
    const s = scriptsDaPagina(html);
    assert.match(html.trimEnd(), /<\/html>$/i, 'HTML termina em </html>');
    assert.strictEqual(s.aberturas, s.fechamentos, 'todas as tags <script> fechadas');
    for (const src of s.externos) {
      assert.ok(fs.existsSync(path.join(root, src)), `script ${src} existe`);
      assert.ok(!TRUNCADOS_JS.includes(src), `script ${src} não está truncado`);
      assert.ok(compila(read(src)), `script ${src} compila`);
    }
    s.inline.forEach((code, i) => assert.ok(compila(code), `script inline #${i} compila`));
  });
}

test('SaveSystem salva, carrega e apaga dados', () => {
  const store = new Map();
  const ctx = {
    console: { log() {}, error() {} },
    localStorage: {
      setItem: (k, v) => store.set(k, String(v)),
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      removeItem: (k) => store.delete(k),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(read('save_system.js') + '\nthis.SaveSystem = SaveSystem;', ctx);
  const { SaveSystem } = ctx;
  assert.strictEqual(SaveSystem.load('x'), null);
  assert.strictEqual(SaveSystem.save('x', { nivel: 3, pontos: 120 }), true);
  assert.deepStrictEqual({ ...SaveSystem.load('x') }, { nivel: 3, pontos: 120 });
  store.set('corrompido', '{nao-json');
  assert.strictEqual(SaveSystem.load('corrompido'), null);
  SaveSystem.delete('x');
  assert.strictEqual(SaveSystem.load('x'), null);
});
