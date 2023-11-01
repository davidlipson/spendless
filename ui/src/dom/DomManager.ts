import {
    addTransaction,
    dev,
    getRecent,
    getUrlList,
    ignoreTransaction,
    loginUser,
    processTransaction,
} from '../api';
import { getCurrency, getPercentage } from '../helpers/mathFns';
import { DomDetails, User } from '../types';

export enum DropdownCSS {
    ROOT = 'spendlo-ext-root',
}

export interface DomManagerCreate {
    user?: User;
    lists?: any;
    recent?: any;
    whitelistKey?: string;
    whitelistEntry?: any;
    url?: string;
}

export class DomManager {
    PRICE_MAX = 10000;
    observer?: MutationObserver;
    user?: User;
    lists?: any;
    whitelistEntry?: any;
    whitelistKey?: any;
    url?: string;
    tid?: string;
    total?: number;
    processedCurrent = false;
    amount?: number;
    description?: string;
    recent?: any;

    constructor(args?: DomManagerCreate) {
        if (!args) return;
        const { user, lists, recent, whitelistKey, whitelistEntry, url } = args;
        this.user = user;
        this.lists = lists;
        this.recent = recent;
        this.whitelistKey = whitelistKey;
        this.whitelistEntry = whitelistEntry;
        this.url = url;
    }

    loginUser = async (email: string): Promise<void> => {
        this.user = await loginUser({
            email,
        });
    };

    setObserver = (): void => {
        this.observer = new MutationObserver(() => {
            this.setPage().then((a) => {
                if (a.amount != this.amount) {
                    this.listenerHelper();
                }
            });
        });
    };

    listenerHelper = async () => {
        console.log('listener', this);
        window.setTimeout(async () => {
            if (!this.user) return;
            if (this.whitelistKey != null) {
                await this.setPage(true);
                this.closeAll();
                if (this.observer) {
                    this.observer.disconnect();
                }
                this.setObserver();
                this.observer?.observe(document, {
                    characterDataOldValue: true,
                    subtree: true,
                    childList: true,
                    characterData: true,
                    attributes: true,
                });

                if (this.amount && this.amount > 0) {
                    this.findProcessButton();
                    this.generatePopup();
                }
            }
        }, 1500);
    };

    generatePopup = () => {
        if (!this.user) {
            this.closeAll();
            return;
        }
        var popup = document.createElement('div');
        popup.className = DropdownCSS.ROOT;
        document.getElementsByTagName('html')[0].appendChild(popup);

        var app = document.createElement('div');
        app.className = 'spendlo-ext-app spendlo-ext-popup';
        popup.appendChild(app);

        var mainText = document.createElement('span');
        mainText.className = 'spendlo-ext-popup-header';
        mainText.innerHTML = 'Spend less, save more!';
        app.appendChild(mainText);

        var overall = document.createElement('div');
        overall.className = 'spendlo-ext-summary-lines';
        app.appendChild(overall);

        var budDiv = document.createElement('div');
        budDiv.className = 'spendlo-ext-summary-div';

        var budVal = document.createElement('span');
        budVal.className = 'spendlo-ext-summary-value';
        budVal.innerHTML = `${getPercentage(
            Math.ceil(this.total || 0),
            Math.ceil(this.user.budget)
        )}%`;
        budDiv.appendChild(budVal);

        var budLine = document.createElement('span');
        budLine.className =
            'spendlo-ext-summary-line spendlo-ext-small-cap-font';
        budLine.innerHTML = 'AMOUNT SPENT';
        budDiv.appendChild(budLine);

        overall.appendChild(budDiv);

        var leftDiv = document.createElement('div');
        leftDiv.className = 'spendlo-ext-summary-div';

        var leftVal = document.createElement('span');
        leftVal.className = 'spendlo-ext-summary-value';
        leftVal.innerHTML = getCurrency(
            Math.ceil(this.user.budget) - Math.ceil(this.total || 0)
        ).replace('.00', '');
        leftDiv.appendChild(leftVal);

        var leftLine = document.createElement('span');
        leftLine.className =
            'spendlo-ext-summary-line spendlo-ext-small-cap-font';
        leftLine.innerHTML = 'LEFT IN BUDGET';
        leftDiv.appendChild(leftLine);

        overall.appendChild(leftDiv);

        var hideMessage = document.createElement('div');
        hideMessage.className = 'spendlo-ext-popup-hide';
        hideMessage.innerHTML = 'Hide this message';

        hideMessage.onclick = () => {
            this.closeAll();
        };

        app.appendChild(hideMessage);

        if (this.whitelistKey !== 'processed') {
            var ignoreMessage = document.createElement('div');
            ignoreMessage.className = 'spendlo-ext-popup-ignore';
            ignoreMessage.innerHTML = 'Ignore this transaction';
            ignoreMessage.onclick = async () => {
                await this.ignoreTransaction();
                this.closeAll();
                this.alertMessage(
                    `<span style='font-weight: 800;'>Got it!</span> 
                    This transaction won't be included in your budget.`
                );
            };
            app.appendChild(ignoreMessage);
        }
    };

    setPage = async (update = false) => {
        let amount = 0;
        let div = null;
        if (this.whitelistKey != 'processed') {
            try {
                let descQuery = '';
                if (this.whitelistEntry.description) {
                    descQuery = document
                        .querySelector(this.whitelistEntry.description)
                        ?.textContent.trim();
                }
                if (descQuery && descQuery != '') {
                    this.description = descQuery;
                } else {
                    const match = this.url?.match(/^https?:\/\/[^#?\/]+/);
                    this.description = match
                        ? match[0]
                              .replace(/^https?:\/\//, '')
                              .replace('www.', '')
                              .replace('.com', '')
                        : '';
                }

                const bestTotalAmount = this.tryQueryingWholePage();
                const bestListedAmount =
                    bestTotalAmount[0] === 0
                        ? this.getPriceFromDivs([
                              ...document.querySelectorAll(
                                  this.whitelistEntry.query
                              ),
                          ])
                        : bestTotalAmount;

                amount = Math.max(bestListedAmount[0], bestTotalAmount[0]);
                console.log('amount', amount);
                div =
                    amount === bestTotalAmount[0]
                        ? bestTotalAmount[1]
                        : bestListedAmount[1];
                if (dev && div) {
                    div.style.background = 'red';
                }
            } catch (e) {
                console.log(e);
            }
        }

        if (update) {
            if (this.processedCurrent) {
                return {
                    amount: 0,
                };
            }
            this.amount = amount;
            const result = await this.updateUserPage();
            this.tid = result?.tid;
            this.total = result?.total;
            return {
                amount,
                div,
            };
        }
        return {
            amount,
        };
    };

    ignoreTransaction = async (): Promise<void> => {
        if (!this.user || !this.tid) return;
        try {
            ignoreTransaction(this.user.id, this.tid);
        } catch (error) {
            console.log(error);
        }
    };

    processTransaction = async (): Promise<void> => {
        if (!this.user || !this.tid) return;
        if (!this.processedCurrent) {
            try {
                const result = await processTransaction(this.user.id, this.tid);
                this.processedCurrent = true;
                const { total } = await result.json();
                this.total = total;
                this.closeAll();
                window.setTimeout(() => {
                    this.generatePopup();
                }, 500);
            } catch (error) {
                console.log(error);
            }
        }
    };

    updateUserPage = async (): Promise<{
        total: number;
        tid: string;
    } | null> => {
        if (!this.user) return null;
        try {
            const result = await addTransaction(
                this.user.id,
                this.amount,
                this.description,
                this.tid
            );
            const { total, tid } = await result.json();
            return { total, tid };
        } catch (error) {
            return null;
        }
    };

    parseDiv = (n: HTMLElement): number[] => {
        if (n.textContent === null) return [];
        const reg = new RegExp(this.lists.amountRegex, 'g');
        const trimmedQuery = n.textContent.replace(/ /g, '').match(reg);
        console.log('trimmedQuery', trimmedQuery);
        if (trimmedQuery) {
            return trimmedQuery.map((t) =>
                parseFloat(t.replace('$', '').replace(',', ''))
            );
        }
        return [];
    };

    alertMessage = (text: string, time = 3000): void => {
        const alert = document.createElement('div');
        alert.className = 'spendlo-ext-popup-message';
        alert.innerHTML = text;
        document.getElementsByTagName('html')[0].appendChild(alert);
        window.setTimeout(function () {
            alert.style.display = 'none';
        }, time);
    };

    closeAll = () => {
        const els = document.querySelectorAll(`.${DropdownCSS.ROOT}`);
        els.forEach((el) => {
            try {
                el.remove();
            } catch (e) {
                console.log(e);
            }
        });
    };

    findProcessButton = (): HTMLElement[] => {
        if (!this.user || !this.tid) return [];
        const group1 = this.lists.processButtons
            .map((p: any) => p.trim())
            .join('|');
        const group2 = this.lists.processButtonEndWords
            .map((p: any) => p.trim())
            .join('|');
        const reg = new RegExp(`^(${group1})(${group2}){0,1}$`, 'i');
        let divs = [
            ...document.querySelectorAll('a, span, input, button'),
        ] as HTMLElement[];
        divs = divs.filter(
            (div) =>
                div.textContent &&
                div.textContent.trim().replace(/\n/g, '').match(reg) !== null
        );

        // TODO: not always working!
        divs.forEach((div) => {
            if (dev) {
                div.style.background = 'green';
                div.onmouseover = async () => {
                    await this.processTransaction();
                };
            } else {
                div.onmousedown = async () => {
                    await this.processTransaction();
                };
            }
        });
        return divs;
    };

    checkRegex = (
        pattern: string,
        div: HTMLElement
    ): RegExpMatchArray | null | undefined => {
        const reg = new RegExp(pattern, 'i');
        return div.textContent?.trim().replace(/\n/g, '').match(reg);
    };

    tryQueryingWholePage = (): number[] => {
        const pattern = `${this.lists.totalRegex}.*${this.lists.amountRegex}`;
        let divs = [
            ...document.querySelectorAll('div, tr, li, dl'),
        ] as HTMLElement[];
        divs = divs.filter((a) => this.checkRegex(pattern, a) !== null);
        const minDiv = Math.min(...divs.map((d) => d.textContent?.length || 0));
        return this.getPriceFromDivs(
            divs.filter((d) => d.textContent?.length === minDiv)
        );
    };

    getPriceFromDivs = (divs: HTMLElement[]): any[] => {
        if (divs.length === 0) {
            return [0];
        }
        let amounts = [0];
        divs.forEach((n) => {
            amounts = amounts.concat(
                this.parseDiv(n).filter((a) => a > 0 && a < this.PRICE_MAX)
            );
        });
        const maxAmount = Math.max(...amounts);
        const maxDiv = divs.find((d) => this.parseDiv(d).includes(maxAmount));
        return [maxAmount, maxDiv];
    };

    navHelper = async (details: DomDetails) => {
        const { tabId, url } = details;
        this.lists = await getUrlList();
        if (details.url !== undefined && details.frameId === 0) {
            let found = false;
            for (const [key, value] of Object.entries(this.lists.whitelist)) {
                const regex = (value as any).regex;
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
                                        this.recent = await getRecent(
                                            this.user.id
                                        );
                                        this.whitelistKey = key;
                                        this.whitelistEntry = value;
                                        this.url = url;
                                        chrome.tabs.sendMessage(tabId, {
                                            ...this,
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
