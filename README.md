# PawLog (React Native + Expo)

PawLog is a mobile app for tracking your dog’s daily routine—potty breaks, meals, training, naps, and notes—so you can spot patterns and stay consistent.

### Key features
- **Onboarding flow**: set up your dog and your profile
- **Home tab**: today’s activity feed, running nap/training banners, and a quick-add FAB for activity types
- **Log tab**: date navigation + full timeline (including feeding details)
- **Profile tab**: dog info + weight tracking
- **Settings tab**: multi-user support (switch who’s logging)

## Run the app locally (Expo)

### Prerequisites
- Node.js + npm installed
- (Recommended) Expo Go installed on your iPhone (from the App Store)

### Install dependencies
From the project folder:

```bash
cd PawLogRN
npm install
```

### Start the Expo dev server (shows a QR code)

```bash
npx expo start
```

This will open the Expo Dev Tools and print a **QR code** in your terminal.

### Run on iPhone with Expo Go (QR code)
- Open **Camera** on your iPhone and scan the QR code from your terminal (or Dev Tools)
- Tap the banner that appears to open the project in **Expo Go**

Tips if the QR code doesn’t work:
- Make sure your iPhone and your computer are on the **same Wi‑Fi network**
- In the Expo Dev Tools, try switching the connection mode (e.g. **Tunnel**)

### Run on iOS Simulator / Android Emulator (optional)

```bash
npx expo start --ios
```

```bash
npx expo start --android
```

## Hosting / “serverless” runtime

PawLog is a **client-side mobile app** built with Expo. There’s no dedicated app server you have to deploy or keep running: the app runs on the device, and it relies on managed services for app delivery and data storage (for example, Expo’s development/update tooling and Firebase for persistence).

- **Live updates**: Expo can publish updates that devices can download without re-running a local dev server. You can view the project’s update history here: [Expo Updates](https://expo.dev/accounts/jack.lewittes/projects/pawlog/updates/9cbaa2ab-35b6-4495-9738-bd4be7e1b1cc).
