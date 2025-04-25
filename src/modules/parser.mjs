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
            currentQuestion = new QuestionBuilder();
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
            currentQuestion.addComment(line.substring(1));
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

class QuestionBuilder {
    question = "";
    options = [];
    comments = [];
    correctAnswers = [];
    get type() {
        return this.correctAnswers.length > 1 ? "multiple" : "single";
    }
    get toObject() {
        return {
            question: this.question.trim(),
            options: this.options.map(toMarkdown),
            comments: this.comments.map(toMarkdown),
            correctAnswers: this.correctAnswers.map(toMarkdown),
            type: this.type,
        };
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

function toMarkdown(text) {
    return marked.parse(text.trim().replace(/\n/g, "  \\n"));
}

function unused_parseFrontMatter(fileContent) {
    const match = fileContent.match(/\s*---\s*([\s\S]*?)\s*---\s*(.*)/);
    if (!match) {
        return { metadata: {}, content: template };
    }
    const [metaString, content] = match;
    const metadata = {};
    for (const line of metaString.split("\n")) {
        const [key, value] = line.split(":").map((part) => part.trim());
        if (key && value) {
            metadata[key] = value;
        }
    }
    return [metadata, content];
}
