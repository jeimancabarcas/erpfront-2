# Button Atom Specification

## Purpose

The `<ui-button>` atom is a reusable button component used across 30+ locations. This spec defines its visual behavior for hover transitions, vertical alignment, border model, and rendering consistency.

## Requirements

### Requirement: Hover Transition Behavior

On hover, the button MUST transition only `background-color` and MAY transition `color`. Hover MUST NOT produce border artifacts, thick inner borders, or animate layout properties.

#### Scenario: Default variant hover darkens background

- GIVEN a `<ui-button>` with variant="default"
- WHEN the user hovers over the button
- THEN the computed `background-color` transitions smoothly to a darker value over 200-300ms
- AND no `border` or `box-shadow` computed value changes during the transition

#### Scenario: Hover on active button does not introduce borders

- GIVEN a `<ui-button>` in pressed/active state
- WHEN the user hovers over it
- THEN the hover background applies on top of the active background
- AND no border artifact appears

### Requirement: Vertical Content Centering

Button content (text and optional icon) MUST be perfectly vertically centered regardless of Tailwind host height overrides.

#### Scenario: Default height centering

- GIVEN a `<ui-button>` with no host height override
- WHEN the button renders
- THEN the content's computed vertical alignment is centered within the button bounds

#### Scenario: Host height override via Tailwind `!h-*`

- GIVEN a `<ui-button>` inside a container with `class="!h-10"` or `class="!h-12"`
- WHEN the button renders
- THEN the content remains vertically centered within the button
- AND the button fills the host's declared height

### Requirement: Border Model

The button MUST use `border: none` as its baseline. The outline variant MUST keep an explicit visible border. Transparent borders MUST NOT participate in hover transitions.

#### Scenario: Default variant has no border

- GIVEN a `<ui-button>` with variant="primary" or variant="secondary"
- WHEN the button renders
- THEN the computed `border-style` is `none`

#### Scenario: Outline variant keeps visible border

- GIVEN a `<ui-button>` with variant="outline"
- WHEN the button renders
- THEN the computed `border` has non-zero width and a visible color

#### Scenario: Hover does not change border

- GIVEN any `<ui-button>` variant
- WHEN the user hovers over the button
- THEN the computed `border` style remains unchanged from its non-hover state

### Requirement: Transition Scoping

CSS transitions MUST scope to `background-color` and `color` only. Width, border, padding, and other layout properties MUST NOT animate.

#### Scenario: Layout properties do not animate

- GIVEN a `<ui-button>` with variant="primary"
- WHEN the user hovers over the button, then unhovers
- THEN no `width`, `height`, `padding`, or `border` transition runs

### Requirement: Rendering Consistency

All `<ui-button>` instances MUST render identically for the same variant, size, and state regardless of parent context.

#### Scenario: Same variant renders identically across parents

- GIVEN two `<ui-button>` instances with variant="primary" and size="md"
- WHEN placed inside different parent containers
- THEN both instances have identical computed styles for background, border, padding, and font
