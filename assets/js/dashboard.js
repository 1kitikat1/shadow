import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { onValue, ref } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const set = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value ?? "—";
};

const logout = document.getElementById("logoutBtn");
if (logout) {
  logout.onclick = () => signOut(auth).then(() => location.href = "../");
}

function dateValue(value) {
  if (!value) return null;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "object" && value.seconds) {
    return new Date(value.seconds * 1000);
  }
  return null;
}

function formatDate(value) {
  const date = dateValue(value);
  return date ? date.toLocaleDateString() : "—";
}

function formatExpires(value, active) {
  const date = dateValue(value);
  const english = window.nemesisLanguage?.() === "en";

  if (date) {
    return english
      ? `Expires ${date.toLocaleDateString()}.`
      : `Истекает ${date.toLocaleDateString()}.`;
  }

  if (active) {
    return english ? "Your subscription is active." : "Ваша подписка активна.";
  }

  return english
    ? "Choose a plan to unlock Nemesis."
    : "Выберите тариф, чтобы открыть дополнительные возможности Nemesis.";
}

function renderUser(user, data = {}) {
  const name = data.username || user.displayName || "User";
  const email = data.email || user.email || "—";
  const created = data.createdAt || user.metadata.creationTime;
  const plan = data.plan || "free";
  const active = data.subscriptionStatus === "active";

  set("userName", name);
  set("userEmail", email);
  set("uid", user.uid);

  set("overviewName", name);
  set("overviewEmail", email);
  set("createdAt", formatDate(created));

  set("profileName", name);
  set("profileEmail", email);
  set("detailName", name);
  set("detailEmail", email);
  set("detailUid", user.uid);
  set("detailCreated", formatDate(created));

  const avatar = document.getElementById("avatar");
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

  set("planName", plan.charAt(0).toUpperCase() + plan.slice(1));
  set(
    "planStatus",
    active
      ? (window.nemesisLanguage?.() === "en" ? "Active" : "Активна")
      : (window.nemesisLanguage?.() === "en" ? "No subscription" : "Без подписки")
  );
  set("expiresText", formatExpires(data.expiresAt, active));
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "../login/";
    return;
  }

  try {
    await user.reload();
  } catch (error) {
    console.warn("Could not reload Firebase user:", error);
  }

  // Live profile data from Realtime Database.
  const userRef = ref(db, `users/${user.uid}`);
  onValue(
    userRef,
    snapshot => {
      const data = snapshot.exists() ? snapshot.val() : {};
      renderUser(user, data);
    },
    error => {
      console.error("Realtime Database read error:", error);
      // Keep Auth data visible even if the RTDB rules are not configured yet.
      renderUser(user, {});
    }
  );
});
