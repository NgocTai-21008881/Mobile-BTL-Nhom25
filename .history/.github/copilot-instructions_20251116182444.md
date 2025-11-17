# Copilot Instructions for Mobile-BTL-Nhom25

## Architecture Overview
This is a React Native Expo app for health tracking, featuring BMI, calories, heart rate, sleep, cycle tracking, and blog sharing. It uses Supabase for data storage with custom authentication via a 'user' table (not Supabase Auth). Navigation employs React Navigation v7 with a stack navigator for main screens and a custom bottom tab bar in the Home screen.

Key folders:
- `screens/`: UI components for each screen (e.g., `HomeScreen.tsx` renders tab content).
- `services/`: Data access layers (e.g., `blogService.ts` for blog operations).
- `lib/`: Utilities like `supabase.ts` for database client.
- `componets/` (note: misspelled 'components'): Reusable UI elements like `BottomNav.tsx`.
- `navigation/`: Navigation setup (though main navigation is in `App.tsx`).

Data flows: Screens often query Supabase directly (e.g., `AllBlogsScreen.tsx` fetches from 'blogs' table), bypassing services. Auth is handled via `userService.ts` with plain email/password checks.

## Developer Workflows
- **Build & Run**: Use `npm run start` (or `expo start`) for development. Platform-specific: `npm run android`, `npm run ios`, `npm run web`.
- **Debugging**: Standard React Native debugging; check console logs for Supabase errors. Auth state is checked in `App.tsx` via `supabase.auth.getUser()`, but sign-in uses custom logic.
- **Dependencies**: Managed via npm. Key: Expo SDK 54, React Native 0.81.4, Supabase JS 2.75.1.

## Conventions & Patterns
- **Navigation**: Define screen params in `RootStackParamList` in `App.tsx`. Use `navigation.replace()` for auth flows (e.g., after sign-in).
- **Data Fetching**: Prefer direct Supabase queries in screens (e.g., `supabase.from('blogs').select(...)`), not always via services. Handle errors with console logs and user alerts.
- **Styling**: Inline styles or `StyleSheet.create()`; no global CSS. Use Expo Vector Icons (e.g., `AntDesign`).
- **State Management**: Local `useState` in components; no Redux or global state.
- **File Naming**: PascalCase for components/screens (e.g., `HomeScreen.tsx`), camelCase for services (e.g., `blogService.ts`).
- **Auth Inconsistency**: Sign-in/sign-up query 'user' table directly; avoid mixing with Supabase Auth methods.

## Examples
- Adding a new screen: Import in `App.tsx`, add to `RootStackParamList`, register in `Stack.Navigator`.
- Fetching data: `const { data, error } = await supabase.from('table').select('fields'); if (error) console.error(error.message);`
- Tab navigation: In `HomeScreen.tsx`, switch content based on `activeTab` state using `renderTabContent()`.

Focus on health data visualization with libraries like `react-native-chart-kit` and progress indicators.