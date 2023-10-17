import { host, dev } from './environment';
import { ContentArgs } from './types';

//const host = 'https://spendless-pg.herokuapp.com';
const PRICE_MAX = 10000;
let processedCurrent = false;
let observer: any = null;

const createObserver = (request: ContentArgs, oldValue: number) => {
    const { user, url, query, description, page, recent, totalRegex } = request;
    return new MutationObserver((events) => {
        setPage(user, url, query, description, page, recent, totalRegex).then(
            (a) => {
                if (a.amount != oldValue) {
                    listenerHelper(request);
                }
            }
        );
    });
};

const listenerHelper = async (request: ContentArgs) => {
    if (request) {
        const {
            user,
            url,
            query,
            description,
            page,
            recent,
            totalRegex,
            processButtonEndWords,
            processButtons,
        } = request;
        console.log(request);
        window.setTimeout(async () => {
            if (page != null) {
                const { total, tid, amount } = await setPage(
                    user,
                    url,
                    query,
                    description,
                    page,
                    recent,
                    totalRegex,
                    true
                );

                closeAll();
                if (observer) {
                    observer.disconnect();
                }
                observer = createObserver(request, amount);
                observer.observe(document, {
                    characterDataOldValue: true,
                    subtree: true,
                    childList: true,
                    characterData: true,
                    attributes: true,
                });

                if (amount > 0) {
                    const processButton = findProcessButton(
                        processButtons,
                        processButtonEndWords,
                        tid,
                        user.id
                    );
                    var popup = document.createElement('div');
                    popup.className = 'spendless-ext-root';
                    document.getElementsByTagName('html')[0].appendChild(popup);

                    var app = document.createElement('div');
                    app.className = 'spendless-ext-app spendless-ext-popup';
                    popup.appendChild(app);

                    var mainText = document.createElement('span');
                    mainText.className = 'spendless-ext-popup-header';
                    mainText.innerHTML = String(
                        dev ? amount : 'Spend less, save more!'
                    );
                    app.appendChild(mainText);

                    var overall = document.createElement('div');
                    overall.className = 'spendless-ext-summary-lines';
                    app.appendChild(overall);

                    var budDiv = document.createElement('div');
                    budDiv.className = 'spendless-ext-summary-div';

                    var budVal = document.createElement('span');
                    budVal.className = 'spendless-ext-summary-value';
                    budVal.innerHTML = `${getPercentage(
                        Math.ceil(total),
                        Math.ceil(user.budget)
                    )}%`;
                    budDiv.appendChild(budVal);

                    var budLine = document.createElement('span');
                    budLine.className =
                        'spendless-ext-summary-line spendless-ext-small-cap-font';
                    budLine.innerHTML = 'AMOUNT SPENT';
                    budDiv.appendChild(budLine);

                    overall.appendChild(budDiv);

                    var leftDiv = document.createElement('div');
                    leftDiv.className = 'spendless-ext-summary-div';

                    var leftVal = document.createElement('span');
                    leftVal.className = 'spendless-ext-summary-value';
                    leftVal.innerHTML = getCurrency(
                        Math.ceil(user.budget) - Math.ceil(total)
                    ).replace('.00', '');
                    leftDiv.appendChild(leftVal);

                    var leftLine = document.createElement('span');
                    leftLine.className =
                        'spendless-ext-summary-line spendless-ext-small-cap-font';
                    leftLine.innerHTML = 'LEFT IN BUDGET';
                    leftDiv.appendChild(leftLine);

                    overall.appendChild(leftDiv);

                    var hideMessage = document.createElement('div');
                    hideMessage.className = 'spendless-ext-popup-hide';
                    hideMessage.innerHTML = 'Hide this message';
                    hideMessage.onclick = function (ev) {
                        closeAll();
                    };

                    app.appendChild(hideMessage);

                    if (page !== 'processed') {
                        var ignoreMessage = document.createElement('div');
                        ignoreMessage.className = 'spendless-ext-popup-ignore';
                        ignoreMessage.innerHTML = 'Ignore this transaction';
                        ignoreMessage.onclick = async function (ev) {
                            await ignoreTransaction(user.id, tid);
                            closeAll();
                            alertMessage(
                                "<span style='font-weight: 800'>Got it!</span> This transaction won't be included in your budget."
                            );
                        };
                        app.appendChild(ignoreMessage);
                    }
                }
            }
        }, 1500);
    }
};

const setPage = async (
    user: any,
    url: any,
    q: any,
    d: any,
    p: any,
    r: any,
    pattern: any,
    update = false
) => {
    const uid = user.id;
    let amount = 0;
    let description = '';
    let div = null;
    if (p != 'processed') {
        try {
            let descQuery = '';
            if (d) {
                descQuery = document.querySelector(d)?.textContent.trim();
            }
            if (descQuery && descQuery != '') {
                description = descQuery;
            } else {
                const baseUrl = url.match(/^https?:\/\/[^#?\/]+/);
                description = baseUrl || '';
            }

            const bestTotalAmount = tryQueryingWholePage(pattern);
            const bestListedAmount =
                bestTotalAmount[0] === 0
                    ? getPriceFromDivs([...document.querySelectorAll(q)])
                    : bestTotalAmount;

            amount = Math.max(bestListedAmount[0], bestTotalAmount[0]);
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

    console.log(`Spendlo Page --- Amount: ${amount}`);

    if (update) {
        if (processedCurrent) {
            console.log('not updating');
            return {
                amount: 0,
            };
        }
        const result = await updateUserPage(uid, amount, description, r?.id);
        return {
            total: result?.total,
            tid: result?.tid,
            amount,
            div,
        };
    }
    return {
        amount,
    };
};

chrome.runtime.onMessage.addListener(listenerHelper);

const ignoreTransaction = async (uid: any, id: any) => {
    try {
        const result = await fetch(`${host}/ignore`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid,
                id,
            }),
        });
        return result;
    } catch (error) {
        return 0;
    }
};

const updateUserPage = async (
    uid: any,
    amount: any,
    description: any,
    transId: any
): Promise<{ total: any; tid: any } | null> => {
    try {
        console.log('updating transaction');
        const result = await fetch(`${host}/add`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid,
                amount,
                description,
                tid: transId,
            }),
        });
        const { total, tid } = await result.json();
        return { total, tid };
    } catch (error) {
        return null;
    }
};

const processTransaction = async (uid: any, transId: any) => {
    if (!processedCurrent) {
        try {
            console.log('processing transaction');
            const result = await fetch(`${host}/process`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid,
                    tid: transId,
                }),
            });
            const { total } = await result.json();
            processedCurrent = true;
            return { total };
        } catch (error) {
            return 0;
        }
    }
};

const alertMessage = (text: any, time = 3000) => {
    var alert = document.createElement('div');
    alert.className = 'spendless-ext-popup-message';
    alert.innerHTML = text;
    document.getElementsByTagName('html')[0].appendChild(alert);
    window.setTimeout(function () {
        alert.style.display = 'none';
    }, time);
};

const closeAll = () => {
    const els = document.querySelectorAll('.spendless-ext-root');
    els.forEach((el) => {
        try {
            el.remove();
        } catch (e) {
            console.log(e);
        }
    });
};

const findProcessButton = function (
    processButtons: any,
    processButtonEndWords: any,
    tid: any,
    uid: any
) {
    const group1 = processButtons.map((p: any) => p.trim()).join('|');
    const group2 = processButtonEndWords.map((p: any) => p.trim()).join('|');
    const reg = new RegExp(`^(${group1})(${group2}){0,1}$`, 'i');
    let divs = [
        ...document.querySelectorAll('a, span, input, button'),
    ] as HTMLElement[];
    divs = divs.filter(
        (div) =>
            div.textContent &&
            div.textContent.trim().replace(/\n/g, '').match(reg) !== null
    );
    divs.forEach((div) => {
        if (dev) {
            div.style.background = 'green';
        }
        div.onmouseover = function (ev: any) {
            processTransaction(uid, tid);
        };
    });
    return divs;
};

const checkRegex = (pattern: any, div: any) => {
    const reg = new RegExp(pattern, 'i');
    return div.textContent.trim().replaceAll('\n', '').match(reg);
};

const tryQueryingWholePage = (pattern: any): any[] => {
    let divs = [...document.querySelectorAll('div, tr, li, dl')];
    divs = divs.filter((a) => checkRegex(pattern, a) !== null);
    const minDiv = Math.min(...divs.map((d) => d.textContent?.length || 0));
    return getPriceFromDivs(
        divs.filter((d) => d.textContent?.length === minDiv)
    );
};

const getCurrency = (a: number) => {
    try {
        return a.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    } catch (e) {
        return '';
    }
};

const getPercentage = (a: any, b: any) => {
    return Math.floor(100 * Math.max(0, a / b));
};

const parseDiv = (n: any) => {
    var trimmedQuery = n.textContent
        .replaceAll(' ', '')
        .match(/\$?[1-9][0-9]*,?[0-9]*(\.[0-9][0-9])?/g);
    if (trimmedQuery) {
        return trimmedQuery.map((t: string) =>
            parseFloat(t.replace('$', '').replace(',', ''))
        );
    }
    return [];
};

const getPriceFromDivs = (divs: any): any[] => {
    if (divs.length === 0) {
        return [0];
    }
    let amounts = [0];
    divs.forEach((n: any) => {
        amounts = amounts.concat(
            parseDiv(n).filter((a: any) => a > 0 && a < PRICE_MAX)
        );
    });
    const maxAmount = Math.max(...amounts);
    const maxDiv = divs.find((d: any) => parseDiv(d).includes(maxAmount));
    return [maxAmount, maxDiv];
};
