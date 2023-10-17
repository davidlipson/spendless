import { domManager } from './dom';

(async () => {
    chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
        domManager.navHelper(details);
    });

    chrome.webNavigation.onCompleted.addListener(async (details) => {
        domManager.navHelper(details);
    });
})();
