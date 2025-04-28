export default class QuestionsRemainingComponent extends HTMLElement {
    static register() {
        customElements.define("c-questions-remaining", QuestionsRemainingComponent);
    }
    static find(id) {
        const found = document.getElementById(id);
        if (found instanceof QuestionsRemainingComponent) {
            return found;
        }
        throw new Error(`Err: #${id} should be a QuestionsRemainingComponent instance`);
    }

    render() {
        this.innerHTML = `
            Questions remaining: ${this.remaining}
        `;
    }

    get current() {
        const asNumber = Number(this.getAttribute("current"));
        return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : 0;
    }
    set current(value) {
        this.setAttribute("current", String(value));
    }
    get total() {
        const asNumber = Number(this.getAttribute("total"));
        return Number.isFinite(asNumber) && asNumber > 0 ? asNumber : 0;
    }
    set total(value) {
        this.setAttribute("total", String(value));
    }
    
    get remaining() {
        const result = this.total - this.current;
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
