# Space Arm

Space Arm é um jogo de ação no navegador onde você controla um braço mecânico/nave no espaço, defendendo-se contra ondas de inimigos. Feito em HTML5 Canvas e JavaScript puro, sem dependências nem etapa de build.

## Como jogar

Abra `space_arm.html` no navegador (duplo clique ou `file://`). Não há instalação.

Opcional, para servir via HTTP: `python -m http.server 8000` e acesse http://localhost:8000/space_arm.html.

### Controles (space_arm.html)
- **W / S**: frente / trás
- **A / D**: esquerda / direita
- **Q / E**: subir / descer
- **ESPAÇO**: atirar

Os controles das outras variantes podem diferir; veja o código de cada página.

## Páginas

Estado verificado na auditoria de 2026-11-22 (carregamento em Chrome headless, sem erros de JavaScript, e testes de sintaxe):

| Página | Estado |
|--------|--------|
| `space_arm.html` | Funciona (versão principal) |
| `space_arm_fixed.html` | Funciona |
| `space_arm_improved.html` | Funciona |
| `space_arm_movement.html` | Funciona |
| `space_combat_simulator.html` | Funciona |
| `optimized_game.html` | **Quebrada**: `optimized_game_launcher.js` e `space_arm_movement_enhanced.js` estão truncados |
| `space_combat_enhanced.html` | **Quebrada**: `game_menu.js`, `improved_targeting_system*.js` e `space_combat_enhanced.js` estão truncados |
| `space_arm_3d.html` | **Quebrada**: arquivo truncado no meio de um `<script>` |

Os arquivos truncados chegaram assim no commit original; o código que falta não existe no histórico e não foi reinventado.

## Recursos (nas páginas que funcionam)
- Níveis progressivos e temas visuais
- Upgrade de armas
- Salvamento de progresso em `localStorage` (`save_system.js`)
- Mapa interativo (`interactive_map.js`)

## Protótipo em Python

`space_arm_panda3d.py` (antes `Untitled-1.ipynb`, que na verdade era um script Python, não um notebook) é um protótipo separado em Panda3D. Requer `pip install panda3d` e ambiente gráfico; não é usado pelas páginas HTML. Na auditoria foi apenas compilado (`py_compile`), não executado.

## Testes

```bash
npm test   # Node 20+; sem dependências
```

Validam a sintaxe de todos os scripts íntegros, a integridade das páginas jogáveis (tags fechadas, scripts referenciados existem e compilam), o comportamento do `SaveSystem` e mantêm a lista de arquivos truncados explícita. O CI (`.github/workflows/ci.yml`) roda isso a cada push/PR.

## Variáveis de ambiente

Nenhuma.

## Tecnologias
- HTML5 / Canvas
- CSS3
- JavaScript
