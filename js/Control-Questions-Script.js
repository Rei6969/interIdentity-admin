import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
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
const database = getDatabase();

// =============================================================================================================================================
const controlSection = document.getElementById("control-section");

// =============================================================================================================================================
const managePostContainer = controlSection.querySelector(
  ".manage-post-container"
);
const pendingApprovalsContainer = controlSection.querySelector(
  ".pending-approvals-container"
);
const archiveContainer = controlSection.querySelector(".archive-container");
const questionsContainer = controlSection.querySelector(".questions-container");

// =============================================================================================================================================
const questions = questionsContainer.querySelector(".questions");

async function displayQuestions() {
  const snapshot = await get(ref(database, "questions"));
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  for (const ID in snapshotData) {
    const data = snapshotData[ID];

    const userSnapshot = await get(ref(database, `users/${data.userID}`));
    const userData = userSnapshot.val();

    if (userData.restricted === true) {
      return;
    }

    const questionsContent = document.createElement("div");
    questionsContent.classList.add("questions-content");

    const firstLayer = document.createElement("div");
    firstLayer.classList.add("first-layer");

    const img = document.createElement("img");
    img.src = userData.profileUrl;

    const nameContainer = document.createElement("div");

    const name = document.createElement("h1");
    name.textContent = `${userData.fName} ${userData.lName}`;

    const p = document.createElement("p");
    p.textContent = "Submitted a question";

    nameContainer.appendChild(name);
    nameContainer.appendChild(p);

    firstLayer.appendChild(img);
    firstLayer.appendChild(nameContainer);

    const secondLayer = document.createElement("div");
    secondLayer.classList.add("second-layer");

    const questionText = document.createElement("p");
    questionText.textContent = data.question;

    secondLayer.appendChild(questionText);

    const zContainer = document.createElement("div");
    zContainer.classList.add("z");

    const btnAnswer = document.createElement("button");
    btnAnswer.textContent = "Answer";

    const btnArchive = document.createElement("button");
    btnArchive.textContent = "Archive";

    zContainer.appendChild(btnAnswer);
    zContainer.appendChild(btnArchive);

    questionsContent.appendChild(firstLayer);
    questionsContent.appendChild(secondLayer);
    questionsContent.appendChild(zContainer);

    questions.appendChild(questionsContent);

    btnAnswer.addEventListener("click", () => {
      const recipientEmail = userData.email;
      const subject = data.question;

      const emailDomain = recipientEmail.split("@")[1];
      let emailUrl = "";

      if (emailDomain === "gmail.com") {
        emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          recipientEmail
        )}&su=${encodeURIComponent(subject)}`;
      } else if (emailDomain === "yahoo.com") {
        emailUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(
          recipientEmail
        )}&subject=${encodeURIComponent(subject)}`;
      } else if (
        emailDomain === "outlook.com" ||
        emailDomain === "hotmail.com"
      ) {
        emailUrl = `https://outlook.live.com/owa/?path=/mail/action/compose&to=${encodeURIComponent(
          recipientEmail
        )}&subject=${encodeURIComponent(subject)}`;
      } else {
        emailUrl = `mailto:${encodeURIComponent(
          recipientEmail
        )}?subject=${encodeURIComponent(subject)}`;
      }

      window.open(emailUrl, "_blank");
    });

    btnArchive.addEventListener("click", () => {
      update(ref(database, `questions/${ID}`), {
        archived: true,
      }).then(() => {
        questions.removeChild(questionsContent);
      });
    });
  }
}
// =============================================================================================================================================

const btnManagePosts = controlSection.querySelector(".btn-manage-post");
const btnPendingApprovals = controlSection.querySelector(
  ".btn-pending-approvals"
);
const btnArchive = controlSection.querySelector(".btn-archive");
const btnQuestions = controlSection.querySelector(".btn-questions");

btnQuestions.addEventListener("click", () => {
  sessionStorage.setItem("control-nav", btnQuestions.className);
  handleControlNav();
});

function handleControlNav() {
  const nav = sessionStorage.getItem("control-nav");

  if (nav === "btn-questions") {
    managePostContainer.style.display = "none";
    archiveContainer.style.display = "none";
    pendingApprovalsContainer.style.display = "none";
    btnManagePosts.style.textDecoration = "none";
    btnArchive.style.textDecoration = "none";
    btnPendingApprovals.style.textDecoration = "none";

    questionsContainer.style.display = "block";
    btnQuestions.style.textDecoration = "underline";
    questions.innerHTML = "";

    displayQuestions();
  }
}

handleControlNav();
