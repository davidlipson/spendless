const Whitelist = {
    "processed": [
        "\/gp\/buy\/thankyou"
    ],
    "checkout": [
      "amazon.+\/gp\/buy\/",
        "\/checkouts",
        "\/gp",
        "\/dp",
    ],
    "cart": [
      "amazon.+\/gp\/cart",
        "amazon.+\/cart",
        "\/cart",
        "\/dp"
    ]
}

const Blacklist = [
  "amazon.+\/dp"
]

chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        if(tab.url !== undefined && changeInfo.status == "complete" && tab.id == tabId){
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                if(tabs[0].id == tabId){
                    let url = tabs[0].url;
                    let found = false;
                    for (const [key, value] of Object.entries(Whitelist)) {
                      value.forEach(r => {
                        let re = new RegExp(r);
                        if (url?.match(re) && !found){
                          found = true;
                          Blacklist.forEach(b => {
                            let bre = new RegExp(b)
                            if(url.match(bre)) found = false;
                          })
                          if(found){
                            chrome.identity.getProfileUserInfo(function(userInfo) {
                              chrome.tabs.sendMessage( tabId, {
                                  email: userInfo.email,
                                  info: changeInfo,
                                  page: key,
                                  tab: tab,
                                  userInfo
                                })
                            });
                          }
                        }
                      })
                    }
                    if(!found){
                        console.log('none found')
                        chrome.identity.getProfileUserInfo(function(userInfo) {
                            chrome.tabs.sendMessage( tabId, {
                                email: userInfo.email,
                                info: changeInfo,
                                key: null
                              })
                        });
                    }
                }
              });
        }
        
      }
  );
