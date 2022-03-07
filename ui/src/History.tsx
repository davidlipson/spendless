import React from 'react';
import { Component } from 'react';
import './App.css';
import HistoryEntry from './HistoryEntry';

class History extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="purchase-history-body">
        <table>
          <tbody>
          {this.props.data.map((h:any) => {
            return <HistoryEntry data={h} ignore={this.props.ignore}/>
          })}
          </tbody>
        </table> 
      </div> 
    );
  }
}

export default History;
