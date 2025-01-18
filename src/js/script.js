const home = document.querySelector(".home");
const quiz = document.querySelector(".quiz");
const optionsContainer = document.querySelector(".options");
const options = document.querySelectorAll(".options .opt-btn");
const startBtn = document.getElementById("start-btn");
const errorEle = document.querySelector(".error");
const spinner = document.querySelector(".spinner");
const questionEle = document.querySelector(".quiz__question--ask");
const answers = document.querySelector(".quiz__question--answers");
const currentQueEle = document.querySelector(".progress__current");
const totalQueNum = document.querySelector(".progress__total");
const finalScreen = document.querySelector(".final");
const scoreEle = document.querySelector(".final__result--score");
const assessment = document.querySelector(".final__result--assessment");
const quizTime = document.querySelector(".quiz__timeline");
const quizTimeProgress = document.querySelector(".quiz__timeline--progress");
const leftSec = document.querySelector(".seconds");
const nextBtn = document.querySelector(".quiz__footer--next-btn");
const backHome = document.querySelector(".final__back-btn");

const QUES_DURATION = 20;
let finalData, choosenOption, score, currentQue, timer;

//? initial states
const init = function () {
    deactivateOptions();
    finalData = "";
    choosenOption = "";
    score = 0;
    currentQue = 1;
    timer = 0;
};

//? Clear active class from options elements
const deactivateOptions = function () {
    options.forEach((option) => option.classList.remove("active"));
};

//? Handle quiz options buttons
const handleQuizOptions = function (e) {
    choosenOption = e.target.closest(".opt-btn");
    if (!choosenOption) return;
    deactivateOptions();
    choosenOption.classList.add("active");
    startBtn.innerHTML = `start ${choosenOption.dataset.value} quiz`;
};

//? Handle start button
const handleStartButton = async function () {
    home.classList.add("hidden");
    spinner.classList.remove("hidden");
    await fetchData();
    if (!finalData) return;
    //! Display total number of questions
    totalQueNum.textContent = finalData.length;
    updateQue(finalData);
    quiz.classList.remove("hidden");
    spinner.classList.add("hidden");
};

//? Getting questions from JSON files
const fetchData = async function () {
    try {
        const data = await fetch(
            `../questions/${choosenOption.dataset.value}.json`
        );
        finalData = await data.json();
    } catch (error) {
        console.error("There no selected option");
        errorEle.classList.remove("error-hidden");
    }
};

//? Get answers from JSON data
const getDataAnswers = function (questionData) {
    return Object.entries(questionData).filter(([key]) =>
        key.startsWith("answer")
    );
};

//? Display question
const displayQue = function (questionData) {
    //! Display question
    questionEle.textContent = `${currentQue}- ${questionData.question}`;
};

//? Display answers
const displayAnswers = function (questionData) {
    //! Display answers
    answers.innerHTML = "";
    getDataAnswers(questionData).forEach(([, answer]) => {
        answers.insertAdjacentHTML(
            "beforeend",
            `
                <button class="answer">${answer}</button>
            `
        );
    });
};

//? Display check, xmark icons
const highlightAnswer = function (answerEle, icon) {
    answerEle.classList.add(icon);
    answerEle.insertAdjacentHTML(
        "beforeend",
        `
            <svg>
                <use href="src/img/icons.svg#icon-${icon}"></use>
            </svg>
        `
    );
};

//? Handle selecting answers
const handleSetAnswer = function (e) {
    const userAnswer = e.target;
    if (!userAnswer.closest(".answer")) return;

    const questionData = finalData[currentQue - 1];
    const allAnswers = [...document.querySelectorAll(".answer")];
    const correctAnswer = allAnswers[questionData.correct - 1];

    if (userAnswer === correctAnswer) score++;
    else highlightAnswer(userAnswer, "xmark");
    highlightAnswer(correctAnswer, "check");

    answers.removeEventListener("click", handleSetAnswer);
};

//? Updating questions
const updateQue = function () {
    //! Display current question number
    currentQueEle.textContent = currentQue;
    timeOut();
    displayQue(finalData[currentQue - 1]);
    displayAnswers(finalData[currentQue - 1]);
};

//? Handle next button
const handleNextScreenBtn = function () {
    answers.addEventListener("click", handleSetAnswer);
    clearInterval(timer);
    currentQue++;
    if (currentQue <= finalData.length) updateQue();
    else {
        spinner.classList.remove("hidden");
        quiz.classList.add("hidden");
        setTimeout(() => {
            displayResult(score);
        }, 1500);
    }
};

//? Handle timeout timer
const timeOut = function () {
    let time = QUES_DURATION;
    const tick = function () {
        leftSec.textContent = time;
        quizTimeProgress.style.width = `${
            ((QUES_DURATION - time) / QUES_DURATION) * 100
        }%`;
        if (time < 0) handleNextScreenBtn();
        time--;
    };
    tick();
    timer = setInterval(tick, 1000);
};

//? Display final screen
const displayResult = function (score) {
    spinner.classList.add("hidden");
    finalScreen.classList.remove("hidden");
    scoreEle.innerHTML = `<p class="score">${score}</p> out of ${finalData.length}`;

    if (score < finalData.length * 0.5) {
        assessment.textContent =
            "You still need to study more. Never give up and try again.";
    } else if (score < finalData.length * 0.8) {
        assessment.textContent =
            "You almost there. Never give up and try again. 🤩";
    } else {
        assessment.textContent = "Awesome you are a hero. 😎";
    }
};

//? Handle back home button
const handleBackHomeBtn = function () {
    home.classList.remove("hidden");
    finalScreen.classList.add("hidden");
    init();
};

init();

//? Handle options buttons
optionsContainer.addEventListener("click", handleQuizOptions);

//? Handle start button
startBtn.addEventListener("click", handleStartButton);

//? Handle next button
nextBtn.addEventListener("click", handleNextScreenBtn);

//? Handle select answer
answers.addEventListener("click", handleSetAnswer);

//? Handle back home button
backHome.addEventListener("click", handleBackHomeBtn);
