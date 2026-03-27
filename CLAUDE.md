# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page wedding photo upload app. Guests scan a QR code, land on `wedding-upload/index.html`, and upload photos directly to Firebase Storage — no authentication required.

## Architecture

The entire app lives in **one file**: `wedding-upload/index.html` (HTML + inline CSS + inline JavaScript, ~577 lines). There is no build system, no package manager, and no separate JS/CSS files.

- **Firebase SDK** is loaded from CDN (v10.12.0) — `firebase-app.js` and `firebase-storage.js`
- **Firebase project**: `bellenger-wedding-photos` (storage bucket: `bellenger-wedding-photos.firebasestorage.app`)
- Files are stored at `wedding-photos/{date}/{timestamp}_{randomId}_{originalFilename}`
- Uploads run concurrently (6 at a time)

## Deployment

No build step. Deploy by one of:

1. **Firebase Hosting**: `firebase init hosting` → `firebase deploy`
2. **Netlify**: Connect the GitHub repo (`juliabellenger/photo-upload`) or drag-and-drop the `wedding-upload/` folder

The live URL will be used to generate a QR code for guests.

## Configuration

To adapt for a different event, edit these values directly in `index.html`:
- Couple names and wedding date (in the HTML header section)
- Firebase config object (lines ~407–417): `apiKey`, `projectId`, `storageBucket`, etc.

## Reference

See `wedding-upload/SETUP.md` for end-to-end setup instructions including Firebase Storage rules, QR code generation, and post-wedding photo download.
