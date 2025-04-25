import demoFile from "../questionPools/Demo -- Syntax Example.mjs";


export async function getQuestionFiles() {

}

// render(html`<${App} name="World" />`, document.body);    

class QuestionPoolList extends HTMLElement {


    _pendingFileContent;
    loadQuestionPoolFile(fileContent) {
        this._pendingFileContent = fileContent;
    }
    loadDemoFile() {
        this.loadQuestionPoolFile(demoFile);
    }
}
