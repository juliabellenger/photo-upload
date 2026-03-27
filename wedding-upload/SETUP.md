# 💍 Wedding Photo App — Setup Guide

**Total setup time: ~20 minutes**
No coding required. Just follow the steps below.

---

## Overview

Here's how it works:

1. You set up a free Firebase project (Google's cloud storage).
2. You deploy the upload page to the web for free (via Firebase Hosting).
3. You generate a QR code pointing to your page URL.
4. Guests scan it, upload photos, done — everything lands in your Firebase Storage.
5. After the wedding, you download all photos in one click.

---

## Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google account.
3. Click **"Add project"**.
4. Name it (e.g. `julia-wedding-photos`). Click Continue.
5. Disable Google Analytics if you like (not needed). Click **"Create project"**.

---

## Step 2 — Enable Firebase Storage

1. In the left sidebar, click **"Build" → "Storage"**.
2. Click **"Get started"**.
3. Select **"Start in production mode"** → click Next.
4. Choose a storage location (pick one near you, e.g. `us-central1`). Click **Done**.

---

## Step 3 — Set Storage Rules (allow uploads without login)

1. In Storage, click the **"Rules"** tab.
2. Replace the entire contents with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wedding-photos/{allPaths=**} {
      allow write: if true;    // Anyone with your link can upload
      allow read:  if false;   // Only you can view (via Firebase Console)
    }
  }
}
```

3. Click **"Publish"**.

> **Note:** `allow write: if true` means anyone who visits your page can upload.
> Since the URL is only on your QR code, only your guests will have access.

---

## Step 4 — Get Your Firebase Config

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar → **Project settings**.
2. Scroll down to **"Your apps"** and click the **"</>"** (Web) icon.
3. Register your app with a nickname (e.g. `wedding-upload`). Click **"Register app"**.
4. You'll see a code block like this:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "julia-wedding-photos.firebaseapp.com",
  projectId:         "julia-wedding-photos",
  storageBucket:     "julia-wedding-photos.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...:web:abc..."
};
```

5. Copy this entire block. You'll need it in the next step.

---

## Step 5 — Customise Your Upload Page

Open the file `index.html` in any text editor (TextEdit on Mac, Notepad on Windows, or VS Code).

**A) Paste your Firebase config**
Find this section near the bottom and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY",
  ...
```

**B) Add your names and wedding date**
Find these two lines near the top and update them:

```html
<div class="couple-names" id="couple-names">Julia &amp; [Partner]</div>
<div class="wedding-date" id="wedding-date">— [Wedding Date] —</div>
```

Example:
```html
<div class="couple-names" id="couple-names">Julia &amp; Marco</div>
<div class="wedding-date" id="wedding-date">— 14 June 2026 —</div>
```

Save the file.

---

## Step 6 — Deploy to the Web (Free)

### Option A: Firebase Hosting (Recommended)

1. Install Node.js from [https://nodejs.org](https://nodejs.org) if you don't have it.
2. Open Terminal (Mac) or Command Prompt (Windows).
3. Run these commands one at a time:

```bash
npm install -g firebase-tools
firebase login
```

4. Navigate to your project folder (the folder containing `index.html`):
```bash
cd path/to/wedding-upload
```

5. Initialise Firebase Hosting:
```bash
firebase init hosting
```
- When asked "What do you want to use as your public directory?" → type `.` (just a dot) and press Enter.
- "Configure as a single-page app?" → type `N`.
- "File ./index.html already exists. Overwrite?" → type `N`.

6. Deploy:
```bash
firebase deploy
```

7. You'll get a URL like: `https://julia-wedding-photos.web.app` — **this is your page!**

### Option B: Netlify (Alternative, also free)

1. Go to [https://netlify.com](https://netlify.com) and create a free account.
2. Drag and drop your `index.html` file onto the Netlify dashboard.
3. You'll instantly get a URL like `https://quirky-flowers-12345.netlify.app`.
4. (Optional) Click "Domain settings" to customise the subdomain.

---

## Step 7 — Generate Your QR Code

1. Go to [https://qr-code-generator.com](https://qr-code-generator.com) (or any free QR generator).
2. Paste your hosted URL.
3. Download the QR code as a high-res PNG.
4. Add it to your table cards, menus, or a sign — done!

**Tip:** Test it yourself first by scanning the code and uploading a test photo.

---

## Step 8 — After the Wedding: Download Your Photos

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Open your project → **Build → Storage**.
3. Click into `wedding-photos/` → you'll see folders by date.
4. You can download photos individually, or use the [Firebase CLI](https://firebase.google.com/docs/cli) to bulk-download:

```bash
gsutil -m cp -r gs://YOUR_PROJECT_ID.appspot.com/wedding-photos ./my-wedding-photos
```

(Replace `YOUR_PROJECT_ID` with your actual project ID.)

5. Import the downloaded folder into Google Photos, iCloud, or wherever you like!

---

## Storage & Cost

| Photos | Approx. Size | Free Tier |
|--------|-------------|-----------|
| 500 photos @ 5 MB avg | 2.5 GB | ✅ Free |
| 1,000 photos @ 5 MB avg | 5 GB | ✅ Free |
| 1,500 photos @ 5 MB avg | 7.5 GB | ~$0.07/month |

Firebase Storage is free up to 5 GB. After that, it's ~$0.026/GB/month — practically free for a one-time event.

---

## Troubleshooting

**Photos not uploading?**
- Double-check your Firebase config values in `index.html`.
- Check the Storage Rules are published correctly (Step 3).
- Make sure your browser allows the site to access storage (try Chrome or Safari).

**Page not loading?**
- Ensure the site is properly deployed (Step 6).
- Check your Firebase Hosting dashboard for any errors.

**Storage limit approaching?**
- You can upgrade to the Blaze plan in Firebase Console → it stays free until you exceed 5GB, then charges only for what you use.

---

## Alternative Services (No Setup Required)

If you'd prefer a plug-and-play solution, these apps do the same thing:

- **[Momento](https://momento.photos)** — wedding photo sharing app
- **[WedPics](https://wedpics.com)** — purpose-built wedding photo app
- **[Nara](https://nara.photo)** — event photo sharing with QR codes
- **[Google Photos Shared Album](https://photos.google.com)** — guests need a Google account but zero setup for you

---

*Questions? The setup is usually smooth but feel free to ask!*
