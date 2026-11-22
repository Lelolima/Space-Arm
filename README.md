# Space Arm

Space Arm é um jogo de ação no navegador onde você controla um braço mecânico/nave no espaço, defendendo-se contra ondas de inimigos. Feito em HTML5 Canvas e JavaScript puro, sem dependências nem etapa de build.

## Como jogar

Abra `space_arm.html` (ou qualquer página da tabela abaixo) no navegador (duplo clique ou `file://`). Não há instalação para jogar; `npm ci` só é necessário para rodar os testes.

Opcional, para servir via HTTP: `python -m http.server 8000` e acesse http://localhost:8000/space_arm.html.

### Controles (space_arm.html)
- **W / S**: frente / trás
- **A / D**: esquerda / direita
- **Q / E**: subir / descer
- **ESPAÇO**: atirar

Os controles das outras variantes podem diferir; veja o código de cada página.

## Páginas

Estado verificado em 2026-11-22 com testes em Chrome headless (carregamento sem erros de JavaScript/console e interações principais):

| Página | Estado |
|--------|--------|
| `space_arm.html` | Funciona (versão principal) |
| `space_arm_fixed.html` | Funciona |
| `space_arm_improved.html` | Funciona |
| `space_arm_movement.html` | Funciona |
| `space_combat_simulator.html` | Funciona |
| `optimized_game.html` | Funciona; partes **reconstruídas** em 2026-11-22 |
| `space_combat_enhanced.html` | Funciona; partes **reconstruídas** em 2026-11-22 |
| `space_arm_3d.html` | Funciona; lógica do jogo **reconstruída** em 2026-11-22 |

Seis arquivos JS e três páginas chegaram truncados no commit original. Não havia versões completas no histórico git, então o que faltava foi reconstruído com a implementação mais simples compatível com o HTML, o CSS e o código existente (detalhes, arquivo por arquivo, em `docs/auditoria/AUDITORIA-2026-11-22.md`). O comportamento dessas partes pode diferir do que o autor pretendia originalmente.

### Controles de `space_combat_enhanced.html`
W/A/S/D ou setas: mover · ESPAÇO: atirar · Q: trocar arma · E: liga/desliga mira automática · T: sistema de mira · P: predição de movimento · ESC: pausa

### Controles de `space_arm_3d.html`
W/A/S/D: mover · Q/E: subir/descer · SHIFT: impulso · ESPAÇO: atirar · TAB: trocar arma

## Recursos (nas páginas que funcionam)
- Níveis progressivos e temas visuais
- Upgrade de armas
- Salvamento de progresso em `localStorage` (`save_system.js`)
- Mapa interativo (`interactive_map.js`)

## Protótipo em Python

`space_arm_panda3d.py` (antes `Untitled-1.ipynb`, que na verdade era um script Python, não um notebook) é um protótipo separado em Panda3D. Requer `pip install panda3d` e ambiente gráfico; não é usado pelas páginas HTML. Na auditoria foi apenas compilado (`py_compile`), não executado.

## Testes

```bash
npm ci
npm test               # testes estáticos (sintaxe, integridade das páginas, SaveSystem); Node 20+
npm run test:browser   # Chrome headless: carrega as 8 páginas e exercita as interações das 3 reconstruídas
```

`test:browser` usa o Chrome instalado na máquina (puppeteer-core, não baixa navegador); defina `CHROME_PATH` se ele não for encontrado. O CI (`.github/workflows/ci.yml`) roda os dois a cada push/PR.

## Variáveis de ambiente

Nenhuma.

## Tecnologias
- HTML5 / Canvas
- CSS3
- JavaScript
