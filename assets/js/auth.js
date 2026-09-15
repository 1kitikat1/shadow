import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const message = document.querySelector("#authMessage");
const lang = () => window.nemesisLanguage?.() || "ru";
const text = {
  ru: {
    signing: "Выполняем вход…",
    creating: "Создаём аккаунт…",
    need: "Сначала введите email и пароль.",
    created: "Аккаунт создан.",
    error: "Что-то пошло не так. Попробуйте ещё раз."
  },
  en: {
    signing: "Signing in…",
    creating: "Creating account…",
    need: "Enter your email and password first.",
    created: "Account created.",
    error: "Something went wrong. Please try again."
  }
};

const show = (value, error = true) => {
  if (message) message.textContent = value;
  if (message) message.className = "form-message " + (error ? "error" : "success");
};

const busy = (form, on, label) => {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;

  if (on) {
    button.dataset.old = button.textContent;
    button.disabled = true;
    button.textContent = label;
  } else {
    button.disabled = false;
    if (button.dataset.old) button.textContent = button.dataset.old;
  }
};

function firebaseError(code) {
  const ru = {
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/invalid-email": "Введите корректный email.",
    "auth/weak-password": "Пароль должен содержать минимум 6 символов.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/too-many-requests": "Слишком много попыток. Попробуйте позже.",
    "PERMISSION_DENIED": "Firebase не разрешил запись в Realtime Database. Проверь Rules."
  };
  const en = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Enter a valid email.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "PERMISSION_DENIED": "Firebase denied the Realtime Database write. Check your Rules."
  };

  return (lang() === "en" ? en : ru)[code] || text[lang()].error;
}

const login = document.querySelector("#loginForm");
if (login) {
  onAuthStateChanged(auth, user => {
    if (user) location.href = "../dashboard/";
  });

  login.addEventListener("submit", async event => {
    event.preventDefault();
    busy(login, true, text[lang()].signing);
    show(text[lang()].signing, false);

    try {
      await signInWithEmailAndPassword(
        auth,
        login.email.value.trim(),
        login.password.value
      );
      location.href = "../dashboard/";
    } catch (error) {
      show(firebaseError(error.code));
    } finally {
      busy(login, false);
    }
  });
}

const register = document.querySelector("#registerForm");
if (register) {
  onAuthStateChanged(auth, user => {
    if (user) location.href = "../dashboard/";
  });

  register.addEventListener("submit", async event => {
    event.preventDefault();
    busy(register, true, text[lang()].creating);
    show(text[lang()].creating, false);

    try {
      const username = register.username.value.trim();
      const email = register.email.value.trim();
      const password = register.password.value;

      if (!username || !email || !password) {
        show(text[lang()].need);
        return;
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      await updateProfile(user, { displayName: username });

      // Realtime Database: users/{uid}
      await set(ref(db, `users/${user.uid}`), {
        username,
        email: user.email || email,
        plan: "free",
        subscriptionStatus: "inactive",
        createdAt: Date.now()
      });

      show(text[lang()].created, false);
      location.href = "../dashboard/";
    } catch (error) {
      console.error("Registration error:", error);
      show(firebaseError(error.code || error.message));
    } finally {
      busy(register, false);
    }
  });
}
