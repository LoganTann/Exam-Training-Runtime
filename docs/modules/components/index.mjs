import CheckboxCardComponent from "./checkbox.mjs";
import InputFileComponent from "./input-file.mjs";
import QuestionsRemainingComponent from "./questions-remaining.mjs";
import TimerComponent from "./timer.mjs"

export function registerComponents() {
    TimerComponent.register();
    InputFileComponent.register();
    QuestionsRemainingComponent.register();
    CheckboxCardComponent.register();
}