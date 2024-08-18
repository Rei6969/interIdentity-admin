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

const homeSection = document.querySelector(".home-section");
const videosSection = document.querySelector(".videos-section");
const quizSection = document.querySelector(".quiz-section");
const newsSection = document.querySelector(".news-section");
const eventsSection = document.querySelector(".events-section");
const articlesSection = document.querySelector(".articles-section");
const papersSection = document.querySelector(".papers-section");
const aboutSection = document.querySelector(".about-section");

// VIDEO ==========================================================================================================================================
const videoTypeSelect = document.getElementById("video-type-select");
const videoLink = document.getElementById("video-link");
const videoTitle = document.getElementById("video-title");
const videoDescription = document.getElementById("video-description");

const videosContainer = videosSection.querySelector(".videos-container");
const btnAddNavVideo = document.getElementById("btn-add-video");
const newVideoContainer = document.querySelector(".new-video-container");
const btnVideoBack = document.querySelector(".btn-video-back");
const btnAddNewVideo = document.getElementById("btn-add-new-video");
const btnUpdateVideo = document.getElementById("btn-update-video");

const videosNav = videosSection.querySelectorAll(".videos-nav a");

videosNav.forEach((btn) => {
  btn.addEventListener("click", () => {
    sessionStorage.setItem("videosCurrentNav", btn.className);
    displayVideos();
  });
});

btnAddNavVideo.addEventListener("click", () => {
  videoLink.value = "";
  videoTitle.value = "";
  videoDescription.value = "";

  btnAddNewVideo.style.removeProperty("display");
  btnUpdateVideo.style.display = "none";
  document.querySelector(".new-video-header h1").textContent = "ADD NEW VIDEO";

  btnAddNavVideo.style.display = "none";
  videosContainer.style.display = "none";
  newVideoContainer.style.display = "flex";
});

btnVideoBack.addEventListener("click", () => {
  btnAddNavVideo.style.removeProperty("display");
  videosContainer.style.removeProperty("display");
  newVideoContainer.style.removeProperty("display");
});

btnAddNewVideo.addEventListener("click", () => {
  if (!videoLink.value || !videoTitle.value || !videoDescription.value) {
    alert("Please fill the link, title and description.");
    return;
  }

  if (!validateURL(videoLink.value)) {
    alert(
      "Please enter a valid YouTube embed URL in the format https://www.youtube.com/embed/VIDEO_ID"
    );
    return;
  }

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let day = String(currentDate.getDate()).padStart(2, "0");
  let hours = String(currentDate.getHours()).padStart(2, "0");
  let minutes = String(currentDate.getMinutes()).padStart(2, "0");
  let seconds = String(currentDate.getSeconds()).padStart(2, "0");

  let videoDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const videoRef = ref(database, "videos");
  const newVideoRef = push(videoRef);

  const videoData = {
    type: videoTypeSelect.value,
    link: videoLink.value.trim(),
    title: convertToNoCookie(videoTitle.value.trim()),
    description: videoDescription.value.trim(),
    date: videoDate,
  };

  set(newVideoRef, videoData)
    .then(() => {
      alert("Video uploaded successfully.");
      displayVideos();
    })
    .catch((err) => {
      console.error(err);
    });
});

// displayVideos();

async function displayVideos() {
  newVideoContainer.style.display = "none";
  btnAddNavVideo.style.removeProperty("display");
  videosContainer.style.removeProperty("display");

  videosSection.style.display = "block";

  videosContainer.innerHTML = "";
  const videosRef = ref(database, `videos`);

  const snapshot = await get(videosRef);
  const snapshotData = snapshot.val();

  const videosCurrentNav =
    sessionStorage.getItem("videosCurrentNav") || "2D-animated-videos";

  videosNav.forEach((btn) => {
    if (btn.classList.contains(videosCurrentNav)) {
      btn.style.textDecoration = "underline";
    } else {
      btn.style.textDecoration = "none";
    }
  });

  if (!snapshotData) {
    return;
  }

  const videosArray = Object.keys(snapshotData).map((key) => ({
    id: key,
    data: snapshotData[key],
  }));

  videosArray.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  for (const video of videosArray) {
    const data = video.data;
    const ID = video.id;

    if (videosCurrentNav === `${data.type}`) {
      const videoContent = document.createElement("div");
      videoContent.classList.add("video-content");

      const iframe = document.createElement("iframe");
      iframe.src = `${data.link}`;
      iframe.allowFullscreen = true;

      const videoDiv = document.createElement("div");
      videoDiv.classList.add("video-title-description");

      const videoTitle = document.createElement("h1");
      videoTitle.classList.add("video-title");
      videoTitle.textContent = `${data.title}`;

      const videoDescription = document.createElement("p");
      videoDescription.classList.add("video-description");
      videoDescription.textContent = `${data.description}`;

      videoDiv.appendChild(videoTitle);
      videoDiv.appendChild(videoDescription);

      videoContent.appendChild(iframe);
      videoContent.appendChild(videoDiv);

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("add-btn-container");
      btnContainer.style.marginBottom = "20px";

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Edit";

      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Delete";
      btnDelete.style.marginLeft = "20px";

      btnContainer.appendChild(btnEdit);
      btnContainer.appendChild(btnDelete);

      videosContainer.appendChild(videoContent);
      videosContainer.appendChild(btnContainer);

      btnEdit.addEventListener("click", () => {
        handleUpdate(data, ID);
      });

      btnDelete.addEventListener("click", () => {
        remove(ref(database, `videos/${ID}`)).then(() => {
          displayVideos();
        });
      });
    }
  }
}

function handleUpdate(data, videoID) {
  btnAddNavVideo.style.display = "none";
  videosContainer.style.display = "none";
  btnAddNewVideo.style.display = "none";
  newVideoContainer.style.display = "flex";
  btnUpdateVideo.style.display = "block";

  document.querySelector(".new-video-header h1").textContent = "EDIT VIDEO";

  videoLink.value = data.link;
  videoTitle.value = data.title;
  videoDescription.value = data.description;

  btnUpdateVideo.addEventListener("click", () => {
    if (!videoLink.value || !videoTitle.value || !videoDescription.value) {
      alert("Please fill the link, title and description.");
      return;
    }

    if (!validateURL(videoLink.value)) {
      alert(
        "Please enter a valid YouTube embed URL in the format https://www.youtube.com/embed/VIDEO_ID"
      );
      return;
    }

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");

    let videoDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    update(ref(database, `videos/${videoID}`), {
      type: videoTypeSelect.value,
      link: convertToNoCookie(videoLink.value.trim()),
      title: videoTitle.value.trim(),
      description: videoDescription.value.trim(),
      date: videoDate,
    }).then(() => {
      displayVideos();
    });
  });
}

function validateURL(url) {
  const pattern =
    /^https:\/\/(www\.youtube\.com|www\.youtube-nocookie\.com)\/embed\/.*/;
  return pattern.test(url);
}

function convertToNoCookie(url) {
  return url.replace("www.youtube.com", "www.youtube-nocookie.com");
}
// VIDEO END ==========================================================================================================================================

// NEWS ==========================================================================================================================================
const newsImg = document.getElementById("news-img");
const newsTitle = document.getElementById("news-title");
const newsInpContent = document.getElementById("news-inp-content");

const newsContainer = document.querySelector(".news-container");
const btnAddNavNews = document.getElementById("btn-add-news");
const newNewsContainer = document.querySelector(".new-news-container");
const btnNewsBack = document.querySelector(".btn-news-back");
const btnAddNewNews = document.getElementById("btn-add-new-news");
const btnUpdateNews = document.getElementById("btn-update-news");

btnAddNavNews.addEventListener("click", () => {
  newsImg.value = "";
  newsTitle.value = "";
  newsInpContent.value = "";

  btnAddNewNews.style.removeProperty("display");
  btnUpdateNews.style.display = "none";

  document.querySelector(".new-news-header h1").textContent = "ADD NEW NEWS";

  btnAddNavNews.style.display = "none";
  newsContainer.style.display = "none";
  newNewsContainer.style.display = "flex";
});

btnNewsBack.addEventListener("click", () => {
  btnAddNavNews.style.removeProperty("display");
  newsContainer.style.removeProperty("display");
  newNewsContainer.style.removeProperty("display");
});

btnAddNewNews.addEventListener("click", async () => {
  if (!newsTitle.value || !newsInpContent.value) {
    alert("Please fill the title and content.");
    return;
  }

  let withImg = false;
  const newsRef = ref(database, "news");
  const newNewsRef = push(newsRef);
  const newsKey = newNewsRef.key;
  let newsFolderRef;
  let newsImgFile;

  if (newsImg.value != "") {
    withImg = true;
    newsImgFile = newsImg.files[0];

    newsFolderRef = storageRef(storage, `news/${newsKey}/${newsImgFile.name}`);

    await uploadBytes(newsFolderRef, newsImgFile);
  }

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let day = String(currentDate.getDate()).padStart(2, "0");
  let hours = String(currentDate.getHours()).padStart(2, "0");
  let minutes = String(currentDate.getMinutes()).padStart(2, "0");
  let seconds = String(currentDate.getSeconds()).padStart(2, "0");

  let newsDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const newsData = {
    imgUrl: withImg ? await getDownloadURL(newsFolderRef) : false,
    imgName: withImg ? newsImgFile.name : "",
    title: newsTitle.value.trim(),
    content: newsInpContent.value.trim(),
    date: newsDate,
  };

  set(newNewsRef, newsData)
    .then(() => {
      alert("News uploaded successfully.");
      displayNews();
    })
    .catch((err) => {
      console.error(err);
    });
});

// displayNews();

async function displayNews() {
  newNewsContainer.style.display = "none";
  btnAddNavNews.style.removeProperty("display");
  newsContainer.style.removeProperty("display");

  newsSection.style.display = "block";

  newsContainer.innerHTML = "";
  const newsRef = ref(database, `news`);

  const snapshot = await get(newsRef);
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  const newsArray = Object.keys(snapshotData).map((key) => ({
    id: key,
    data: snapshotData[key],
  }));

  newsArray.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  for (const news of newsArray) {
    const data = news.data;
    const ID = news.id;

    const newsContent = document.createElement("div");
    newsContent.classList.add("news-content");

    const img = document.createElement("img");
    if (data.imgUrl != false) {
      img.src = `${data.imgUrl}`;
    }

    const newsDiv = document.createElement("div");
    newsDiv.classList.add("news-title-description");

    const newsTitle = document.createElement("h1");
    newsTitle.classList.add("news-title");
    newsTitle.textContent = `${data.title}`;

    const newsInpContent = document.createElement("p");
    newsInpContent.classList.add("news-description");
    newsInpContent.textContent = `${data.content}`;

    newsDiv.appendChild(newsTitle);
    newsDiv.appendChild(newsInpContent);

    if (data.imgUrl != false) {
      newsContent.appendChild(img);
    } else {
      newsContent.style.gridTemplateColumns = "1fr";
    }
    newsContent.appendChild(newsDiv);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("add-btn-container");
    btnContainer.style.marginBottom = "20px";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.style.marginLeft = "20px";

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnDelete);

    newsContainer.appendChild(newsContent);
    newsContainer.appendChild(btnContainer);

    btnEdit.addEventListener("click", () => {
      handleUpdateNews(data, ID);
    });

    btnDelete.addEventListener("click", async () => {
      if (data.imgUrl != false) {
        const newsImgFolderRef = storageRef(storage, `news/${ID}`);
        const imgList = await listAll(newsImgFolderRef);
        const deletePromises = imgList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);
      }

      remove(ref(database, `news/${ID}`)).then(() => {
        displayNews();
      });
    });
  }
}

function handleUpdateNews(data, newsID) {
  btnAddNavNews.style.display = "none";
  newsContainer.style.display = "none";
  btnAddNewNews.style.display = "none";
  newNewsContainer.style.display = "flex";
  btnUpdateNews.style.display = "block";

  document.querySelector(".new-news-header h1").textContent = "EDIT NEWS";

  newsTitle.value = data.title;
  newsInpContent.value = data.content;

  btnUpdateNews.addEventListener("click", () => {
    if (!newsTitle.value || !newsInpContent.value) {
      alert("Please fill the title and content.");
      return;
    }

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");

    let newsDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    update(ref(database, `news/${newsID}`), {
      link: newsImg.value,
      title: newsTitle.value,
      description: newsInpContent.value,
      date: newsDate,
    }).then(() => {
      displayNews();
    });
  });
}
// NEWS END ==========================================================================================================================================

// EVENTS ==========================================================================================================================================
const eventsImg = document.getElementById("events-img");
const eventsTitle = document.getElementById("events-title");
const eventsInpContent = document.getElementById("events-inp-content");

const eventsContainer = document.querySelector(".events-container");
const btnAddNavEvents = document.getElementById("btn-add-events");
const newEventsContainer = document.querySelector(".new-events-container");
const btnEventsBack = document.querySelector(".btn-events-back");
const btnAddNewEvents = document.getElementById("btn-add-new-events");
const btnUpdateEvents = document.getElementById("btn-update-events");

btnAddNavEvents.addEventListener("click", () => {
  eventsImg.value = "";
  eventsTitle.value = "";
  eventsInpContent.value = "";

  btnAddNewEvents.style.removeProperty("display");
  btnUpdateEvents.style.display = "none";

  document.querySelector(".new-events-header h1").textContent = "ADD NEW EVENT";

  btnAddNavEvents.style.display = "none";
  eventsContainer.style.display = "none";
  newEventsContainer.style.display = "flex";
});

btnEventsBack.addEventListener("click", () => {
  btnAddNavEvents.style.removeProperty("display");
  eventsContainer.style.removeProperty("display");
  newEventsContainer.style.removeProperty("display");
});

btnAddNewEvents.addEventListener("click", async () => {
  if (!eventsTitle.value || !eventsInpContent.value) {
    alert("Please fill the title and content.");
    return;
  }

  let withImg = false;
  const eventsRef = ref(database, "events");
  const newEventsRef = push(eventsRef);
  const eventsKey = newEventsRef.key;
  let eventsFolderRef;
  let eventsImgFile;

  if (eventsImg.value != "") {
    withImg = true;
    eventsImgFile = eventsImg.files[0];

    eventsFolderRef = storageRef(
      storage,
      `events/${eventsKey}/${eventsImgFile.name}`
    );

    await uploadBytes(eventsFolderRef, eventsImgFile);
  }

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let day = String(currentDate.getDate()).padStart(2, "0");
  let hours = String(currentDate.getHours()).padStart(2, "0");
  let minutes = String(currentDate.getMinutes()).padStart(2, "0");
  let seconds = String(currentDate.getSeconds()).padStart(2, "0");

  let eventsDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const eventsData = {
    imgUrl: withImg ? await getDownloadURL(eventsFolderRef) : false,
    imgName: withImg ? eventsImgFile.name : "",
    title: eventsTitle.value.trim(),
    content: eventsInpContent.value.trim(),
    date: eventsDate,
  };

  set(newEventsRef, eventsData)
    .then(() => {
      alert("Events uploaded successfully.");
      displayEvents();
    })
    .catch((err) => {
      console.error(err);
    });
});

// displayEvents();

async function displayEvents() {
  newEventsContainer.style.display = "none";
  btnAddNavEvents.style.removeProperty("display");
  eventsContainer.style.removeProperty("display");

  eventsSection.style.display = "block";

  eventsContainer.innerHTML = "";
  const eventsRef = ref(database, `events`);

  const snapshot = await get(eventsRef);
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  const eventsArray = Object.keys(snapshotData).map((key) => ({
    id: key,
    data: snapshotData[key],
  }));

  eventsArray.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  for (const events of eventsArray) {
    const data = events.data;
    const ID = events.id;

    const eventsContent = document.createElement("div");
    eventsContent.classList.add("events-content");

    const img = document.createElement("img");
    if (data.imgUrl != false) {
      img.src = `${data.imgUrl}`;
    }

    const eventsDiv = document.createElement("div");
    eventsDiv.classList.add("events-title-description");

    const eventsTitle = document.createElement("h1");
    eventsTitle.classList.add("events-title");
    eventsTitle.textContent = `${data.title}`;

    const eventsInpContent = document.createElement("p");
    eventsInpContent.classList.add("events-description");
    eventsInpContent.textContent = `${data.content}`;

    eventsDiv.appendChild(eventsTitle);
    eventsDiv.appendChild(eventsInpContent);

    if (data.imgUrl != false) {
      eventsContent.appendChild(img);
    } else {
      eventsContent.style.gridTemplateColumns = "1fr";
    }
    eventsContent.appendChild(eventsDiv);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("add-btn-container");
    btnContainer.style.marginBottom = "20px";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.style.marginLeft = "20px";

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnDelete);

    eventsContainer.appendChild(eventsContent);
    eventsContainer.appendChild(btnContainer);

    btnEdit.addEventListener("click", () => {
      handleUpdateEvents(data, ID);
    });

    btnDelete.addEventListener("click", async () => {
      if (data.imgUrl != false) {
        const eventsImgFolderRef = storageRef(storage, `events/${ID}`);
        const imgList = await listAll(eventsImgFolderRef);
        const deletePromises = imgList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);
      }

      remove(ref(database, `events/${ID}`)).then(() => {
        displayEvents();
      });
    });
  }
}

function handleUpdateEvents(data, eventsID) {
  btnAddNavEvents.style.display = "none";
  eventsContainer.style.display = "none";
  btnAddNewEvents.style.display = "none";
  newEventsContainer.style.display = "flex";
  btnUpdateEvents.style.display = "block";

  document.querySelector(".new-events-header h1").textContent = "EDIT EVENT";

  eventsTitle.value = data.title;
  eventsInpContent.value = data.content;

  btnUpdateEvents.addEventListener("click", () => {
    if (!eventsTitle.value || !eventsInpContent.value) {
      alert("Please fill the title and content.");
      return;
    }

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");

    let eventsDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    update(ref(database, `events/${eventsID}`), {
      link: eventsImg.value,
      title: eventsTitle.value,
      description: eventsInpContent.value,
      date: eventsDate,
    }).then(() => {
      displayEvents();
    });
  });
}
// EVENTS END ==========================================================================================================================================

// ARTICLES ==========================================================================================================================================
const articlesImg = document.getElementById("articles-img");
const articlesTitle = document.getElementById("articles-title");
const articlesInpContent = document.getElementById("articles-inp-content");

const articlesContainer = document.querySelector(".articles-container");
const btnAddNavArticles = document.getElementById("btn-add-articles");
const newArticlesContainer = document.querySelector(".new-articles-container");
const btnArticlesBack = document.querySelector(".btn-articles-back");
const btnAddNewArticle = document.getElementById("btn-add-new-articles");
const btnUpdateArticle = document.getElementById("btn-update-articles");

btnAddNavArticles.addEventListener("click", () => {
  articlesImg.value = "";
  articlesTitle.value = "";
  articlesInpContent.value = "";

  btnAddNewArticle.style.removeProperty("display");
  btnUpdateArticle.style.display = "none";

  document.querySelector(".new-articles-header h1").textContent =
    "ADD NEW ARTICLE";

  btnAddNavArticles.style.display = "none";
  articlesContainer.style.display = "none";
  newArticlesContainer.style.display = "flex";
});

btnArticlesBack.addEventListener("click", () => {
  btnAddNavArticles.style.removeProperty("display");
  articlesContainer.style.removeProperty("display");
  newArticlesContainer.style.removeProperty("display");
});

btnAddNewArticle.addEventListener("click", async () => {
  if (!articlesTitle.value || !articlesInpContent.value) {
    alert("Please fill the title and content.");
    return;
  }

  let withImg = false;
  const articlesRef = ref(database, "articles");
  const newArticlesRef = push(articlesRef);
  const articlesKey = newArticlesRef.key;
  let articlesFolderRef;
  let articlesImgFile;

  if (articlesImg.value != "") {
    withImg = true;
    articlesImgFile = articlesImg.files[0];

    articlesFolderRef = storageRef(
      storage,
      `articles/${articlesKey}/${articlesImgFile.name}`
    );

    await uploadBytes(articlesFolderRef, articlesImgFile);
  }

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let day = String(currentDate.getDate()).padStart(2, "0");
  let hours = String(currentDate.getHours()).padStart(2, "0");
  let minutes = String(currentDate.getMinutes()).padStart(2, "0");
  let seconds = String(currentDate.getSeconds()).padStart(2, "0");

  let articlesDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const articlesData = {
    imgUrl: withImg ? await getDownloadURL(articlesFolderRef) : false,
    imgName: withImg ? articlesImgFile.name : "",
    title: articlesTitle.value.trim(),
    content: articlesInpContent.value.trim(),
    date: articlesDate,
  };

  set(newArticlesRef, articlesData)
    .then(() => {
      alert("Articles uploaded successfully.");
      displayArticles();
    })
    .catch((err) => {
      console.error(err);
    });
});

// displayArticles();

async function displayArticles() {
  newArticlesContainer.style.display = "none";
  btnAddNavArticles.style.removeProperty("display");
  articlesContainer.style.removeProperty("display");

  articlesSection.style.display = "block";

  articlesContainer.innerHTML = "";
  const articlesRef = ref(database, `articles`);

  const snapshot = await get(articlesRef);
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  const articlesArray = Object.keys(snapshotData).map((key) => ({
    id: key,
    data: snapshotData[key],
  }));

  articlesArray.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  for (const articles of articlesArray) {
    const data = articles.data;
    const ID = articles.id;

    const articlesContent = document.createElement("div");
    articlesContent.classList.add("articles-content");

    const img = document.createElement("img");
    if (data.imgUrl != false) {
      img.src = `${data.imgUrl}`;
    }

    const articlesDiv = document.createElement("div");
    articlesDiv.classList.add("articles-title-description");

    const articlesTitle = document.createElement("h1");
    articlesTitle.classList.add("articles-title");
    articlesTitle.textContent = `${data.title}`;

    const articlesInpContent = document.createElement("p");
    articlesInpContent.classList.add("articles-description");
    articlesInpContent.textContent = `${data.content}`;

    articlesDiv.appendChild(articlesTitle);
    articlesDiv.appendChild(articlesInpContent);

    if (data.imgUrl != false) {
      articlesContent.appendChild(img);
    } else {
      articlesContent.style.gridTemplateColumns = "1fr";
    }
    articlesContent.appendChild(articlesDiv);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("add-btn-container");
    btnContainer.style.marginBottom = "20px";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.style.marginLeft = "20px";

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnDelete);

    articlesContainer.appendChild(articlesContent);
    articlesContainer.appendChild(btnContainer);

    btnEdit.addEventListener("click", () => {
      handleUpdateArticles(data, ID);
    });

    btnDelete.addEventListener("click", async () => {
      if (data.imgUrl != false) {
        const articlesImgFolderRef = storageRef(storage, `articles/${ID}`);
        const imgList = await listAll(articlesImgFolderRef);
        const deletePromises = imgList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);
      }

      remove(ref(database, `articles/${ID}`)).then(() => {
        displayArticles();
      });
    });
  }
}

function handleUpdateArticles(data, articlesID) {
  btnAddNavArticles.style.display = "none";
  articlesContainer.style.display = "none";
  btnAddNewArticle.style.display = "none";
  newArticlesContainer.style.display = "flex";
  btnUpdateArticle.style.display = "block";

  document.querySelector(".new-articles-header h1").textContent =
    "EDIT ARTICLE";

  articlesTitle.value = data.title;
  articlesInpContent.value = data.content;

  btnUpdateArticle.addEventListener("click", () => {
    if (!articlesTitle.value || !articlesInpContent.value) {
      alert("Please fill the title and content.");
      return;
    }

    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, "0");
    let day = String(currentDate.getDate()).padStart(2, "0");
    let hours = String(currentDate.getHours()).padStart(2, "0");
    let minutes = String(currentDate.getMinutes()).padStart(2, "0");
    let seconds = String(currentDate.getSeconds()).padStart(2, "0");

    let articlesDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    update(ref(database, `articles/${articlesID}`), {
      link: articlesImg.value,
      title: articlesTitle.value,
      description: articlesInpContent.value,
      date: articlesDate,
    }).then(() => {
      displayArticles();
    });
  });
}
// ARTICLES END ==========================================================================================================================================

// RESEARCH PAPERS ==========================================================================================================================================
const papersTitle = document.getElementById("papers-title");
const papersAuthor = document.getElementById("papers-author");
const papersInpContent = document.getElementById("papers-inp-content");
const papersFile = document.getElementById("papers-file");

const papersContainer = document.querySelector(".papers-container");
const btnAddNavPapers = document.getElementById("btn-add-papers");
const newPapersContainer = document.querySelector(".new-papers-container");
const btnPapersBack = document.querySelector(".btn-papers-back");
const btnAddNewPapers = document.getElementById("btn-add-new-papers");
const btnUpdatePapers = document.getElementById("btn-update-papers");

btnAddNavPapers.addEventListener("click", () => {
  papersFile.value = "";
  papersTitle.value = "";
  papersAuthor.value = "";
  papersInpContent.value = "";

  btnAddNewPapers.style.removeProperty("display");
  btnUpdatePapers.style.display = "none";

  document.querySelector(".new-papers-header h1").textContent =
    "ADD NEW RESEARCH PAPER";

  btnAddNavPapers.style.display = "none";
  papersContainer.style.display = "none";
  newPapersContainer.style.display = "flex";
});

btnPapersBack.addEventListener("click", () => {
  btnAddNavPapers.style.removeProperty("display");
  papersContainer.style.removeProperty("display");
  newPapersContainer.style.removeProperty("display");
});

btnAddNewPapers.addEventListener("click", async () => {
  if (
    !papersTitle.value ||
    !papersAuthor.value ||
    !papersInpContent.value ||
    !papersFile.files[0]
  ) {
    alert("Please fill all the fields and select a PDF file.");
    return;
  }

  const papersRef = ref(database, "researchPapers");
  const newPapersRef = push(papersRef);
  const papersKey = newPapersRef.key;
  const papersFileItem = papersFile.files[0];

  const papersFileRef = storageRef(
    storage,
    `researchPapers/${papersKey}/${papersFileItem.name}`
  );

  await uploadBytes(papersFileRef, papersFileItem);

  const downloadURL = await getDownloadURL(papersFileRef);

  const papersData = {
    fileName: papersFileItem.name,
    fileURL: downloadURL,
    title: papersTitle.value.trim(),
    author: papersAuthor.value.trim(),
    content: papersInpContent.value.trim(),
    date: new Date().toISOString(),
  };

  set(newPapersRef, papersData)
    .then(() => {
      alert("Research paper uploaded successfully.");
      displayPapers();
    })
    .catch((err) => {
      console.error(err);
    });
});

async function displayPapers() {
  newPapersContainer.style.display = "none";
  btnAddNavPapers.style.removeProperty("display");
  papersContainer.style.removeProperty("display");

  papersSection.style.display = "block";

  papersContainer.innerHTML = "";
  const papersRef = ref(database, "researchPapers");

  const snapshot = await get(papersRef);
  const snapshotData = snapshot.val();

  if (!snapshotData) {
    return;
  }

  const papersArray = Object.keys(snapshotData).map((key) => ({
    id: key,
    data: snapshotData[key],
  }));

  papersArray.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  for (const papers of papersArray) {
    const data = papers.data;
    const ID = papers.id;

    const papersContent = document.createElement("div");
    papersContent.classList.add("papers-content");

    const papersDiv = document.createElement("div");
    papersDiv.classList.add("papers-title-description");

    const papersTitle = document.createElement("h1");
    papersTitle.classList.add("papers-title");
    papersTitle.textContent = `${data.title}`;

    const papersAuthor = document.createElement("h3");
    papersAuthor.classList.add("papers-author");
    papersAuthor.style.marginLeft = "10px";
    papersAuthor.textContent = `${data.author}`;

    const papersInpContent = document.createElement("p");
    papersInpContent.classList.add("papers-description");
    papersInpContent.textContent = `${data.content}`;

    const papersFileName = document.createElement("p");
    papersFileName.classList.add("papers-filename");
    papersFileName.textContent = `PDF: ${data.fileName}`;
    papersFileName.style.marginTop = "10px";

    papersDiv.appendChild(papersTitle);
    papersDiv.appendChild(papersAuthor);
    papersDiv.appendChild(papersInpContent);
    papersDiv.appendChild(papersFileName);

    papersContent.appendChild(papersDiv);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("add-btn-container");
    btnContainer.style.marginBottom = "20px";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Delete";
    btnDelete.style.marginLeft = "20px";

    btnContainer.appendChild(btnEdit);
    btnContainer.appendChild(btnDelete);

    papersContainer.appendChild(papersContent);
    papersContainer.appendChild(btnContainer);

    btnEdit.addEventListener("click", () => {
      handleUpdatePapers(data, ID);
    });

    btnDelete.addEventListener("click", async () => {
      const papersFileFolderRef = storageRef(storage, `researchPapers/${ID}`);
      const fileList = await listAll(papersFileFolderRef);
      const deletePromises = fileList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      remove(ref(database, `researchPapers/${ID}`)).then(() => {
        displayPapers();
      });
    });
  }
}

function handleUpdatePapers(data, papersID) {
  btnAddNavPapers.style.display = "none";
  papersContainer.style.display = "none";
  btnAddNewPapers.style.display = "none";
  newPapersContainer.style.display = "flex";
  btnUpdatePapers.style.display = "block";

  document.querySelector(".new-papers-header h1").textContent =
    "EDIT RESEARCH PAPER";

  papersTitle.value = data.title;
  papersAuthor.value = data.author;
  papersInpContent.value = data.content;

  btnUpdatePapers.addEventListener("click", async () => {
    if (!papersTitle.value || !papersAuthor.value || !papersInpContent.value) {
      alert("Please fill all the fields.");
      return;
    }

    let papersFileItem = papersFile.files[0];
    let papersFileRef;
    let downloadURL = data.fileURL;

    if (papersFileItem) {
      const previousFileRef = storageRef(
        storage,
        `researchPapers/${papersID}/${data.fileName}`
      );
      await deleteObject(previousFileRef);

      papersFileRef = storageRef(
        storage,
        `researchPapers/${papersID}/${papersFileItem.name}`
      );
      await uploadBytes(papersFileRef, papersFileItem);
      downloadURL = await getDownloadURL(papersFileRef);
    }

    const papersDate = new Date().toISOString();

    update(ref(database, `researchPapers/${papersID}`), {
      fileName: papersFileItem ? papersFileItem.name : data.fileName,
      fileURL: downloadURL,
      title: papersTitle.value.trim(),
      author: papersAuthor.value.trim(),
      content: papersInpContent.value.trim(),
      date: papersDate,
    }).then(() => {
      displayPapers();
    });
  });
}

// Initialize the display
// displayPapers();
// RESEARCH PAPERS END ==========================================================================================================================================

// NAV ==========================================================================================================================================
const btnNav = document.querySelectorAll(
  ".content-nav-dropdown .dropdown-content a"
);

btnNav.forEach((btn) => {
  btn.addEventListener("click", () => {
    sessionStorage.setItem("content-nav", btn.id);
    designNav();
  });
});

designNav();

function designNav() {
  const nav = sessionStorage.getItem("content-nav");

  if (!nav) {
    sessionStorage.setItem("content-nav", "btn-home");
  }

  homeSection.style.display = "none";
  videosSection.style.display = "none";
  quizSection.style.display = "none";
  newsSection.style.display = "none";
  eventsSection.style.display = "none";
  articlesSection.style.display = "none";
  papersSection.style.display = "none";
  aboutSection.style.display = "none";

  btnNav.forEach((btn) => {
    if (btn.classList.contains(nav)) {
      btn.style.textDecoration = "underline";

      if (nav === "btn-videos") {
        displayVideos();
      } else if (nav === "btn-news") {
        displayNews();
      } else if (nav === "btn-events") {
        displayEvents();
      } else if (nav === "btn-articles") {
        displayArticles();
      } else if (nav === "btn-research-papers") {
        displayPapers();
      } else if (nav === "btn-home") {
        homeSection.style.display = "block";
      } else if (nav === "btn-about-us") {
        aboutSection.style.display = "block";
      } else if (nav === "btn-quiz") {
        quizSection.style.display = "block";
      }
    } else {
      btn.style.textDecoration = "none";
    }
  });
}
// NAV END ==========================================================================================================================================
