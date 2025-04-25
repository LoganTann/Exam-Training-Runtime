import QuestionsRemainingComponent from "./questions-remaining.mjs";
import TimerComponent from "./timer.mjs"

export function registerComponents() {
    TimerComponent.register();
    QuestionsRemainingComponent.register();
}