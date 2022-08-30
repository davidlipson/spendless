// TODO
// refactor to Jquery
// only use the extension.css for the react app as well 

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
      if(request.page != null){
        let user = request.user;
        if(request.page == "processed"){
          await updateUserPage(user.id, request.url, 0, "")  
        }
        let {amount} = await setPage(user, request.url, request.query, request.description);
        let spent = await getHistory(user.id);
       
        var total = amount + spent;
        const range = getRange(total, user.budget);

        var popup = parent.document.createElement('div');
        popup.id = 'popup-root';
        parent.document.getElementsByTagName('html')[0].appendChild(popup);

        var app = parent.document.createElement('div');
        app.className = 'popup-app';
        app.style.borderColor = range.colour
        popup.appendChild(app);

        var mainText = parent.document.createElement('span');
        mainText.className = 'popup-main-text';
        mainText.innerHTML = "Spendless, Save more!"
        app.appendChild(mainText);

        var overall = parent.document.createElement('div');
        overall.className = 'popup-budget-summary-lines';
        app.appendChild(overall);

        var budDiv = parent.document.createElement('div');
        budDiv.className = 'popup-budget-summary-div';

        var budVal = parent.document.createElement('span');
        budVal.className = 'popup-summary-value';
        budVal.innerHTML = getCurrency(spent).replace('.00', '');
        budDiv.appendChild(budVal);
        
        var budLine = parent.document.createElement('span');
        budLine.className = 'popup-summary-line popup-small-cap-font';
        budLine.innerHTML = 'AMOUNT SPENT';
        budDiv.appendChild(budLine);

        overall.appendChild(budDiv);

        var leftDiv = parent.document.createElement('div');
        leftDiv.className = 'popup-budget-summary-div';

        var leftVal = parent.document.createElement('span');
        leftVal.className = 'popup-summary-value';
        leftVal.innerHTML = getCurrency(Math.ceil(user.budget)).replace('.00', '');
        leftDiv.appendChild(leftVal);
        
        var leftLine = parent.document.createElement('span');
        leftLine.className = 'popup-summary-line popup-small-cap-font';
        leftLine.innerHTML = 'LEFT IN BUDGET';
        leftDiv.appendChild(leftLine);

        overall.appendChild(leftDiv);

        var hideMessage = parent.document.createElement('div');
        hideMessage .className = 'popup-hide-message';
        hideMessage.innerHTML = "Hide this message"
        hideMessage.onclick = function(ev){
          const els = parent.document.querySelectorAll('.popup-app');
          els.forEach(el => {
            el.remove()
          })
        }

        app.appendChild(hideMessage)
        
        var ignoreMessage = parent.document.createElement('div');
        ignoreMessage.className = 'popup-ignore-message';
        ignoreMessage.innerHTML = "Ignore this transaction"
        ignoreMessage.onclick = function(ev){
          updateUserPage(user.id, request.url, 0, '')
          const els = parent.document.querySelectorAll('.popup-app');
          els.forEach(el => {
            el.remove()
          });
          alertMessage("<span style='font-weight: 800'>Got it!</span> This transaction won't be included in your budget.")
        }
        app.appendChild(ignoreMessage)
      }
  });

  alertMessage = (text, time = 5000) => {
    var alert = parent.document.createElement('div');
    alert.className = 'popup-alert-message';
    alert.innerHTML = text;
    parent.document.getElementsByTagName('html')[0].appendChild(alert);
    window.setTimeout(function() {
      alert.style.display = 'none';
    }, time);
    
  }


  getHistory = async (uid) => {
    try{
      const url = `http://localhost:5000/history?uid=${uid}`;
      const response = await fetch(url)
      const data = await response.json()
      let total = 0;
      data.forEach((h) => {
        total += h.amount;
      })
      return total
    }
    catch(error){
      console.log(error);
      return 0
    }
  }

  setPage = async(user, url, q, d) => {
    let uid = user.id;
    let link = url;
    let amount = 0;
    let description = "";
    let found = false;
    try{
      let query = "";
      let descQuery = "";
      query = parent.document.querySelector(q)?.textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')
      if (d){
        descQuery = parent.document.querySelector(d)?.textContent.trim()
      }
      if (query && query != ""){
          try{
            let result = parseFloat(query);
            found = true
            if (!isNaN(result) && result > 0){
              amount = result
              if (descQuery && descQuery != ""){
                description = descQuery
              }
              else{
                const baseUrl = url.match(/^https?:\/\/[^#?\/]+/)
                description = baseUrl || ''
              }
            }
            else{
              throw "Invalid query value";
            }
          }
          catch(e){
            console.log(e)
          }
      }
      else{
        throw "Query not found";
      }
    }
    catch(e){
      console.log(e);
    }

    await updateUserPage(uid, link, amount, description)
    return {found, amount, description}
  }

  getCurrency = (a) => {
	try{
		return a.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
		})
	}
	catch(e){
		return ""
	}
}

getRange = (total, budget) => {
    if (100*total/budget < 75){
      return {class: "below-budget", colour: "rgb(75,176,248)"}
    }
    else if (100*total/budget < 100){
      return {class: "approaching-budget", colour: "rgb(248,200,75)"}
    }
     else{
      return {class: "above-budget", colour: "rgb(248,75,75)"}
    }
}

getPercentage = (a, b) => {
	return Math.floor(100*Math.max(0, a / b));
}

convertToDateString = (date) => {
  return date.split("T")[0].replaceAll("-", "/");
}

updateUserPage = async(uid, url, amount, description) => {
  try{
    const response = await fetch(`http://localhost:5000/page`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({uid, url, amount, description})
    });

    const data = await response.json();
  }
  catch(error){
    console.log(error);
  }
}

