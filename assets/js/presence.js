import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { onDisconnect, ref, set, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const HEARTBEAT_MS = 30000;
let timer = null;
let privateRef = null;
let publicRef = null;

async function stopPresence() {
  if (timer) clearInterval(timer);
  timer = null;
  if (privateRef) try { await remove(privateRef); } catch (_) {}
  if (publicRef) try { await remove(publicRef); } catch (_) {}
  privateRef = null;
  publicRef = null;
}

async function startPresence(user) {
  await stopPresence();
  if (!user) return;

  privateRef = ref(db, `presence/${user.uid}`);
  publicRef = ref(db, `publicPresence/${user.uid}`);

  const now = () => Date.now();
  const write = async () => {
    const lastSeen = now();
    await set(privateRef, {
      username: user.displayName || "User",
      email: user.email || "",
      source: "web",
      lastSeen
    });
    await set(publicRef, { lastSeen });
  };

  try {
    await onDisconnect(privateRef).remove();
    await onDisconnect(publicRef).remove();
    await write();
    timer = setInterval(() => write().catch(() => {}), HEARTBEAT_MS);
  } catch (error) {
    console.warn("Presence heartbeat unavailable:", error);
  }
}

onAuthStateChanged(auth, user => startPresence(user));

window.addEventListener("beforeunload", () => {
  if (privateRef) remove(privateRef).catch(() => {});
  if (publicRef) remove(publicRef).catch(() => {});
});
