import { getRecent, getUrlList, loginUser } from '../api';
import { ContentArgs, DomDetails, User } from '../types';

class DomManager {
    user: User | null;
    lists: any;

    //const host = 'https://spendless-pg.herokuapp.com';

    constructor() {
        this.user = null;
    }

    loginUser = async (email: string) => {
        this.user = await loginUser({
            email,
        });
    };

    // remove the 'any'
    sendMessage = (tabId: number, message: ContentArgs) => {
        chrome.tabs.sendMessage(tabId, message);
    };

    // remove anys
    navHelper = async (details: DomDetails) => {
        const { tabId, url } = details;
        this.lists = await getUrlList();
        console.log(details);
        if (details.url !== undefined && details.frameId === 0) {
            let found = false;
            for (const [key, value] of Object.entries(this.lists.whitelist)) {
                const regex = (value as any).regex;
                const query = (value as any).query;
                const description = (value as any).description;
                regex.forEach((r: any) => {
                    let re = new RegExp(r, 'i');
                    if (url?.match(re) && !found) {
                        found = true;
                        const blacklisted = this.lists.blacklist.find(
                            (b: any) => {
                                let bre = new RegExp(b, 'i');
                                return url.match(bre);
                            }
                        );
                        if (!blacklisted) {
                            chrome.identity.getProfileUserInfo(
                                async (userInfo) => {
                                    await this.loginUser(userInfo.email);
                                    if (this.user) {
                                        let recent = await getRecent(
                                            this.user.id
                                        );
                                        this.sendMessage(tabId, {
                                            recent,
                                            page: key,
                                            query,
                                            description,
                                            url,

                                            // can we remove and access through domManager?
                                            user: this.user,
                                            totalRegex: this.lists.totalRegex,
                                            processButtons:
                                                this.lists.processButtons,
                                            processButtonEndWords:
                                                this.lists
                                                    .processButtonEndWords,
                                        });
                                    }
                                }
                            );
                        }
                    }
                });
            }
        }
    };
}

export const domManager = new DomManager();
