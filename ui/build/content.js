chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
      if(request.page != null){
        let user = await loginUser({email: request.email})
        if(request.page == "amazon_processed"){
          submitLastTransaction(user.id);
          updateUserPage(user.id, request.tab.url, 0, "")  
        }
        let { found, amount, description } = await setPage(request.page, user, request.tab);
        let {spent, history} = await getHistory(user.id);
       
        var total = amount + spent;
        const range = getRange(total, user.budget);

        var popup = parent.document.createElement('div');
        popup.id = 'popup-root';
        parent.document.getElementsByTagName('html')[0].appendChild(popup);

        var app = parent.document.createElement('div');
        app.className = 'popup-app';
        app.style.borderColor = range.colour
        popup.appendChild(app);

        var currentUser = parent.document.createElement('div');
        currentUser.className = 'popup-current-user';
        currentUser.innerHTML = `Welcome to Spendless${((typeof user.first_name != 'undefined') && user.first_name != "" && user.first_name != "undefined") ? (", " + user.first_name) : ""}!`
        app.appendChild(currentUser);

        var checkout = parent.document.createElement('div');
        checkout.className = 'popup-checkout-line';
        app.appendChild(checkout);

        var totalDiv = parent.document.createElement('span');
        totalDiv.className = 'popup-total';
        totalDiv.innerHTML = getCurrency(total);
        totalDiv.style.color = range.color;
        checkout.appendChild(totalDiv);

        var progress = parent.document.createElement('div');
        progress.className = 'popup-progress';
        checkout.appendChild(progress);
        
        var perc = getPercentage(total, user.budget); 
        progress.innerHTML = `${amount > 0 ? "You'd hit " : "You're at "} ${perc <= 100 ? perc : perc - 100}% ${perc <= 100 ? "of" : "over"} your monthly budget`

        
        if(found){
          var summary = parent.document.createElement('span');
          summary.className = 'popup-summary-line';
          if (amount > 0) {
            summary.innerHTML = `Are you sure you want to spend ${getCurrency(amount)} on this?`
          }
          else {
            summary.innerHTML = 'Are you sure you want to buy this?'
          }
          summary.style.color = range.colour
          checkout.appendChild(summary);
        }

        
        var overall = parent.document.createElement('div');
        overall.className = 'popup-overall-summary';
        app.appendChild(overall);

        var budLine = parent.document.createElement('span');
        budLine.className = 'popup-summary-line';
        budLine.innerHTML = `Monthly Budget: <span class="summary-value">${getCurrency(user.budget)}</span>`;
        overall.appendChild(budLine);

        var spentLine = parent.document.createElement('span');
        spentLine.className = 'popup-summary-line';
        spentLine.innerHTML = `Spent this month: <span class="summary-value">${getCurrency(spent)}</span>`;
        overall.appendChild(spentLine);

        /*var historyDiv = parent.document.createElement('div');
        historyDiv.className = 'popup-purchase-history-body';
        app.appendChild(historyDiv); 
       
        var historyTable = parent.document.createElement('table');
        historyDiv.appendChild(historyTable); 

        var historyTB = parent.document.createElement('tbody');
        historyTB.className = 'popup-history-tbody';
        historyTable.appendChild(historyTB); 
        

        history.forEach((h) => {
          var historyRow = parent.document.createElement('tr')
          historyRow.id = `popup-history-row-${h.id}`
          historyRow.innerHTML = `
            <td className="popup-table-label">${h.description.length > 20 ? `${h.description.substring(0,19)}...` : h.description}</td>
            <td className="popup-table-amount">${getCurrency(h.amount)}</td>
            <td className='popup-table-timestamp'>${convertToDateString(h.timestamp)}</td>
          `
          historyTB.appendChild(historyRow);
          parent.document.getElementById(`popup-history-row-${h.id}`).addEventListener('click', function(){
              var ignoreDiv = parent.document.createElement('div');
              ignoreDiv.className = 'popup-confirm-ignore';
              overall.append(ignoreDiv);
              
              var ignoreSpan = parent.document.createElement('span');
              ignoreSpan.className = 'popup-alert-message';
              ignoreSpan.innerHTML = `Ignore the ${getCurrency(h.amount)} spent on ${h.description} in your monthly budget?`;
              ignoreDiv.append(ignoreSpan);
  
              var ignoreInnerDiv = parent.document.createElement('div');
              ignoreInnerDiv.className = 'popup-confirm-buttons';
              ignoreDiv.append(ignoreInnerDiv);
  
              var ignoreTrue = parent.document.createElement('a');
              ignoreTrue.innerHTML = 'Yes';
              ignoreTrue.className = 'popup-ignore-true';
              ignoreTrue.onclick = function(){
                ignoreSpan.innerHTML = '';
              }
              ignoreInnerDiv.append(ignoreTrue);
              var ignoreFalse = parent.document.createElement('a');
              ignoreFalse.className = 'popup-ignore-false';
              ignoreFalse.innerHTML = 'No';
              ignoreFalse.onclick = function(){
                ignoreSpan.innerHTML = '';
              }
              ignoreInnerDiv.append(ignoreFalse);
  
              Array.from(parent.document.getElementsByClassName('popup-ignore-true')).forEach(c => {
                c.addEventListener('click', function(){
                  ignoreDiv.style.display = 'none';
                });
              })
      
              Array.from(parent.document.getElementsByClassName('popup-ignore-false')).forEach(c => {
                c.addEventListener('click', function(){
                  ignoreDiv.style.display = 'none';
                });
              })
            });
          })  */      
      }
  });

loginUser = async (prof) => {
    try{
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            first_name: prof.givenName,
            last_name: prof.familyName,
            email: prof.email
          })
      };
      const url = "http://localhost:5000/login";
      const response = await fetch(url, requestOptions);
      const data = await response.json();
      return data[0];
    }
    catch(error){
      console.log(error);
      return null;
    }
  } 

  getHistory = async (uid) => {
    try{
      const url = `http://localhost:5000/history?uid=${uid}`;
      const response = await fetch(url)
      const data = await response.json()
      console.log(data);
      // do this better w triggers in db instead of calculating spent in ui
      let total = 0;
      data.forEach((h) => {
        total += h.amount;
      })
      return {history: data, spent: total};
    }
    catch(error){
      console.log(error);
      return {history: [], spent: 0};
    }
  }

  setPage = async(page, user, tab) => {
    try{
      let query = "";
      let descQuery = "";
      console.log(page)
      if (page == "amazon_product"){
        query = parent.document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','');
        descQuery = parent.document.querySelector('#productTitle, #title').textContent.trim()
      }
      if (page == "amazon_cart"){
        query = parent.document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')
      }
      if (page == "amazon_checkout"){
        query = parent.document.querySelector('.grand-total-price, .payment-due__price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')
        descQuery = parent.document.querySelector('#productTitle, #title').textContent.trim()
      }
      if (page == "cart"){
        query = parent.document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')
      }
      if (page == "checkout"){
        query = parent.document.querySelector('.grand-total-price, .payment-due__price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')
        descQuery = parent.document.querySelector('#productTitle, #title').textContent.trim()
      }
      if (query != ""){
          try{
            let result = parseFloat(query);
            if (!isNaN(result) && result > 0){
              if (descQuery != ""){
                updateUserPage(user.id, tab.url, result, descQuery)
                return {found: true, amount: result, description: descQuery}
              }
              else{
                var desc = (page == "amazon_cart" || page == "amazon_checkout") ? "Amazon" : "";
                updateUserPage(user.id, tab.url, result, desc)
                return {found: true, amount: result, description: desc}
              }
            }
            else{
              updateUserPage(user.id, tab.url, 0, "")
              return {found: true, amount: 0, description: ""}
            }
          }
          catch(e){
            console.log(e)
            updateUserPage(user.id, tab.url, 0, "")
            return {found: false, amount: 0, description: ""}
          }
      }
      else{
        updateUserPage(user.id, "", 0, "")
        return {found: false, amount: 0, description: ""}
      }
    }
    catch(e){
      console.log(e)
      updateUserPage(user.id, "", 0, "")
      return {found: false, amount: 0, description: ""}
    }
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
    console.log(data);
  }
  catch(error){
    console.log(error);
  }
}

submitLastTransaction = async(id) => {
  try{
    const url = `http://localhost:5000/submit?uid=${id}`;
    await fetch(url)
  }
  catch(error){
    console.log(error);
  }
}