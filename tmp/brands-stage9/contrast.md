# Контраст текста баннеров /brands/ (этап 9)

## Цвета
- Заголовок: Snow Ivory `#F2F0EB` → rgb(242, 240, 235), L ≈ 0.872
- Описание: `color-mix(Snow Ivory 90%)` ≈ rgb(218, 216, 212), L ≈ 0.688
- Warm Black: `#2C2929` → rgb(44, 41, 41)

## Затемнение
1. Базовый scrim (как на главной): `linear-gradient(to top, rgba(44,41,41,.58), transparent 55%)`
2. Только на `/brands/` (`.brands-banners`): + `radial-gradient` под текстовой зоной `rgba(44,41,41,.50)` → эффективная α ≈ **0.79** в зоне H2/описания

## Расчёт (WCAG 2.1 relative luminance)

Эффективный фон: `bg = WarmBlack·α + underlay·(1−α)`, α = 0.79

| Подложка (низ кадра) | bg ≈ | Title | Desc | ≥4.5:1 |
| --- | --- | --- | --- | --- |
| Белый (worst case) | rgb(88,86,86) | **6.40:1** | **5.12:1** | PASS |
| Кремовый диван | rgb(83,80,79) | **7.02:1** | **5.61:1** | PASS |
| Деревянный пол | rgb(68,63,56) | **9.16:1** | **7.33:1** | PASS |
| Placeholder / тёмный пол | rgb(47,44,42) | **12.17:1** | **9.74:1** | PASS |

Visionnaire / Molteni&C / Baxter — фото; Bonaldo — Placeholder (тёмный градиент `#3a3530`→ink).
