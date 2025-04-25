import QuestionsRemainingComponent from "./modules/components/questions-remaining.mjs";
import TimerComponent from "./modules/components/timer.mjs";
import { parseFileContent } from "./modules/parser.mjs";
import DemoSyntaxExample from "./questionPools/Demo -- Syntax Example.mjs";

const elements = {
    App: document.getElementById("App"),
    quizLayout: document.getElementById("quiz-layout"),
    timerCmp: TimerComponent.find("timer"),
    questionsRemainingEl: QuestionsRemainingComponent.find("questions-remaining"),
    launchButton: document.getElementById("launch-button"),

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

window.addEventListener("DOMContentLoaded", () => {
    console.log(globals.questionPool.questions);
});

elements.launchButton.addEventListener("click", () => {
    startQuiz(globals.questionPool.questions);
});

function startQuiz(questionPool) {
    globals.quizState.reset(questionPool);

    // Setup features: shuffle, timer, amount of questions
    if (globals.config.shuffle) {
        globals.quizState.selectedQuestions = globals.quizState.selectedQuestions.sort(() => Math.random() - 0.5);
    }
    if (globals.config.totalTime > 0) {
        elements.timerCmp.start(globals.config.totalTime);
    }
    if (globals.config.questionsToPick > 0) {
        globals.quizState.selectedQuestions = globals.quizState.selectedQuestions.slice(0, globals.config.questionsToPick);
    }
    elements.questionsRemainingEl.reset(globals.quizState.selectedQuestions.length);

    // Launch multiple-choice question view and render the first question
    elements.App.dataset.section = "quiz-layout";
    renderQuestion();
}

function renderQuestion() {
    elements.quizLayout.dataset.mode = "question";
    /** @type {import("./modules/parser.mjs").CompiledQuestion} */
    const q = globals.quizState.selectedQuestions[globals.quizState.currentIndex];

    elements.questionTextEl.innerHTML = q.question;
    elements.optionsContainerEl.innerHTML = "";

    const inputType = q.type === "single" ? "radio" : "checkbox";

    let options = q.options.map((optionText, originalIndex) => ({
        text: optionText,
        index: originalIndex,
    }));
    if (globals.config.shuffle) {
        options.sort(() => Math.random() - 0.5);
    }

    // Now loop over the shuffled list to build UI
    options.forEach(({ text, index }) => {
        const wrapper = document.createElement("div");
        wrapper.className = "option-item";

        const input = document.createElement("input");
        input.type = inputType;
        input.name = "quizOption_" + globals.quizState.currentIndex; // group name
        // IMPORTANT: set the value to the *original* index
        input.value = String(index);

        // Use the same function for options so code blocks appear properly
        const label = document.createElement("label");
        label.innerHTML = text;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        elements.optionsContainerEl.appendChild(wrapper);
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

    // For the "correct answers" portion, we might just show them as text:
    const escapeHTML = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Build correct answer string
    const correctAnswersText = question.correctAnswers.map((idx) => escapeHTML(question.options[idx])).join(", ");

    if (status === "correct") {
        elements.feedbackEl.classList.add("correct");
        elements.feedbackEl.innerHTML = "Correct!";
    } else if (status === "partial") {
        elements.feedbackEl.classList.add("partial");
        const percent = (fraction * 100).toFixed(0);
        elements.feedbackEl.innerHTML = `Partially correct (${percent}%).<br/>
      Correct answers: ${correctAnswersText}`;
    } else {
        elements.feedbackEl.classList.add("incorrect");
        elements.feedbackEl.innerHTML = `Incorrect!<br/>
      Correct answers: ${correctAnswersText}`;
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

elements.restartBtn.addEventListener("click", () => {
    elements.App.dataset.section = "launcher";
});

function endQuiz() {
    elements.App.dataset.section = "score-container";
    elements.timerCmp.stop();

    // Convert state.userScore to a final percentage
    const finalScore = (globals.quizState.userScore / globals.quizState.selectedQuestions.length) * 100;
    elements.scorePercentEl.textContent = finalScore.toFixed(2) + "%";
    elements.scoreContainerEl.classList.remove("hidden");
}
