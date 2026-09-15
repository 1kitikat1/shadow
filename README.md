# Nemesis Web — GitHub Pages

Updated Nemesis website with Russian default language, RU/EN switch, purple theme, Firebase Email/Password authentication and mandatory email verification.

## Deploy
Upload all files in this archive to your GitHub Pages repository.

## Firebase
Enable Authentication → Sign-in method → Email/Password. Registration sends a verification email via Firebase `sendEmailVerification()`. Unverified users are blocked from the dashboard.

Customize the verification email in Firebase Authentication → Templates.

## Important
The Firebase Web API key in `assets/js/firebase.js` is intended for client-side Firebase configuration. Never put Firebase Admin credentials, private keys, payment secrets or server credentials in the repository.


### EXE download
The main Minecraft download buttons now point to `download/Nemesis.exe`. Place the real `Nemesis.exe` file in the site root at `download/Nemesis.exe` before deploying to GitHub Pages.
