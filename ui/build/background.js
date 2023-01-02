//const host = 'https://spendless-pg.herokuapp.com';
const host = 'http://localhost:5000';
navHelper = async (details) => {
    let dev = false;
    chrome.management.get(chrome.runtime.id, function (extensionInfo) {
        dev = extensionInfo.installType === 'development';
    });
    const { whitelist, blacklist, totalRegex } = await getUrlList();
    const { frameId, tabId, url } = details;
    if (url !== undefined && frameId === 0) {
        let found = false;
        for (const [key, value] of Object.entries(whitelist)) {
            value.regex.forEach((r) => {
                let re = new RegExp(r, 'i');
                console.log(url, re);
                if (url?.match(re) && !found) {
                    found = true;
                    const blacklisted = blacklist.find((b) => {
                        let bre = new RegExp(b, 'i');
                        return url.match(bre);
                    });
                    if (!blacklisted) {
                        chrome.identity.getProfileUserInfo(async (userInfo) => {
                            let user = await loginUser({
                                email: userInfo.email,
                            });
                            if (user) {
                                let recent = await getRecent(user.id);
                                chrome.tabs.sendMessage(tabId, {
                                    user,
                                    recent,
                                    page: key,
                                    query: value.query,
                                    description: value.description,
                                    url,
                                    dev,
                                    totalRegex,
                                });
                            }
                        });
                    }
                }
            });
        }
    }
};

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
        const url = `${host}/login`;
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
        const url = `${host}/list`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return { whitelist: {}, blacklist: [], totalRegex: null };
    }
};

getRecent = async (uid) => {
    try {
        const url = `${host}/recent?uid=${uid}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    navHelper(details);
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
    navHelper(details);
});
