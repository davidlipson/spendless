//const host = 'http://localhost:5000';
const host = 'https://spendless-pg.herokuapp.com';

listenerHelper = async (request) => {
    const { user, url, query, description, page, recent, dev, totalRegex } =
        request;
    closeAll();
    window.setTimeout(async () => {
        if (
            request.page != null &&
            !document.querySelector('.spendless-ext-root')
        ) {
            const { total, tid, amount } = await setPage(
                user,
                url,
                query,
                description,
                page,
                recent,
                dev,
                totalRegex
            );

            if (amount > 0) {
                var popup = document.createElement('div');
                popup.className = 'spendless-ext-root';
                document.getElementsByTagName('html')[0].appendChild(popup);

                var app = document.createElement('div');
                app.className = 'spendless-ext-app spendless-ext-popup';
                popup.appendChild(app);

                var mainText = document.createElement('span');
                mainText.className = 'spendless-ext-popup-header';
                mainText.innerHTML = 'Spend less, Save more!';
                app.appendChild(mainText);

                var overall = document.createElement('div');
                overall.className = 'spendless-ext-summary-lines';
                app.appendChild(overall);

                var budDiv = document.createElement('div');
                budDiv.className = 'spendless-ext-summary-div';

                var budVal = document.createElement('span');
                budVal.className = 'spendless-ext-summary-value';
                budVal.innerHTML = getCurrency(Math.ceil(total)).replace(
                    '.00',
                    ''
                );
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
                leftVal.innerHTML = getCurrency(Math.ceil(user.budget)).replace(
                    '.00',
                    ''
                );
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
};

closeAll = () => {
    const els = document.querySelectorAll('.spendless-ext-root');
    els.forEach((el) => {
        try {
            el.remove();
        } catch (e) {
            console.log(e);
        }
    });
};

alertMessage = (text, time = 3000) => {
    var alert = document.createElement('div');
    alert.className = 'spendless-ext-popup-message';
    alert.innerHTML = text;
    document.getElementsByTagName('html')[0].appendChild(alert);
    window.setTimeout(function () {
        alert.style.display = 'none';
    }, time);
};

setPage = async (user, url, q, d, p, r, dev, pattern) => {
    const uid = user.id;
    let amount = 0;
    let description = '';
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

            const bestTotalAmount = tryQueryingWholePage(pattern, dev);
            const bestListedAmount =
                bestTotalAmount === 0
                    ? getPriceFromDivs([...document.querySelectorAll(q)], dev)
                    : 0;

            amount = Math.max(bestListedAmount, bestTotalAmount);
        } catch (e) {
            console.log(e);
        }
    }

    if (dev) {
        console.log(`Spendlo Page --- Amount: ${amount}, Query: ${q}`);
    }

    const { total, tid } = await updateUserPage(
        uid,
        amount,
        description,
        p == 'processed',
        r
    );
    return { total, tid, amount };
};

parseDiv = (n) => {
    var trimmedQuery = n.textContent
        .replaceAll(' ', '')
        .match(/\$?[1-9][0-9]*,?[0-9]*(\.[0-9][0-9])?/g);
    if (trimmedQuery) {
        return trimmedQuery.map((t) =>
            parseFloat(t.replace('$', '').replace(',', ''))
        );
    }
    return [];
};

getPriceFromDivs = (divs, dev = false) => {
    if (divs.length === 0) {
        return 0;
    }
    amounts = [0];
    divs.forEach((n) => {
        amounts = amounts.concat(parseDiv(n));
    });
    maxAmount = Math.max(...amounts);
    maxDiv = divs.find((d) => parseDiv(d).includes(maxAmount));
    if (dev) {
        maxDiv.style.border = 'thick solid #0000FF';
    }
    let observer = new MutationObserver((e) => {
        console.log('test', e);
    });
    observer.observe(maxDiv.parentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
    });
    return maxAmount;
};

tryQueryingWholePage = (pattern, dev = false) => {
    console.log(pattern);
    const reg = new RegExp(pattern, 'i');
    console.log(reg);
    divs = [...document.querySelectorAll('div, tr, li, dl')];
    divs = divs.filter((a) =>
        a.textContent.trim().replaceAll('\n', '').match(reg)
    );
    minDiv = Math.min(...divs.map((d) => d.textContent.length));
    return getPriceFromDivs(
        divs.filter((d) => d.textContent.length === minDiv),
        dev
    );
};

getCurrency = (a) => {
    try {
        return a.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    } catch (e) {
        return '';
    }
};

getPercentage = (a, b) => {
    return Math.floor(100 * Math.max(0, a / b));
};

convertToDateString = (date) => {
    return date.split('T')[0].replaceAll('-', '/');
};

updateUserPage = async (uid, amount, description, lastPurchase, recent) => {
    try {
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
                lastPurchase,
                tid: recent?.id,
            }),
        });
        const { total, tid } = await result.json();
        return { total, tid };
    } catch (error) {
        return 0;
    }
};

ignoreTransaction = async (uid, id) => {
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
        console.log(error);
        return 0;
    }
};

chrome.runtime.onMessage.addListener(listenerHelper);

/* TODO: check when page dom updates
window.setTimeout(async () => {
    document.addEventListener('DOMSubtreeModified', (e) => {
        console.log(e);
    });
}, 3000);
*/
