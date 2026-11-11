# Контраст баннеров (этап 6m)

## Scrim (default)
`linear-gradient(to top, rgba(44,41,41,.72) 0%, rgba(44,41,41,.45) 40%, transparent 78%)`

Текст: Snow Ivory `#F2F0EB` (title L≈0.872); описание ≈90% snow (L≈0.688).

Эффективная α в зоне текста у низа баннера: **≈0.72**.

## Расчёт WCAG (композит Warm Black·α + underlay·(1−α))

| Подложка | α | Title | Desc | ≥4.5 |
| --- | --- | --- | --- | --- |
| Белый (worst) | 0.72 | **5.09:1** | **4.07:1** | desc marginal* |
| Кремовый | 0.72 | **5.72:1** | **4.57:1** | PASS |
| Средний тон | 0.72 | **9.54:1** | **7.64:1** | PASS |
| Тёмный / Placeholder | 0.72 | **12.1:1** | **9.7:1** | PASS |
| Белый + strong (×1.15) | ~0.83 | **7.26:1** | **5.81:1** | PASS |

\* Описание на чисто белом при default чуть <4.5; у реальных кадров низ темнее. Светлые → `scrimStrength="strong"`.

## По баннерам главной

| Баннер | Кадр | Scrim | Контраст |
| --- | --- | --- | --- |
| Бренды | Gemini ty7owq | default | тёмный низ → PASS |
| Каталог | **Placeholder** | strong | тёмный → PASS (~12:1 / 9.7:1) |
| Интерьеры | interior-03 | default | PASS |
| Шоурумы | hero.jpg (флаг выкл.) | default | — |
| Дизайнерам (сплит) | partners.jpg | ink-фон | кнопка inverse на Warm Black |

## /brands/

| Бренд | Scrim |
| --- | --- |
| Visionnaire | strong |
| Molteni&C / Baxter | default |
| Bonaldo | default (Placeholder) |

## Provenance: `public/images/interior-01.png`

```
git log --follow -- public/images/interior-01.png  → пусто
git status → ?? untracked
exiftool → не установлен
file → PNG 1440×1791 RGBA
```

Источник неизвестен → с баннера «Каталог» снят, до замены Placeholder.
