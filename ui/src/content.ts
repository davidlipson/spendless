import { DomManager, DomManagerCreate } from './dom';

const generateAndRunDom = async (request: DomManagerCreate) => {
    const domManager = new DomManager(request);
    await domManager.listenerHelper();
};
chrome.runtime.onMessage.addListener(generateAndRunDom);
