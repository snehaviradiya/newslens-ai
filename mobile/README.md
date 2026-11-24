# NewsLens AI — Mobile Application Client

The `mobile/` directory contains the cross-platform mobile client for **NewsLens AI**, built using **React Native**, **Expo SDK 52**, and **TypeScript**.

The application delivers an editorial, evidence-grounded news intelligence interface allowing readers to compare headlines, inspect framing dimensions (Conflict, Economic, Human Interest, Morality, and Responsibility), and evaluate multi-source reporting of identical real-world events.

---

## 1. Implemented Features & Screens (Day 7 Integration)

The client now connects its news, event, comparison, account, and history workflows to the backend. UI components remain in the existing design system:

| Screen | File Path | Description |
|---|---|---|
| **Welcome Screen** | `screens/WelcomeScreen.tsx` | Editorial onboarding and application branding with pathways to exploration and sign-in. |
| **Login Screen** | `screens/LoginScreen.tsx` | Secure login interface with client-side form validation (email format, password length). |
| **Registration Screen** | `screens/RegisterScreen.tsx` | Account registration interface with password matching and field validation. |
| **Home Dashboard** | `screens/HomeScreen.tsx` | Live collected articles, sources, events, recent signed-in analyses, refresh and empty/error states. |
| **Framing Analysis Screen** | `screens/AnalysisScreen.tsx` | Transient analysis for pasted text; URL fetching is explicitly unsupported. |
| **Perspective Comparison Screen** | `screens/ComparisonScreen.tsx` | Live persisted comparison results with headlines, entities, topics, quotes, framing excerpts and limitations. |
| **Analysis History Screen** | `screens/HistoryScreen.tsx` | Authenticated history with links to stored article analyses and comparisons. |
| **Research Profile Screen** | `screens/ProfileScreen.tsx` | Authenticated backend profile, history counts, connection status, and sign-out. |
| **Event Detail Screen** | `screens/EventDetailScreen.tsx` | Live event members, source diversity, and comparison navigation. |
| **Article Detail Screen** | `screens/ArticleDetailScreen.tsx` | Live article content, stored analysis, and authenticated analyze-and-save action. |

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

The client does not replace failed news, event, comparison, or analysis requests with fixtures. API failures show an error or empty state. The auth token is held in memory for the current app session; secure device storage could not be added because npm registry access was unavailable in this environment, so reopening the app requires signing in again.

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
# 1. Run Expo Doctor checks
npx expo-doctor

# 2. Run TypeScript compiler check
npx tsc --noEmit

# 3. Test Android bundle compilation
npx expo export --platform android --output-dir /tmp/newslens-expo-verify
```

## Demonstration workflow

1. Start PostgreSQL, apply `backend/prisma/migrations`, and configure the backend and AI engine URLs.
2. Set `RESEARCHER_EMAILS` to an address allowed to register with the researcher role, register that address in the app, then start RSS collection with the protected collection endpoint or scheduler.
3. Sign in, open a collected article, and choose **Analyze and Save**. The backend stores the rule-based analysis and adds it to your history.
4. Open an event with articles from at least two sources and choose **Compare Coverage**. The comparison and the signed-in user's history entry are persisted.

Pasted-text analyses are transient and do not appear in saved history. URL-only analysis is not implemented. Physical-device builds must set `EXPO_PUBLIC_API_BASE_URL` to a reachable HTTPS or LAN backend URL.

## Android APK build profile

`eas.json` defines `preview` and `production` APK profiles. To build after EAS CLI access and account setup are available, run `eas build --platform android --profile preview`. The Android bundle export verified during development is a JavaScript bundle check, not an APK build or installation test.
