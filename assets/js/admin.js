import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { onValue, ref, update, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const ADMIN_EMAIL = "admin@nemesis.team";
const ACTIVE_WINDOW = 90000;
const table = document.getElementById("usersTable");
const count = document.getElementById("userCount");
const activeCount = document.getElementById("activeUserCount");
const activeTable = document.getElementById("activeUsersTable");
const message = document.getElementById("adminMessage");

let usersCache = {};
let presenceCache = {};

function show(text, error = true) {
  if (message) {
    message.textContent = text;
    message.className = "form-message " + (error ? "error" : "success");
  }
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#039;"}[c]));
}

function render(users) {
  usersCache = users || {};
  const entries = Object.entries(usersCache);
  if (count) count.textContent = entries.length;
  if (!table) return;
  if (!entries.length) {
    table.innerHTML = '<tr><td colspan="5">No accounts found.</td></tr>';
    return;
  }
  table.innerHTML = entries.map(([uid, u]) => `
    <tr data-uid="${esc(uid)}">
      <td><strong>${esc(u.username || "—")}</strong></td>
      <td>${esc(u.email || "—")}</td>
      <td><select data-field="plan"><option value="free" ${u.plan === "free" ? "selected" : ""}>Free</option><option value="premium" ${u.plan === "premium" ? "selected" : ""}>Premium</option><option value="pro" ${u.plan === "pro" ? "selected" : ""}>Pro</option></select></td>
      <td><select data-field="subscriptionStatus"><option value="inactive" ${u.subscriptionStatus !== "active" ? "selected" : ""}>Inactive</option><option value="active" ${u.subscriptionStatus === "active" ? "selected" : ""}>Active</option></select></td>
      <td><button class="btn btn-small save-user">Save</button></td>
    </tr>`).join("");
}

function renderPresence(presence) {
  presenceCache = presence || {};
  const now = Date.now();
  const entries = Object.entries(presenceCache)
    .filter(([, p]) => Number(p?.lastSeen) > now - ACTIVE_WINDOW)
    .sort((a, b) => Number(b[1].lastSeen) - Number(a[1].lastSeen));

  if (activeCount) activeCount.textContent = entries.length;
  if (!activeTable) return;
  if (!entries.length) {
    activeTable.innerHTML = '<tr><td colspan="4">No active users right now.</td></tr>';
    return;
  }

  activeTable.innerHTML = entries.map(([uid, p]) => `
    <tr>
      <td><strong>${esc(p.username || usersCache[uid]?.username || "—")}</strong></td>
      <td>${esc(p.email || usersCache[uid]?.email || "—")}</td>
      <td>${esc(p.source === "loader" ? "Minecraft / Loader" : "Website")}</td>
      <td>${new Date(Number(p.lastSeen)).toLocaleTimeString()}</td>
    </tr>`).join("");
}

function loadUsers() {
  onValue(ref(db, "users"), snapshot => {
    const users = snapshot.val() || {};
    render(users);
    set(ref(db, "stats/registeredCount"), Object.keys(users).length).catch(error => console.warn("Stats sync failed:", error));
  }, () => show("Не удалось загрузить пользователей. Проверьте Rules."));

  onValue(ref(db, "presence"), snapshot => renderPresence(snapshot.val() || {}), () => show("Не удалось загрузить активных пользователей."));
}

document.getElementById("refreshBtn")?.addEventListener("click", () => location.reload());
document.getElementById("logoutBtn")?.addEventListener("click", () => signOut(auth).then(() => location.href = "../"));

table?.addEventListener("click", async e => {
  const button = e.target.closest(".save-user");
  if (!button) return;
  const row = button.closest("tr");
  const uid = row.dataset.uid;
  const plan = row.querySelector('[data-field="plan"]').value;
  const subscriptionStatus = row.querySelector('[data-field="subscriptionStatus"]').value;
  button.disabled = true;
  try {
    await update(ref(db, `users/${uid}`), { plan, subscriptionStatus });
    show("Изменения сохранены.", false);
  } catch (error) {
    console.error(error);
    show("Не удалось сохранить изменения.");
  } finally {
    button.disabled = false;
  }
});

onAuthStateChanged(auth, async user => {
  if (!user) { location.href = "../login/"; return; }
  await user.reload();
  if ((user.email || "").toLowerCase() !== ADMIN_EMAIL) { location.href = "../dashboard/"; return; }
  loadUsers();
});
