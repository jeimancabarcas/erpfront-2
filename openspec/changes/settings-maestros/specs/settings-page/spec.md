# Settings Page Specification

## Purpose

Wire navbar "Configuración" → `/settings`, render a card-based settings launchpad, guard all routes, handle 404 for unknown sub-routes.

## Requirements

### Requirement: NAV-01 — Navbar navigation

The user dropdown "Configuración" button MUST navigate to `/settings` via `[routerLink]` and MUST close the dropdown after clicking.

#### Scenario: Click navigates to /settings
- GIVEN the user is authenticated and the navbar user dropdown is open
- WHEN the user clicks "Configuración"
- THEN `router.navigate(['/settings'])` executes AND the dropdown closes

### Requirement: NAV-02 — Card grid rendering

The `/settings` page MUST render exactly 3 cards (Taxes, Payment Methods, Payment Types) in a responsive grid layout.

#### Scenario: Cards visible
- GIVEN the user navigates to `/settings`
- THEN 3 Material cards display in a grid (1 col mobile, 2 col tablet, 3 col desktop)
- AND each card shows an icon, title, and short description

### Requirement: NAV-03 — Card navigation

Clicking a card MUST navigate to its sub-route.

#### Scenario: Tax card navigates
- GIVEN the card grid is visible at `/settings`
- WHEN the user clicks the "Taxes" card
- THEN the router navigates to `/settings/taxes`

### Requirement: NAV-04 — Back button

Each CRUD page MUST have a back button that navigates to `/settings`.

#### Scenario: Back from sub-page
- GIVEN the user is on `/settings/taxes`
- WHEN the user clicks the back button
- THEN the router navigates to `/settings`

### Requirement: NAV-05 — Auth guard

The `/settings` route and all children MUST require `authGuard`. Unauthenticated users redirect to `/login`.

#### Scenario: Unauthenticated redirect
- GIVEN the user is not authenticated
- WHEN navigating to `/settings` or any `/settings/*` route
- THEN redirect to `/login`

### Requirement: NAV-06 — Profile guard

The `/settings` route and all children MUST require `profileGuard`. Users without a completed profile redirect to profile setup.

#### Scenario: Incomplete profile
- GIVEN the user is authenticated but profile is incomplete
- WHEN navigating to `/settings`
- THEN auth passes, profile guard redirects to `/profile/setup`

### Requirement: NAV-07 — 404 handling

Unknown routes under `/settings` MUST show a 404 page.

#### Scenario: Unknown route
- GIVEN the user navigates to `/settings/unknown-route`
- THEN a 404 page component renders
