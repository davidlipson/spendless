/*global chrome*/

import { Component } from 'react';
import './App.css';
import Progress from './Progress';
import History from './History';
import ConfirmIgnore from './ConfirmIgnore';
import { getCurrency, getRange } from './Helpers';
import { GoogleLogin } from 'react-google-login';
import Cookies from 'universal-cookie';
import { idText } from 'typescript';

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

  componentDidMount(){
    const currentUser = cookies.get(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string);
    if (currentUser){
      console.log(`Using currently signed in user ${currentUser}`)
      this.setUser(currentUser);
    }
    else{
      console.log(`Logging in new user through google api`)
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
        const response = await fetch(url, requestOptions);
        const data = await response.json()
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
      console.log(error);
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
    return  (
      <div className="App"  style={{ borderColor: range.colour }} >
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
        Once signed in through Chrome, reload the SpendLess extension.
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
          <span className="summary-line">Monthly budget: <span className="summary-value">{getCurrency(this.state.user.budget)}</span></span>
          <span className="summary-line">Spent this month: <span className="summary-value">{getCurrency(this.state.spent)}</span></span>
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
