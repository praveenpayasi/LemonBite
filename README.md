# LemonLite

A React Native restaurant application built with Expo and TypeScript.

> **Status: Phase 1 — Foundation.** This repository currently contains the
> project scaffolding, design system, reusable components, navigation shell and
> testing setup. The actual product screens (Welcome, Sign Up, Preferences,
> Home/Menu, Profile) are **not** implemented yet — they are planned for later
> phases.

## Project overview

LemonLite is a portfolio project that grows the "Little Lemon" restaurant app
into a clean, scalable, multi-screen mobile application. Phase 1 focuses on a
professional, testable foundation rather than UI completeness: a centralized
design system, strongly-typed reusable components, file-based navigation and a
working test harness.

## Technology stack

| Concern        | Choice                                                      |
| -------------- | ---------------------------------------------------------- |
| Framework      | React Native (Expo SDK 57)                                 |
| Language       | TypeScript (strict)                                        |
| Navigation     | Expo Router (file-based)                                   |
| Fonts          | `@expo-google-fonts` (Markazi Text + Karla) via `expo-font` |
| Safe areas     | `react-native-safe-area-context`                           |
| Native screens | `react-native-screens`                                     |
| Testing        | Jest (`jest-expo` preset) + React Native Testing Library   |
| Linting        | ESLint (`eslint-config-expo`, flat config)                 |
| Formatting     | Prettier                                                   |

Only dependencies with a clear present-day need are installed. State management,
networking, storage and form libraries are intentionally omitted until a real
requirement appears.

## Architecture

- **File-based routing** via Expo Router. The router root is `src/app`; every
  file there becomes a route. A single root `Stack` in `_layout.tsx` provides the
  base navigator that future nested route groups plug into.
- **Design tokens are centralized.** Colors, typography, spacing and dimensions
  live in `src/constants` and are re-exported through a single `theme` object.
  Components consume `theme.colors.primary`, never raw hex literals.
- **Presentational components.** Reusable UI in `src/components` is strongly
  typed, side-effect free, and holds no business or navigation logic.
- **Path aliases.** `@/*` maps to `src/*` (TypeScript `paths` + Expo Router's
  `tsconfigPaths` experiment) so imports stay flat and refactor-safe.

## Folder structure

```
src/
├── app/                  # Expo Router routes (file-based navigation)
│   ├── _layout.tsx       # Root layout: providers, font loading, root Stack
│   └── index.tsx         # Phase 1 placeholder landing route
├── components/
│   ├── common/           # Cross-cutting UI (PrimaryButton, ScreenContainer, logo)
│   ├── forms/            # Form controls (TextInputField)
│   └── navigation/       # App chrome (AppHeader)
├── constants/            # Design tokens + route definitions
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── dimensions.ts
│   └── routes.ts
├── theme/                # Single aggregated `theme` export of all tokens
├── hooks/                # Reusable hooks (useAppFonts)
├── types/                # Shared TypeScript types
└── __tests__/            # Unit tests
```

Directories such as `screens/`, `services/`, `utils/` and an `assets/` tree are
part of the intended architecture but are **not** created yet — they will be
added in the phase that first needs them, to avoid empty placeholder files.

### Directory responsibilities

- **`app/`** — Route files only. Screens compose components; they own navigation
  and screen-level state.
- **`components/common/`** — Generic, reusable presentational components.
- **`components/forms/`** — Input controls; validation logic stays in the caller.
- **`components/navigation/`** — App chrome/branding (headers). No routing logic.
- **`constants/`** — The single source of truth for design tokens and route paths.
- **`theme/`** — Aggregates the constants into one `theme` object for consumption.
- **`hooks/`** — Reusable, testable React hooks.
- **`types/`** — Shared, cross-cutting TypeScript types.
- **`__tests__/`** — Unit tests for foundational code.

## Development setup

Prerequisites: Node.js 20+, npm, and the Expo Go app (or an iOS/Android
simulator) for on-device previews.

```bash
npm install
```

## Running the application

```bash
npm run start      # Start the Expo dev server (choose a target from the CLI)
npm run ios        # Open in the iOS simulator
npm run android    # Open in the Android emulator
npm run web        # Run in the browser
```

## Testing

```bash
npm test           # Run the Jest suite once
npm run test:watch # Watch mode
```

Tests use the `jest-expo` preset with React Native Testing Library. The `@/*`
path alias is mapped in the Jest config so tests import modules the same way the
app does.

## Code quality

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check
```

Guiding principles: no `any`, centralized design tokens, small single-purpose
components, explicit prop types, and no business logic inside UI components.

## Future implementation phases

- **Phase 2** — Implement the Welcome screen from the Figma design using the
  existing components and tokens; add the Sign Up route and its form validation.
- **Phase 3** — Preferences and Profile screens; introduce local persistence
  (e.g. `expo-secure-store` / AsyncStorage) only when required.
- **Phase 4** — Home/Menu screen with the menu list, categories and search;
  introduce a data layer (`services/`) when a real data source is added.
- **Later** — Add state management, networking and other libraries progressively,
  only when an actual feature needs them.
