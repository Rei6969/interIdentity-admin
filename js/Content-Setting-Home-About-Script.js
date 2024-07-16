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

// HOME END ==========================================================================================================================================
// HEADER IMAGES ==========================================================================================================================================
const btnHeaderAdd = homeSection.querySelector(
  ".header-btn-container .btn-header-add"
);
const btnHeaderRemove = homeSection.querySelector(
  ".header-btn-container .btn-header-remove"
);

const headerImgContainer = homeSection.querySelector(".header-img-container");
const indicatorContainer = homeSection.querySelector(".indicator-container");

const prevButton = homeSection.querySelector(".prev-btn");
const nextButton = homeSection.querySelector(".next-btn");
const headerSection = homeSection.querySelector(".main-header");

displayHeader();

let urls = [];

btnHeaderRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove header images?");
    if (!confirmDelete) {
      return;
    }

    const headerFolderRef = storageRef(storage, `content/home/header`);
    const imgList = await listAll(headerFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/home/header")).then(() => {
      displayHeader();
    });
  }
});

btnHeaderAdd.addEventListener("click", () => {
  if (urls.length >= 8) {
    alert("8 images is the limit for header");
    return;
  }

  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.multiple = true;

  file.addEventListener("change", async () => {
    try {
      if (!Array.isArray(urls)) {
        urls = [];
      }

      const files = Array.from(file.files);

      if (urls.length === 0 && files.length < 3) {
        alert("Please upload at least 3 images.");
        return;
      }

      if (urls.length + files.length > 8) {
        alert(`You can only add ${8 - urls.length} more images.`);
        return;
      }

      for (const img of files) {
        const headerFolderRef = storageRef(
          storage,
          `content/home/header/${img.name}`
        );
        await uploadBytes(headerFolderRef, img);
        const downloadURL = await getDownloadURL(headerFolderRef);

        urls.push(downloadURL);
      }

      await set(ref(database, "content/home/header"), urls);
      displayHeader();
    } catch (error) {
      console.error("Error adding image URL:", error);
    }
  });

  file.click();
});

async function displayHeader() {
  headerImgContainer.innerHTML = "";
  indicatorContainer.innerHTML = "";

  const dbRef = ref(database, "content/home/header");
  const snapshot = await get(dbRef);
  urls = snapshot.val() || [];

  if (urls) {
    urls.forEach((imageUrl, index) => {
      const img = document.createElement("img");
      img.alt = "";
      img.src = imageUrl;

      headerImgContainer.appendChild(img);

      const indicator = document.createElement("span");
      indicator.classList.add("dot");
      if (index == 0) {
        indicator.classList.add("active");
      }

      indicatorContainer.appendChild(indicator);
    });
  }

  const images = homeSection.querySelectorAll(".header-img-container img");
  const dots = indicatorContainer.querySelectorAll(".dot");

  let currentImageIndex = 0;
  let scrollAmount = 0;

  headerSection.scrollTo({
    top: 0,
    left: scrollAmount,
    behavior: "instant",
  });

  headerSection.addEventListener("scroll", function (e) {
    e.preventDefault();
  });

  function updateIndicator() {
    dots.forEach((dot, index) => {
      if (index === currentImageIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  prevButton.addEventListener("click", () => {
    if (currentImageIndex > 0) {
      currentImageIndex--;
      scrollAmount -= headerSection.offsetWidth;
    } else {
      currentImageIndex = images.length - 1;
      scrollAmount = headerSection.offsetWidth * (images.length - 1);
    }
    headerSection.scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: "smooth",
    });
    updateIndicator();
  });

  nextButton.addEventListener("click", () => {
    if (currentImageIndex < images.length - 1) {
      currentImageIndex++;
      scrollAmount += headerSection.offsetWidth;
    } else {
      currentImageIndex = 0;
      scrollAmount = 0;
    }
    headerSection.scrollTo({
      top: 0,
      left: scrollAmount,
      behavior: "smooth",
    });
    updateIndicator();
  });
}
// HEADER IMAGES END ==========================================================================================================================================

const updateContainer = homeSection.querySelector(".home-update-container");
const updateOverlay = document.querySelector(".update-overlay");

const updateH1 = updateContainer.querySelector("h1");
const updateInputField = updateContainer.querySelector(
  ".update-input-container"
);
const btnUpdateCancel = updateContainer.querySelector(".btn-update-cancel");
const btnUpdate = updateContainer.querySelector(".btn-update");

btnUpdateCancel.addEventListener("click", updateCancel);

function updateCancel() {
  updateContainer.style.display = "none";
  updateOverlay.style.display = "none";
}

// INTERSEX PH ==========================================================================================================================================
const intersexContainer = homeSection.querySelector(".intersex-ph-container");
const btnIntersexUpdate = intersexContainer.querySelector(
  ".btn-intersex-update"
);
const btnIntersexRemove = intersexContainer.querySelector(
  ".btn-intersex-remove"
);

const intersexContent = intersexContainer.querySelector("p");

btnIntersexRemove.addEventListener("click", async () => {
  const confirmDelete = confirm("Remove intersex content?");
  if (!confirmDelete) {
    return;
  }

  remove(ref(database, "content/home/intersex")).then(() => {
    displayIntersex();
  });
});

displayIntersex();

async function displayIntersex() {
  const snapshot = await get(ref(database, "content/home/intersex"));
  const data = snapshot.val();

  if (snapshot.exists()) {
    intersexContent.textContent = data.content ? data.content : "";
  } else {
    intersexContent.textContent = "";
  }
}

btnIntersexUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-intersex");
  updateH1.textContent = "INTERSEX PHILIPPINES";

  const intersexRef = ref(database, "content/home/intersex");

  const snapshot = await get(intersexRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const content = document.createElement("textarea");
  content.placeholder = "About Intersex Philippines Content";

  if (snapshot.exists()) {
    content.value = data.content ? data.content : "";
  }

  updateInputField.appendChild(content);

  updateContainer
    .querySelector(".btn-update-intersex")
    .addEventListener("click", async () => {
      if (!content.value) {
        alert("Please insert a value.");
        return;
      }

      await set(ref(database, "content/home/intersex"), {
        content: content.value.trim(),
      }).then(() => {
        console.log(111);
        displayIntersex();
        btnUpdate.classList.remove("btn-update-intersex");
        updateCancel();
      });
    });
});

// INTERSEX PH END ==========================================================================================================================================

// VARIATION ==========================================================================================================================================
const variationContainer = homeSection.querySelector(".variations-section");

const btnVariationUpdate = variationContainer.querySelector(
  ".btn-variation-update"
);
const btnVariationRemove = variationContainer.querySelector(
  ".btn-variation-remove"
);

const variationImg = variationContainer.querySelector("img");
const variationContent = variationContainer.querySelector("p");

displayVariation();

async function displayVariation() {
  const variationRef = ref(database, "content/home/variation");

  const snapshot = await get(variationRef);

  if (!snapshot.exists()) {
    return;
  }

  const data = snapshot.val();

  variationImg.src = data.imgUrl;
  variationContent.textContent = data.content;
}

btnVariationRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }

    const variationFolderRef = storageRef(storage, `content/home/variation`);
    const imgList = await listAll(variationFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/home/variation")).then(() => {
      displayVariation();
    });
  }
});

btnVariationUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-variation");
  updateH1.textContent = "INTERSEX VARIATIONS";

  const variationRef = ref(database, "content/home/variation");

  const snapshot = await get(variationRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const img = document.createElement("input");
  img.type = "file";
  img.accept = "image/*";
  img.maxLength = "1";

  const content = document.createElement("textarea");
  content.placeholder = "Intersex Variation Content";

  if (snapshot.exists()) {
    content.value = data.content ? data.content : "";
  }

  updateInputField.appendChild(img);
  updateInputField.appendChild(content);

  updateContainer
    .querySelector(".btn-update-variation")
    .addEventListener("click", async () => {
      if (!content.value || !img.value) {
        alert("Please insert a value.");
        return;
      }

      const deleteVariationFolderRef = storageRef(
        storage,
        `content/home/variation`
      );
      const imgList = await listAll(deleteVariationFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      const imgFile = img.files[0];

      const variationFolderRef = storageRef(
        storage,
        `content/home/variation/${imgFile.name}`
      );
      await uploadBytes(variationFolderRef, imgFile);

      await set(ref(database, "content/home/variation"), {
        imgUrl: await getDownloadURL(variationFolderRef),
        content: content.value.trim(),
      }).then(() => {
        displayVariation();
        btnUpdate.classList.remove("btn-update-variation");
        updateCancel();
      });
    });
});
// VARIATION END ==========================================================================================================================================

// VIDEOS ==========================================================================================================================================
const videosContainer = homeSection.querySelector(
  ".education-videos-container"
);

const btnVideosUpdate = videosContainer.querySelector(".btn-videos-update");
const btnVideosRemove = videosContainer.querySelector(".btn-videos-remove");

const videosTitle1 = videosContainer.querySelector(".video-title-1");
const videosTitle2 = videosContainer.querySelector(".video-title-2");
const videosTitle3 = videosContainer.querySelector(".video-title-3");
const videosUrl1 = videosContainer.querySelector(".video-url-1");
const videosUrl2 = videosContainer.querySelector(".video-url-2");
const videosUrl3 = videosContainer.querySelector(".video-url-3");

btnVideosRemove.addEventListener("click", async () => {
  const confirmDelete = confirm("Remove videos content?");
  if (!confirmDelete) {
    return;
  }

  remove(ref(database, "content/home/videos")).then(() => {
    displayVideos();
  });
});

displayVideos();

async function displayVideos() {
  const videosRef = ref(database, "content/home/videos");

  const snapshot = await get(videosRef);
  const data = snapshot.val();

  if (!snapshot.exists()) {
    return;
  }

  videosTitle1.textContent = data.videoTitle1;
  videosTitle2.textContent = data.videoTitle2;
  videosTitle3.textContent = data.videoTitle3;

  videosUrl1.src = data.videoUrl1;
  videosUrl2.src = data.videoUrl2;
  videosUrl3.src = data.videoUrl3;
}

btnVideosUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-videos");
  updateH1.textContent = "EDUCATIONAL VIDEOS";

  const videosRef = ref(database, "content/home/videos");

  const snapshot = await get(videosRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const videoTitle1 = document.createElement("input");
  videoTitle1.placeholder = "Video Title 1";

  const videoUrl1 = document.createElement("input");
  videoUrl1.placeholder = "https://www.youtube.com/embed/tgbNymZ7vqY";
  videoUrl1.style.marginBottom = "10px";

  const videoTitle2 = document.createElement("input");
  videoTitle2.placeholder = "Video Title 2";

  const videoUrl2 = document.createElement("input");
  videoUrl2.placeholder = "https://www.youtube.com/embed/tgbNymZ7vqY";
  videoUrl2.style.marginBottom = "10px";

  const videoTitle3 = document.createElement("input");
  videoTitle3.placeholder = "Video Title 3";

  const videoUrl3 = document.createElement("input");
  videoUrl3.placeholder = "https://www.youtube.com/embed/tgbNymZ7vqY";
  videoUrl3.style.marginBottom = "10px";

  if (snapshot.exists()) {
    videoTitle1.value = data.videoTitle1 ? data.videoTitle1 : "";
    videoUrl1.value = data.videoUrl1 ? data.videoUrl1 : "";

    videoTitle2.value = data.videoTitle2 ? data.videoTitle2 : "";
    videoUrl2.value = data.videoUrl2 ? data.videoUrl2 : "";

    videoTitle3.value = data.videoTitle3 ? data.videoTitle3 : "";
    videoUrl3.value = data.videoUrl3 ? data.videoUrl3 : "";
  }

  updateInputField.appendChild(videoTitle1);
  updateInputField.appendChild(videoUrl1);
  updateInputField.appendChild(videoTitle2);
  updateInputField.appendChild(videoUrl2);
  updateInputField.appendChild(videoTitle3);
  updateInputField.appendChild(videoUrl3);

  updateContainer
    .querySelector(".btn-update-videos")
    .addEventListener("click", async () => {
      if (
        !videoUrl1.value.trim() ||
        !videoUrl2.value.trim() ||
        !videoUrl3.value.trim() ||
        !videoTitle1.value.trim() ||
        !videoTitle2.value.trim() ||
        !videoTitle3.value.trim()
      ) {
        alert("Please insert a value.");
        return;
      }

      if (
        !validateURL(videoUrl1.value.trim()) ||
        !validateURL(videoUrl2.value.trim()) ||
        !validateURL(videoUrl3.value.trim())
      ) {
        alert(
          "Please enter a valid YouTube embed URL in the format https://www.youtube.com/embed/VIDEO_ID"
        );
        return;
      }

      await set(ref(database, "content/home/videos"), {
        videoTitle1: videoTitle1.value.trim(),
        videoTitle2: videoTitle2.value.trim(),
        videoTitle3: videoTitle3.value.trim(),
        videoUrl1: videoUrl1.value.trim(),
        videoUrl2: videoUrl2.value.trim(),
        videoUrl3: videoUrl3.value.trim(),
      }).then(() => {
        console.log(111);
        displayVideos();
        btnUpdate.classList.remove("btn-update-videos");
        updateCancel();
      });
    });
});

function validateURL(url) {
  const pattern =
    /^https:\/\/(www\.youtube\.com|www\.youtube-nocookie\.com)\/embed\/.*/;
  return pattern.test(url);
}

// VIDEOS END ==========================================================================================================================================

// COMMUNITY ==========================================================================================================================================
const communityContainer = homeSection.querySelector(
  ".community-banner-container"
);

const btnCommunityUpdate = communityContainer.querySelector(
  ".btn-community-update"
);
const btnCommunityRemove = communityContainer.querySelector(
  ".btn-community-remove"
);

const communityImg = communityContainer.querySelector(".community-banner-img");
const communityText = communityContainer.querySelector(".community-text");

displayCommunity();

async function displayCommunity() {
  const communityRef = ref(database, "content/home/community");

  const snapshot = await get(communityRef);
  const data = snapshot.val();

  if (!snapshot.exists()) {
    return;
  }

  communityImg.src = data.imgUrl;
  communityText.textContent = data.content;
}

btnCommunityRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }

    const communityFolderRef = storageRef(storage, `content/home/community`);
    const imgList = await listAll(communityFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/home/community")).then(() => {
      displayCommunity();
    });
  }
});

btnCommunityUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-community");
  updateH1.textContent = "COMMUNITY";

  const communityRef = ref(database, "content/home/community");

  const snapshot = await get(communityRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const img = document.createElement("input");
  img.type = "file";
  img.accept = "image/*";
  img.maxLength = "1";

  const content = document.createElement("textarea");
  content.placeholder = "Community Content";

  if (snapshot.exists()) {
    content.value = data.content ? data.content : "";
  }

  updateInputField.appendChild(img);
  updateInputField.appendChild(content);

  updateContainer
    .querySelector(".btn-update-community")
    .addEventListener("click", async () => {
      if (!content.value || !img.value) {
        alert("Please insert a value.");
        return;
      }

      const deleteVariationFolderRef = storageRef(
        storage,
        `content/home/community`
      );
      const imgList = await listAll(deleteVariationFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      const imgFile = img.files[0];

      const communityFolderRef = storageRef(
        storage,
        `content/home/community/${imgFile.name}`
      );
      await uploadBytes(communityFolderRef, imgFile);

      await set(ref(database, "content/home/community"), {
        imgUrl: await getDownloadURL(communityFolderRef),
        content: content.value.trim(),
      }).then(() => {
        displayCommunity();
        btnUpdate.classList.remove("btn-update-community");
        updateCancel();
      });
    });
});
// COMMUNITY END ==========================================================================================================================================

// NEWS ==========================================================================================================================================
const newsContainer = homeSection.querySelector(".news-banner-container");

const btnNewsUpdate = newsContainer.querySelector(".btn-news-update");
const btnNewsRemove = newsContainer.querySelector(".btn-news-remove");

const newsImg = newsContainer.querySelector(".news-banner-img");
const newsText = newsContainer.querySelector(".news-text");

displayNews();

async function displayNews() {
  const newsRef = ref(database, "content/home/news");

  const snapshot = await get(newsRef);
  const data = snapshot.val();

  if (!snapshot.exists()) {
    return;
  }

  newsImg.src = data.imgUrl;
  newsText.textContent = data.content;
}

btnNewsRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }

    const newsFolderRef = storageRef(storage, `content/home/news`);
    const imgList = await listAll(newsFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/home/news")).then(() => {
      displayNews();
    });
  }
});

btnNewsUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-news");
  updateH1.textContent = "NEWS";

  const newsRef = ref(database, "content/home/news");

  const snapshot = await get(newsRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const img = document.createElement("input");
  img.type = "file";
  img.accept = "image/*";
  img.maxLength = "1";

  const content = document.createElement("textarea");
  content.placeholder = "News Content";

  if (snapshot.exists()) {
    content.value = data.content ? data.content : "";
  }

  updateInputField.appendChild(img);
  updateInputField.appendChild(content);

  updateContainer
    .querySelector(".btn-update-news")
    .addEventListener("click", async () => {
      if (!content.value || !img.value) {
        alert("Please insert a value.");
        return;
      }

      const deleteVariationFolderRef = storageRef(storage, `content/home/news`);
      const imgList = await listAll(deleteVariationFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      const imgFile = img.files[0];

      const newsFolderRef = storageRef(
        storage,
        `content/home/news/${imgFile.name}`
      );
      await uploadBytes(newsFolderRef, imgFile);

      await set(ref(database, "content/home/news"), {
        imgUrl: await getDownloadURL(newsFolderRef),
        content: content.value.trim(),
      }).then(() => {
        displayNews();
        btnUpdate.classList.remove("btn-update-news");
        updateCancel();
      });
    });
});
// NEWS END ==========================================================================================================================================

// FAQ ==========================================================================================================================================
const faqContainer = homeSection.querySelector(".faq-banner-container");

const btnFaqUpdate = faqContainer.querySelector(".btn-faq-update");
const btnFaqRemove = faqContainer.querySelector(".btn-faq-remove");

const faqImg = faqContainer.querySelector(".faq-banner-img");

displayFaq();

async function displayFaq() {
  const faqRef = ref(database, "content/home/faq");

  const snapshot = await get(faqRef);
  const data = snapshot.val();

  if (!snapshot.exists()) {
    return;
  }

  faqImg.src = data.imgUrl;
}

btnFaqRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }

    const faqFolderRef = storageRef(storage, `content/home/faq`);
    const imgList = await listAll(faqFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/home/faq")).then(() => {
      displayFaq();
    });
  }
});

btnFaqUpdate.addEventListener("click", async () => {
  updateContainer.style.display = "block";
  updateOverlay.style.display = "block";

  btnUpdate.classList.add("btn-update-faq");
  updateH1.textContent = "FAQ";

  const faqRef = ref(database, "content/home/faq");

  const snapshot = await get(faqRef);
  const data = snapshot.val();

  updateInputField.innerHTML = "";

  const img = document.createElement("input");
  img.type = "file";
  img.accept = "image/*";
  img.maxLength = "1";

  updateInputField.appendChild(img);

  updateContainer
    .querySelector(".btn-update-faq")
    .addEventListener("click", async () => {
      if (!img.value) {
        alert("Please insert a value.");
        return;
      }

      const deleteVariationFolderRef = storageRef(storage, `content/home/faq`);
      const imgList = await listAll(deleteVariationFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      const imgFile = img.files[0];

      const faqFolderRef = storageRef(
        storage,
        `content/home/faq/${imgFile.name}`
      );
      await uploadBytes(faqFolderRef, imgFile);

      await set(ref(database, "content/home/faq"), {
        imgUrl: await getDownloadURL(faqFolderRef),
      }).then(() => {
        displayFaq();
        btnUpdate.classList.remove("btn-update-faq");
        updateCancel();
      });
    });
});
// FAQ END ==========================================================================================================================================

// INTERSEX VARIATION ==========================================================================================================================================
const intersexVariationContainer = document.querySelector(
  ".intersex-variation-section"
);

const btnIntersexBack = intersexVariationContainer.querySelector(
  ".btn-intersex-variation-back"
);

const btnIntersexVariationUpdate = intersexVariationContainer.querySelector(
  ".btn-intersex-variation-update"
);
const btnIntersexVariationRemove = intersexVariationContainer.querySelector(
  ".btn-intersex-variation-remove"
);

const intersexVariationUpdateContainer = document.querySelector(
  ".intersex-variation-update-container"
);

const btnIntersexVariationUpdateUpdate =
  intersexVariationUpdateContainer.querySelector(
    ".btn-intersex-variation-update-update"
  );
const btnIntersexVariationUpdateCancel =
  intersexVariationUpdateContainer.querySelector(
    ".btn-intersex-variation-update-cancel"
  );

// INPUT ==============================================================================================================
const variationInpImg = document.getElementById("intersex-variation-img");
const variationInpContent = document.getElementById(
  "intersex-variation-content"
);

const variation1Img = document.getElementById("intersex-variation-1-img");
const variation1Name = document.getElementById("intersex-variation-1-name");
const variation1Content = document.getElementById(
  "intersex-variation-1-content"
);

const variation2Img = document.getElementById("intersex-variation-2-img");
const variation2Name = document.getElementById("intersex-variation-2-name");
const variation2Content = document.getElementById(
  "intersex-variation-2-content"
);

const variation3Img = document.getElementById("intersex-variation-3-img");
const variation3Name = document.getElementById("intersex-variation-3-name");
const variation3Content = document.getElementById(
  "intersex-variation-3-content"
);
// INPUT END ==============================================================================================================

// CONTENT ========================================================================================================================
const intersexSectionImg = document.getElementById("intersex-section-img");
const intersexSectionContent = document.getElementById(
  "intersex-section-content"
);

const intersexSectionVariation1Name = document.getElementById(
  "intersex-section-variation-1-name"
);
const intersexSectionVariation1Content = document.getElementById(
  "intersex-section-variation-1-content"
);
const intersexSectionVariation1Img = document.getElementById(
  "intersex-section-variation-1-img"
);

const intersexSectionVariation2Name = document.getElementById(
  "intersex-section-variation-2-name"
);
const intersexSectionVariation2Content = document.getElementById(
  "intersex-section-variation-2-content"
);
const intersexSectionVariation2Img = document.getElementById(
  "intersex-section-variation-2-img"
);

const intersexSectionVariation3Name = document.getElementById(
  "intersex-section-variation-3-name"
);
const intersexSectionVariation3Content = document.getElementById(
  "intersex-section-variation-3-content"
);
const intersexSectionVariation3Img = document.getElementById(
  "intersex-section-variation-3-img"
);
// CONTENT END ==============================================================================================================

btnIntersexVariationRemove.addEventListener("click", async () => {
  if (urls) {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }

    const intersexFolderRef = storageRef(storage, `content/intersex`);
    const imgList = await listAll(intersexFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/intersex")).then(() => {
      displayIntersexVariation();
    });
  }
});

displayIntersexVariation();

async function displayIntersexVariation() {
  const snapshot = await get(ref(database, "content/intersex"));
  const data = snapshot.val();

  if (!data) {
    return;
  }

  intersexSectionImg.src = data.intersexContent.imgUrl;
  intersexSectionContent.textContent = data.intersexContent.content;

  intersexSectionVariation1Name.textContent = data.variation1.name;
  intersexSectionVariation1Content.textContent = data.variation1.content;
  intersexSectionVariation1Img.src = data.variation1.imgUrl;

  intersexSectionVariation2Name.textContent = data.variation2.name;
  intersexSectionVariation2Content.textContent = data.variation2.content;
  intersexSectionVariation2Img.src = data.variation2.imgUrl;

  intersexSectionVariation3Name.textContent = data.variation3.name;
  intersexSectionVariation3Content.textContent = data.variation3.content;
  intersexSectionVariation3Img.src = data.variation3.imgUrl;
}

btnIntersexVariationUpdateUpdate.addEventListener("click", async () => {
  if (
    !variationInpImg.files.length ||
    !variationInpContent.value.trim() ||
    !variation1Img.files.length ||
    !variation1Name.value.trim() ||
    !variation1Content.value.trim() ||
    !variation2Img.files.length ||
    !variation2Name.value.trim() ||
    !variation2Content.value.trim() ||
    !variation3Img.files.length ||
    !variation3Name.value.trim() ||
    !variation3Content.value.trim()
  ) {
    alert("Please fill all the fields.");
    return;
  }

  const confirm1 = confirm(
    "This will replace all the previous contents, proceed?"
  );
  if (!confirm1) {
    return;
  }

  const deleteVariationFolderRef = storageRef(storage, `content/intersex`);
  const imgList = await listAll(deleteVariationFolderRef);
  const deletePromises = imgList.items.map((item) => deleteObject(item));
  await Promise.all(deletePromises);

  const inputs = [
    {
      img: variationInpImg.files[0],
      content: variationInpContent.value.trim(),
      key: "intersexContent",
    },
    {
      img: variation1Img.files[0],
      name: variation1Name.value.trim(),
      content: variation1Content.value.trim(),
      key: "variation1",
    },
    {
      img: variation2Img.files[0],
      name: variation2Name.value.trim(),
      content: variation2Content.value.trim(),
      key: "variation2",
    },
    {
      img: variation3Img.files[0],
      name: variation3Name.value.trim(),
      content: variation3Content.value.trim(),
      key: "variation3",
    },
  ];

  const data = {};

  for (const input of inputs) {
    const fileRef = storageRef(storage, `content/intersex/${input.img.name}`);
    await uploadBytes(fileRef, input.img);
    const downloadURL = await getDownloadURL(fileRef);
    data[input.key] = {
      imgUrl: downloadURL,
      content: input.content,
    };
    if (input.name) {
      data[input.key].name = input.name;
    }
  }

  await set(ref(database, "content/intersex"), data).then(() => {
    displayIntersexVariation();
    intersexVariationUpdateContainer.style.display = "none";
    updateOverlay.style.display = "none";
  });
});

btnIntersexVariationUpdateCancel.addEventListener("click", () => {
  intersexVariationUpdateContainer.style.display = "none";
  updateOverlay.style.display = "none";
});

btnIntersexVariationUpdate.addEventListener("click", () => {
  intersexVariationUpdateContainer.style.display = "block";
  updateOverlay.style.display = "block";
});

btnIntersexBack.addEventListener("click", () => {
  homeSection.style.display = "block";
  intersexVariationContainer.style.display = "none";
});

variationContainer
  .querySelector(".btn-variation-proceed")
  .addEventListener("click", () => {
    homeSection.style.display = "none";
    intersexVariationContainer.style.display = "block";
  });
// INTERSEX VARIATION END ==========================================================================================================================================

// HOME END ==========================================================================================================================================

// ABOUT US ==========================================================================================================================================
const aboutSection = document.querySelector(".about-section");

const aboutUpdateContainer = document.querySelector(".about-update-container");

const aboutInp = aboutUpdateContainer.querySelector("#about-intersex-input");
const aboutInpMission = aboutUpdateContainer.querySelector(
  "#about-mission-input"
);
const aboutInpVision = aboutUpdateContainer.querySelector(
  "#about-vision-input"
);

const membersContainer = aboutSection.querySelector(".members-container");

const membersUpdateContainer = aboutSection.querySelector(
  ".members-update-container"
);
const membersUpdateText = aboutSection.querySelector(".member-update-text");

const btnMemberCancel =
  membersUpdateContainer.querySelector(".btn-member-cancel");
const btnMemberUpdate =
  membersUpdateContainer.querySelector(".btn-member-update");
const btnMemberSave = membersUpdateContainer.querySelector(".btn-member-save");

const memberInpImg = membersUpdateContainer.querySelector("#member-inp-img");
const memberInpName = membersUpdateContainer.querySelector("#member-inp-name");
const memberInpRole = membersUpdateContainer.querySelector("#member-inp-role");
const memberInpDescription = membersUpdateContainer.querySelector(
  "#member-inp-description"
);

const btnAddNewMember = aboutSection.querySelector(".btn-add-new-member");

btnMemberCancel.addEventListener("click", handleMemberCancel);

function handleMemberCancel() {
  btnMemberUpdate.style.display = "block";
  btnMemberSave.style.display = "block";
  membersUpdateContainer.style.display = "none";
  updateOverlay.style.display = "none";
}

btnAddNewMember.addEventListener("click", () => {
  btnMemberUpdate.style.display = "none";
  membersUpdateContainer.style.display = "block";
  updateOverlay.style.display = "block";
  membersUpdateText.textContent = "NEW BOARD MEMBER";

  memberInpImg.value = "";
  memberInpName.value = "";
  memberInpRole.value = "";
  memberInpDescription.value = "";

  btnMemberSave.addEventListener("click", async () => {
    if (
      !memberInpImg.value ||
      !memberInpName.value.trim() ||
      !memberInpRole.value.trim() ||
      !memberInpDescription.value.trim()
    ) {
      alert("Please fill all the field.");
      return;
    }

    const img = memberInpImg.files[0];

    const memberRef = ref(database, "content");
    const newMemberRef = await push(child(memberRef, "about/members"));
    const memberKey = newMemberRef.key;

    const memberFolderRef = storageRef(
      storage,
      `content/about/members/${memberKey}/${img.name}`
    );
    await uploadBytes(memberFolderRef, img);

    set(ref(database, `content/about/members/${memberKey}`), {
      imgUrl: await getDownloadURL(memberFolderRef),
      name: memberInpName.value.trim(),
      role: memberInpRole.value.trim(),
      description: memberInpDescription.value.trim(),
    }).then(() => {
      handleMemberCancel();
    });
  });
});

aboutSection
  .querySelector(".btn-about-intro-update")
  .addEventListener("click", () => {
    aboutUpdateContainer.style.display = "block";
    updateOverlay.style.display = "block";

    aboutSection
      .querySelector(".btn-about-update")
      .addEventListener("click", () => {
        if (
          !aboutInp.value.trim() ||
          !aboutInpMission.value.trim() ||
          !aboutInpVision.value.trim()
        ) {
          alert("Please fill all the field.");
          return;
        }

        set(ref(database, "content/about/texts"), {
          intro: aboutInp.value.trim(),
          mission: aboutInpMission.value.trim(),
          vision: aboutInpVision.value.trim(),
        }).then(() => {
          aboutUpdateContainer.style.display = "none";
          updateOverlay.style.display = "none";
          displayAbout();
        });
      });
  });

aboutSection
  .querySelector(".btn-about-update-cancel")
  .addEventListener("click", () => {
    aboutUpdateContainer.style.display = "none";
    updateOverlay.style.display = "none";
  });

aboutSection
  .querySelector(".btn-about-intro-remove")
  .addEventListener("click", () => {
    const confirmDelete = confirm("Remove content?");
    if (!confirmDelete) {
      return;
    }
    remove(ref(database, "content/about/texts")).then(() => {
      displayAbout();
    });
  });

displayAbout();

async function displayAbout() {
  const snapshot = await get(ref(database, "content/about"));
  const data = snapshot.val();
  membersContainer.innerHTML = "";

  if (!data) {
    return;
  }

  if (data.imgUrl) {
    aboutSection.querySelector(".about-header-img").src = data.imgUrl || "";
  }

  if (data.texts) {
    aboutSection.querySelector("#about-intro").textContent =
      data.texts.intro || "";
    aboutSection.querySelector("#about-mission").textContent =
      data.texts.mission || "";
    aboutSection.querySelector("#about-vision").textContent =
      data.texts.vision || "";
  }

  if (data.members) {
    for (const ID in data.members) {
      const memberData = data.members[ID];

      const memberContent = document.createElement("div");
      memberContent.classList.add("members-content");

      const img = document.createElement("img");
      img.src = memberData.imgUrl;

      const memberInfo = document.createElement("div");
      memberInfo.classList.add("member-info");

      const h1 = document.createElement("h1");
      h1.textContent = memberData.name;

      const h3 = document.createElement("h3");
      h3.textContent = memberData.role;

      const p = document.createElement("p");
      p.textContent = memberData.description;

      memberInfo.appendChild(h1);
      memberInfo.appendChild(h3);
      memberInfo.appendChild(p);

      const btnContainer = document.createElement("div");
      btnContainer.classList.add("home-btn-container");

      const btnUpdate = document.createElement("button");
      btnUpdate.textContent = "Update";

      const btnRemove = document.createElement("button");
      btnRemove.textContent = "Remove";

      btnContainer.appendChild(btnUpdate);
      btnContainer.appendChild(btnRemove);

      memberContent.appendChild(img);
      memberContent.appendChild(memberInfo);
      memberContent.appendChild(btnContainer);

      membersContainer.appendChild(memberContent);

      btnRemove.addEventListener("click", async () => {
        const confirmDelete = confirm("Remove member content?");
        if (!confirmDelete) {
          return;
        }

        const deleteAboutFolderRef = storageRef(
          storage,
          `content/about/members/${ID}`
        );
        const imgList = await listAll(deleteAboutFolderRef);
        const deletePromises = imgList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);

        remove(ref(database, `content/about/members/${ID}`)).then(() => {
          displayAbout();
        });
      });

      btnUpdate.addEventListener("click", () => {
        btnMemberSave.style.display = "none";
        membersUpdateContainer.style.display = "block";
        updateOverlay.style.display = "block";

        memberInpName.value = memberData.name;
        memberInpRole.value = memberData.role;
        memberInpDescription.value = memberData.description;

        btnMemberUpdate.addEventListener("click", async () => {
          if (
            !memberInpImg.value ||
            !memberInpName.value.trim() ||
            !memberInpRole.value.trim() ||
            !memberInpDescription.value.trim()
          ) {
            alert("Please fill all the field.");
            return;
          }

          const imgFile = memberInpImg.files[0];

          const deleteAboutFolderRef = storageRef(
            storage,
            `content/about/members/${ID}`
          );
          const imgList = await listAll(deleteAboutFolderRef);
          const deletePromises = imgList.items.map((item) =>
            deleteObject(item)
          );
          await Promise.all(deletePromises);

          const aboutFolderRef = storageRef(
            storage,
            `content/about/members/${ID}/${imgFile.name}`
          );
          await uploadBytes(aboutFolderRef, imgFile);

          await update(ref(database, `content/about/members/${ID}`), {
            imgUrl: await getDownloadURL(aboutFolderRef),
            name: memberInpName.value.trim(),
            role: memberInpRole.value.trim(),
            description: memberInpDescription.value.trim(),
          }).then(() => {
            handleMemberCancel();
            displayAbout();
          });
        });
      });
    }
  }
}

aboutSection
  .querySelector(".btn-about-img-update")
  .addEventListener("click", () => {
    const img = document.createElement("input");
    img.type = "file";
    img.maxLength = "1";
    img.accept = "image/*";

    img.addEventListener("change", async () => {
      const imgFile = img.files[0];

      const deleteAboutFolderRef = storageRef(storage, `content/about/img`);
      const imgList = await listAll(deleteAboutFolderRef);
      const deletePromises = imgList.items.map((item) => deleteObject(item));
      await Promise.all(deletePromises);

      const aboutFolderRef = storageRef(
        storage,
        `content/about/img/${imgFile.name}`
      );
      await uploadBytes(aboutFolderRef, imgFile);

      await set(ref(database, "content/about"), {
        imgUrl: await getDownloadURL(aboutFolderRef),
      }).then(() => {
        displayAbout();
      });
    });

    img.click();
  });

aboutSection
  .querySelector(".btn-about-img-remove")
  .addEventListener("click", async () => {
    const confirmDelete = confirm("Remove image?");
    if (!confirmDelete) {
      return;
    }

    const deleteAboutFolderRef = storageRef(storage, `content/about/img`);
    const imgList = await listAll(deleteAboutFolderRef);
    const deletePromises = imgList.items.map((item) => deleteObject(item));
    await Promise.all(deletePromises);

    remove(ref(database, "content/about/imgUrl")).then(() => {
      displayAbout();
    });
  });

// ABOUT US END ==========================================================================================================================================
