import { DomManager } from './dom';

(async () => {
    const backgroundDomManager = new DomManager();
    chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
        backgroundDomManager.navHelper(details);
    });

    chrome.webNavigation.onCompleted.addListener(async (details) => {
        backgroundDomManager.navHelper(details);
    });
})();
