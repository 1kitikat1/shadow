import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, reload, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const message=document.querySelector("#authMessage");
const lang=()=>window.nemesisLanguage?.()||"ru";
const text={
  ru:{signing:"Выполняем вход…",creating:"Создаём аккаунт…",verify:"",sent:"",need:"Сначала введите email и пароль.",created:"Аккаунт создан.",error:"Что-то пошло не так. Попробуйте ещё раз."},
  en:{signing:"Signing in…",creating:"Creating account…",verify:"",sent:"",need:"Enter your email and password first.",created:"Account created.",error:"Something went wrong. Please try again."}
};
const show=(v,error=true)=>{if(message){message.textContent=v;message.className="form-message "+(error?"error":"success")}};
const busy=(form,on,label)=>{const b=form?.querySelector('button[type="submit"]');if(!b)return;if(on){b.dataset.old=b.textContent;b.disabled=true;b.textContent=label}else{b.disabled=false;if(b.dataset.old)b.textContent=b.dataset.old}};
function firebaseError(code){const ru={"auth/email-already-in-use":"Этот email уже зарегистрирован.","auth/invalid-email":"Введите корректный email.","auth/weak-password":"Пароль должен содержать минимум 6 символов.","auth/invalid-credential":"Неверный email или пароль.","auth/too-many-requests":"Слишком много попыток. Попробуйте позже."};const en={"auth/email-already-in-use":"This email is already registered.","auth/invalid-email":"Enter a valid email.","auth/weak-password":"Password must be at least 6 characters.","auth/invalid-credential":"Incorrect email or password.","auth/too-many-requests":"Too many attempts. Try again later."};return(lang()==="en"?en:ru)[code]||text[lang()].error}

const login=document.querySelector("#loginForm");
if(login){
  onAuthStateChanged(auth,user=>{if(user)location.href="../dashboard/"});
  login.addEventListener("submit",async e=>{e.preventDefault();busy(login,true,text[lang()].signing);show(text[lang()].signing,false);try{const cred=await signInWithEmailAndPassword(auth,login.email.value.trim(),login.password.value);location.href="../dashboard/"}catch(err){show(firebaseError(err.code))}finally{busy(login,false)}})
}

const register=document.querySelector("#registerForm");
if(register){
  onAuthStateChanged(auth,user=>{if(user)location.href="../dashboard/"});
  register.addEventListener("submit",async e=>{e.preventDefault();busy(register,true,text[lang()].creating);show(text[lang()].creating,false);try{const username=register.username.value.trim();const cred=await createUserWithEmailAndPassword(auth,register.email.value.trim(),register.password.value);await updateProfile(cred.user,{displayName:username});await setDoc(doc(db,"users",cred.user.uid),{username,email:cred.user.email,plan:"free",subscriptionStatus:"inactive",createdAt:serverTimestamp()});show(text[lang()].created,false);location.href="../dashboard/"}catch(err){show(firebaseError(err.code))}finally{busy(register,false)}})
}

