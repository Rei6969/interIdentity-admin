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
  remove,
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

const controlNav = controlSection.querySelectorAll(".control-nav a");

// =============================================================================================================================================
const filterType = archiveContainer.querySelector(".archive-filter-type");
const filterSearch = archiveContainer.querySelector(".archive-filter-search");
const postContainer = archiveContainer.querySelector(".post-container");

filterType.addEventListener("change", () => {
  displayPosts();
});

filterSearch.addEventListener("input", displayPosts);

async function displayPosts() {
  const searchValue = filterSearch.value.toLowerCase();

  postContainer.innerHTML = "";

  const snapshot = await get(ref(database, `${filterType.value}`));
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

        if (data.archived) {
          const postContent = document.createElement("div");
          postContent.classList.add("post-content");

          const topContainer = document.createElement("div");
          topContainer.classList.add("post-content-top");

          const postHeader = document.createElement("div");
          postHeader.classList.add("post-header");

          const profileImg = document.createElement("img");
          profileImg.classList.add("post-user-profile");
          profileImg.src = userData.profileUrl
            ? userData.profileUrl
            : "./../media/images/default-profile.png";

          const headerDiv = document.createElement("div");

          const userName = document.createElement("h1");
          userName.classList.add("post-user-name");
          userName.textContent = `${userData.fName} ${userData.lName}`;

          const postDate = document.createElement("p");
          postDate.classList.add("post-post-date");
          postDate.textContent = data.postDate ? data.postDate : data.date;

          headerDiv.appendChild(userName);
          headerDiv.appendChild(postDate);

          postHeader.appendChild(profileImg);
          postHeader.appendChild(headerDiv);

          topContainer.appendChild(postHeader);

          if (filterType.value === "posts") {
            const postText = document.createElement("p");
            postText.classList.add("post-text");
            postText.classList.add("post-post-content");
            postText.textContent = data.postContent
              ? data.postContent
              : data.discussionContent;

            topContainer.appendChild(postText);
          } else if (filterType.value === "stories") {
            const title = document.createElement("h1");
            title.textContent = data.title;

            const content = document.createElement("p");
            content.textContent = data.content;
            content.classList.add("story-content");
            content.style.paddingBottom = "20px";

            topContainer.appendChild(title);
            topContainer.appendChild(content);
          } else if (filterType.value === "polls") {
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

            topContainer.appendChild(pollCard);
          }

          const imgContainer = document.createElement("div");
          imgContainer.id = "pending-post-image-container";

          if (data.withImg) {
            const images = [];
            imgContainer.style.display = "grid";
            imgContainer.innerHTML = "";

            const postImgRef = storageRef(storage, `posts/${ID}/${postID}`);

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
                  imgContainer.style.gridTemplateColumns = "1fr";
                } else if (images.length == 2) {
                  imgContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
                } else if (images.length >= 3) {
                  imgContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
                }

                images.forEach((image) => {
                  const postImg = document.createElement("img");
                  postImg.src = image;

                  imgContainer.appendChild(postImg);
                });
              });

            topContainer.appendChild(imgContainer);
          }

          const postIcons = document.createElement("div");
          postIcons.classList.add("post-icons");

          const postIconsDiv1 = document.createElement("div");

          const heartIcon = document.createElement("img");
          heartIcon.src = "./../media/icons/icons8-heart-50.png";

          const heartCount = document.createElement("p");
          heartCount.classList.add("post-heart-count");

          if (filterType.value === "posts") {
            heartCount.textContent = data.postReacts ? data.postReacts : 0;
          } else if (filterType.value === "polls") {
            heartCount.textContent = data.pollReacts ? data.pollReacts : 0;
          }

          if (filterType.value !== "stories") {
            postIconsDiv1.appendChild(heartIcon);
            postIconsDiv1.appendChild(heartCount);
          }

          const postIconsDiv2 = document.createElement("div");

          const commentIcon = document.createElement("img");
          commentIcon.src = "./../media/icons/icons8-comment-96.png";

          const commentCount = document.createElement("p");
          commentCount.classList.add("post-comment-count");

          if (filterType.value !== "stories") {
            commentCount.textContent = data.comments
              ? Object.keys(data.comments).length
              : 0;

            postIconsDiv2.appendChild(commentIcon);
            postIconsDiv2.appendChild(commentCount);
          }

          postIcons.appendChild(postIconsDiv1);
          postIcons.appendChild(postIconsDiv2);

          topContainer.appendChild(postIcons);

          const bottomContainer = document.createElement("div");
          bottomContainer.classList.add("post-content-bottom");

          const btnUnarchive = document.createElement("button");
          btnUnarchive.classList.add("btn-post-approve");
          btnUnarchive.textContent = "Unarchive";

          const btnDelete = document.createElement("button");
          btnDelete.classList.add("btn-post-decline");
          btnDelete.textContent = "Delete";

          bottomContainer.appendChild(btnUnarchive);
          bottomContainer.appendChild(btnDelete);

          postContent.appendChild(topContainer);

          postContent.appendChild(bottomContainer);

          postContainer.appendChild(postContent);

          btnUnarchive.addEventListener("click", async () => {
            await update(ref(database, `${filterType.value}/${ID}/${postID}`), {
              archived: false,
            });

            displayPosts();
          });

          btnDelete.addEventListener("click", async () => {
            if (data.withImg) {
              const imgFolderRef = storageRef(
                storage,
                `${filterType.value}/${ID}/${postID}`
              );
              const imgList = await listAll(imgFolderRef);
              const deletePromises = imgList.items.map((item) =>
                deleteObject(item)
              );
              await Promise.all(deletePromises);
            }

            await remove(ref(database, `${filterType.value}/${ID}/${postID}`));

            displayPosts();
          });
        }
      }
    }
  }
}
// =============================================================================================================================================

const btnManagePosts = controlSection.querySelector(".btn-manage-post");
const btnPendingApprovals = controlSection.querySelector(
  ".btn-pending-approvals"
);
const btnArchive = controlSection.querySelector(".btn-archive");

btnArchive.addEventListener("click", () => {
  sessionStorage.setItem("control-nav", btnArchive.className);
  handleControlNav();
});

function handleControlNav() {
  const nav = sessionStorage.getItem("control-nav");

  if (nav === "btn-archive") {
    pendingApprovalsContainer.style.display = "none";
    managePostContainer.style.display = "none";
    btnPendingApprovals.style.textDecoration = "none";

    btnManagePosts.style.textDecoration = "none";
    archiveContainer.style.display = "block";
    btnArchive.style.textDecoration = "underline";
    postContainer.innerHTML = "";

    displayPosts();
  }
}

handleControlNav();
