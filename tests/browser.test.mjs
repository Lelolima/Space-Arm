// Testes em Chrome headless (puppeteer-core): carregam as páginas, exercitam as
// interações principais e falham com qualquer erro de JavaScript ou de console.
// Rodar com `npm run test:browser`. Usa o Chrome instalado (CHROME_PATH sobrescreve).
import { test, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) throw new Error('Chrome não encontrado; defina CHROME_PATH');
  return found;
}

let browser;
before(async () => {
  browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--no-sandbox'] });
});
after(async () => {
  if (browser) await browser.close();
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage(file) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.split('\n')[0]}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(pathToFileURL(path.join(root, file)).href, { waitUntil: 'load' });
  return { page, errors };
}

const key = (page, type, k) => page.evaluate((t, kk) => window.dispatchEvent(new KeyboardEvent(t, { key: kk })), type, k);

// Todas as páginas devem carregar sem erros
const allPages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
for (const file of allPages) {
  test(`carrega sem erros: ${file}`, async () => {
    const { page, errors } = await openPage(file);
    await sleep(1500);
    await page.close();
    assert.deepStrictEqual(errors, []);
  });
}

test('optimized_game.html: inicia, move, atira, troca opções e mostra FPS', async () => {
  const { page, errors } = await openPage('optimized_game.html');
  await page.waitForSelector('#start-button', { visible: true, timeout: 5000 });
  await page.click('#start-button');
  await sleep(300);
  await key(page, 'keydown', 'w');
  await key(page, 'keydown', ' ');
  await sleep(1000);
  const state = await page.evaluate(() => {
    const canvas = document.getElementById('game-canvas');
    return {
      fps: document.querySelector('div#fps-counter')?.textContent || '',
      canvasW: canvas.width,
      score: document.getElementById('score').textContent,
      weapon: document.getElementById('weapon').textContent,
    };
  });
  await page.click('#occlusion');
  await page.click('#fps-counter');
  const fpsHidden = await page.evaluate(() => document.querySelector('div#fps-counter').style.display);
  await key(page, 'keyup', ' ');
  await page.close();
  assert.deepStrictEqual(errors, []);
  assert.match(state.fps, /^FPS: \d+/);
  assert.ok(state.canvasW > 0);
  assert.match(state.score, /^Score: \d+/);
  assert.match(state.weapon, /^Weapon: /);
  assert.strictEqual(fpsHidden, 'none');
});

test('space_arm_3d.html: menu, configurações, novo jogo, tiro, troca de arma e save', async () => {
  const { page, errors } = await openPage('space_arm_3d.html');
  await page.evaluate(() => localStorage.clear());
  await page.waitForSelector('#new-game-btn', { visible: true, timeout: 5000 });
  // Configurações: desativa auto-aim e volta
  await page.click('#settings-btn');
  await page.select('#aim-assist-level', '0');
  await page.click('#settings-back-btn');
  const aim = await page.$eval('#aim-assist-indicator', (e) => e.textContent);
  await page.click('#settings-btn');
  await page.select('#aim-assist-level', '2');
  await page.click('#settings-back-btn');
  await page.click('#new-game-btn');
  await sleep(300);
  const armBefore = await page.$eval('#arm', (e) => e.style.left);
  await key(page, 'keydown', 'd');
  await key(page, 'keydown', ' ');
  await sleep(1200);
  await key(page, 'keydown', 'Tab');
  await key(page, 'keyup', 'Tab');
  await sleep(300);
  const state = await page.evaluate(() => ({
    armLeft: document.getElementById('arm').style.left,
    fps: document.getElementById('fps').textContent,
    projectiles: document.querySelectorAll('#ui-overlay .projectile').length,
    message: document.getElementById('message-box').textContent,
    menuHidden: document.getElementById('main-menu').style.display,
  }));
  await key(page, 'keyup', ' ');
  await key(page, 'keyup', 'd');
  await page.close();
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(aim, 'Auto-Aim: Inativo');
  assert.notStrictEqual(state.armLeft, armBefore, 'o braço se moveu');
  assert.match(state.fps, /^FPS: \d+/);
  assert.ok(state.projectiles > 0, 'houve disparos');
  assert.strictEqual(state.message, 'Arma: Míssil');
  assert.strictEqual(state.menuHidden, 'none');
});

test('space_combat_enhanced.html: dificuldade, instruções, início, tiro, troca de arma, mira e pausa', async () => {
  const { page, errors } = await openPage('space_combat_enhanced.html');
  await page.waitForSelector('#start-game-btn', { visible: true, timeout: 10000 });
  await page.click('#instructions-btn');
  const instr = await page.$eval('#instructions-screen', (e) => e.style.display);
  await page.click('#back-to-menu-btn');
  await page.click('[data-difficulty="hard"]');
  await page.click('#start-game-btn');
  await sleep(500);
  await key(page, 'keydown', 'w');
  await key(page, 'keydown', ' ');
  await sleep(1000);
  await key(page, 'keydown', 'q');
  await key(page, 'keydown', 'e');
  await sleep(200);
  const state = await page.evaluate(() => ({
    difficulty: window.gameController.settings.difficulty,
    projectiles: window.gameController.projectiles.length,
    weapon: document.getElementById('weapon-display').textContent,
    targeting: document.getElementById('targeting-indicator').textContent,
    integration: Boolean(window.gameController.targetingIntegration),
  }));
  await key(page, 'keydown', 'Escape');
  await sleep(100);
  const paused = await page.evaluate(() => ({ state: window.gameController.gameState, menu: Boolean(document.getElementById('pause-menu')) }));
  await page.click('#resume-btn');
  const resumed = await page.evaluate(() => window.gameController.gameState);
  await page.close();
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(instr, 'flex');
  assert.strictEqual(state.difficulty, 'hard');
  assert.ok(state.projectiles > 0, 'houve disparos');
  assert.strictEqual(state.weapon, 'ARMA: Homing Missile');
  assert.strictEqual(state.targeting, 'MIRA AUTOMÁTICA: OFF');
  assert.ok(state.integration, 'TargetingSystemIntegration inicializado');
  assert.deepStrictEqual(paused, { state: 'paused', menu: true });
  assert.strictEqual(resumed, 'playing');
});
