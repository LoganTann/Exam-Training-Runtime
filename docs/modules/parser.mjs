import { marked } from "./deps.mjs";

export function parseFileContent(template) {
    const lines = template.split("\n");
    const header = [];
    const questions = [];
    /** @type {QuestionBuilder | null} */
    let currentQuestion = null;
    for (const line of lines) {
        if (line.startsWith("##")) {
            if (currentQuestion) {
                questions.push(currentQuestion.toObject);
            }
            currentQuestion = new QuestionBuilder(line.substring(2));
            continue;
        }
        if (!currentQuestion) {
            header.push(line.trim());
            continue;
        }
        if (line.startsWith("-")) {
            currentQuestion.addOption(line.substring(1), false);
        } else if (line.startsWith("*")) {
            currentQuestion.addOption(line.substring(1), true);
        } else if (line.startsWith(">>")) {
            currentQuestion.addComment(line.substring(2));
        } else if (line.startsWith("\\")) {
            currentQuestion.putNewLine(line.substring(1));
        } else {
            currentQuestion.putNewLine(line);
        }
    }
    // Push last question if it exists
    if (currentQuestion) {
        questions.push(currentQuestion.toObject);
    }
    return {
        header: marked.parse(header.join("\n")),
        questions: questions,
    };
}

const modes = {
    question: 1,
    answer: 2,
    comment: 3,
};

/**
 * @typedef {{
 *  question: string,
 *  options: string[],
 *  comments: string[],
 *  correctAnswers: number[]
 *  type: "single" | "multiple"
 * }} CompiledQuestion
 */

export class QuestionBuilder {
    question = "";
    /** @type {string[]} */
    options = [];
    /** @type {string[]} */
    comments = [];
    /** @type {number[]} */
    correctAnswers = [];
    get type() {
        return this.correctAnswers.length > 1 ? "multiple" : "single";
    }
    get toObject() {
        return /** @type {CompiledQuestion} */{
            question: toHtml(this.question),
            options: this.options.map(toHtml),
            comments: this.comments.map(toHtml),
            correctAnswers: this.correctAnswers,
            type: this.type,
        };
    }

    constructor(line) {
        this.question = line;
    }

    _mode = modes.question;
    get _index() {
        return this.options.length - 1;
    }

    addOption(text, isAnswser) {
        this._mode = modes.answer;
        this.options.push(text);
        this.comments.push("");
        if (isAnswser) {
            this.correctAnswers.push(this._index);
        }
    }
    addComment(text) {
        this._mode = modes.comment;
        this.comments[this._index] = text;
    }
    putNewLine(text) {
        if (this._mode == modes.question) {
            this.question += `\n${text}`;
        } else if (this._mode == modes.comment) {
            this.comments[this._index] += `\n${text}`;
        } else {
            this.options[this._index] += `\n${text}`;
        }
    }
}

/**
 * Trims the block, adds two spaces after every new lines, and converts MD to HTML.
 * @param {string} text 
 * @returns {string}
 */
function toHtml(text) {
    return marked.parseInline(text.trim().replace(/\n/g, "  \n"));
}
