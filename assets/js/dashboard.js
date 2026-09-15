import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
const logout=document.getElementById("logoutBtn");
if(logout) logout.onclick=()=>signOut(auth).then(()=>location.href="../");

onAuthStateChanged(auth, async user => {
  if(!user){ location.href="../login/"; return; }
  await user.reload();
  const snap=await getDoc(doc(db,"users",user.uid));
  const data=snap.exists()?snap.data():{};
  const name=data.username || user.displayName || "User";
  const created=user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "—";
  set("userName",name); set("userEmail",user.email); set("uid",user.uid);
  set("overviewName",name); set("overviewEmail",user.email); set("createdAt",created);
  set("profileName",name); set("profileEmail",user.email); set("detailName",name); set("detailEmail",user.email); set("detailUid",user.uid); set("detailCreated",created);
  const avatar=document.getElementById("avatar"); if(avatar) avatar.textContent=name.charAt(0).toUpperCase();
  const plan=data.plan || "free"; const active=data.subscriptionStatus==="active";
  set("planName",plan.charAt(0).toUpperCase()+plan.slice(1));
  set("planStatus",active?(window.nemesisLanguage?.() === "en" ? "Active" : "Активна"):(window.nemesisLanguage?.() === "en" ? "No subscription" : "Без подписки"));
  set("expiresText", data.expiresAt ? (window.nemesisLanguage?.() === "en" ? `Expires ${new Date(data.expiresAt.seconds*1000).toLocaleDateString()}.` : `Истекает ${new Date(data.expiresAt.seconds*1000).toLocaleDateString()}.`) : (active ? (window.nemesisLanguage?.() === "en" ? "Your subscription is active." : "Ваша подписка активна.") : (window.nemesisLanguage?.() === "en" ? "Choose a plan to unlock Nemesis." : "Выберите тариф, чтобы открыть дополнительные возможности Nemesis.")));
});