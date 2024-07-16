import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
  push,
  onValue,
  query,
  orderByChild,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
  uploadBytes,
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

// ===============================================================================================================================================

// const aBtn = document.querySelectorAll("#dashboard-section .dashboard-left a");
const btnDashboard = document.getElementById("btn-dashboard");

const sectionDashboard = document.getElementById("dashboard-section");

const btnViewUserEngagement = sectionDashboard.querySelector(
  ".btn-view-user-engagement"
);
const btnManageUsers = sectionDashboard.querySelector(".btn-manage-users");
// ===============================================================================================================================================
const btnBackUserEngagement = sectionDashboard.querySelector(
  ".btn-back-user-engagement"
);
const btnBackManageUsers = sectionDashboard.querySelector(
  ".btn-back-manage-users"
);
const btnBackUserProfile = sectionDashboard.querySelector(
  ".btn-back-users-profile"
);
// ===============================================================================================================================================
const dashboardLanding = document.getElementById("dashboard-landing");
const userEngagementContainer = document.getElementById(
  "user-engagement-container"
);
const manageUsersContainer = document.getElementById("manage-users-container");
const usersCardContainer = document.getElementById("users-card-container");
const userInfoContainer = document.getElementById("user-info-container");

const cityTBody = sectionDashboard.querySelector(".city-table-body");

// ===============================================================================================================================================
const profileImg = userInfoContainer.querySelector(".profile-img");
const name = userInfoContainer.querySelector(".name");
const fName = userInfoContainer.querySelector(".first-name");
const lName = userInfoContainer.querySelector(".last-name");
const email = userInfoContainer.querySelector(".email");
const contact = userInfoContainer.querySelector(".contact");
const province = userInfoContainer.querySelector(".province");
const age = userInfoContainer.querySelector(".age");
const blogsCount = userInfoContainer.querySelector(".blogs-count");
const discussionsCount = userInfoContainer.querySelector(".discussions-count");
const pollsCount = userInfoContainer.querySelector(".polls-count");
const btnRestrict = userInfoContainer.querySelector(".btn-restrict");
// ===============================================================================================================================================

btnDashboard.addEventListener("click", () => {
  sessionStorage.removeItem("current-dashboard-nav");

  dashboardLanding.style.removeProperty("display");
  userEngagementContainer.style.display = "none";
  manageUsersContainer.style.display = "none";
});

// =============================================================================================================================================
btnViewUserEngagement.addEventListener("click", () => {
  sessionStorage.setItem("current-dashboard-nav", "userEngagementContainer");
  handleNav();
});

btnManageUsers.addEventListener("click", () => {
  sessionStorage.setItem("current-dashboard-nav", "manageUsersContainer");
  handleNav();
});
// =============================================================================================================================================

handleNav();

function handleNav() {
  const nav = sessionStorage.getItem("current-dashboard-nav");

  dashboardLanding.style.display = "none";
  userEngagementContainer.style.removeProperty("display");
  manageUsersContainer.style.removeProperty("display");

  if (nav === "userEngagementContainer") {
    userEngagementContainer.style.display = "block";
    displayUserEngagementByAgeAndGender();
    displayUserEngagement();
    displayUsersCard();
  } else if (nav === "manageUsersContainer") {
    manageUsersContainer.style.display = "grid";
    displayUsersCard();
  } else {
    dashboardLanding.style.removeProperty("display");
    displayUsersCard();
  }
}

// =============================================================================================================================================
btnBackUserEngagement.addEventListener("click", () => {
  sessionStorage.removeItem("current-dashboard-nav");
  handleNav();
});

btnBackManageUsers.addEventListener("click", () => {
  sessionStorage.setItem("current-dashboard-nav", "userEngagementContainer");
  handleNav();
});
// =============================================================================================================================================

async function displayUserEngagement() {
  cityTBody.innerHTML = "";

  const usersRef = ref(database, "users");

  const snapshot = await get(usersRef);
  const snapshotData = snapshot.val();

  const provinceCountMap = new Map();

  for (const ID in snapshotData) {
    const data = snapshotData[ID];
    const province = data.province;

    if (provinceCountMap.has(province)) {
      provinceCountMap.set(province, provinceCountMap.get(province) + 1);
    } else {
      provinceCountMap.set(province, 1);
    }
  }

  for (const [province, count] of provinceCountMap.entries()) {
    const tr = document.createElement("tr");

    const tdProvince = document.createElement("td");
    tdProvince.textContent = province;

    const tdCount = document.createElement("td");
    tdCount.textContent = count;

    tr.appendChild(tdProvince);
    tr.appendChild(tdCount);

    cityTBody.appendChild(tr);
  }
}

async function displayUserEngagementByAgeAndGender() {
  const usersRef = ref(database, "users");
  const snapshot = await get(usersRef);
  const snapshotData = snapshot.val();

  const ageGenderCountMap = {
    "12-": { male: 0, female: 0, others: 0 },
    "13-17": { male: 0, female: 0, others: 0 },
    "18-24": { male: 0, female: 0, others: 0 },
    "25-34": { male: 0, female: 0, others: 0 },
    "35-44": { male: 0, female: 0, others: 0 },
    "45-54": { male: 0, female: 0, others: 0 },
    "55-64": { male: 0, female: 0, others: 0 },
    "65+": { male: 0, female: 0, others: 0 },
  };

  function getAgeGroup(age) {
    if (age <= 12) return "12-";
    if (age >= 13 && age <= 17) return "13-17";
    if (age >= 18 && age <= 24) return "18-24";
    if (age >= 25 && age <= 34) return "25-34";
    if (age >= 35 && age <= 44) return "35-44";
    if (age >= 45 && age <= 54) return "45-54";
    if (age >= 55 && age <= 64) return "55-64";
    return "65+";
  }

  for (const ID in snapshotData) {
    const data = snapshotData[ID];
    const ageGroup = getAgeGroup(data.age);
    const gender = data.gender.toLowerCase();

    if (
      ageGenderCountMap[ageGroup] &&
      ageGenderCountMap[ageGroup][gender] !== undefined
    ) {
      ageGenderCountMap[ageGroup][gender]++;
    }
  }

  const table = document.getElementById("age-gender-table");

  for (const ageGroup in ageGenderCountMap) {
    const ageGroupRow = table.querySelector(`tr[data-age-group="${ageGroup}"]`);

    if (ageGroupRow) {
      ageGroupRow.querySelector('td[data-gender="male"]').textContent =
        ageGenderCountMap[ageGroup].male;
      ageGroupRow.querySelector('td[data-gender="female"]').textContent =
        ageGenderCountMap[ageGroup].female;
      ageGroupRow.querySelector('td[data-gender="others"]').textContent =
        ageGenderCountMap[ageGroup].others;
    }
  }
}

// MANAGE USERS =============================================================================================================================================
// displayUsersCard();

async function displayUsersCard() {
  usersCardContainer.innerHTML = "";

  const usersRef = ref(database, "users");

  const snapshot = await get(usersRef);
  const snapshotData = snapshot.val();

  const usersCount = sectionDashboard.querySelectorAll(
    ".registered-users-count"
  );

  usersCount.forEach((count) => {
    count.textContent = snapshotData ? Object.keys(snapshotData).length : 0;
  });

  for (const ID in snapshotData) {
    const data = snapshotData[ID];

    const cardContent = document.createElement("div");
    cardContent.classList.add("users-card-content");

    const div = document.createElement("div");

    const userProfile = document.createElement("img");
    userProfile.src =
      data.profileUrl || "./../media/images/default-profile.png";

    const h1 = document.createElement("h1");
    h1.textContent = `${data.fName} ${data.lName}`;

    div.appendChild(userProfile);
    div.appendChild(h1);

    const iconArrow = document.createElement("img");
    iconArrow.src = "./../media/icons/icons8-chevron-right-90.png";
    iconArrow.alt = "icon";

    cardContent.appendChild(div);
    cardContent.appendChild(iconArrow);

    usersCardContainer.appendChild(cardContent);

    cardContent.addEventListener("click", async () => {
      document.getElementById("registered-manage-users").style.display = "none";
      usersCardContainer.style.display = "none";
      btnBackManageUsers.style.display = "none";
      userInfoContainer.style.display = "block";
      btnBackUserProfile.style.display = "block";

      const postsSnapshot = await get(ref(database, `posts/${ID}`));
      const discussionsSnapshot = await get(ref(database, `discussions/${ID}`));
      const pollsSnapshot = await get(ref(database, `polls/${ID}`));

      profileImg.src =
        data.profileUrl || "./../media/images/default-profile.png";
      name.textContent = `${data.fName} ${data.lName}`;
      fName.textContent = data.fName;
      lName.textContent = data.lName;
      email.textContent = data.email;
      contact.textContent = data.contact;
      province.textContent = data.province;
      age.textContent = data.age;

      const postsData = postsSnapshot.val();
      const discussionsData = discussionsSnapshot.val();
      const pollsData = pollsSnapshot.val();

      const blogsCount1 = postsData ? Object.keys(postsData).length : 0;
      const discussionsCount1 = discussionsData
        ? Object.keys(discussionsData).length
        : 0;
      const pollsCount1 = pollsData ? Object.keys(pollsData).length : 0;

      blogsCount.textContent = blogsCount1;
      discussionsCount.textContent = discussionsCount1;
      pollsCount.textContent = pollsCount1;

      btnRestrict.textContent = data.restricted ? "Unrestrict" : "Restrict";

      btnRestrict.addEventListener("click", async () => {
        try {
          await update(ref(database, `users/${ID}`), {
            restricted: !data.restricted,
          });

          btnRestrict.textContent = !data.restricted
            ? "Unrestrict"
            : "Restrict";
        } catch (error) {
          console.error("Error updating restricted status:", error);
        }
      });
    });
  }
}

btnBackUserProfile.addEventListener("click", () => {
  userInfoContainer.style.display = "none";
  btnBackUserProfile.style.display = "none";
  usersCardContainer.style.display = "grid";
  btnBackManageUsers.style.display = "block";
  document.getElementById("registered-manage-users").style.display = "flex";
});
// MANAGE USERS END =============================================================================================================================================
