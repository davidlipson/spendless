// TODO
// refactor to Jquery
chrome.runtime.onMessage.addListener(async function (request) {
    if (request.page != null) {
        const { user, url, query, description, page } = request;
        const { total } = await setPage(user, url, query, description, page);

        var popup = parent.document.createElement('div');
        popup.className = 'spendless-ext-root';
        parent.document.getElementsByTagName('html')[0].appendChild(popup);

        var app = parent.document.createElement('div');
        app.className = 'spendless-ext-app spendless-ext-popup';
        popup.appendChild(app);

        var mainText = parent.document.createElement('span');
        mainText.className = 'spendless-ext-popup-header';
        mainText.innerHTML = 'Spendless, Save more!';
        app.appendChild(mainText);

        var overall = parent.document.createElement('div');
        overall.className = 'spendless-ext-summary-lines';
        app.appendChild(overall);

        var budDiv = parent.document.createElement('div');
        budDiv.className = 'spendless-ext-summary-div';

        var budVal = parent.document.createElement('span');
        budVal.className = 'spendless-ext-summary-value';
        budVal.innerHTML = getCurrency(Math.ceil(total)).replace('.00', '');
        budDiv.appendChild(budVal);

        var budLine = parent.document.createElement('span');
        budLine.className =
            'spendless-ext-summary-line spendless-ext-small-cap-font';
        budLine.innerHTML = 'AMOUNT SPENT';
        budDiv.appendChild(budLine);

        overall.appendChild(budDiv);

        var leftDiv = parent.document.createElement('div');
        leftDiv.className = 'spendless-ext-summary-div';

        var leftVal = parent.document.createElement('span');
        leftVal.className = 'spendless-ext-summary-value';
        leftVal.innerHTML = getCurrency(Math.ceil(user.budget)).replace(
            '.00',
            ''
        );
        leftDiv.appendChild(leftVal);

        var leftLine = parent.document.createElement('span');
        leftLine.className =
            'spendless-ext-summary-line spendless-ext-small-cap-font';
        leftLine.innerHTML = 'LEFT IN BUDGET';
        leftDiv.appendChild(leftLine);

        overall.appendChild(leftDiv);

        var hideMessage = parent.document.createElement('div');
        hideMessage.className = 'spendless-ext-popup-hide';
        hideMessage.innerHTML = 'Hide this message';
        hideMessage.onclick = function (ev) {
            const els = parent.document.querySelectorAll('.spendless-ext-app');
            els.forEach((el) => {
                el.remove();
            });
        };

        app.appendChild(hideMessage);

        var ignoreMessage = parent.document.createElement('div');
        ignoreMessage.className = 'spendless-ext-popup-ignore';
        ignoreMessage.innerHTML = 'Ignore this transaction';
        ignoreMessage.onclick = async function (ev) {
            await updateUserPage(user.id, request.url, 0, '', false);
            const els = parent.document.querySelectorAll('.spendless-ext-app');
            els.forEach((el) => {
                el.remove();
            });
            alertMessage(
                "<span style='font-weight: 800'>Got it!</span> This transaction won't be included in your budget."
            );
        };
        app.appendChild(ignoreMessage);
    }
});

alertMessage = (text, time = 5000) => {
    var alert = parent.document.createElement('div');
    alert.className = 'spendless-ext-popup-message';
    alert.innerHTML = text;
    parent.document.getElementsByTagName('html')[0].appendChild(alert);
    window.setTimeout(function () {
        alert.style.display = 'none';
    }, time);
};

setPage = async (user, url, q, d, p) => {
    const uid = user.id;
    let amount = 0;
    let description = '';
    let found = false;
    if (p != 'processed') {
        try {
            let query = '';
            let descQuery = '';
            query = parent.document
                .querySelector(q)
                ?.textContent.replace(/[]+|[s]{2,}/g, ' ')
                .trim()
                .replace('$', '');
            if (d) {
                descQuery = parent.document
                    .querySelector(d)
                    ?.textContent.trim();
            }
            if (query && query != '') {
                try {
                    let result = parseFloat(query);
                    found = true;
                    if (!isNaN(result) && result > 0) {
                        amount = result;
                        if (descQuery && descQuery != '') {
                            description = descQuery;
                        } else {
                            const baseUrl = url.match(/^https?:\/\/[^#?\/]+/);
                            description = baseUrl || '';
                        }
                    } else {
                        throw 'Invalid query value';
                    }
                } catch (e) {
                    console.log(e);
                }
            } else {
                throw 'Query not found';
            }
        } catch (e) {
            console.log(e);
        }
    }

    const total = await updateUserPage(uid, url, amount, description, false);
    return { total };
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

updateUserPage = async (uid, url, amount, description, lastPurchase) => {
    try {
        const result = await fetch(`https://spendless-pg.herokuapp.com/page`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid,
                url,
                amount,
                description,
                lastPurchase,
            }),
        });
        const { total } = result.json();
        return total;
    } catch (error) {
        console.log(error);
        return 0;
    }
};
