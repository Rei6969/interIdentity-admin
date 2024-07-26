import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  setPersistence,
  browserSessionPersistence,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
  listAll,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

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
const storage = getStorage(firebaseApp);

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userID = user.uid;
    const role = localStorage.getItem("adminStaffRole");

    const btnStaff = document.getElementById("btn-staff");

    if (role === "admin") {
      btnStaff.style.display = "block";
    } else {
      btnStaff.style.display = "none";
    }

    const adminProfile = document.getElementById("admin-profile");
    const adminName = document.getElementById("admin-name");

    const snapshot = await get(ref(database, `${role}/${userID}`));
    const snapshotData = snapshot.val();

    adminProfile.src = snapshotData.profileUrl
      ? snapshotData.profileUrl
      : "./../media/icons/icons8-person-64.png";

    adminName.textContent = `${snapshotData.lName}`;

    document.querySelector(".btn-logout").addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "./../Index.html";
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    });

    const adminProfileSection = document.getElementById(
      "admin-profile-section"
    );

    const profileContainer =
      adminProfileSection.querySelector(".profile-container");
    const editProfileContainer = adminProfileSection.querySelector(
      ".edit-profile-container"
    );
    const changePasswordContainer = adminProfileSection.querySelector(
      ".change-password-container"
    );

    const editProfileBtn = document.getElementById("edit-profile-btn");
    const backBtn = document.getElementById("back-btn");
    const saveChangesBtn = document.getElementById("save-changes-btn");
    const savePasswordBtn = document.getElementById("save-password-btn");
    const btnChangePassword = document.getElementById("btn-change-password");
    const cancelPasswordBtn = document.getElementById("cancel-password-btn");
    const uploadPhotoBtn = document.getElementById("upload-photo-btn");

    const profilePic = document.getElementById("profile-pic");
    const editProfilePic = document.getElementById("edit-profile-pic");
    const editFirstName = document.getElementById("edit-first-name");
    const editLastName = document.getElementById("edit-last-name");
    const editRole = document.getElementById("edit-role");
    const editEmail = document.getElementById("edit-email");
    const editContact = document.getElementById("edit-contact");
    const editAddress = document.getElementById("edit-address");
    const editBirthday = document.getElementById("edit-birthday");

    const oldPassword = document.getElementById("old-password");
    const newPassword = document.getElementById("new-password");
    const confirmPassword = document.getElementById("admin-confirm-password");

    let fileData = "";

    editProfileBtn.addEventListener("click", () => {
      profileContainer.classList.add("hidden");
      editProfileContainer.classList.remove("hidden");
    });

    backBtn.addEventListener("click", () => {
      profileContainer.classList.remove("hidden");
      editProfileContainer.classList.add("hidden");
    });

    btnChangePassword.addEventListener("click", () => {
      changePasswordContainer.classList.remove("hidden");
      editProfileContainer.classList.add("hidden");
    });

    uploadPhotoBtn.addEventListener("click", async () => {
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/*";
      file.maxLength = "1";

      file.click();

      file.onchange = async (e) => {
        fileData = e.target.files[0];

        const reader = new FileReader();

        reader.onload = (event) => {
          editProfilePic.setAttribute("src", event.target.result);
        };

        reader.readAsDataURL(fileData);
      };
    });

    saveChangesBtn.addEventListener("click", async () => {
      let profileStorageRef;

      if (fileData != "") {
        const profileRef = storageRef(
          storage,
          `adminProfile/${auth.currentUser.uid}`
        );
        const res = await listAll(profileRef);
        const deletePromises = res.items.map((itemRef) =>
          deleteObject(itemRef)
        );
        await Promise.all(deletePromises);

        profileStorageRef = storageRef(
          storage,
          `adminProfile/${auth.currentUser.uid}/${fileData.name}`
        );
        await uploadBytes(profileStorageRef, fileData);
      }

      const snapshot = await get(
        ref(database, `${role}/${auth.currentUser.uid}`)
      );
      const snapshotData = snapshot.val();

      const updates = {
        fName: editFirstName.value,
        lName: editLastName.value,
        role: editRole.value,
        email: editEmail.value,
        contact: editContact.value,
        cityProvince: editAddress.value,
        birthday: editBirthday.value,
        profileUrl:
          fileData != ""
            ? await getDownloadURL(profileStorageRef)
            : snapshotData.profileUrl,
      };

      const userID = auth.currentUser.uid;
      update(ref(database, `${role}/` + userID), updates)
        .then(() => {
          alert("Profile updated successfully!");
          window.location.reload();
        })
        .catch((error) => {
          alert("Error updating profile: " + error.message);
        });
    });

    savePasswordBtn.addEventListener("click", async () => {
      if (
        newPassword.value != confirmPassword.value ||
        !newPassword.value ||
        !confirmPassword.value
      ) {
        alert("New password and confirm password do not match.");
        return;
      }

      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword.value
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword.value)
            .then(() => {
              alert("Password updated successfully!");
              changePasswordContainer.classList.add("hidden");
              profileContainer.classList.remove("hidden");
            })
            .catch((error) => {
              alert("Error updating password: " + error.message);
            });
        })
        .catch((error) => {
          alert("Error reauthenticating: " + error.message);
        });
    });

    cancelPasswordBtn.addEventListener("click", () => {
      changePasswordContainer.classList.add("hidden");
      editProfileContainer.classList.remove("hidden");
    });

    get(ref(database, `${role}/` + userID))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          document.getElementById(
            "profile-admin-name"
          ).innerText = `${data.fName} ${data.lName}`;
          document.getElementById("admin-role").innerText = data.role;
          document.getElementById("info-first-name").innerText = data.fName;
          document.getElementById("info-last-name").innerText = data.lName;
          document.getElementById("info-role").innerText = data.role;
          document.getElementById("info-email").innerText = data.email;
          document.getElementById("info-contact").innerText = data.contact;
          document.getElementById("info-address").innerText = data.cityProvince;
          document.getElementById("info-birthday").innerText = data.birthday;

          editFirstName.value = data.fName;
          editLastName.value = data.lName;
          editRole.value = data.role;
          editEmail.value = data.email;
          editContact.value = data.contact;
          editAddress.value = data.cityProvince;
          editBirthday.value = data.birthday;

          profilePic.src = data.profileUrl
            ? data.profileUrl
            : "./../media/images/default-profile.png";
          editProfilePic.src = data.profileUrl
            ? data.profileUrl
            : "./../media/images/default-profile.png";
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error("Error retrieving data:", error);
      });
  } else {
    window.location.href = "./../Index.html";
  }
});
