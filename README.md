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

## Live activity / Minecraft loader

The site now uses `presence/{uid}` and `publicPresence/{uid}` with a 30-second heartbeat. A session is considered active for 90 seconds after its last heartbeat. The admin panel shows the real active users and whether the heartbeat came from the website or the Minecraft loader.

For the **Minecraft client/loader**, use the Firebase Auth ID token of the logged-in Nemesis account and send a heartbeat to:

`https://nemkaclient-default-rtdb.firebaseio.com/presence/<UID>.json?auth=<ID_TOKEN>`

Send the private heartbeat JSON to `presence/<UID>` and the public heartbeat JSON (`{"lastSeen": ...}`) to `publicPresence/<UID>`.

Send JSON similar to:

```json
{"username":"Kitikat","email":"user@example.com","source":"loader","lastSeen":1720000000000}
```

Repeat every 30 seconds. Stop sending when the loader/client exits. The admin panel will then count the loader user as active. Do not put Firebase admin/service-account credentials into the loader.

The public site does **not** invent a fake live-user number: it shows the real active session count. If you want a separate marketing/community number such as `1000+`, label it as a community estimate rather than live users.
