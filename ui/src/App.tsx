/*global chrome*/

import { Component } from 'react';
import './App.css';
import Progress from './Progress';
import History from './History';
import ConfirmIgnore from './ConfirmIgnore';
import { getCurrency, getRange } from './Helpers';
import { GoogleLogin } from 'react-google-login';
import Cookies from 'universal-cookie';
import Whitelist from './Whitelist';

const cookies = new Cookies();
const CLIENT_ID = process.env.NODE_ENV == "development" 
  ? process.env.REACT_APP_DEV_CLIENT_ID 
  : process.env.REACT_APP_PROD_CLIENT_ID;

class App extends Component<any,any>{
  constructor(props: any) {
    super(props);

    this.state = { 
      user: false,
      spent:  0,
      last: 0,
      price: 0,
      history: [],
      page: "",
      pendingAmount: 0,
      ignoring: false
    };
  }

  loginGoogleProfile = async () => {
    try{
      let s = this;
      chrome.identity.getProfileUserInfo(function(userInfo) {
        s.loginUser({email: userInfo.email})
      });
    }
    catch(e){
      console.log(e)
    }
  }

  /*checkTab = async() => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      let url = tabs[0].url;
      let found = false;
      for (const [key, value] of Object.entries(Whitelist)) {
        value.forEach(r => {
          let re = new RegExp(r);
          if (url?.match(re) && !found){
            found = true;
            if(key == "amazon_processed"){
              this.submitLastTransaction();
              this.updateUserPage(this.state.user.id, url, 0, "")
            }
            else{
              this.setPage(key, tabs[0], r)
            }
          }
        })
      }
      if(!found){
        this.updateUserPage(this.state.user.id, "", 0, "")
      }
    });
    return false;
  }*/

  /*setPage = async(page:any, tab:any, match:any) => {
    try{
      let query = "";
      let descQuery = "";
      if (page == "amazon_product"){
        query = `document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
        descQuery = `document.querySelector('#productTitle, #title').textContent.trim()`
      }
      if (page == "amazon_cart"){
        query = `document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
      }
      if (page == "amazon_checkout"){
        query = `document.querySelector('.grand-total-price, .payment-due__price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
        descQuery = `document.querySelector('#productTitle, #title').textContent.trim()`
      }
      if (page == "cart"){
        query = `document.querySelector('#sns-base-price, .cart__subtotal-price, .cart__total-money, .sc-price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
      }
      if (page == "checkout"){
        query = `document.querySelector('.grand-total-price, .payment-due__price, .a-price-whole').textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
        descQuery = `document.querySelector('#productTitle, #title').textContent.trim()`
      }
      if (query != ""){
        chrome.tabs.executeScript(tab.id, {
          code: query
        }, (amount) => {
          try{
            let result = parseFloat(amount[0]);
            if (!isNaN(result) && result > 0){
              if (descQuery != ""){
                chrome.tabs.executeScript(tab.id, {
                  code: descQuery
                }, (description) => {
                  try{
                    this.updateUserPage(this.state.user.id, tab.url, result, description[0])
                  }
                  catch(e){
                    console.log(e);
                    this.updateUserPage(this.state.user.id, tab.url, result, "")
                  }
                })
              }
              else{
                this.updateUserPage(this.state.user.id, tab.url, result, 
                  (page == "amazon_cart" || page == "amazon_checkout") ? "Amazon" : "")
              }
              this.setState({page: page, price: result});
            }
            else{
              this.updateUserPage(this.state.user.id, tab.url, 0, "")
              this.setState({page: page, price: 0});
            }
          }
          catch(e){
            console.log(e)
            this.updateUserPage(this.state.user.id, tab.url, 0, "")
            this.setState({page: page, price: 0});
          }
        })
      }
      else{
        this.updateUserPage(this.state.user.id, "", 0, "")
        this.setState({page: "", price: 0})
      }
    }
    catch(e){
      this.updateUserPage(this.state.user.id, "", 0, "")
      this.setState({page: "", price: 0})
      console.log(e)
    }
  }*/

  /*checkPopOut = async() => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let id = tabs[0].id
      chrome.tabs.executeScript(id as number, {
        code: `document.querySelector(".cart-flyout__total__price").textContent.replace(/[]+|[s]{2,}/g, ' ').trim().replace('$','')`
      }, (result) => {
        console.log('cart found', result)
      })
    });
    return;
  }*/

  /*checkForCheckout = async() =>{
    let found = await this.checkTab() 
    if (!found) this.checkPopOut()
  }*/

  componentDidMount(){
    const currentUser = cookies.get(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string);
    if (currentUser){
      this.setUser(currentUser);
    }
    else{
      this.loginGoogleProfile();
    }
  }

  setUser = async(uid:string) => {
    try{
      const url = `http://localhost:5000/user?uid=${uid}`;
      const response = await fetch(url)
      const data = await response.json()
      this.setState({ user : data[0] })
      this.getHistory(this.state.user.id);
      //this.checkForCheckout();
    }
    catch(error){
      console.log(error);
    }
  }

  /*submitLastTransaction = async() => {
    try{
      const url = `http://localhost:5000/submit?uid=${this.state.user.id}`;
      const response = await fetch(url)
      const data = await response.json()
      this.getHistory(this.state.user.id);
    }
    catch(error){
      console.log(error);
    }
  }*/

  updateUserPage = async(uid:string, url:string, amount: number, description: string) => {
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

  loginUser = async (prof:any) => {
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
      cookies.set(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string, data[0].id as string, { path: '/' });
      this.setState({user : data[0]})
      this.getHistory(this.state.user.id);
    }
    catch(error){
      console.log(error);
      this.setState({user : false, history: [], spent: 0})
    }
  }

  getHistory = async (uid:string) => {
    try{
      const url = `http://localhost:5000/history?uid=${uid}`;
      const response = await fetch(url)
      const data = await response.json()
      console.log(data);
      // do this better w triggers in db instead of calculating spent in ui
      let total = 0;
      data.forEach((h:any) => {
        total += h.amount;
      })
      console.log(total);
      this.setState({history : data, spent: total})
    }
    catch(error){
      console.log(error);
      this.setState({history : []})
    }
  }

  handleLogin = async (data:any) => {
    this.loginUser(data.profileObj);
  }

  handleLoginFailure = async (data:any) => {
    console.log(data);
  }

  checkIgnoreTransaction(data:any){
    this.setState({ ignoring: data });
  }

  ignoreTransaction = async(c:boolean, d:any) => {
    try{
      if (c == true){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              uid: this.state.user.id,
              id: d.id
            })
        };
        const url = "http://localhost:5000/ignore";
        await fetch(url, requestOptions);
        const newLast = this.state.spent + this.state.price;
        const newSpent = Math.max((this.state.spent - d.amount), 0);
        this.setState({last: newLast, spent: newSpent, ignoring: false});
        this.getHistory(this.state.user.id);
      }
      else{
        this.setState({ignoring: false});
      }
    }
    catch(error){
      this.setState({ignoring: false})
    } 
  }

  initialize(){
    cookies.remove(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string, { path: '/' });
    this.setState({user: false, spent: 0, last: 0, price: 0, history: []});
  }

  logout(){
    this.initialize();
  }

  render() {
    const range = getRange(this.state.price + this.state.spent, this.state.user.budget);
    console.log(this.state.page);
    return  (
      <div className="App" style={{ borderColor: (this.state.user == false ? "#e3e3e3" : range.colour) }} >
      {this.state.user == false ?
        <>
        <div className={`welcome-header`}>
            Welcome to SpendLess!
        </div>
        <div className={`welcome-body`}>
        In order to use SpendLess, you must login with Google.
        </div>
        {process.env.NODE_ENV == "development" ?
          <GoogleLogin
          className="google-login-button"
          clientId={CLIENT_ID as string}
          buttonText="Login"
          cookiePolicy={'single_host_origin'}
          onSuccess={this.handleLogin.bind(this)}
          onFailure={this.handleLoginFailure.bind(this)}
        /> : <div className={`welcome-body`}>
        Once signed in through Chrome, reload the SpendLess extension (you may need to restart Chrome).
        </div>
        }</>
         :
        <>
        {process.env.NODE_ENV == "development" ? <div className="logout-button" onClick={this.logout.bind(this)}>Logout</div> : <></>}
        <div className="current-user">Welcome to Spendless{((typeof this.state.user.first_name != 'undefined') && this.state.user.first_name != "" && this.state.user.first_name != "undefined") ? `, ${this.state.user.first_name}` : ""}!</div>
        <Progress amount={this.state.price} last={this.state.last} total={this.state.price + this.state.spent} budget={this.state.user.budget}/>
        <div className="overall-summary">
       
        {this.state.ignoring != false ? <ConfirmIgnore confirm={this.ignoreTransaction.bind(this)} data={this.state.ignoring}/> 
        : <>
          {(this.state.page == "checkout") || (this.state.page == "cart") || (this.state.page == "amazon_cart") || (this.state.page == "amazon_checkout") || (this.state.page == "amazon_product")? 
          (this.state.price > 0 ? <div style={{ color: range.colour }} className="checkout-line"><span className="summary-line">Are you sure you want to spend <span className="summary-value">{getCurrency(this.state.price)}</span> on this?</span></div>
          : <div style={{ color: range.colour }} className="checkout-line"><span className="summary-line">Are you sure you want to buy this?</span></div>
          ) : <></>}
          <span className="summary-line">Spent this month: <span className="summary-value">{getCurrency(this.state.spent)}</span></span>
          <span className="summary-line">Monthly budget: <span className="summary-value">{getCurrency(this.state.user.budget)}</span></span>
        </>}
          
          <div className="divider-bar"></div>
          <div className="purchase-history">
          <span className="history-title">Purchases</span>
          <History ignore={this.checkIgnoreTransaction.bind(this)} data={this.state.history}/>
          </div>
        </div>
        </>}
      </div>
    );
  }
}

export default App;
