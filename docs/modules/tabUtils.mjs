
export class HeadlessTab {
    static init() {
        /** @type {NodeListOf<HTMLElement>} */
        const tabs = document.querySelectorAll("[data-tab]");
        for (const tab of tabs) {
            this.refreshTab(tab);
        }
    }

    static _queryElement(elementQuery) {
        if (typeof elementQuery === "string") {
            elementQuery = document.querySelector(elementQuery + "[data-tab]");
        }
        if (! elementQuery?.dataset.tab) {
            throw new Error(`Requested element is not a tab`);
        }
        return elementQuery;
    }

    static refreshTab(elementQuery) {
        const tabContainer = this._queryElement(elementQuery);
        const openedTab = tabContainer.dataset.tab;
        const tabs = tabContainer.querySelectorAll("[data-tab-id]");
        for (const tab of tabs) {
            if (tab.dataset.tabId == openedTab) {
                tab.classList.remove("hidden");
            } else {
                tab.classList.add("hidden");
            }
        }
    }
    static setTab(elementQuery, tabId) {
        const tabContainer = this._queryElement(elementQuery);
        tabContainer.dataset.tab = tabId;
        this.refreshTab(tabContainer);
    }
}