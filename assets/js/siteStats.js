import { db } from "./firebase.js";
import { onValue, ref } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const ACTIVE_WINDOW = 90000;

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
  if (id === "activeUsersCount") {
    const second = document.getElementById("activeUsersCount2");
    if (second) second.textContent = value;
  }
}

onValue(ref(db, "publicPresence"), snapshot => {
  const now = Date.now();
  const active = Object.values(snapshot.val() || {})
    .filter(p => Number(p?.lastSeen) > now - ACTIVE_WINDOW).length;
  set("activeUsersCount", active);
  set("activeUsersLabel", active === 1 ? "ACTIVE USER" : "ACTIVE USERS");
}, () => set("activeUsersCount", "—"));

onValue(ref(db, "stats/registeredCount"), snapshot => {
  const value = Number(snapshot.val());
  set("registeredUsersCount", Number.isFinite(value) ? value : 0);
}, () => set("registeredUsersCount", "—"));
