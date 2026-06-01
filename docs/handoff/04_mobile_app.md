# Helpdesk.ai — Project Handoff Sheet: 04. Mobile App (Expo / React Native)

This handoff sheet covers the React Native mobile app built with Expo SDK 54. It outlines folder structures, key screens, navigation logic, and instructions for compiling/building the app using EAS CLI.

---

## 📱 1. Technical Specifications

*   **Framework:** Expo SDK 54 (React Native 0.81.5)
*   **Routing & Navigation:** React Navigation (Bottom Tabs + Native Stacks)
*   **State & Database:** Direct connection via `@supabase/supabase-js`
*   **App Config:** [MobileApp/app.json](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/MobileApp/app.json)
    *   **Package Name:** `com.ritesh.helpdeskai`
    *   **Project ID:** `a5830464-58a7-4737-9cc9-e5ecad2e4acf`
    *   **EAS Owner:** `ritesh1918`
*   **Theme Settings:** [MobileApp/src/styles/theme.js](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/MobileApp/src/styles/theme.js) (Primary: Green `#16a34a`, Dark: `#0f1f12`)

---

## 📂 2. Directory & Screen Layout

The mobile source code resides in the [MobileApp/](file:///c:/Projects/Software%20Projects/AI-Powered-Ticket-Creation-and-Categorization-from-User-Input/MobileApp) directory:

```
MobileApp/
├── App.js                  # Main navigator and Session provider
├── app.json                # Expo setup (EAS Project ID, Android Package)
├── eas.json                # EAS Build profiles
├── src/
│   ├── components/         # Shared components (e.g. NotificationProvider.js)
│   ├── lib/
│   │   └── supabase.js     # Supabase client (Anon Key & URL configuration)
│   ├── styles/
│   │   └── theme.js        # Global HSL UI theme configs
│   └── screens/
│       ├── auth/           # Login, Admin Registration, Forgot Password
│       ├── user/           # User dashboard, ticket queues, AI understanding
│       └── admin/          # SLA queues, system configurations, user validation
```

### Key Screen Inventories

#### Authentication Stack
*   `OnboardingScreen.js`: Introduction carousel explaining AI-automated features.
*   `LoginScreen.js` / `SignupScreen.js`: Standard authentication.
*   `AdminSignupScreen.js`: Register custom business domains and onboarding queue entries.
*   `UserLobbyScreen.js`: Redirection lobby for pending admins or restricted accounts.

#### Standard User Screens (`src/screens/user/`)
*   `DashboardScreen.js`: Quick metrics, active ticket summary, self-service links.
*   `CreateTicketScreen.js`: Submission form integrated with EasyOCR image loading and RAG prompts.
*   `AIProcessingScreen.js`: Displays interactive loaders during DistilBERT and NER extraction.
*   `TicketDetailScreen.js` & `TicketTrackingScreen.js`: Conversational timeline support chat with WhatsApp-like structure.
*   `KnowledgeBaseScreen.js`: Vector-search support articles.

#### IT Administrator Screens (`src/screens/admin/`)
*   `AdminDashboardScreen.js`: Multi-tenant operations queue.
*   `AdminTicketsScreen.js`: Escalation queues.
*   `AdminUsersScreen.js`: Access requests.
*   `AdminSettingsScreen.js`: Customize company AI thresholds and auto-close variables.

---

## 🧭 3. Routing & State Flow

*   **Session Watchers:** `App.js` initializes `supabase.auth.getSession()` and registers `onAuthStateChange`.
*   **Role Redirects:** When an authenticated profile is resolved, its `role` and `status` values evaluate the routing tree:
    *   If `status = 'pending_approval'`, user is routed to `UserLobbyScreen`.
    *   If `role = 'admin'` or `'master_admin'`, the application boots the admin tab navigator (`AdminTabNavigator`).
    *   Else, the app launches the user tab navigator (`TabNavigator`).

---

## 🛠️ 4. EAS Build & Compilation Workflow

> [!NOTE]  
> The mobile project is already set up to generate Android **APK** files using the EAS cloud compiler.
> We have successfully cleaned up the broken `@logrocket/react-native` integration in the package dependencies and `App.js` to ensure the compilation executes without runtime errors.

### Starting a New Build
An APK build has already been initialized in the background using the active credentials (`ritesh1918`).
If you need to execute or restart the EAS Android compilation on Claude Code:

1.  Make sure you are logged in to Expo/EAS:
    ```bash
    npx eas whoami
    ```
2.  Start the build:
    ```bash
    npx eas build --profile preview_apk --platform android --non-interactive
    ```
3.  The build system compiles on Expo's remote servers and returns a downloadable `.apk` URL upon completion.
