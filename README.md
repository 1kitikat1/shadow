# Nemesis Web — GitHub Pages

Nemesis website with Firebase Email/Password authentication and Firebase Realtime Database for account data.

## Deploy
Upload all files in this archive to your GitHub Pages repository.

## Firebase Authentication
Enable **Authentication → Sign-in method → Email/Password**.

Email verification is not required by this website. After registration the user is sent directly to the dashboard.

## Firebase Realtime Database
Create a **Realtime Database** in the Firebase project and publish the rules from `database.rules.json`.

The website stores user data at:

```text
users/{uid}
```

Example:

```json
{
  "username": "Kitikat",
  "email": "user@example.com",
  "plan": "free",
  "subscriptionStatus": "inactive",
  "createdAt": 1760000000000
}
```

### Database URL
`assets/js/firebase.js` currently uses:

```text
https://nemkaclient-default-rtdb.firebaseio.com
```

If Firebase Console shows a different **Realtime Database URL**, replace `databaseURL` in `assets/js/firebase.js` with the exact URL shown there.

## Security
The rules allow each authenticated user to read/write only their own `users/{uid}` record. Never put Firebase Admin credentials, private keys, payment secrets or server credentials in the repository.

### EXE download
The main Minecraft download buttons point to `download/Nemesis.exe`. Place the real `Nemesis.exe` file in the site root at `download/Nemesis.exe` before deploying to GitHub Pages.
