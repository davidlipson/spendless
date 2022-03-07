import React from 'react';
import { Component } from 'react';
import './App.css';
import { getCurrency } from './Helpers';

class ConfirmIgnore extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  confirm(c:any){
      this.props.confirm(c, this.props.data);
  }

  render() {
    return (
      <div className="confirm-ignore">
       <span className="alert-message">Ignore the {getCurrency(this.props.data.amount)} spent on {this.props.data.description} in your monthly budget?</span>
       <div className="confirm-buttons">
           <a onClick={() => this.confirm(true)}>Yes</a>
           <a onClick={() => this.confirm(false)}>No</a>
        </div>
      </div> 
    );
  }
}

export default ConfirmIgnore;
