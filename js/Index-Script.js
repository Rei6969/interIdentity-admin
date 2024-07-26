import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPgWFqszS_2o_40rIUbZhSDPgsxl3u5n0",
  authDomain: "interidentity-90d32.firebaseapp.com",
  databaseURL: "https://interidentity-90d32-default-rtdb.firebaseio.com",
  projectId: "interidentity-90d32",
  storageBucket: "interidentity-90d32.appspot.com",
  messagingSenderId: "564846928127",
  appId: "1:564846928127:web:abf02f06edd576fcd12cca",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

const loginButton = document.querySelector(".btn-login");

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    loginButton.addEventListener("click", async () => {
      const email = document.getElementById("login-email");
      const password = document.getElementById("login-password");

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.value,
          password.value
        );
        const user = userCredential.user;

        const staffRef = ref(db, "staff/" + user.uid);
        const adminRef = ref(db, "admin/" + user.uid);

        const staffSnapshot = await get(staffRef);
        const adminSnapshot = await get(adminRef);

        if (staffSnapshot.exists() || adminSnapshot.exists()) {
          const userType = staffSnapshot.exists() ? "staff" : "admin";
          const userVerified = user.emailVerified;

          if (userVerified) {
            // auth.onAuthStateChanged(() => {}); // Remove listener
            console.log(
              "Setting localStorage item for adminStaffRole:",
              userType
            );
            localStorage.setItem("adminStaffRole", userType);
            window.location.href = "./html/Dashboard.html";
          } else {
            alert("Please verify your email before logging in.");
          }
        } else {
          alert("No account.");
        }
      } catch (error) {
        console.error("Error logging in: ", error);
        alert(error.message);
      }
    });

    const loginContainer = document.querySelector(".login-container");
    const forgotPasswordContainer = document.querySelector(
      ".forgot-password-container"
    );

    document
      .querySelector(".btn-forgot-password")
      .addEventListener("click", () => {
        loginContainer.style.display = "none";
        forgotPasswordContainer.style.display = "grid";
        document.getElementById("forgot-password-email").value = "";
      });

    document.querySelector(".btn-cancel").addEventListener("click", () => {
      loginContainer.style.display = "grid";
      forgotPasswordContainer.style.display = "none";
    });

    document.querySelector(".btn-reset").addEventListener("click", () => {
      const email = document.getElementById("forgot-password-email").value;

      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent. Please check your inbox.");
          loginContainer.style.display = "grid";
          forgotPasswordContainer.style.display = "none";
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    });
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });
