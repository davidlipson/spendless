const Whitelist = {
    processed: {
        query: '',
        regex: ['/gp/buy/thankyou'],
    },
    checkout: {
        query: '.grand-total-price, .payment-due__price, .a-price-whole',
        description: '#productTitle, #title',
        regex: [
            'amazon.+/gp/buy/',
            '/checkouts',
            '/checkout',
            '/gp',
            '/dp',
            '/buy/',
        ],
    },
    cart: {
        query: '#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole, .price, .gl-body-l',
        regex: ['amazon.+/gp/cart', 'amazon.+/cart', '/cart', '/dp'],
    },
};

const Blacklist = ['amazon.+/dp/', 'amazon.+/gp/product/'];

chrome.webNavigation.onCompleted.addListener(async (details) => {
    const { frameId, parentFrameId, processId, tabId, timeStamp, url } =
        details;
    if (url !== undefined && frameId === 0) {
        let found = false;
        for (const [key, value] of Object.entries(Whitelist)) {
            value.regex.forEach((r) => {
                let re = new RegExp(r);
                if (url?.match(re) && !found) {
                    found = true;
                    let blacklisted = false;
                    Blacklist.forEach((b) => {
                        let bre = new RegExp(b);
                        if (url.match(bre)) {
                            blacklisted = true;
                        }
                    });
                    if (!blacklisted) {
                        chrome.identity.getProfileUserInfo(async (userInfo) => {
                            let user = await loginUser({
                                email: userInfo.email,
                            });
                            if (user) {
                                if (key === 'processed') {
                                    await submitLastTransaction(user.id);
                                } else {
                                    chrome.tabs.sendMessage(tabId, {
                                        user,
                                        page: key,
                                        query: value.query,
                                        description: value.description,
                                        url,
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    }
});

loginUser = async (prof) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: prof.givenName,
                last_name: prof.familyName,
                email: prof.email,
            }),
        };
        const url = `https://spendless-pg.herokuapp.com/login`;
        const response = await fetch(url, requestOptions);
        console.log(response);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

submitLastTransaction = async (id) => {
    try {
        const url = `https://spendless-pg.herokuapp.com/submit?uid=${id}`;
        await fetch(url);
    } catch (error) {
        console.log(error);
    }
};
