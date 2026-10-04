<div align="center">

  <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/src/assets/images/little-lemon-mark.png" alt="LemonBite Logo" width="120" />

  # 🍋 LemonBite 🍋

  **A production-ready, scalable React Native food ordering application crafted with Expo Router, Clean Architecture, SQLite, and TypeScript.**

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-architecture--data-flow">Architecture</a> •
    <a href="#-screen-gallery">Screen Gallery</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-about-me">About Me</a>
  </p>

  <!-- BADGES SECTION -->
  <p align="center">
    <img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-v57.0-000000?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/SQLite-57.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/Jest-29.7-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square&logo=github-actions" alt="Build" />
    <img src="https://img.shields.io/badge/Type_Check-0_Errors-success?style=flat-square&logo=typescript" alt="TypeScript OK" />
    <img src="https://img.shields.io/badge/Tests-238_Passing-blueviolet?style=flat-square&logo=jest" alt="Tests" />
    <img src="https://img.shields.io/badge/Lint-0_Warnings-success?style=flat-square&logo=eslint" alt="ESLint" />
  </p>

</div>

---

## 📸 Overview

<!-- Drop a wide showcase image at docs/screenshots/lemonbite_banner.jpg and uncomment:
<div align="center">
  <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/lemonbite_banner.jpg" alt="LemonBite App Showcase" width="100%" />
</div>
-->

<div align="center">
  <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Home.png" alt="LemonBite Home Screen" width="260" />
</div>

> **LemonBite** is a production-grade React Native portfolio application built to Meta's React Native best-practice standards. It features dynamic custom dish add-ons, 3-tier offline storage (Memory → SQLite → Remote API), line-item cart merging, interactive delivery settings, and complete screen-to-screen unit testing.

---

## 🌟 Key Features

<details open>
<summary><b>🔥 Click to View Feature Matrix</b></summary>

<br />

| Feature | Description | Architecture / Implementation |
| :--- | :--- | :--- |
| **🚀 Instant Launch & Offline Mode** | 3-tier offline caching with zero rendering pop-in | `Memory Cache` → `SQLite` → `Fetch API` |
| **🛒 Global Dynamic Cart** | Line-item merging, custom add-on pricing, and real-time total computation | `CartContext` + derived totals via `useMemo` |
| **🔍 Debounced Search** | Real-time 500 ms debounced search over a parameterized local database | `useDebouncedValue` + `expo-sqlite` |
| **🏷️ Personalised Menu** | Onboarding course preferences seed the menu's default category filters | `profileStorage` → `useMenu` |
| **🎨 Design System UI** | Tokenized design system with custom typography (`Markazi Text` & `Karla`) | Centralized `@/theme` tokens |
| **🧩 100% Strict TypeScript** | Compiled under strict indexing and type assertion rules | `"noUncheckedIndexedAccess": true` |
| **♿ Accessibility First** | Roles, labels, hints and 44×44 pt minimum touch targets on every control | Asserted by role in tests |
| **🧪 Automated Testing** | Unit tests and UI interaction tests covering all screens and hooks | `Jest` + `React Native Testing Library` |

</details>

---

## 🏗️ Architecture & Data Flow

LemonBite enforces a strict one-way dependency chain. Screens never touch the network, SQL or disk directly.

```
┌──────────────────────────────────────────────────────────┐
│                   UI Layer (src/app/)                    │
│   (Pure presentational screens & controlled components)  │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                Custom Hooks (src/hooks/)                 │
│    (UI state machines, debounced search, form logic)     │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│    Repositories & Stores (src/repositories/ & context/)  │
│   (CartContext, menuRepository singleton, cache logic)   │
└────────────────────────────┬─────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   Database (expo-sqlite)  │   │     Remote API / Disk     │
│  (Parameterized queries)  │   │ (menuApi, profileStorage) │
└───────────────────────────┘   └───────────────────────────┘
```

<details>
<summary><b>🧠 Click to see how the menu resolves (cache-first)</b></summary>

<br />

1. **In-memory cache** — `peekMenuCache()` hydrates the UI synchronously, so Home renders with no loading flash.
2. **SQLite** — if the cache is cold, `menuitems` is read from the local database. Search and category filtering run here as a single parameterized query, so **filtering never hits the network**.
3. **Remote API** — only on a cold start with an empty database. The response is validated, normalized, then persisted to SQLite.

Concurrent callers share one in-flight promise, so duplicate loads are impossible. Images are prefetched before Home becomes visible.

</details>

---

## 📱 Screen Gallery

<div align="center">

| Welcome | Sign Up | Preferences |
| :---: | :---: | :---: |
| <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Welcome.png" width="230" /> | <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Signup.png" width="230" /> | <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Preferences.png" width="230" /> |

| Home / Menu | Dish Details | Profile Settings |
| :---: | :---: | :---: |
| <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Home.png" width="230" /> | <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/menu_details.png" width="230" /> | <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/Profile.png" width="230" /> |

| Order Summary / Cart | Success Confirmation |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/cart_summary.png" width="230" /> | <img src="https://raw.githubusercontent.com/praveenpayasi/LemonBite/main/docs/screenshots/order_confirmation.png" width="230" /> |

</div>

### Screen Inventory

| Screen | Route | Description |
| :--- | :--- | :--- |
| **Welcome** | `/` | Brand hero and the onboarding entry point. |
| **Sign Up** | `/signup` | First name and email with live client-side validation. |
| **Preferences** | `/preferences` | Course selection, persisted and used to seed the menu's default filters. |
| **Home / Menu** | `/menu` | `SectionList` grouped by category, debounced search and multi-select chips. |
| **Menu Details** | `/menu-details/:id` | Dish hero, add-on selection, quantity stepper, live-priced *Add to Cart*. |
| **Cart / Order Summary** | `/cart` | Cart lines, cutlery preference, recommended dishes, fee breakdown, checkout. |
| **Order Confirmation** | `/order-confirmation` | Success card with generated order reference over a read-only order recap. |
| **Profile** | `/profile` | Avatar picker, validated personal details, notification preferences, logout. |

Every primary screen shares `AppHeader` — back button, LemonBite wordmark, profile avatar, and a cart icon whose yellow badge reflects the live `totalItemsCount` from `useCart()`.

---

## 🛠️ Tech Stack

| Area | Technology |
| :--- | :--- |
| **Framework** | React Native 0.86 (New Architecture) + Expo SDK 57 |
| **Language** | TypeScript 6 — `strict` and `noUncheckedIndexedAccess` |
| **Navigation** | Expo Router 57 (file-based routing, typed routes) |
| **State** | React Context (cart) + screen-scoped custom hooks |
| **Local Database** | `expo-sqlite` (async API) — menu persistence, search, filtering |
| **Key-Value Storage** | `@react-native-async-storage/async-storage` — profile, onboarding, preferences |
| **Fonts** | `@expo-google-fonts` — Markazi Text + Karla |
| **Media** | `expo-image-picker` — profile avatar |
| **Testing** | Jest (`jest-expo`) + React Native Testing Library |
| **Quality** | ESLint (`eslint-config-expo`) + Prettier |

> No state-management library, icon library, form library or HTTP client is used. Icons are drawn with views and requests use `fetch` — keeping the bundle lean and the dependency surface small.

---

## 📁 Complete Directory Tree

```
LemonBite/
├── app.json                       # Expo configuration & bundle identifiers
├── tsconfig.json                  # Strict TypeScript setup with @/* path aliases
├── src/
│   ├── app/                       # Expo Router file-based navigation routes
│   │   ├── _layout.tsx            # Root provider stack & splash gate
│   │   ├── index.tsx              # Welcome / onboarding screen
│   │   ├── signup.tsx             # User sign-up form
│   │   ├── preferences.tsx        # Category preference selection
│   │   ├── menu.tsx               # Home / menu screen
│   │   ├── menu-details/
│   │   │   └── [id].tsx           # Dynamic dish details route
│   │   ├── cart.tsx               # Order summary / cart screen
│   │   ├── order-confirmation.tsx # Order success confirmation
│   │   └── profile.tsx            # User profile settings
│   ├── components/                # Modular presentational UI system
│   │   ├── cart/                  # CartItemRow, CutleryOption, PriceSummary,
│   │   │                          # RecommendedDishes, SuccessModalCard
│   │   ├── common/                # PrimaryButton, ScreenContainer, LittleLemonLogo,
│   │   │                          # QuantitySelector, DeliveryInfoRow
│   │   ├── forms/                 # TextInputField, CategoryOption
│   │   ├── menu/                  # MenuItem, MenuHero, MenuSearch, CategoryChip,
│   │   │                          # MenuListHeader, MenuSectionHeader, AddOnRow
│   │   ├── navigation/            # AppHeader (back · logo · cart badge · avatar)
│   │   └── profile/               # ProfileAvatar, AvatarEditor, NotificationCheckbox
│   ├── constants/                 # Theme tokens, cart fees, spacing, dimensions, routes
│   ├── context/                   # CartContext (global cart state)
│   ├── hooks/                     # useMenu, useMenuDetails, useCartScreen,
│   │                              # useOrderConfirmation, useProfile, useHeaderAvatar
│   ├── repositories/              # menuRepository (SQLite + API orchestration)
│   ├── services/                  # menuApi, menuDatabase (SQLite),
│   │                              # profileStorage, onboardingStorage
│   ├── theme/                     # Centralized design tokens
│   ├── types/                     # Domain interfaces (MenuItem, CartItem, UserProfile)
│   ├── utils/                     # Price/phone formatting, image prefetch, order refs
│   └── __tests__/                 # 21 test suites / 238 unit & integration tests
└── docs/                          # Wireframes and screenshots
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js 20+**
- **npm**
- The **Expo Go** app on a physical Android or iOS device (or a simulator/emulator)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/praveenpayasi/LemonBite.git
cd LemonBite

# 2. Install dependencies
npm install

# 3. Start Expo in Expo Go mode
npx expo start --go
```

Then pick a target: scan the QR code with **Expo Go**, or press `i` (iOS Simulator), `a` (Android Emulator), or `w` (web).

> Every native module used (`expo-sqlite`, `expo-image-picker`, `async-storage`) ships with Expo Go — **no custom development build required**.

<details>
<summary><b>🔌 Android over USB (if Wi-Fi fails)</b></summary>

<br />

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --clear
```

</details>

---

## ✅ Quality Assurance & Verification

```bash
# Run TypeScript typecheck (0 errors)
npx tsc --noEmit

# Run ESLint audit (0 warnings)
npx eslint .

# Execute the full automated test suite (238 passing tests)
npx jest
```

Run all three gates in one pass before committing:

```bash
npx eslint . && npx tsc --noEmit && npx jest
```

### Current Status

| Gate | Result |
| :--- | :--- |
| **ESLint** | 0 errors, 0 warnings |
| **TypeScript** | 0 errors |
| **Jest** | 21 suites · 238 tests passing |

Coverage spans pure utilities, the API/SQLite/AsyncStorage service layer, the repository cache, custom hooks, shared components, and full screen-level integration tests for all eight screens.

---

## 🤝 Contributing & Pull Requests

1. Fork the repository and create your feature branch:

   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. Commit your changes following Conventional Commit standards:

   ```bash
   git commit -m "feat(cart): add promo code discount support"
   ```

3. Ensure all three verification gates pass, then push your branch and open a Pull Request targeting `dev`.

---

## 🚀 About Me

**Praveen Payasi**
*Senior Mobile Consultant & Cross-Platform Architect*

Passionate about building highly performant, accessible, and scalable mobile apps using React Native, TypeScript, and modern mobile architectures.

<p align="left">
  <a href="https://github.com/praveenpayasi">
    <img src="https://img.shields.io/badge/GitHub-praveenpayasi-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

<div align="center">

  **⭐ If you find this project useful, consider giving it a star!**

  <sub>Built with 🍋 using React Native, Expo Router & TypeScript</sub>

</div>
