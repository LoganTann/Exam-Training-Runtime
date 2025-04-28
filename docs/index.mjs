import InputFileComponent from "./modules/components/input-file.mjs";
import QuestionsRemainingComponent from "./modules/components/questions-remaining.mjs";
import TimerComponent from "./modules/components/timer.mjs";
import { parseFileContent } from "./modules/parser.mjs";
import { HeadlessTab } from "./modules/tabUtils.mjs";
import DemoSyntaxExample from "./questionPools/Demo -- Syntax Example.mjs";

const elements = {
    App: document.getElementById("App"),

    launcherLoadDemoBtn: document.getElementById("load-demo-file"),
    launcherFileInput: InputFileComponent.find("question-pool-input"),
    /** @type {HTMLFormElement} */
    launcherSettingsForm: document.querySelector("form#launcher-form"),
    /** @type {HTMLInputElement} */
    launcherQuestionsToPick: document.querySelector("input#questionsToPick"),
    launcherBlockquote: document.getElementById("launcher-file-meta"),

    quizLayout: document.getElementById("quiz-layout"),
    timerCmp: TimerComponent.find("timer"),
    questionsRemainingEl: QuestionsRemainingComponent.find("questions-remaining"),
    

    questionTextEl: document.getElementById("question-text"),
    optionsContainerEl: document.getElementById("options-container"),
    feedbackEl: document.getElementById("feedback"),
    nextBtn: document.getElementById("next-question-btn"),
    checkBtn: document.getElementById("submit-answer-button"),
    restartBtn: document.getElementById("restart-button"),
    scoreContainerEl: document.getElementById("score-container"),
    scorePercentEl: document.getElementById("score-percent"),
};

const globals = {
    config: {
        totalTime: 90,
        questionsToPick: 5,
        shuffle: true,
    },
    questionPool: parseFileContent(DemoSyntaxExample),
    quizState: {
        selectedQuestions: [],
        currentIndex: 0,
        userScore: 0,
        reset(questionPool) {
            this.selectedQuestions = questionPool;
            this.currentIndex = 0;
            this.userScore = 0;
        },
    },
};

// App Load 
window.addEventListener("DOMContentLoaded", () => {
    HeadlessTab.init();
});

// File selection
elements.launcherLoadDemoBtn.addEventListener("click", () => {
    globals.questionPool = parseFileContent(DemoSyntaxExample);
    openLauncherForm();
});
elements.launcherFileInput.addEventListener("file-uploaded", async() => {
    try {
        const fileContent = await elements.launcherFileInput.getFileContent();
        globals.questionPool = parseFileContent(fileContent);
        openLauncherForm();
    } catch(e) {
        if (e?.message) {
            alert(e.message);
        } else {
            throw e;
        }
    }
});

function openLauncherForm() {
    elements.launcherQuestionsToPick.value = String(globals.questionPool.questions.length || -1);
    elements.launcherQuestionsToPick.max = String(globals.questionPool.questions.length || -1);
    elements.launcherBlockquote.innerHTML = globals.questionPool.header;
    HeadlessTab.setTab("#launcher", 'launcher-form');
}

// Quiz settings
elements.launcherSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.launcherSettingsForm);
    globals.config.totalTime = Number(formData.get("totalTime")) * 60;
    globals.config.questionsToPick = Number(formData.get("questionsToPick"));
    globals.config.shuffle = Boolean(formData.get("shuffle"));
    try {
        startQuiz(globals.questionPool.questions);
    } catch (e) {
        if (e && e.message) {
            alert(e.message);
        }
        throw e;
    }
});

function startQuiz(questionPool) {
    globals.quizState.reset(questionPool);

    // Setup features: shuffle, timer, amount of questions
    if (globals.config.shuffle) {
        globals.quizState.selectedQuestions = globals.quizState.selectedQuestions.sort(() => Math.random() - 0.5);
    }
    if (globals.config.totalTime > 0) {
        elements.timerCmp.start(globals.config.totalTime);
        elements.timerCmp.classList.remove("hidden");
    } else {
        elements.timerCmp.classList.add("hidden");
    }
    if (globals.config.questionsToPick > 0) {
        globals.quizState.selectedQuestions = globals.quizState.selectedQuestions.slice(0, globals.config.questionsToPick);
    }
    elements.questionsRemainingEl.reset(globals.quizState.selectedQuestions.length);

    // Launch multiple-choice question view and render the first question
    HeadlessTab.setTab("#App", "question");
    renderQuestion();
}

function renderQuestion() {
    elements.quizLayout.dataset.mode = "question";
    /** @type {import("./modules/parser.mjs").CompiledQuestion} */
    const question = globals.quizState.selectedQuestions[globals.quizState.currentIndex];

    elements.questionTextEl.innerHTML = question.question;
    elements.optionsContainerEl.innerHTML = "";

    const inputType = question.type === "single" ? "radio" : "checkbox";

    let options = question.options.map((optionText, originalIndex) => ({
        text: optionText,
        index: originalIndex,
    }));
    if (globals.config.shuffle) {
        options.sort(() => Math.random() - 0.5);
    }

    // Now loop over the shuffled list to build UI
    options.forEach(({ text, index }) => {    
        const id = `quizCheckbox_${index}`;    
        const name = `quizOption_${globals.quizState.currentIndex}`;
        const value = String(index);
        const explanation = question.comments.at(index) || "";
        const item = document.createElement("div");
        item.innerHTML = `
            <label class="checkbox-card" for="${id}">
                <input type="${inputType}" id="${id}" name="${name}" value="${value}">
                <c-checkbox-icon></c-checkbox-icon>
                <div>
                    ${text}
                    <div class="hide-on-question explanation">${explanation}</div>
                </div>
            </label>
        `;
        elements.optionsContainerEl.appendChild(item);
    });

    // Update "questions remaining"
    elements.questionsRemainingEl.current = globals.quizState.currentIndex;
}

elements.checkBtn.addEventListener("click", () => {
    const q = globals.quizState.selectedQuestions[globals.quizState.currentIndex];
    const inputs = [...elements.optionsContainerEl.querySelectorAll("input")];

    // Indices that the user checked
    const checkedIndices = inputs.filter((inp) => inp.checked).map((inp) => parseInt(inp.value));

    // Evaluate correctness
    const correctSet = new Set(q.correctAnswers);
    const userSet = new Set(checkedIndices);

    // If user selected any *incorrect* => 0
    let fraction = 0;
    for (let val of userSet) {
        if (!correctSet.has(val)) {
            fraction = 0;
            showFeedback("incorrect", q, fraction);
            globals.quizState.userScore += 0;
            return;
        }
    }

    // If user didn't pick anything wrong but missed some correct => partial
    fraction = userSet.size / correctSet.size;
    if (fraction === 1) {
        showFeedback("correct", q, fraction);
    } else if (fraction > 0) {
        showFeedback("partial", q, fraction);
    } else {
        showFeedback("incorrect", q, fraction);
    }
    globals.quizState.userScore += fraction;
});

function showFeedback(status, question, fraction) {
    elements.quizLayout.dataset.mode = "answer";
    const correctAnswersText = question.correctAnswers.map((idx) => question.options[idx]).join("<br> ");
    if (status === "correct") {
        elements.feedbackEl.dataset.status = "correct";
        elements.feedbackEl.innerHTML = "Correct!";
    } else if (status === "partial") {
        elements.feedbackEl.dataset.status = "partial";
        const percent = (fraction * 100).toFixed(0);
        elements.feedbackEl.innerHTML = `Partially correct (${percent}%).<br/> Correct answers: ${correctAnswersText}`;
    } else {
        elements.feedbackEl.dataset.status = "incorrect";
        elements.feedbackEl.innerHTML = `Incorrect!<br/>Correct answers: <br>${correctAnswersText}`;
    }
}

elements.nextBtn.addEventListener("click", () => {
    globals.quizState.currentIndex++;
    if (globals.quizState.currentIndex >= globals.quizState.selectedQuestions.length) {
        endQuiz();
        return;
    }
    renderQuestion();
});

// @ts-ignore
window.restart = () => {
    elements.timerCmp.stop();
    HeadlessTab.setTab("#App", "launcher");
    HeadlessTab.setTab("#launcher", "launcher-form");
};

function endQuiz() {
    HeadlessTab.setTab("#App", "score-container");
    elements.timerCmp.stop();

    // Convert state.userScore to a final percentage
    const finalScore = (globals.quizState.userScore / globals.quizState.selectedQuestions.length) * 100;
    elements.scorePercentEl.textContent = finalScore.toFixed(2) + "%";
}
