# NewsLens AI — Mobile Application Client

The `mobile/` directory contains the cross-platform mobile client for **NewsLens AI**, built using **React Native**, **Expo SDK 52**, and **TypeScript**.

The application delivers an editorial, evidence-grounded news intelligence interface allowing readers to compare headlines, inspect framing dimensions (Conflict, Economic, Human Interest, Morality, and Responsibility), and evaluate multi-source reporting of identical real-world events.

---

## 1. Implemented Features & Screens (Day 2 Milestone)

The Day 2 mobile foundation includes a complete, navigable screen suite and modular design system:

| Screen | File Path | Description |
|---|---|---|
| **Welcome Screen** | `screens/WelcomeScreen.tsx` | Editorial onboarding and application branding with pathways to exploration and sign-in. |
| **Login Screen** | `screens/LoginScreen.tsx` | Secure login interface with client-side form validation (email format, password length). |
| **Registration Screen** | `screens/RegisterScreen.tsx` | Account registration interface with password matching and field validation. |
| **Home Dashboard** | `screens/HomeScreen.tsx` | Real-time newsroom feed displaying shared event clusters, monitored publication badges, and fast analysis triggers. |
| **Framing Analysis Screen** | `screens/AnalysisScreen.tsx` | Direct URL and text input interface with interactive framing dimension breakdowns and cited paragraph excerpts. |
| **Perspective Comparison Screen** | `screens/ComparisonScreen.tsx` | Side-by-side comparative layout contrasting headlines, framing dimensions, and quoted stakeholders across competing outlets. |
| **Analysis History Screen** | `screens/HistoryScreen.tsx` | Chronological archive of inspected stories with metric badges and empty state handling. |
| **Research Profile Screen** | `screens/ProfileScreen.tsx` | User credentials, research activity statistics, and live backend connection diagnostics. |
| **Event Detail Screen** | `screens/EventDetailScreen.tsx` | Multi-source event clusters detailing all articles covering an event with cross-comparison links. |
| **Article Detail Screen** | `screens/ArticleDetailScreen.tsx` | Deep article reader with embedded evidence-grounded framing metrics. |

---

## 2. Reusable Component System

All UI elements are centralized in `components/` to ensure design consistency and accessibility:
- `AppButton`: Accessible button supporting variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) and loading states.
- `AppInput`: Form text input supporting floating labels, validation error alerts, and secure password toggling.
- `ScreenHeader`: Clean editorial header supporting navigation pops and action buttons.
- `ArticleCard`: Card component for article lists with source badges and inspect triggers.
- `NewsSourceCard`: Publication identity card showing monitoring status.
- `AnalysisCard`: Comprehensive framing spectrum visualizer, subjectivity rating, and quoted evidence cards.
- `EmptyState`: Contextual illustration for empty lists or missing data.
- `LoadingIndicator`: Centered loading spinner with informative feedback.

---

## 3. Environment & API Configuration

The mobile client interacts with the backend using the centralized service at `services/api.ts`. The API base URL is dynamically determined from the environment variable `EXPO_PUBLIC_API_BASE_URL`.

Create a local environment file:
```sh
cp .env.example .env
```

### Supported Environments

- **iOS Simulator:**
  ```env
  EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
  ```
- **Android Emulator:**
  ```env
  EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
  ```
- **Physical Device (via Expo Go over Wi-Fi):**
  Replace `<YOUR_LOCAL_IP>` with your development machine's local network IP:
  ```env
  EXPO_PUBLIC_API_BASE_URL=http://192.168.1.50:3000
  ```

> **Standalone Fallback:** When the backend server is offline or unreachable, the mobile client gracefully falls back to realistic mock editorial datasets so UI demonstration and visual testing remain functional.

---

## 4. Installation & Local Execution

### Install Dependencies
```sh
cd mobile
npm install
```

### Run TypeScript Verification
```sh
npm run typecheck
```

### Launch Development Server
```sh
npm start
```
From the interactive terminal menu:
- Press `i` to open in the **iOS Simulator**.
- Press `a` to open in the **Android Emulator**.
- Press `w` to open in the **Web Browser**.
- Scan the printed QR code using the **Expo Go** app on your physical device.

---

## 5. Verification & Test Commands

To verify application health and build consistency:
```sh
# 1. Run Expo Doctor health check (18/18 checks pass)
npx expo-doctor

# 2. Run TypeScript compiler check
npx tsc --noEmit

# 3. Test multi-platform bundle compilation (iOS, Android, Web)
npx expo export --output-dir /tmp/expo-verify && rm -rf /tmp/expo-verify
```
