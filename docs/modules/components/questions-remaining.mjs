export default class QuestionsRemainingComponent extends HTMLElement {
    static register() {
        customElements.define("c-questions-remaining", QuestionsRemainingComponent);
    }
    /**
     * @param {string} id 
     * @returns {QuestionsRemainingComponent}
     */
    static find(id) {
        const found = document.getElementById(id);
        return (found instanceof QuestionsRemainingComponent) ? found : null;
    }

    render() {
        this.innerHTML = `
            Questions remaining: ${this.remaining}
        `;
    }

    current = 0;
    total = 0;
    get remaining() {
        const result = Number(this.total) - Number(this.current);
        return Math.max(0, result);
    }

    static observedAttributes = ["current"];
    attributeChangedCallback() {
        this.render();
    }

    reset(total) {
        this.total = total;
        this.current = 0;
    }
}
