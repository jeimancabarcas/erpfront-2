# Design: Fix Button Hover Styles

## Technical Approach

SCSS-only fix to `button.component.scss` (no template/TS changes). Three isolated concerns: transition scoping, border model normalization, and vertical centering. The component is an Angular 21 atom at `src/app/components/atoms/button/`. Each fix is a targeted CSS change — not a refactor.

## Architecture Decisions

### Decision: Transition scoping — `background-color, color` only

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep `transition: all` | Simple but animates border-color and box-shadow on every frame | ❌ Rejected |
| Scope to `background-color, color` | Stops border/box-shadow animation cold. No layout flicker. | ✅ Chosen |
| Scope to `opacity, color` | More perf but requires color-stack refactor | ❌ Over-engineered |

**Rationale**: The current transition list includes `border-color` and `box-shadow`, both of which never change on hover for most variants. The `border-color` transitioning while the button has `border: 1px solid transparent` is the root cause of the thick inner-border artifact — the 1px transparent region animates unnecessarily, creating a visible edge ring during the transition. Scoping to only `background-color` and `color` eliminates it.

### Decision: Border model — `border: none` baseline, explicit on outline

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep `border: 1px solid transparent` | Baseline box-model preserved but participates in unwanted animation | ❌ Rejected |
| `border: none` on base, `border: 1px solid` on outline | Clean baseline, outline variant keeps visible border, ~2px content growth in border-box | ✅ Chosen |

**Rationale**: With Tailwind v4 preflight (`box-sizing: border-box` globally), the 1px transparent border takes up space inside the declared height. Removing it grows the content area ~2px (negligible). Every variant except outline had `border-color: transparent` — those overrides become redundant and are removed. The outline variant gets an explicit `border: 1px solid var(--color-accent)`.

### Decision: Vertical centering — `:host` alignment + `min-height` on size variants

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add `height: 100%` to `.button` | Requires cascade fight with size-specific heights | ❌ Brittle |
| Switch sizes to `min-height`, add `height: 100%` | Clean: min-height provides floor, percentage fills host when overridden | ✅ Chosen |
| Change `:host` to `inline-flex` | Works but changes host display model; risk of parent layout shifts | ❌ Riskier |

**Rationale**: Changing size variant `height` to `min-height` and adding `height: 100%` on `.button` gives us both fixed-size behavior (normal case) and host-fill behavior (when Tailwind overrides `:host` height). The `:host` gets `vertical-align: middle` to prevent baseline shift from `line-height: 0`.

## Data Flow

```
Parent container
  └── <ui-button> :host (inline-block, line-height: 0, vertical-align: middle)
       │  height: auto by default, overridable via Tailwind !h-*
       └── button.button (inline-flex, align-items: center, height: 100%)
            │  min-height per size variant provides floor
            └── .button__content (inline-flex, align-items: center)
                 └── <ng-content> (text + optional icon)
```

**Hover flow**: User hovers → `.button:hover:not(:disabled)` triggers → `background-color` transitions only (no border/box-shadow animation) → smooth color shift, no edge artifact.

## File Changes

### `src/app/components/atoms/button/button.component.scss` (Modify)

| Rule | Before | After |
|------|--------|-------|
| `:host` | `display: inline-block; line-height: 0;` | +`vertical-align: middle;` |
| `.button` base | `border: 1px solid transparent;` | `border: none;` |
| `.button` transitions | 4 properties incl. `border-color`, `box-shadow` | `background-color, color` only |
| `.button` sizing | *(no height rule)* | +`height: 100%;` |
| `--primary` | `border-color: transparent;` | *removed* |
| `--secondary` | `border-color: transparent;` | *removed* |
| `--outline` | `border-color: var(--color-accent);` | `border: 1px solid var(--color-accent);` |
| `--ghost` | `border-color: transparent;` | *removed* |
| `--icon` | `border-color: transparent;` | *removed* |
| `--sm` | `height: 2rem;` | `min-height: 2rem;` |
| `--md` | `height: 2.5rem;` | `min-height: 2.5rem;` |
| `--lg` | `height: 3rem;` | `min-height: 3rem;` |

### `src/app/components/atoms/button/button.component.spec.ts` (Modify)

Add 3 computed-style assertions:
1. Default variant has `border-style: none` and transition scoped to only `background-color`/`color`
2. Outline variant has visible border (`border-style: solid`, `border-width > 0`)
3. Host height override (simulate via `host.style.height`) → button fills the host

## Interfaces / Contracts

No new interfaces. The component's public API is unchanged:
- `@Input variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'icon'` (no change)
- `@Input size`: `'sm' | 'md' | 'lg'` (no change)
- All existing inputs, outputs, and template slots unchanged

The visual contract (from spec) is reinforced:
- Hover transitions MUST scope to `background-color` and `color` only
- Baseline border MUST be `none`; outline variant keeps 1px visible border
- Content MUST be vertically centered regardless of host `height` overrides

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component creation, click, disabled, loading | Keep existing 5 tests — no changes needed |
| Unit (new) | Computed style assertions for hover transitions | `getComputedStyle` — verify `transitionProperty` excludes `border`/`box-shadow` |
| Unit (new) | Border model per variant | `getComputedStyle` — verify `borderStyle` is `none` for non-outline, `solid` for outline |
| Unit (new) | Vertical centering with host override | Set `host.style.height`, verify `button.offsetHeight` matches |
| Visual | 5 variants × 3 sizes × 2 states (default, hover) | Manual visual check — no screenshot testing tool in stack |

## Migration / Rollout

No migration required. Single-file SCSS change — `git revert` rollback if needed. The ~2px content area growth from switching to `border: none` is visually negligible and affects all variants equally (outline variant keeps the 1px border, so its content area stays 2px smaller — acceptable given its distinct visual role).

## Non-Regression Checklist

- [ ] Primary hover: background darkens smoothly, no inner border
- [ ] Outline variant: visible 1px border present before and during hover
- [ ] Ghost/icon: transparent background, hover reveals background with no edge artifact
- [ ] All variants: disabled state (`opacity: 0.4, pointer-events: none`) unchanged
- [ ] All sizes: sm (2rem), md (2.5rem), lg (3rem) render at correct heights
- [ ] Loading spinner: position and animation unchanged
- [ ] `prefers-reduced-motion`: `transition: none` still fires
- [ ] Focus-visible: `outline: 2px solid var(--color-accent)` unchanged

## Open Questions

- [ ] None — all decisions resolved from codebase evidence and spec requirements.
