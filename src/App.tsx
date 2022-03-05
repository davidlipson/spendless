import React from 'react';
import ReactDOM from 'react-dom';
import { Component } from 'react';

import logo from './logo.svg';
import './App.css';

import CountUp from 'react-countup';
import Progress from './Progress';
import History from './History';

import { v4 as uuid } from 'uuid';

import { GoogleLogin } from 'react-google-login';

import {
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class App extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = { 
      user: false,
      budget: 500,
      spent:  300,
      last: 0,
      price: 5,
      history: [
        {id: uuid(), date: "01/22/2022", amount: 200, label: "Nike"},
        {id: uuid(), date: "01/16/2022", amount: 200, label: "Aritzia"}
      ]
    };
  }

  handleLogin = async (data:any) => {
    this.setState({ user : data });
  }

  handleLoginFailure = async (data:any) => {
    alert("Error");
    console.log(data);
  }

  deleteTransaction(id:any, amount: any){
    const newHistory = this.state.history.filter((h:any) => h.id != id);
    const newLast = this.state.spent + this.state.price;
    const newSpent = Math.max((this.state.spent - amount), 0);
    console.log(newSpent);
    this.setState({history: newHistory, last: newLast, spent: newSpent});
  }

  render() {
    return  (
      <div className="App">
      {this.state.user == false ?
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}
          buttonText="Login"
          cookiePolicy={'single_host_origin'}
          onSuccess={this.handleLogin.bind(this)}
          onFailure={this.handleLoginFailure.bind(this)}
        /> :
        <>
        <Progress amount={this.state.price} last={this.state.last} total={this.state.price + this.state.spent} budget={this.state.budget}/>
        <div className="overall-summary">
          <span className="summary-line">Monthly budget: <span className="summary-value">${this.state.budget}</span></span>
          <span className="summary-line">Spent this month: <span className="summary-value">${this.state.spent}</span></span>
          <div className="divider-bar"></div>
          <div className="purchase-history">
          <span className="history-title">Purchases</span>
          <History delete={this.deleteTransaction.bind(this)} data={this.state.history}/>
          </div>
        </div>
        </>}
      </div>
    );
  }
}

export default App;
