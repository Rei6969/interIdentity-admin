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

// =================================================================================================================================================
const quizSection = document.getElementById("quiz-section");

const btnAddQuiz = quizSection.querySelector(".btn-add-quiz");
quizSection
  .querySelector(".btn-cancel-quiz")
  .addEventListener("click", handleCloseAddContainer);

const quizOverlay = quizSection.querySelector(".quiz-overlay");
const quizAddContainer = quizSection.querySelector(".quiz-add-container");

const itemQuestion = document.getElementById("item-question");
const optionsContainer = quizAddContainer.querySelector(".options-container");
let optionsSpan = optionsContainer.querySelectorAll("span");
const optionsItemIp = optionsContainer.querySelectorAll("input");
let btnAddOption = quizAddContainer.querySelector(".btn-add-option");
const itemRightAnswer = quizAddContainer.querySelector("#item-right-answer");
const itemWrongAnswer = quizAddContainer.querySelector("#item-wrong-answer");
let btnDeleteQuiz = quizAddContainer.querySelector(".btn-delete-quiz");
let btnSaveQuiz = quizAddContainer.querySelector(".btn-save-quiz");

const quizContainer = quizSection.querySelector(".quiz-container");

const quizFilter = document.getElementById("quiz-filter");
// =================================================================================================================================================
displayQuiz();

quizFilter.addEventListener("change", displayQuiz);

async function displayQuiz() {
  const snapshot = await get(ref(database, `quiz/${quizFilter.value}`));
  const snapshotData = snapshot.val();

  quizContainer.innerHTML = "";

  if (!snapshotData) {
    return;
  }

  let counter = 0;

  for (const ID in snapshotData) {
    const data = snapshotData[ID];
    counter++;
    const currentIndex = counter;

    const quizContent = document.createElement("div");
    quizContent.classList.add("quiz-content");

    const itemNumber = document.createElement("div");
    itemNumber.classList.add("item-number");

    const number = document.createElement("h1");
    number.textContent = `Item #${counter}`;

    itemNumber.appendChild(number);

    const itemContent = document.createElement("div");
    itemContent.classList.add("item-content");

    const question = document.createElement("h1");
    question.textContent = "Question";

    const questionContent = document.createElement("p");
    questionContent.textContent = data.question;

    const options = document.createElement("h1");
    options.textContent = "Options";

    const option1 = document.createElement("p");
    option1.classList.add("options-item");

    const span1 = document.createElement("span");
    span1.textContent = "a";
    option1.appendChild(span1);

    const textNode1 = document.createTextNode(data.option1);
    option1.appendChild(textNode1);

    const option2 = document.createElement("p");
    option2.classList.add("options-item");

    const span2 = document.createElement("span");
    span2.textContent = "b";
    option2.appendChild(span2);

    const textNode2 = document.createTextNode(data.option2);
    option2.appendChild(textNode2);

    itemContent.appendChild(question);
    itemContent.appendChild(questionContent);
    itemContent.appendChild(options);
    itemContent.appendChild(option1);
    itemContent.appendChild(option2);

    let span3;
    let span4;

    if (data.option3) {
      const option3 = document.createElement("p");
      option3.classList.add("options-item");

      span3 = document.createElement("span");
      span3.textContent = "c";
      option3.appendChild(span3);

      const textNode3 = document.createTextNode(data.option3);
      option3.appendChild(textNode3);
      itemContent.appendChild(option3);
    }

    if (data.option4) {
      const option4 = document.createElement("p");
      option4.classList.add("options-item");

      span4 = document.createElement("span");
      span4.textContent = "d";
      option4.appendChild(span4);

      const textNode4 = document.createTextNode(data.option4);
      option4.appendChild(textNode4);
      itemContent.appendChild(option4);
    }

    const rightAnswer = document.createElement("h1");
    rightAnswer.textContent = "Right Answer Feedback";

    const rightAnswerContent = document.createElement("p");
    rightAnswerContent.textContent = data.rightAnswer;

    const wrongAnswer = document.createElement("h1");
    wrongAnswer.textContent = "Right Answer Feedback";

    const wrongAnswerContent = document.createElement("p");
    wrongAnswerContent.textContent = data.wrongAnswer;

    const zContainer = document.createElement("div");
    zContainer.classList.add("z");

    const btnEditQuiz = document.createElement("button");
    btnEditQuiz.classList.add("btn-edit-quiz");
    btnEditQuiz.textContent = "Edit";

    if (data.selectedSpan === "span1") {
      span1.classList.add("highlighted");
    } else if (data.selectedSpan === "span2") {
      span2.classList.add("highlighted");
    } else if (data.option3 && data.selectedSpan === "span3") {
      span3.classList.add("highlighted");
    } else if (data.option4 && data.selectedSpan === "span4") {
      span4.classList.add("highlighted");
    }

    zContainer.appendChild(btnEditQuiz);

    itemContent.appendChild(rightAnswer);
    itemContent.appendChild(rightAnswerContent);
    itemContent.appendChild(wrongAnswer);
    itemContent.appendChild(wrongAnswerContent);
    itemContent.appendChild(zContainer);

    quizContent.appendChild(itemNumber);
    quizContent.appendChild(itemContent);

    quizContainer.appendChild(quizContent);

    btnDeleteQuiz.replaceWith(btnDeleteQuiz.cloneNode(true));
    btnDeleteQuiz = quizAddContainer.querySelector(".btn-delete-quiz");

    btnDeleteQuiz.addEventListener("click", async () => {
      await remove(ref(database, `quiz/${quizFilter.value}/${ID}`));
      displayQuiz();
      handleCloseAddContainer();
    });

    btnEditQuiz.addEventListener("click", () => {
      quizOverlay.style.display = "block";
      quizAddContainer.style.display = "block";
      quizAddContainer.querySelector(".item-number").style.display = "block";
      quizAddContainer.querySelector(
        ".item-number h1"
      ).textContent = `Item #${currentIndex}`;

      btnDeleteQuiz.style.opacity = "1";
      btnDeleteQuiz.disabled = false;
      btnSaveQuiz.disabled = false;

      itemQuestion.value = data.question;
      itemRightAnswer.value = data.rightAnswer;
      itemWrongAnswer.value = data.wrongAnswer;

      optionsContainer.innerHTML = "";

      const option1Div = document.createElement("div");
      option1Div.classList.add("options-item");

      const span1 = document.createElement("span");
      span1.textContent = "a";
      span1.id = "span1";
      if (data.selectedSpan === "span1") {
        span1.classList.add("highlighted");
      }

      const input1 = document.createElement("input");
      input1.type = "text";
      input1.id = "option1";
      input1.value = data.option1;

      option1Div.appendChild(span1);
      option1Div.appendChild(input1);
      optionsContainer.appendChild(option1Div);

      const option2Div = document.createElement("div");
      option2Div.classList.add("options-item");

      const span2 = document.createElement("span");
      span2.textContent = "b";
      span2.id = "span2";
      if (data.selectedSpan === "span2") {
        span2.classList.add("highlighted");
      }

      const input2 = document.createElement("input");
      input2.type = "text";
      input2.id = "option2";
      input2.value = data.option2;

      option2Div.appendChild(span2);
      option2Div.appendChild(input2);
      optionsContainer.appendChild(option2Div);

      if (data.option3) {
        const option3Div = document.createElement("div");
        option3Div.classList.add("options-item", "dynamic-item");

        const span3 = document.createElement("span");
        span3.textContent = "c";
        span3.id = "span3";
        if (data.selectedSpan === "span3") {
          span3.classList.add("highlighted");
        }

        const input3 = document.createElement("input");
        input3.type = "text";
        input3.id = "option3";
        input3.value = data.option3;

        const btnRemove3 = document.createElement("button");
        btnRemove3.classList.add("btn-remove-option");
        btnRemove3.textContent = "Remove";

        option3Div.appendChild(span3);
        option3Div.appendChild(input3);
        option3Div.appendChild(btnRemove3);
        optionsContainer.appendChild(option3Div);

        btnRemove3.addEventListener("click", () => {
          optionsContainer.removeChild(option3Div);
          if (document.getElementById("option4")) {
            document.getElementById("span4").textContent = "c";
            document.getElementById("option4").placeholder = "Edit Option 3";
            document.getElementById("option4").id = "option3";
            document.getElementById("span4").id = "span3";
          }
          btnAddOption.style.display = "block";
        });
      }

      if (data.option4) {
        const option4Div = document.createElement("div");
        option4Div.classList.add("options-item", "dynamic-item");

        const span4 = document.createElement("span");
        span4.textContent = "d";
        span4.id = "span4";
        if (data.selectedSpan === "span4") {
          span4.classList.add("highlighted");
        }

        const input4 = document.createElement("input");
        input4.type = "text";
        input4.id = "option4";
        input4.value = data.option4;

        const btnRemove4 = document.createElement("button");
        btnRemove4.classList.add("btn-remove-option");
        btnRemove4.textContent = "Remove";

        option4Div.appendChild(span4);
        option4Div.appendChild(input4);
        option4Div.appendChild(btnRemove4);
        optionsContainer.appendChild(option4Div);

        btnRemove4.addEventListener("click", () => {
          optionsContainer.removeChild(option4Div);
          btnAddOption.style.display = "block";
        });
      }

      optionsSpan = optionsContainer.querySelectorAll("span");

      if (optionsSpan.length >= 4) {
        btnAddOption.style.display = "none";
      } else {
        btnAddOption.style.display = "block";
      }

      btnAddOption.replaceWith(btnAddOption.cloneNode(true));
      btnAddOption = quizAddContainer.querySelector(".btn-add-option");

      btnAddOption.addEventListener("click", () => {
        optionsSpan = optionsContainer.querySelectorAll("span");

        const optionsItem = document.createElement("div");
        optionsItem.classList.add("options-item", "dynamic-item");

        const span = document.createElement("span");

        const input = document.createElement("input");
        input.type = "text";

        if (optionsSpan.length == 2) {
          span.textContent = "c";
          span.id = "span3";
          input.id = "option3";
          input.placeholder = "Edit Option 3";
        } else if (optionsSpan.length == 3) {
          span.textContent = "d";
          span.id = "span4";
          input.id = "option4";
          input.placeholder = "Edit Option 4";
          btnAddOption.style.display = "none";
        }

        const btnRemove = document.createElement("button");
        btnRemove.classList.add("btn-remove-option");
        btnRemove.textContent = "Remove";

        optionsItem.appendChild(span);
        optionsItem.appendChild(input);
        optionsItem.appendChild(btnRemove);

        optionsContainer.appendChild(optionsItem);

        span.addEventListener("click", () => {
          highlightSpan(span);
        });

        btnRemove.addEventListener("click", () => {
          optionsContainer.removeChild(optionsItem);
          if (input.id === "option3") {
            if (document.getElementById("option4")) {
              document.getElementById("span4").textContent = "c";
              document.getElementById("option4").placeholder = "Edit Option 3";
              document.getElementById("option4").id = "option3";
              document.getElementById("span4").id = "span3";
            }
          }
          btnAddOption.style.display = "block";
        });

        optionsSpan = optionsContainer.querySelectorAll("span");
      });

      optionsSpan.forEach((spanBtn) => {
        spanBtn.addEventListener("click", () => {
          highlightSpan(spanBtn);
        });
      });

      btnSaveQuiz.replaceWith(btnSaveQuiz.cloneNode(true));
      btnSaveQuiz = quizAddContainer.querySelector(".btn-save-quiz");

      btnSaveQuiz.addEventListener("click", async () => {
        let highlightedId = null;
        let allFieldsFilled = true;

        optionsSpan.forEach((span) => {
          if (span.classList.contains("highlighted")) {
            highlightedId = span.id;
          }
        });

        if (!highlightedId) {
          alert("Please select an option before saving.");
          return;
        }

        const question = itemQuestion.value;
        const rightAnswer = itemRightAnswer.value;
        const wrongAnswer = itemWrongAnswer.value;

        if (!question || !rightAnswer || !wrongAnswer) {
          allFieldsFilled = false;
        }

        const quizData = {
          question: question,
          rightAnswer: rightAnswer,
          wrongAnswer: wrongAnswer,
          selectedSpan: highlightedId,
        };

        optionsContainer.querySelectorAll(".options-item").forEach((item) => {
          const input = item.querySelector("input");
          const span = item.querySelector("span");

          if (!input.value) {
            allFieldsFilled = false;
          }

          quizData[input.id] = input.value;
          quizData[span.id] = span.textContent;
        });

        if (!allFieldsFilled) {
          alert("Please fill in all fields before saving.");
          return;
        }

        try {
          const quizRef = ref(database, `quiz/${quizFilter.value}/${ID}`);
          await set(quizRef, quizData);
          alert("Quiz updated successfully!");

          const dynamicOptions =
            optionsContainer.querySelectorAll(".dynamic-item");
          dynamicOptions.forEach((item) => item.remove());

          optionsContainer.innerHTML = "";
          handleCloseAddContainer();
          displayQuiz();
        } catch (error) {
          console.error("Error updating quiz:", error);
          alert("Error updating quiz. Please try again.");
        }
      });
    });
  }
}

// ADD QUIZ ITEM =================================================================================================================================================
btnAddQuiz.addEventListener("click", () => {
  quizOverlay.style.display = "block";
  quizAddContainer.style.display = "block";
  quizAddContainer.querySelector(".item-number").style.display = "none";

  btnDeleteQuiz.style.opacity = "0";
  btnDeleteQuiz.disabled = true;
  btnSaveQuiz.disabled = true;

  itemQuestion.value = "";
  optionsSpan.forEach((span) => span.classList.remove("highlighted"));
  optionsItemIp.forEach((inp) => (inp.value = ""));
  itemRightAnswer.value = "";
  itemWrongAnswer.value = "";

  optionsContainer.innerHTML = "";

  optionsSpan = optionsContainer.querySelectorAll("span");

  if (optionsSpan.length >= 4) {
    btnAddOption.style.display = "none";
  } else {
    btnAddOption.style.display = "block";
  }

  const option1Div = document.createElement("div");
  option1Div.classList.add("options-item");

  const span1 = document.createElement("span");
  span1.textContent = "a";
  span1.id = "span1";

  const input1 = document.createElement("input");
  input1.type = "text";
  input1.id = "option1";
  input1.value = "";
  input1.placeholder = "Add Option 1";

  option1Div.appendChild(span1);
  option1Div.appendChild(input1);
  optionsContainer.appendChild(option1Div);

  const option2Div = document.createElement("div");
  option2Div.classList.add("options-item");

  const span2 = document.createElement("span");
  span2.textContent = "b";
  span2.id = "span2";

  const input2 = document.createElement("input");
  input2.type = "text";
  input2.id = "option2";
  input2.value = "";
  input2.placeholder = "Add Option 2";

  option2Div.appendChild(span2);
  option2Div.appendChild(input2);
  optionsContainer.appendChild(option2Div);

  optionsSpan = optionsContainer.querySelectorAll("span");

  btnAddOption.replaceWith(btnAddOption.cloneNode(true));
  btnAddOption = quizAddContainer.querySelector(".btn-add-option");

  btnAddOption.addEventListener("click", () => {
    optionsSpan = optionsContainer.querySelectorAll("span");

    const optionsItem = document.createElement("div");
    optionsItem.classList.add("options-item", "dynamic-item");

    const span = document.createElement("span");

    const input = document.createElement("input");
    input.type = "text";

    if (optionsSpan.length == 2) {
      span.textContent = "c";
      span.id = "span3";
      input.id = "option3";
      input.placeholder = "Add Option 3";
    } else if (optionsSpan.length == 3) {
      span.textContent = "d";
      span.id = "span4";
      input.id = "option4";
      input.placeholder = "Add Option 4";
      btnAddOption.style.display = "none";
    }

    const btnRemove = document.createElement("button");
    btnRemove.classList.add("btn-remove-option");
    btnRemove.textContent = "Remove";

    optionsItem.appendChild(span);
    optionsItem.appendChild(input);
    optionsItem.appendChild(btnRemove);

    optionsContainer.appendChild(optionsItem);

    span.addEventListener("click", () => {
      highlightSpan(span);
    });

    btnRemove.addEventListener("click", () => {
      optionsContainer.removeChild(optionsItem);
      if (input.id === "option3") {
        document.getElementById("span4").textContent = "c";
        document.getElementById("option4").placeholder = "Add Option 3";
        document.getElementById("option4").id = "option3";
        document.getElementById("span4").id = "span3";
      }
      btnAddOption.style.display = "block";
    });

    optionsSpan = optionsContainer.querySelectorAll("span");
  });

  optionsSpan.forEach((spanBtn) => {
    spanBtn.addEventListener("click", () => {
      highlightSpan(spanBtn);
    });
  });

  btnSaveQuiz.replaceWith(btnSaveQuiz.cloneNode(true));
  btnSaveQuiz = quizAddContainer.querySelector(".btn-save-quiz");

  btnSaveQuiz.addEventListener("click", async () => {
    let highlightedId = null;
    let allFieldsFilled = true;

    optionsSpan.forEach((span) => {
      if (span.classList.contains("highlighted")) {
        highlightedId = span.id;
      }
    });

    if (!highlightedId) {
      alert("Please select an option before saving.");
      return;
    }

    const question = itemQuestion.value;
    const rightAnswer = itemRightAnswer.value;
    const wrongAnswer = itemWrongAnswer.value;

    if (!question || !rightAnswer || !wrongAnswer) {
      allFieldsFilled = false;
    }

    const quizData = {
      question: question,
      rightAnswer: rightAnswer,
      wrongAnswer: wrongAnswer,
      selectedSpan: highlightedId,
    };

    optionsContainer.querySelectorAll(".options-item").forEach((item) => {
      const input = item.querySelector("input");
      const span = item.querySelector("span");

      if (!input.value) {
        allFieldsFilled = false;
      }

      quizData[input.id] = input.value;
      quizData[span.id] = span.textContent;
    });

    if (!allFieldsFilled) {
      alert("Please fill in all fields before saving.");
      return;
    }

    try {
      const quizRef = ref(database, `quiz/${quizFilter.value}`);
      const newQuizRef = push(quizRef);
      await set(newQuizRef, quizData);
      alert("Quiz saved successfully!");

      const dynamicOptions = optionsContainer.querySelectorAll(".dynamic-item");
      dynamicOptions.forEach((item) => item.remove());

      optionsContainer.innerHTML = "";
      handleCloseAddContainer();
      displayQuiz();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Error saving quiz. Please try again.");
    }
  });
});

function highlightSpan(span) {
  optionsSpan = optionsContainer.querySelectorAll("span");
  optionsSpan.forEach((spanBtn) => {
    spanBtn.classList.remove("highlighted");
  });
  span.classList.add("highlighted");
  btnSaveQuiz.disabled = false;
}

function handleCloseAddContainer() {
  quizOverlay.style.display = "none";
  quizAddContainer.style.display = "none";
}

// ADD QUIZ ITEM END =================================================================================================================================================
