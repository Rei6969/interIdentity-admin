import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
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
const database = getDatabase();
const storage = getStorage(firebaseApp);

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

const controlNav = controlSection.querySelectorAll(".control-nav a");

// =============================================================================================================================================
const postsContainerManage =
  managePostContainer.querySelector(".posts-container");
const manageFilterContainer = managePostContainer.querySelector(
  ".manage-post-filter"
);
const filterTypeManage = managePostContainer.querySelector(
  ".manage-post-filter-type"
);
const filterSearchManage = managePostContainer.querySelector(
  ".manage-post-filter-search"
);
const managePostCard = managePostContainer.querySelector(".post-card");
const manageH1Text = managePostContainer.querySelector(".h1-text");

const managePostCommentsContainer = managePostContainer.querySelector(
  ".post-comments-container"
);

// =============================================================================================================================================

filterTypeManage.addEventListener("change", () => {
  postsContainerManage.innerHTML = "";
  displayManagePosts();
});

filterSearchManage.addEventListener("input", () => {
  postsContainerManage.innerHTML = "";
  displayManagePosts();
});

async function displayManagePosts() {
  const searchValue = filterSearchManage.value.toLowerCase();
  postsContainerManage.innerHTML = "";

  const snapshot = await get(ref(database, `${filterTypeManage.value}`));
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  for (const ID in snapshotData) {
    const userSnapshot = await get(ref(database, `users/${ID}`));
    const userData = userSnapshot.val();

    const userName = `${userData.fName} ${userData.lName}`.toLowerCase();

    if (userName.includes(searchValue)) {
      for (const postID in snapshotData[ID]) {
        const data = snapshotData[ID][postID];

        if (!data.archived && data.approved) {
          const postsContent = document.createElement("div");
          postsContent.classList.add("posts-content");

          const div1 = document.createElement("div");

          const img = document.createElement("img");
          img.src = userData.profileUrl
            ? userData.profileUrl
            : "./../media/images/default-profile.png";
          img.alt = "img";

          const div2 = document.createElement("div");

          const userName = document.createElement("h1");
          userName.textContent = `${userData.fName} ${userData.lName}`;

          const postDate = document.createElement("p");
          if (filterTypeManage.value === "posts") {
            postDate.textContent = `Posted a Blog \u00B7 ${data.postDate}`;
          } else if (filterTypeManage.value === "stories") {
            postDate.textContent = `Shared a Story \u00B7 ${data.date}`;
          } else if (filterTypeManage.value === "polls") {
            postDate.textContent = `Created a Poll \u00B7 ${data.date}`;
          }

          div2.appendChild(userName);
          div2.appendChild(postDate);

          div1.appendChild(img);
          div1.appendChild(div2);

          const btnView = document.createElement("button");
          btnView.classList.add("btn-view-post");
          btnView.textContent = "View Post";

          postsContent.appendChild(div1);
          postsContent.appendChild(btnView);

          postsContainerManage.appendChild(postsContent);

          btnView.addEventListener("click", () => {
            displayPostCard(userData, data, postID, ID);
          });
        }
      }
    }
  }
}

async function displayPostCard(userData, data, postID, userID) {
  postsContainerManage.style.display = "none";
  manageFilterContainer.style.display = "none";
  manageH1Text.style.display = "none";
  managePostCard.style.display = "block";

  managePostCommentsContainer.innerHTML = "";

  managePostCard.querySelector(".card-user-profile").src = userData.profileUrl
    ? userData.profileUrl
    : "./../media/images/default-profile.png";
  managePostCard.querySelector(
    ".card-user-name"
  ).textContent = `${userData.fName} ${userData.lName}`;

  if (filterTypeManage.value === "posts") {
    managePostCard.querySelector(
      ".card-post-date"
    ).textContent = `${data.postDate}`;
    managePostCard.querySelector(
      ".card-post-content"
    ).textContent = `${data.postContent}`;
    managePostCard.querySelector(
      ".card-heart-count"
    ).textContent = `${data.postReacts}`;
    managePostCard.querySelector(".card-comment-count").textContent =
      data.comments ? Object.keys(data.comments).length : 0;

    //   ==========================================================================================================================================
  } else if (filterTypeManage.value === "stories") {
    managePostCard.querySelector(".card-post-date").textContent = data.date;

    managePostCard.querySelector(".story-title").textContent = `${data.title}`;

    managePostCard.querySelector(
      ".card-post-content"
    ).textContent = `${data.content}`;

    managePostCard.querySelector(".card-post-content").style.paddingBottom =
      "20px";

    managePostCard.querySelector(".post-icons").style.display = "none";
    managePostCard.querySelector(".card-bottom").style.display = "none";

    //   ==========================================================================================================================================
  } else if (filterTypeManage.value === "polls") {
    managePostCard.querySelector(".card-post-date").textContent = data.date;

    const pollCardContainer = document.querySelector(".poll-card-container");
    pollCardContainer.innerHTML = "";

    const pollCard = document.createElement("div");

    const pollQuestion = document.createElement("h3");
    pollQuestion.classList.add("poll-question");
    pollQuestion.textContent = data.question;

    pollCard.appendChild(pollQuestion);

    const optionData = data.options;
    const content = [];
    const voteCounts = {};

    for (let key in optionData) {
      if (isNaN(key)) {
        voteCounts[key] = optionData[key];
      } else {
        content.push(optionData[key]);
      }
    }

    content.forEach((option) => {
      const pollOption = document.createElement("div");
      pollOption.classList.add("poll-option");

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = option;
      radio.classList.add("poll-radio");
      radio.name = `poll-${data.pollId}`;
      radio.value = option;

      const label = document.createElement("label");
      label.htmlFor = option;
      label.textContent = option;

      const span = document.createElement("span");
      span.classList.add("poll-votes");
      span.textContent = voteCounts[option];

      pollOption.appendChild(radio);
      pollOption.appendChild(label);
      pollOption.appendChild(span);

      pollCard.appendChild(pollOption);
    });

    pollCardContainer.appendChild(pollCard);

    managePostCard.querySelector(
      ".card-heart-count"
    ).textContent = `${data.pollReacts}`;
    managePostCard.querySelector(".card-comment-count").textContent =
      data.comments ? Object.keys(data.comments).length : 0;
  }

  const postImageContainer = document.getElementById("post-image-container");
  if (data.withImg) {
    const images = [];
    postImageContainer.style.display = "grid";
    postImageContainer.innerHTML = "";

    const postImgRef = storageRef(storage, `posts/${userID}/${postID}`);

    listAll(postImgRef)
      .then((res) => {
        const downloadPromises = res.items.map((itemRef) => {
          return getDownloadURL(itemRef)
            .then((url) => {
              images.push(url);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        });

        return Promise.all(downloadPromises);
      })
      .then(() => {
        if (images.length == 1) {
          postImageContainer.style.gridTemplateColumns = "1fr";
        } else if (images.length == 2) {
          postImageContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
        } else if (images.length >= 3) {
          postImageContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
        }

        images.forEach((image) => {
          const img = document.createElement("img");
          img.src = image;

          postImageContainer.appendChild(img);
        });
      });
  } else {
    postImageContainer.style.display = "none";
    postImageContainer.innerHTML = "";
  }

  if (data.comments) {
    for (const commentID in data.comments) {
      const commentData = data.comments[commentID];

      const commentUserSnapshot = await get(
        ref(database, `users/${commentData.userID}`)
      );
      const commentUserSnapshotData = commentUserSnapshot.val();

      if (commentUserSnapshotData) {
        if (!commentUserSnapshotData.restricted) {
          const commentContent = document.createElement("div");
          commentContent.classList.add("comments-content");

          const mainComment = document.createElement("div");
          mainComment.classList.add("main-comment");

          const commentImg = document.createElement("img");
          commentImg.src = commentUserSnapshotData.profileUrl
            ? commentUserSnapshotData.profileUrl
            : "./../media/images/default-profile.png";

          const div1 = document.createElement("div");

          const commentH3 = document.createElement("h3");
          commentH3.textContent = `${commentUserSnapshotData.fName} ${commentUserSnapshotData.lName}`;

          const commentTexts = document.createElement("p");
          commentTexts.classList.add("comment-texts");
          commentTexts.textContent = commentData.commentContent;

          div1.appendChild(commentH3);
          div1.appendChild(commentTexts);

          mainComment.appendChild(commentImg);
          mainComment.appendChild(div1);

          commentContent.appendChild(mainComment);

          if (commentData.replies) {
            for (const replyID in commentData.replies) {
              const replyData = commentData.replies[replyID];

              const replyUserSnapshot = await get(
                ref(database, `users/${replyData.userID}`)
              );
              const replyUserSnapshotData = replyUserSnapshot.val();

              if (!replyUserSnapshotData.restricted) {
                const replyContent = document.createElement("div");
                replyContent.classList.add("reply-content");

                const replyImg = document.createElement("img");
                replyImg.src = replyUserSnapshotData.profileUrl
                  ? replyUserSnapshotData.profileUrl
                  : "./../media/images/default-profile.png";

                const div2 = document.createElement("div");

                const replyH3 = document.createElement("h3");
                replyH3.textContent = `${replyUserSnapshotData.fName} ${replyUserSnapshotData.lName}`;

                const replyText = document.createElement("p");
                replyText.textContent = replyData.replyContent;

                div2.appendChild(replyH3);
                div2.appendChild(replyText);

                replyContent.appendChild(replyImg);
                replyContent.appendChild(div2);

                commentContent.appendChild(replyContent);
              }
            }
          }

          managePostCommentsContainer.appendChild(commentContent);
        }
      }
    }
  }

  document
    .getElementById("btn-archive-manage-post")
    .addEventListener("click", async () => {
      await update(
        ref(database, `${filterTypeManage.value}/${userID}/${postID}`),
        {
          archived: true,
        }
      );

      postsContainerManage.style.removeProperty("display");
      manageFilterContainer.style.removeProperty("display");
      manageH1Text.style.removeProperty("display");
      managePostCard.style.display = "none";
      displayManagePosts();
    });
}

managePostCard.querySelector(".btn-post-back").addEventListener("click", () => {
  postsContainerManage.style.removeProperty("display");
  manageFilterContainer.style.removeProperty("display");
  manageH1Text.style.removeProperty("display");
  managePostCard.style.display = "none";
});

const btnManagePosts = controlSection.querySelector(".btn-manage-post");
const btnPendingApprovals = controlSection.querySelector(
  ".btn-pending-approvals"
);
const btnArchive = controlSection.querySelector(".btn-archive");
const btnQuestions = controlSection.querySelector(".btn-questions");

btnManagePosts.addEventListener("click", () => {
  sessionStorage.setItem("control-nav", btnManagePosts.className);
  handleControlNav();
});

function handleControlNav() {
  const nav = sessionStorage.getItem("control-nav")
    ? sessionStorage.getItem("control-nav")
    : "btn-manage-post";

  if (nav === "btn-manage-post") {
    pendingApprovalsContainer.style.display = "none";
    archiveContainer.style.display = "none";
    questionsContainer.style.display = "none";
    btnPendingApprovals.style.textDecoration = "none";
    btnArchive.style.textDecoration = "none";
    btnQuestions.style.textDecoration = "none";

    managePostContainer.style.display = "block";
    btnManagePosts.style.textDecoration = "underline";
    postsContainerManage.innerHTML = "";

    displayManagePosts();
  }
}

handleControlNav();
