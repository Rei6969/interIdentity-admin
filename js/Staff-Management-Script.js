import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
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
const database = getDatabase();

const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const staffTable = document.querySelector(
  ".staff-management-section .staff-table-container"
);
const h1Text = document.querySelector(".staff-management-section .h1-text1");
const btnAddStaffNav = document.querySelector(
  ".staff-management-section .add-staff-btn"
);

const staffsTableBody = document.getElementById("staffs-table-body");
const newStaffAccountContainer = document.getElementById("new-staff-account");

const fName = newStaffAccountContainer.querySelector(".first-name");
const lName = newStaffAccountContainer.querySelector(".last-name");
const role = newStaffAccountContainer.querySelector(".role");
const email = newStaffAccountContainer.querySelector(".email");
const contact = newStaffAccountContainer.querySelector(".contact");
const cityProvince = newStaffAccountContainer.querySelector(".city-province");
const birthday = newStaffAccountContainer.querySelector(".birthday");
const password = newStaffAccountContainer.querySelector(".password");
const cPassword = newStaffAccountContainer.querySelector(".confirm-password");

const btnAddStaffAccount = newStaffAccountContainer.querySelector(
  ".btn-add-staff-account"
);
const btnBack = newStaffAccountContainer.querySelector(
  ".btn-back-staff-account"
);

// ==================================================================================================================================================
displayStaffs();

async function displayStaffs() {
  staffsTableBody.innerHTML = "";

  const snapshot = await get(ref(database, "staff"));
  const snapshotData = snapshot.val();

  for (const ID in snapshotData) {
    const data = snapshotData[ID];

    const tr = document.createElement("tr");

    const img = document.createElement("td");
    const profile = document.createElement("img");
    profile.src = data.profileUrl
      ? data.profileUrl
      : "./../media/images/default-profile.png";
    profile.alt = "img";

    img.appendChild(profile);

    const fName = document.createElement("td");
    fName.textContent = data.fName;

    const lName = document.createElement("td");
    lName.textContent = data.lName;

    const email = document.createElement("td");
    email.textContent = data.email;

    const contact = document.createElement("td");
    contact.textContent = data.contact;

    const dateJoin = document.createElement("td");
    dateJoin.textContent = data.dateJoin;

    const location = document.createElement("td");
    location.textContent = data.cityProvince;

    const actions = document.createElement("td");

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "Remove";
    btnRemove.classList.add("remove-btn");

    actions.appendChild(btnRemove);

    tr.appendChild(img);
    tr.appendChild(fName);
    tr.appendChild(lName);
    tr.appendChild(email);
    tr.appendChild(contact);
    tr.appendChild(dateJoin);
    tr.appendChild(location);
    tr.appendChild(actions);

    staffsTableBody.appendChild(tr);

    btnRemove.addEventListener("click", () => {
      const confirmRemove = confirm(`remove account ${data.email}?`);
      if (!confirmRemove) return;

      remove(ref(database, `admin/${ID}`)).then(() => {
        displayStaffs();
      });
    });
  }
}
// ==================================================================================================================================================
btnAddStaffNav.addEventListener("click", () => {
  staffTable.style.display = "none";
  h1Text.style.display = "none";
  btnAddStaffNav.style.display = "none";
  newStaffAccountContainer.style.display = "block";
});

btnBack.addEventListener("click", () => {
  staffTable.style.removeProperty("display");
  h1Text.style.removeProperty("display");
  btnAddStaffNav.style.removeProperty("display");
  newStaffAccountContainer.style.display = "none";
});

btnAddStaffAccount.addEventListener("click", () => {
  if (
    !fName.value ||
    !lName.value ||
    !email.value ||
    !contact.value ||
    !cityProvince.value ||
    !birthday.value ||
    !password.value ||
    !cPassword.value
  ) {
    alert("Please fill all the field.");
    return;
  }

  if (password.value !== cPassword.value) {
    alert("Password and confirm password do not match.");
    return;
  }

  createUserWithEmailAndPassword(
    secondaryAuth,
    email.value.trim(),
    password.value.trim()
  )
    .then((userCredential) => {
      sendEmailVerification(secondaryAuth.currentUser)
        .then(() => {
          alert(`Verification email has been sent to ${email.value.trim()}`);
        })
        .catch((error) => {
          console.error("Error sending verification email:", error);
        });

      let currentDate = new Date();
      let year = currentDate.getFullYear();
      let month = String(currentDate.getMonth() + 1).padStart(2, "0");
      let day = String(currentDate.getDate()).padStart(2, "0");

      let date = `${month}-${day}-${year}`;

      const user = userCredential.user;
      const userData = {
        fName: fName.value.trim(),
        lName: lName.value.trim(),
        email: email.value.trim(),
        contact: contact.value.trim(),
        cityProvince: cityProvince.value.trim(),
        birthday: birthday.value.trim(),
        role: "staff",
        dateJoin: date,
      };

      set(ref(database, "staff/" + user.uid), userData)
        .then(() => {
          alert("Registration successful!");
          secondaryAuth.signOut();
          window.location.reload();
        })
        .catch((error) => {
          alert("Error registering user: " + error.message);
        });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
      console.error("createUserWithEmailAndPassword", errorMessage);
    });
});
