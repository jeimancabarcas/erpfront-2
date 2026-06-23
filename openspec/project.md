# Project: erpfrontend

**Initialized**: 2026-06-23
**Last SDD Init**: 2026-06-23
**Mode**: hybrid (openspec + Engram)
**Artifact Store**: openspec (file-based)
**Review Budget**: 1500 lines
**CodeGraph**: enabled (`.codegraph/` + MCP server)

## Stack

| Layer            | Technology                   | Version              |
| ---------------- | ---------------------------- | -------------------- |
| Framework        | Angular                      | ^21.2.10             |
| Language         | TypeScript                   | ~5.9.2               |
| UI Library       | Angular Material             | ^21.2.8              |
| CSS Framework    | Tailwind CSS                 | ^4.1.12              |
| PostCSS          | postcss + @tailwindcss/postcss | ^8.5.3 / ^4.1.12   |
| Build System     | Angular CLI (@angular/build) | ^21.2.6              |
| Package Manager  | npm                          | 11.11.0              |
| Node Engine      | Node.js                      | ^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0 |
| Formatter        | Prettier                     | ^3.8.1               |
| Test Runner      | Vitest                       | ^4.0.8               |
| DOM Environment  | jsdom                        | ^28.0.0              |

## Architecture

- **Atomic Design**: atoms → molecules → organisms → pages → templates
- **Standalone components** (no NgModules, no TestBed)
- **Signals** for state management and component models
- **Angular CDK** for overlay/positioning primitives (OverlayModule)
- **Reactive Forms** for complex forms, Template-driven for simple inputs
- **Tailwind utility classes**: canonical design system with `rounded-2xl` + indigo focus ring
- **Custom atoms** wrapping Material primitives via CDK Overlay (select dropdown, datepicker calendar)
- **CodeGraph**: indexed for AI-assisted code navigation and symbol resolution

## Project Structure

```
src/
├── app/
│   ├── app.ts                    # Root standalone component
│   ├── app.html                  # Root template
│   ├── app.css                   # Root styles
│   ├── app.config.ts             # Application config (providers)
│   ├── app.routes.ts             # Route definitions
│   ├── app.spec.ts               # Root component tests
│   ├── components/               # Atomic design components
│   │   ├── atoms/                # ui-text-input, ui-textarea, ui-select, ui-datepicker, etc.
│   │   ├── molecules/            # Compound components (form groups, etc.)
│   │   ├── organisms/            # Page sections, dialogs, sidebar
│   │   ├── pages/                # Full page-level components (e.g. sales-page)
│   │   └── templates/            # Layout templates
│   ├── guards/                   # Route guards (auth, permissions)
│   ├── interceptors/             # HTTP interceptors (auth, error handling)
│   ├── models/                   # Typed interfaces and data models
│   ├── services/                 # Injectable services (API, state, sidebar)
│   ├── shared/                   # Shared modules, pipes, directives
│   └── utils/                    # Utility functions
├── environments/                 # environment.ts + environment.development.ts
├── main.ts                       # App bootstrap entry point
├── index.html                    # HTML shell (root component mount)
└── styles.css                    # Global styles (Tailwind directives)
```

## Testing Capabilities

| Layer         | Available | Tool       | Coverage |
|---------------|-----------|------------|----------|
| Unit          | ✅ Yes    | Vitest     | ✅ Yes (`ng test --code-coverage`) |
| Integration   | ❌ No     | —          | —        |
| E2E           | ❌ No     | —          | —        |

### Quality Tools

| Tool           | Available | Command                  |
|----------------|-----------|--------------------------|
| Type Checker   | ✅ Yes    | `npx tsc --noEmit`       |
| Formatter      | ✅ Yes    | `npx prettier --check .` |
| Linter         | ❌ No     | —                        |

### Test Inventory
- **30+ spec files** across atoms, molecules, organisms, and pages
- All use `TestBed.configureTestingModule` + `compileComponents`
- Patterns: `fixture.componentRef.setInput()`, `fixture.detectChanges()`, host components for ngModel/formControl testing
- CVA (Control Value Accessor) tests via `writeValue()` direct invocation
- `vitest/globals` type references in `tsconfig.spec.json`

### Resolved Strict TDD
- **Status**: ✅ Enabled
- **Source**: `openspec/config.yaml` explicit setting
- **Rationale**: Test runner (Vitest) available, watch mode via `ng test` (default), test-first workflow established

## SDD Conventions

- **Phase artifacts**: stored in `openspec/changes/{change-name}/`
- **Archives**: `openspec/changes/archive/`
- **Main specs**: `openspec/specs/{component-name}/spec.md`
- **Design system**: `openspec/DESIGN_SYSTEM.md`
- **Persistence**: all phases use `hybrid` (openspec files + Engram)
- **Strict TDD**: enabled (write failing tests before implementation)
- **Skill Registry**: `.atl/skill-registry.md` (10 non-SDD skills indexed)
- **CodeGraph**: enabled in `opencode.jsonc` with local MCP server
- **AGENTS.md**: CodeGraph instructions for AI tools
- **Completed cycles**: atomic-ui-redesign phases 1–5, searchable-select, redesign-textareas, redesign-selects, redesign-datepickers, filter-text-inputs, manual-sales-pdf-display, menu-reorganization

## Skills Configured

| Skill | Source | Type |
|-------|--------|------|
| angular-developer | angular/skills | Locked |
| angular-material | pluginagentmarketplace | Locked |
| atomic-design-fundamentals | thebushidocollective | Locked |
| google-material-design | copyleftdev | Locked |
| ui-ux-pro-max | nextlevelbuilder | Locked |
| web-design-guidelines | vercel-labs | Locked |

## Active Changes

Check `openspec/changes/` for in-progress change folders. Current contents: 11 change folders (2 non-archive, 9 individual changes).

