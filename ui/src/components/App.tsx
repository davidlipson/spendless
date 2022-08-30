/*global chrome*/
import { Component } from 'react';
import '../App.css';
import Progress from './Progress';
import History from './History';
import { getRange } from '../helpers/mathFns';
import { GoogleLogin } from 'react-google-login';
import Cookies from 'universal-cookie';
import { loginUser } from '../api/login';
import { getHistory } from '../api/history';
import { ignoreTransaction } from '../api/ignore';
import BudgetSummary from './BudgetSummary';
import TopBar from './TopBar';
import { updateBudget } from '../api/budget';

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
    };
  }

  loginGoogleProfile = async () => {
    try{
      let s = this;
      chrome.identity.getProfileUserInfo(async(userInfo) => {
        await s.login({email: userInfo.email})
      });
    }
    catch(e){
      console.log(e)
    }
  }

  async componentDidMount(){
    const currentUser = cookies.get(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string);
    if (currentUser){
      await this.setUser(currentUser);
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
      this.history(this.state.user.id);
    }
    catch(error){
      console.log(error);
    }
  }

  handleLogin = async (data:any) => {
    await this.login(data.profileObj);
  }

  login = async (profile:any) => {
    const user = await loginUser(profile);
    if(user){
      this.setState({user})
      this.history(this.state.user.id);
    }
    else{
      this.setState({user, history: [], spent: 0})
    }
  }

  history = async (uid:string) => {
    const {history, spent} = await getHistory(uid);
    this.setState({history, spent})
  }

  handleLoginFailure = async (data:any) => {
    alert(data);
  }

  ignoreTransaction(data:any){
    this.ignore(true, data)
  }

  ignore = async(c:boolean, d:any) => {
    try{
      if (c == true){
        await ignoreTransaction(this.state.user.id, d.id)
        const newLast = this.state.spent + this.state.price;
        const newSpent = Math.max((this.state.spent - d.amount), 0);
        this.setState({last: newLast, spent: newSpent});
        await this.history(this.state.user.id);
      }
    }
    catch(error){
      console.log(error);
    } 
  }

  submitNewBudget = async(budget:number) => {
    await updateBudget(this.state.user.id, budget)
    this.setUser(this.state.user.id)
  }

  initialize(){
    cookies.remove(process.env.REACT_APP_SPENDLESS_COOKIE_NAME as string, { path: '/' });
    this.setState({user: false, spent: 0, last: 0, price: 0, history: []});
  }

  logout(){
    this.initialize();
  }

  // <div className="App"> border style={{ borderColor: (this.state.user == false ? "#e3e3e3" : range.colour) }} 

  render() {
    const range = getRange(this.state.price + this.state.spent, this.state.user.budget);
    return  (
      <div className="App">
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
        <TopBar logout={this.logout.bind(this)}/>
        <Progress amount={this.state.price} last={this.state.last} total={this.state.price + this.state.spent} budget={this.state.user.budget}/>
        <div className="overall-summary">
        <BudgetSummary submitNewBudget={this.submitNewBudget.bind(this)} spent={this.state.spent} budget={this.state.user.budget}/>
          
          <div className="divider-bar"></div>
          <div className="purchase-history">
          <History ignore={this.ignoreTransaction.bind(this)} data={this.state.history.slice(0,3)}/>
          </div>
        </div>
        </>}
      </div>
    );
  }
}

export default App;
