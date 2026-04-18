# DESIGN AUDIT — Le Doigt du Destin

**Date :** 2026-04-19
**Direction validée :** Liquid Glass iOS 26 vibrant club (specular rouge `#ff2d55` + violet `#bf5af2`)
**Scope :** 5 écrans + modal caméra

---

## Légende des mockups ASCII

```
╔════╗ = glass-regular (card, nav, dock)
┌────┐ = solid/classic container (zéro verre)
▓▓▓▓  = glass-clear (overlay léger)
░░░░  = glass-dense (modal caméra)
⬤ ⬤  = accent color (CTA, winner, active)
·····  = specular edge / glow halo
```

---

## 1. Screen HOME

### État actuel
```
┌──────────────────────────────┐
│                              │
│                              │
│             ☠️                │
│                              │
│         Le Doigt             │
│         du Destin            │
│                              │
│    Un seul perdant.          │
│  Tous les autres regardent.  │
│                              │
│     [  Nouveau Jeu  ]        │
│                              │
│                              │
└──────────────────────────────┘
```
- Logo emoji plat, rendu OS-dépendant
- Titre blanc crème sur noir pur, aucune profondeur
- CTA rouge solide, pas de matière

### Frictions
1. **Pas de moment WOW à l'ouverture** — aucune animation d'ambiance qui installe le ton du jeu
2. **Titre figé** — une fois lu, l'écran ne vit plus jusqu'au tap
3. **CTA orphelin** — flotte sans hiérarchie avec le reste
4. **Fond mort** — pas de texture/gradient qui donne envie de regarder
5. **Logo ☠️ trop cartoon** — casse le ton "club vibrant"

### Mockup refonte
```
┌──────────────────────────────┐
│     (gradient mesh ambient)   │
│  ·················           │
│  ·  ⬤ orb pulse  ·           │
│  ·  (red→violet) ·           │
│  ·················           │
│                              │
│       Le Doigt               │
│       du Destin              │
│       ═══════════            │
│                              │
│  Un seul perdant.            │
│  Tous les autres regardent.  │
│                              │
│  ╔════════════════════╗      │
│  ║ ✦ Nouveau Jeu  →   ║      │
│  ╚════════════════════╝      │
│   (glass-regular + specular) │
└──────────────────────────────┘
```

### Changements
| Élément | Type | Note |
|---|---|---|
| `<div class="ambient-mesh">` | HTML new | Div absolue avec radial gradient `#1a0f26 → #070710` + 2 blobs colorés blur 80px |
| Logo ☠️ → `.logo-orb` | CSS rewrite | Sphère SVG 120×120 avec specular + `glassShineSweep` 8s infinite |
| `.game-title` | CSS tune | Ajouter text-shadow subtil `0 0 40px rgba(255,45,85,0.3)` |
| `.btn-primary` Home | CSS rewrite | Glass-regular + flèche `→` inline + specular sweep on hover |
| Keyframe `pulseGlow` sur orb | CSS new | 2s infinite, couleur alternée rouge→violet |

**Purement CSS** (zéro changement HTML/JS hors ajout `<div class="ambient-mesh">`).

---

## 2. Screen GAGE

### État actuel
```
┌──────────────────────────────┐
│ ← Le Gage                    │
│                              │
│                              │
│  QUEL EST LE GAGE DU         │
│  PERDANT ?                   │
│                              │
│  ┌────────────────────────┐  │
│  │ Ex: faire 20 pompes... │  │
│  │                        │  │
│  │                        │  │
│  └────────────────────────┘  │
│                      12/200  │
│                              │
│                              │
│                              │
│     [   Suivant →    ]       │
└──────────────────────────────┘
```
- `.btn-back` 24px (2 chars, tap target sous-dimensionné)
- Textarea surface2 solide
- CTA statique tout en bas

### Frictions
1. **Back button 24px** — hors standard tap target iOS 44px
2. **Pas de swipe-back** — geste naturel iPhone absent
3. **Textarea plate** — aucune différenciation avec le reste
4. **Compteur 12/200 atone** — devrait alerter à l'approche de la limite
5. **CTA passif** — flotte sans ancrage visuel (ni sticky ni dock)

### Mockup refonte
```
┌──────────────────────────────┐
│ ╔═══════════════════════════╗│
│ ║ (←) pill   Le Gage        ║│ glass-regular sticky top
│ ╚═══════════════════════════╝│
│                              │
│  QUEL EST LE GAGE DU         │
│  PERDANT ?                   │
│                              │
│  ╔════════════════════════╗  │
│  ║ Ex: faire 20 pompes... ║  │ glass-regular
│  ║                        ║  │ inner shadow subtle
│  ║                        ║  │ focus → blur augmente
│  ╚════════════════════════╝  │
│  ·········         12/200    │ pulse red si > 180
│                              │
│  ──────────────────────────  │
│  ╔══════════════════════════╗│
│  ║ Suivant  →               ║│ dock glass-regular bottom
│  ╚══════════════════════════╝│
└──────────────────────────────┘
```

### Changements
| Élément | Type | Note |
|---|---|---|
| `.btn-back` → pill 44×44 | CSS rewrite | Icône SVG chevron (pas texte `←`), glass-regular |
| `.screen-header` → sticky glass | CSS rewrite | `position: sticky; top: 0;` + `padding-top: max(56px, var(--sa-top))` |
| `textarea` | CSS rewrite | Glass-regular input, focus augmente `--glass-blur-md` → `--glass-blur-lg` |
| `.char-count` | CSS tune | Classe `.warn` ajoutée par JS si ≥180, pulse rouge |
| CTA "Suivant" → dock | HTML+CSS | Extraire de `.screen-content`, mettre en `<div id="dock">` fixed bottom |
| Swipe-back → home | JS étape 4 | Gesture detection edge 0-20px |

**Changements structurels :** dock séparé (étape 4).

---

## 3. Screen PLAYERS

### État actuel
```
┌──────────────────────────────┐
│ ← Les Joueurs                │
│                              │
│  ┌─┐  ┌─────────────┐  ┌─┐   │
│  │📷│  │ Nom du joueur│  │+│   │
│  └─┘  └─────────────┘  └─┘   │
│                              │
│  ┌──────────────────────────┐│
│  │ ⬤ Alice            × │  ││
│  ├──────────────────────────┤│
│  │ ⬤ Bob              × │  ││
│  ├──────────────────────────┤│
│  │ ⬤ Chloé            × │  ││
│  └──────────────────────────┘│
│                              │
│  Ajoutez au moins 2 joueurs  │
│    [  C'est parti ! 🎲  ]    │
└──────────────────────────────┘
```
- Form ajout en haut → scrolle pour voir CTA avec 6+ joueurs
- Cards surface2 plates
- Avatar photo optionnel pas clair (placeholder 📷 seul)
- CTA dans le flux scrollable

### Frictions
1. **Form d'ajout scrolle out of view** quand liste longue
2. **Photo optionnel ambigu** — user croit que caméra est obligatoire
3. **Cards plates** — couleur joueur sous-exploitée
4. **CTA perdu en bas** — pas sticky, pas ancré
5. **Bouton `×` supprimer** petit et peu visible
6. **Hint "Ajoutez au moins 2 joueurs"** disparaît quand on tape — devrait évoluer

### Mockup refonte
```
┌──────────────────────────────┐
│ ╔═══════════════════════════╗│
│ ║ (←)   Les Joueurs   3/∞   ║│ glass-regular sticky (compteur live)
│ ╚═══════════════════════════╝│
│                              │
│  ╔══════════════════════════╗│
│  ║  (📷) (pill_input____) (+)║│ add-form glass-regular
│  ║  opt.   Nom              ║│ (+) morphe en ✓ après add
│  ╚══════════════════════════╝│
│                              │
│  ╔══════════════════════════╗│
│  ║ ⬤ Alice          (×)    ║│ player-card glass-regular
│  ║ ·········· red specular  ║│ specular ton couleur joueur
│  ╚══════════════════════════╝│
│  ╔══════════════════════════╗│
│  ║ ⬤ Bob            (×)    ║│
│  ║ ·········· blue specular ║│
│  ╚══════════════════════════╝│
│                              │
│  ──── (scrollable area) ────  │
│  ╔══════════════════════════╗│
│  ║ ✦ C'est parti ! 🎲       ║│ dock glass-regular
│  ╚══════════════════════════╝│ disabled état = opacity 0.4
└──────────────────────────────┘
```

### Changements
| Élément | Type | Note |
|---|---|---|
| Compteur `3/∞` dans nav | HTML+JS | Ajouter `<span id="nav-counter">` mis à jour par `renderPlayers()` |
| `.add-player-form` | CSS rewrite | Glass-regular, input en pill, avatar-btn avec label "opt." en tooltip discret |
| `.btn-add` | CSS+JS | Morphe en ✓ check pendant 0.4s après `addPlayer()`, puis reset |
| `.player-card` | CSS rewrite | Glass-regular avec `background: linear-gradient(135deg, ${playerColor}22, transparent)` (specular teinté joueur) |
| `.btn-remove` (×) | CSS tune | Taille 32×32, glass-clear, hover rouge vif |
| `.bottom-actions` → dock | HTML+CSS | Extraction en `<div id="dock">` fixed, gère le disabled visuel |
| Hint "Ajoutez 2 joueurs" | JS tune | Remplacer par texte dynamique : "Encore 1 joueur" / "Prêt !" selon count |

**Changements structurels :** dock + compteur nav (étape 4).

---

## 4. Screen FINGERS (critique perf)

### État actuel
```
┌──────────────────────────────┐
│         Alice                │
│  pose ton doigt sur l'écran  │
│    ●  ●  ○  ○  ○              │
│                              │
│                              │
│    ⬤                         │ touch-circle Alice posé
│    ↑ring pulse                │
│                              │
│          ⬤                   │ touch-circle Bob posé
│                              │
│                              │
│                              │
│                              │
└──────────────────────────────┘
```
- Instruction disparaît brusquement quand tous posés
- `.progress-dot` petits (8px)
- Touch circles OK mais pas de specular
- Fond noir pur

### Frictions
1. **Instruction transition brute** (display:none instantané)
2. **Progress dots trop petits** — difficile de compter d'un coup d'œil
3. **Touch circles sans profondeur** — pas de specular, pas de matière
4. **Fond noir total** — pas de "scène" pour les doigts
5. **Aucun feedback pré-pose** — écran vide, user hésite

### Contrainte critique
**⚠️ ZÉRO `backdrop-filter` sur `.touch-area` et `.touch-circle*`** — `touchmove` track la position en continu (`app.js:293-303`), tout blur actif = drop à 30fps avec 4+ doigts.

### Mockup refonte
```
┌──────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ glass-clear top instruction
│  ▓    Alice              ▓  │ (pointer-events:none)
│  ▓  pose ton doigt       ▓  │
│  ▓  ● ● ○ ○ ○             ▓  │ progress 12px dots
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  (gradient mesh léger)       │ ambient très subtle
│                              │
│    ⬤·····                    │ touch-circle Alice
│    (red specular ring)       │ specular statique
│                              │
│          ⬤·····              │ touch-circle Bob
│                              │
│                              │
│   (scene vide — touch-area)  │ ← ZÉRO verre ici
│                              │
└──────────────────────────────┘
```

Countdown phase :
```
┌──────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  ▓                        ▓  │
│  ▓                        ▓  │ glass-clear overlay
│  ▓          3             ▓  │ + glassShineSweep 8s
│  ▓         ·····          ▓  │ specular traverse
│  ▓    (red+violet glow)   ▓  │
│  ▓                        ▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                              │
│    ⬤·····  (locked)          │ circles figés, ring paused
│          ⬤·····              │
│                              │
└──────────────────────────────┘
```

### Changements
| Élément | Type | Note |
|---|---|---|
| `.fingers-instruction` | CSS rewrite | Glass-clear pill top, fade out avec `opacity` + `transform: translateY(-20px)` (pas `display:none` brut) |
| `.progress-dot` | CSS tune | 12×12px (vs 8×8 actuel), glass-clear pour off, accent glow pour done |
| `.touch-area` ambient | CSS new | Gradient mesh très léger derrière (pas sur touch-area directement pour éviter repaint) |
| `.touch-circle-ring` | CSS tune | Garder `ringPulse`, ajouter specular gradient rotatif très lent (16s, `animation-play-state: paused` pendant countdown pour éco CPU) |
| `.touch-circle-inner` | CSS tune | Border 3px avec gradient specular au lieu de couleur solide |
| `.countdown-overlay` | CSS rewrite | Glass-clear (moins dense), remplace `overlayFlash` par `glassShineSweep` |
| `.countdown-number` | CSS tune | Garder `countPop` 0.7s, enrichir text-shadow double accent rouge+violet |
| `.countdown-go` | CSS tune | Garder `goPop` 0.5s, ajouter `pulseGlow` 0.5s après apparition |

**Perf check obligatoire :** Safari Timeline pendant `touchmove` avec 5 doigts → `< 16ms/frame`. Si glass-clear sur instruction fait dropper, le passer en surface semi-opaque solide avec `@media (pointer: coarse)`.

---

## 5. Screen REVEAL

### État actuel
```
┌──────────────────────────────┐
│                              │
│                              │
│         ┌──────┐             │
│         │  A   │             │ reveal-avatar 140px
│         └──────┘             │ border accent
│                              │
│          Alice               │
│                              │
│  ┌─────────────────────┐     │
│  │ Ton gage            │     │ surface2 card
│  │ faire 20 pompes     │     │
│  └─────────────────────┘     │
│                              │
│       [🔊 Écouter]           │
│                              │
│  [ Rejouer ] [Nouvelle part.]│
└──────────────────────────────┘
```
- Avatar winner avec border simple
- Gage card plate
- **Rejouer vs Nouvelle partie ambigus** (friction #6 du plan)
- Bouton Écouter neutre

### Frictions
1. **"Rejouer" vs "Nouvelle partie"** ambigus → renommer "Même gage" / "Recommencer"
2. **Avatar border simple** — pas de sensation "winner"
3. **Gage card atone** — n'incarne pas la sentence
4. **🔊 Écouter** sans hiérarchie — l'user l'oublie
5. **Actions en bas pas docké** — scroll possible sur petits écrans

### Mockup refonte
```
┌──────────────────────────────┐
│                              │
│   (ambient dim + glow)        │ fond dimmed pour focus avatar
│                              │
│       ·················      │ pulseGlow 2s infinite
│       ·               ·      │ outer ring color joueur
│       · ╔═══════════╗ ·      │ double-ring: inner glass specular
│       · ║     A     ║ ·      │
│       · ╚═══════════╝ ·      │ avatar 140px
│       ·               ·      │
│       ·················      │
│                              │
│       A L I C E              │ grandes lettres spacing
│                              │
│  ╔══════════════════════╗    │
│  ║ Ton gage             ║    │ glass-regular
│  ║ faire 20 pompes      ║    │ text-shadow subtle
│  ╚══════════════════════╝    │
│                              │
│  ╔══════════════════════╗    │
│  ║ 🔊 Écouter           ║    │ glass-regular secondary
│  ╚══════════════════════╝    │
│                              │
│  ──────────────────────────  │
│  ╔═══════════╗ ╔═══════════╗│
│  ║ Même gage ║ ║ Recommencer║│ dock 2 boutons
│  ╚═══════════╝ ╚═══════════╝│
└──────────────────────────────┘
```

### Changements
| Élément | Type | Note |
|---|---|---|
| `.reveal-avatar` | CSS rewrite | Double-ring : outer avec `box-shadow: 0 0 60px ${color}80`, inner glass avec specular edge |
| `.pulseGlow` sur avatar | CSS new keyframe | 2s infinite, color dynamique via CSS variable set en JS |
| `.reveal-name` | CSS tune | Letter-spacing 0.15em, taille 2.2rem |
| `.reveal-gage` | CSS rewrite | Glass-regular card |
| `.btn-icon` Écouter | CSS rewrite | Glass-regular secondary |
| `.reveal-actions` → dock | HTML+CSS | Extraction en dock 2 boutons |
| **Renommage CTAs** | HTML | `Rejouer` → `Même gage`, `Nouvelle partie` → `Recommencer` |

**Changements structurels :** dock 2 boutons + renommage (étape 4).

---

## 6. Modal CAMERA

### État actuel
```
████████████████████████████████
█                              █
█  ┌──────────────────────┐    █
█  │                      │    █
█  │      video feed      │    █
█  │      (mirrored)      │    █
█  │                      │    █
█  └──────────────────────┘    █
█                              █
█  [ Annuler ]    ( 📸 )       █
█                              █
████████████████████████████████
```
- Fond `rgba(0,0,0,0.97)` → quasi opaque
- Boutons asymétriques (pill vs circle)

### Frictions
1. **Fond noir opaque** — pas de matière, contraste brut
2. **Boutons asymétriques** — OK pour hiérarchie mais visuellement déséquilibré

### Mockup refonte
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░  ╔══════════════════════╗    ░ glass-dense background
░  ║                      ║    ░ blur 48px, opacity 0.5
░  ║      video feed      ║    ░
░  ║      (mirrored)      ║    ░
░  ║                      ║    ░
░  ╚══════════════════════╝    ░
░                              ░
░  ╔═══════════╗    (⬤ 📸)     ░ capture reste icône blanche 70px
░  ║  Annuler  ║                ░ annuler → pill glass-regular 44px
░  ╚═══════════╝                ░
░                              ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Changements
| Élément | Type | Note |
|---|---|---|
| `.modal` background | CSS rewrite | `background: rgba(10,10,16,0.5)` + `backdrop-filter: blur(48px)` |
| `.btn-capture` | CSS préservé | Garde blanc 70px (primary action) |
| Bouton "Annuler" | CSS rewrite | Pill 44px glass-regular |

**100% CSS.**

---

## Priorité écrans (ordre d'impact visuel)

| Rang | Écran | Raison |
|---|---|---|
| 1 | **Fingers + countdown** | Moments WOW du jeu, perception dominante |
| 2 | **Reveal** | Climax émotionnel, justification du jeu |
| 3 | **Home** | Premier contact, installe le ton |
| 4 | **Players** | Écran le plus utilisé en durée |
| 5 | **Gage** | Rapide, setup |
| 6 | **Modal camera** | Occasionnel |

Si coupe nécessaire en étape 5 (polish), tailler d'abord sur 5, 6.

---

## Décisions structurelles à valider

1. **Dock flottant** (étape 4) extrait `.bottom-actions` sur players, gage, reveal → change la hauteur scrollable et nécessite padding-bottom dynamique
2. **Nav unique** (étape 4) fusionne les 3 `.screen-header` actuels en un `<nav id="app-nav">` contrôlé par JS (title + back + spacer/counter)
3. **Renommage CTAs reveal** : `Rejouer` → `Même gage`, `Nouvelle partie` → `Recommencer` ✓ (validé user)
4. **Compteur dynamique** dans nav players : `3/∞` (ou `3 joueurs`) mis à jour par `renderPlayers()`
5. **Morph FAB** `+` → `✓` après `addPlayer()` puis reset 0.4s plus tard (étape 5)
6. **Swipe-back** sur gage et players uniquement (pas fingers/reveal)
7. **Ambient mesh** (div absolu en fond du body, sous tout le reste) qui reste présent sur toutes les screens sauf fingers (trop coûteux)

---

## Checkpoint utilisateur

Validation requise avant passage à l'étape 3 :

- [ ] Mockups ASCII alignés avec ta vision ? Si non, lequel ajuster ?
- [ ] Dock flottant OK (impact : changement structurel HTML étape 4) ?
- [ ] Nav unique fusionnée OK (impact : app.js devra gérer title dynamique) ?
- [ ] Compteur `3/∞` dans nav players : `3/∞`, `3 joueurs`, ou rien ?
- [ ] Ambient mesh activé sur toutes screens sauf fingers : OK ou garder fingers 100% noir ?
- [ ] Ordre de priorité écrans (fingers > reveal > home > players > gage) : OK ou tu inverses ?
