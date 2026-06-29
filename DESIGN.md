# ComplianceAI — Design System

> Single source of truth for all visual decisions in the frontend.
> All CSS custom properties in `src/index.css` are derived from this document.

---

## Brand Identity

**Product Name:** ComplianceAI  
**Tagline:** AI-Powered Regulatory Gap Analysis  
**Visual Language:** Dark-first, enterprise-grade, technical precision with warmth  
**Font:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts, weights 300–800)

---

## Color Palette

### Background & Surface
| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#0a0e1a` | Page background (deep navy) |
| `--color-bg-surface` | `#111827` | Card backgrounds |
| `--color-bg-raised` | `#1a1f36` | Slightly elevated surfaces |
| `--color-bg-elevated` | `#1e293b` | Inputs, dropdowns, hover states |

### Border
| Token | Hex | Usage |
|---|---|---|
| `--color-border-subtle` | `#1e293b` | Subtle dividers, card outlines |
| `--color-border-default` | `#334155` | Input borders, separators |
| `--color-border-focus` | `#6366f1` | Focus rings |

### Text
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#f1f5f9` | Primary body text |
| `--color-text-secondary` | `#94a3b8` | Subtitles, descriptions |
| `--color-text-tertiary` | `#64748b` | Hints, placeholders, meta |
| `--color-text-inverse` | `#0a0e1a` | Text on light backgrounds |

### Brand / Primary
| Token | Hex | Usage |
|---|---|---|
| `--color-primary-300` | `#a5b4fc` | Light accents |
| `--color-primary-400` | `#818cf8` | Links, active labels |
| `--color-primary-500` | `#6366f1` | Primary actions, focus |
| `--color-primary-600` | `#4f46e5` | Hover states |

**Primary gradient:** `linear-gradient(135deg, #6366f1, #8b5cf6)`

### Semantic — Risk Levels
| Token | Hex | Level | Score Range |
|---|---|---|---|
| `--color-risk-critical` | `#ff4757` | CRITICAL | 80–100 |
| `--color-risk-high` | `#ff6b35` | HIGH | 60–79 |
| `--color-risk-medium` | `#ffa502` | MEDIUM | 40–59 |
| `--color-risk-low` | `#2ed573` | LOW | 0–39 |

### Semantic — Confidence Levels
| Token | Hex | Level |
|---|---|---|
| `--color-confidence-confirmed` | `#2ed573` | CONFIRMED |
| `--color-confidence-probable` | `#ffa502` | PROBABLE |
| `--color-confidence-unknown` | `#ff4757` | UNKNOWN |

### Semantic — State
| Token | Hex | Usage |
|---|---|---|
| `--color-state-success` | `#2ed573` | Completed, success |
| `--color-state-warning` | `#ffa502` | Warnings |
| `--color-state-error` | `#ff4757` | Errors, failures |
| `--color-state-info` | `#818cf8` | Running, in-progress |

### External Research Mode
| Token | Hex | Usage |
|---|---|---|
| `--color-external-bg` | `rgba(14,116,144,0.08)` | Callout background |
| `--color-external-border` | `rgba(14,116,144,0.35)` | Callout border |
| `--color-external-text` | `#0e7490` | Labels and icons |

---

## Typography

**Base font size:** `16px` (1rem = 16px)

### Font Size Scale
| Token | Value | rem | Usage |
|---|---|---|---|
| `--font-size-xs` | `12px` | `0.75rem` | Hints, meta, file sizes |
| `--font-size-sm` | `14px` | `0.875rem` | Labels, badges, secondary text |
| `--font-size-md` | `16px` | `1rem` | Body text (base) |
| `--font-size-lg` | `18px` | `1.125rem` | Lead text |
| `--font-size-xl` | `20px` | `1.25rem` | Section labels |
| `--font-size-2xl` | `24px` | `1.5rem` | H2 headings |
| `--font-size-3xl` | `32px` | `2rem` | H1 page titles |
| `--font-size-4xl` | `48px` | `3rem` | Hero numbers (risk score) |

### Font Weight
| Token | Value | Usage |
|---|---|---|
| `--font-weight-light` | `300` | De-emphasised text |
| `--font-weight-regular` | `400` | Body copy |
| `--font-weight-medium` | `500` | UI labels |
| `--font-weight-semibold` | `600` | Subheadings, form labels |
| `--font-weight-bold` | `700` | Headings, badges |
| `--font-weight-extrabold` | `800` | Hero numbers, stat cards |

### Line Height
| Token | Value | Usage |
|---|---|---|
| `--line-height-tight` | `1.2` | Headings |
| `--line-height-snug` | `1.35` | Compact UI text |
| `--line-height-normal` | `1.6` | Body text |
| `--line-height-relaxed` | `1.75` | Long-form content |

---

## Spacing

**Base unit:** `4px` (0.25rem). All spacing is a multiple of 4.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Micro gaps (icon + label) |
| `--space-2` | `8px` | Inner element spacing |
| `--space-3` | `12px` | Compact padding |
| `--space-4` | `16px` | Standard component padding |
| `--space-5` | `20px` | Medium gaps |
| `--space-6` | `24px` | Section inner padding |
| `--space-8` | `32px` | Page-level padding |
| `--space-10` | `40px` | Section separation |
| `--space-12` | `48px` | Large section gaps |
| `--space-16` | `64px` | Hero sections |

> **Legacy aliases** (keep for backwards compat during transition):
> `--space-xs = --space-1`, `--space-sm = --space-2`, `--space-md = --space-4`,
> `--space-lg = --space-6`, `--space-xl = --space-8`, `--space-2xl = --space-12`

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | `4px` | Badge pills (small) |
| `--radius-sm` | `6px` | Compact chips |
| `--radius-md` | `10px` | Inputs, buttons, small cards |
| `--radius-lg` | `16px` | Cards, panels |
| `--radius-xl` | `24px` | Large modals |
| `--radius-full` | `9999px` | Pills, avatars, progress bars |

---

## Elevation / Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` | Subtle card lift |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Hover state cards |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modals, drawers |
| `--shadow-glow` | `0 0 20px rgba(99,102,241,0.15)` | Focused primary actions |
| `--shadow-glow-lg` | `0 0 40px rgba(99,102,241,0.2)` | Hero CTAs |

---

## Z-Index Scale

| Token | Value | Layer |
|---|---|---|
| `--z-below` | `-1` | Decorative backgrounds |
| `--z-base` | `0` | Default flow |
| `--z-raised` | `10` | Tooltips, dropdowns (relative) |
| `--z-sidebar` | `100` | Fixed sidebar |
| `--z-overlay` | `150` | Mobile sidebar backdrop |
| `--z-modal` | `200` | Modals |
| `--z-toast` | `300` | Toast notifications |

---

## Motion & Animation

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `150ms` | Micro-interactions |
| `--duration-normal` | `250ms` | Standard transitions |
| `--duration-slow` | `400ms` | Page transitions |
| `--ease-standard` | `cubic-bezier(0.4,0,0.2,1)` | Default easing |
| `--ease-enter` | `cubic-bezier(0,0,0.2,1)` | Elements entering |
| `--ease-exit` | `cubic-bezier(0.4,0,1,1)` | Elements leaving |

**Named animations:**
- `fadeIn` — `opacity 0 → 1, translateY(10px) → 0`
- `slideInLeft` — `opacity 0 → 1, translateX(-20px) → 0`
- `pulse` — box-shadow ping for active progress step
- `spin` — 360° rotation for loading spinner

---

## Layout

| Token | Value | Usage |
|---|---|---|
| `--layout-sidebar-width` | `320px` | Fixed sidebar width (desktop) |
| `--layout-sidebar-collapsed` | `64px` | Icon-only rail (tablet, future) |
| `--layout-content-max` | `960px` | Max content width |
| `--layout-auth-card-max` | `420px` | Auth form card max-width |

### Breakpoints
| Name | Min-width | Target |
|---|---|---|
| `sm` | `480px` | Large phones |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Small laptops |
| `xl` | `1280px` | Desktop |
| `2xl` | `1440px` | Large desktop |

---

## Component Specifications

### Cards
- **`.card`** — `background: var(--color-bg-surface)`, `border: 1px solid var(--color-border-subtle)`, `border-radius: var(--radius-lg)`, `padding: var(--space-6)`
- **`.card-glass`** — `background: rgba(17,24,39,0.6)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.05)`
- Hover on `.card`: `border-color → --color-border-default`, `box-shadow → --shadow-md`

### Buttons
- **`.btn`** — base: `display: inline-flex`, `align-items: center`, `gap: var(--space-2)`, `padding: 10px 20px`, `font-weight: var(--font-weight-semibold)`, `border-radius: var(--radius-md)`
- **`.btn--primary`** — background: primary gradient, hover: `translateY(-1px)` + glow shadow
- **`.btn--secondary`** — background: `--color-bg-elevated`, border: `--color-border-default`
- **`.btn--danger`** — background: `--color-risk-critical`
- **`.btn--sm`** — padding: `6px 14px`, font-size: `--font-size-sm`
- **`.btn--lg`** — padding: `14px 28px`, font-size: `--font-size-md`

### Badges
- Base: `border-radius: var(--radius-full)`, `font-size: var(--font-size-xs)`, `font-weight: var(--font-weight-bold)`, `text-transform: uppercase`, `letter-spacing: 0.05em`
- Variants: `badge--critical`, `badge--high`, `badge--medium`, `badge--low` (risk)
- Variants: `badge--confirmed`, `badge--probable`, `badge--unknown` (confidence)
- Variants: `badge--pending`, `badge--running`, `badge--complete`, `badge--failed` (pipeline state)

### Form Controls
- **Inputs/Selects/Textareas**: `padding: var(--space-3) var(--space-4)`, `background: var(--color-bg-base)`, `border: 1px solid var(--color-border-subtle)`, `border-radius: var(--radius-md)`
- Focus: `border-color: var(--color-primary-500)`, `box-shadow: 0 0 0 3px rgba(99,102,241,0.15)`
- **Form label**: `font-size: var(--font-size-sm)`, `font-weight: var(--font-weight-semibold)`, `text-transform: uppercase`, `letter-spacing: 0.05em`

### Tables (`.data-table`)
- Header row: `background: var(--color-bg-elevated)`, `font-size: var(--font-size-xs)`, uppercase
- Body rows: hover `background: rgba(99,102,241,0.04)`
- Cell padding: `12px 16px`
- `border-collapse: separate`, `border-radius: var(--radius-md)` on table

---

## Light Theme Override

Applied via `.light-theme` on `<html>`. All background/text/border tokens flip.
Risk and confidence colors remain unchanged (they must be readable on both themes).

| Dark token value | Light override |
|---|---|
| `--color-bg-base: #0a0e1a` | `#f8fafc` |
| `--color-bg-surface: #111827` | `#ffffff` |
| `--color-bg-raised: #1a1f36` | `#f1f5f9` |
| `--color-bg-elevated: #1e293b` | `#e2e8f0` |
| `--color-text-primary: #f1f5f9` | `#0f172a` |
| `--color-text-secondary: #94a3b8` | `#475569` |
| `--color-text-tertiary: #64748b` | `#94a3b8` |
