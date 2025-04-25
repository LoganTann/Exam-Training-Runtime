export default class TimerComponent extends HTMLElement {
    static register() {
        customElements.define("c-timer", TimerComponent);
    }
    /**
     * @param {string} id 
     * @returns {TimerComponent}
     */
    static find(id) {
        const found = document.getElementById(id);
        return (found instanceof TimerComponent) ? found : null;
    }

    render() {
        this.innerHTML = `
            <span part="text" style="font-weight: bold;">
                Time: ${this.timeString}
            </span>
        `;
    }

    timerInterval = null;
    timeRemaining = 0;
    get timeString() {
        if (this.timeRemaining <= 0) {
            return "00:00";
        }
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = String(this.timeRemaining % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    reset() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timeRemaining = 0;
    }
    start(timeRemaining) {
        this.timeRemaining = timeRemaining;
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        return this.timerInterval;
    }
    stop() {
        this.reset();
    }
    updateTimer() {
        if (this.timeRemaining <= 0) {
            this.stop();
            const event = new CustomEvent("time");
            dispatchEvent(event);
        } else {
            this.timeRemaining--;
            this.render();
        }
    }
}
