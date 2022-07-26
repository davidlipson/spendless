const Whitelist = {
    "amazon_processed": [
        "\/gp\/buy\/thankyou"
    ],
    "amazon_product": [
        "amazon.+\/dp"
    ],
    "amazon_cart": [
        "amazon.+\/gp\/cart",
        "amazon.+\/cart"
    ],
    "amazon_checkout": [
        "amazon.+\/gp\/buy\/"
    ],
    "checkout": [
        "\/checkouts",
        "\/gp",
        "\/dp",
    ],
    "cart": [
        "\/cart",
        "\/dp"
    ]
}

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
                          if(key == "amazon_processed"){
                            console.log("submit last transaction")
                            //this.updateUserPage(this.state.user.id, url, 0, "")
                            //this.submitLastTransaction();
                          }
                          else{
                              console.log('set current page')
                            //this.setPage(key, tabs[0], r)
                          }
        
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
                      //this.updateUserPage(this.state.user.id, "", 0, "")
                    }
                }
              });
        }
        
      }
  );

/*
  chrome.webNavigation.onCompleted.addListener(function(details) {
    if(details.frameId == 0){
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                let url = tabs[0].url;
                let found = false;
                for (const [key, value] of Object.entries(Whitelist)) {
                  value.forEach(r => {
                    let re = new RegExp(r);
                    if (url?.match(re) && !found){
                      found = true;
                      if(key == "amazon_processed"){
                        console.log("submit last transaction")
                        //this.updateUserPage(this.state.user.id, url, 0, "")
                        //this.submitLastTransaction();
                      }
                      else{
                          console.log('set current page')
                        //this.setPage(key, tabs[0], r)
                      }

                      chrome.identity.getProfileUserInfo(function(userInfo) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            email: userInfo.email,
                            info: changeInfo,
                            page: key,
                            tab: tab
                          })
                      });
                      
                    }
                  })
                }
                if(!found){
                    console.log('none found')
                    chrome.identity.getProfileUserInfo(function(userInfo) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            email: userInfo.email,
                            info: changeInfo,
                            key: null
                          })
                    });
                  //this.updateUserPage(this.state.user.id, "", 0, "")
                }
          });
    }
});*/