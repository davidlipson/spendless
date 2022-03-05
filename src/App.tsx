import React from 'react';
import { Component } from 'react';

import logo from './logo.svg';
import './App.css';

import CountUp from 'react-countup';
import Progress from './Progress';
import History from './History';

import { v4 as uuid } from 'uuid';

import {
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class App extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = { 
      budget: 500,
      spent:  200,
      price: 50,
      history: [
        {id: uuid(), date: "01/22/2022", amount: 52.6, label: "Nike"},
        {id: uuid(), date: "01/16/2022", amount: 124, label: "Aritzia"}
      ]
    };
  }

  deleteTransaction(id:any){
    console.log(id);
    const currentHistory = this.state.history.filter((h:any) => h.id != id);
    console.log(currentHistory);
    this.setState({history: currentHistory});
  }

  render() {
    return  (
      <div className="App">
        <Progress spent={this.state.spent} total={this.state.price + this.state.spent} budget={this.state.budget}/>
        <div className="overall-summary">
          <span className="summary-line">Monthly budget: <span className="summary-value">${this.state.budget}</span></span>
          <span className="summary-line">Spent this month: <span className="summary-value">${this.state.spent}</span></span>
          <div className="divider-bar"></div>
          <div className="purchase-history">
          <span className="history-title">Purchases</span>
          <History delete={this.deleteTransaction.bind(this)} data={this.state.history}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
