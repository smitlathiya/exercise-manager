# Gym Tracker (Expo · React Native · TypeScript)

A single-user, offline-first gym progress tracking app with private Google
Drive backups (AppData scope only).

## What's wired

- **Local-first SQLite** schema (workouts, sets, exercises, body, nutrition,
  photos, PRs, sync queue) with WAL, indexes, soft deletes, timestamps.
- **Pre-seeded exercise library** (~45 exercises across all muscle groups).
- **Zustand stores** for theme, settings, auth session, app lock, sync state,
  and the live workout session (with crash recovery via AsyncStorage snapshot).
- **Google OAuth** via `expo-auth-session` + PKCE. Tokens in `expo-secure-store`.
  Scope is `https://www.googleapis.com/auth/drive.appdata` — nothing else.
- **Drive AppData sync**: queue-drained item-by-item; full DB snapshot uploaded
  to `GymTracker/backups/latest.json` on each sync; progress photos uploaded
  to `GymTracker/progress_photos/`. Auto-retry with attempt cap. Manual
  + 5-min interval auto sync.
- **Live workout** with elapsed timer, pause/resume, rest timer, set type
  cycling (normal/warmup/failure/dropset/superset), inline weight/reps/RPE
  edit, previous-workout comparison, autosave snapshot every 5s, and
  automatic PR detection (max weight, max reps, max volume, est. 1RM).
- **PRs** computed from the formula `1RM = w × (1 + r/30)` whenever a set is
  marked complete.
- **Body**, **photos** (camera + gallery, compressed locally before backup),
  **nutrition** (with favorite meals), and **analytics** charts powered by
  `react-native-gifted-charts`.
- **Notifications** via `expo-notifications` for workout / water / weight
  reminders.
- **Security**: biometrics + PIN app lock with re-lock on background.
- **Settings**: theme, units (kg/lbs), default rest, export to file, restore
  from Drive, delete-all-local-data, sign out.

## Project layout

```
src/
  charts/          gifted-charts wrappers (line, bar, heatmap)
  components/ui/   reusable UI primitives
  constants/       app-wide constants
  database/        sqlite schema, init, seed, repos, sync queue
  hooks/           useTheme, useDbReady, useTicker
  navigation/      Root, Tabs, RootStackParamList
  screens/         feature screens (dashboard, workouts, exercises, body,
                   photos, nutrition, prs, settings, auth, security)
  services/        auth, drive, notifications, images, network, appLock
  store/           zustand stores
  sync/            sync manager + restore
  theme/           colors, spacing, typography
  types/           domain TS types
  utils/           id, date, calc helpers
```

## Setup

```bash
npm install
npx expo prebuild   # only if you want bare workflow
```

### Google OAuth (required to test sync)

1. Create a Google Cloud project: https://console.cloud.google.com
2. Enable the **Google Drive API**.
3. Create OAuth client IDs (Android + iOS + Web). For Expo Go testing, create
   a separate Expo/Web client if needed.
4. Copy `.env.example` to `.env` and add your client IDs:

   ```env
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=...
   ```

5. For an Android development/native build, the Google provider redirects to
   `com.you.gymtracker:/oauthredirect`. In your Android OAuth client, enable
   custom URI schemes and make sure the client uses package name
   `com.you.gymtracker` plus the SHA-1 fingerprint for the build you installed.
   If you change the Android package, update the app scheme and redirect URI to
   match the new package name.
6. The app only ever requests
   `https://www.googleapis.com/auth/drive.appdata` plus standard openid
   scopes. You cannot accidentally widen this — it's hard-coded in
   `src/constants/index.ts`.

## Run

```bash
npm run start
# then press 'a' for Android, 'i' for iOS
```

## Drive folder layout

The app creates a tree inside the AppData folder:

```
GymTracker/
  backups/         <- latest.json + dated daily snapshots
  progress_photos/ <- compressed JPEGs uploaded as binary
  exports/         <- reserved for future use
```

You can see these only through the Google Drive API or the
`drive.appdata` scope — not through the regular Drive web UI.

## What's intentionally simple

- The sync model uploads a fresh DB snapshot every drain. For a single-user
  device this is reliable, conflict-free, and small (the JSON of even
  thousands of sets is on the order of low MBs).
- Progress photos are processed locally with `expo-image-manipulator`
  (resize 1280px wide, ~78% quality) and a 320px thumb.
- There is no analytics dashboard tab — analytics live on the Dashboard +
  inside Body. Add a tab if you want a dedicated screen.

## Where to extend

- **More analytics**: drop new `react-native-gifted-charts` cards in
  `src/charts/` and add screens.
- **Custom exercises**: `createExercise()` already supports `is_custom: 1`
  — wire it into a "+ New exercise" form when you want.
- **Per-entity sync** (instead of full snapshot): the sync queue items
  already carry the entity name, id, and op. Replace the snapshot upload
  in `sync/manager.ts` with per-entity uploads if you outgrow the simple
  model.
