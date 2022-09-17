chrome.webNavigation.onCompleted.addListener(async (details) => {
    const { whitelist, blacklist } = await getUrlList();
    const { frameId, tabId, url } = details;
    if (url !== undefined && frameId === 0) {
        let found = false;
        for (const [key, value] of Object.entries(whitelist)) {
            value.regex.forEach((r) => {
                let re = new RegExp(r);
                if (url?.match(re) && !found) {
                    found = true;
                    let blacklisted = false;
                    blacklist.forEach((b) => {
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
                                }
                                chrome.tabs.sendMessage(tabId, {
                                    user,
                                    page: key,
                                    query: value.query,
                                    description: value.description,
                                    url,
                                });
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
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

getUrlList = async () => {
    try {
        const url = `https://spendless-pg.herokuapp.com/list`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
        return { whitelist: {}, blacklist: [] };
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
