// Testes de fumaça sem dependências: validam sintaxe dos scripts e das páginas
// jogáveis, e o comportamento do SaveSystem. Rodar com `npm test`.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

// Os 6 JS e as 3 páginas antes truncados foram reconstruídos em 2026-11-22
// (ver docs/auditoria/AUDITORIA-2026-11-22.md). Todos devem compilar.

const jsFiles = fs.readdirSync(root).filter((f) => f.endsWith('.js'));
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const paginasJogaveis = htmlFiles;

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

for (const f of jsFiles) {
  test(`sintaxe válida: ${f}`, () => assert.ok(compila(read(f))));
}

for (const f of paginasJogaveis) {
  test(`página jogável íntegra: ${f}`, () => {
    const html = read(f);
    const s = scriptsDaPagina(html);
    assert.match(html.trimEnd(), /<\/html>$/i, 'HTML termina em </html>');
    assert.strictEqual(s.aberturas, s.fechamentos, 'todas as tags <script> fechadas');
    for (const src of s.externos) {
      assert.ok(fs.existsSync(path.join(root, src)), `script ${src} existe`);
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
