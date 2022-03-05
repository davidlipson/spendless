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
      <table>
        <tbody>
        {this.props.data.map((h:any) => {
          return <HistoryEntry data={h} delete={this.props.delete}/>
        })}
        </tbody>
      </table>  
    );
  }
}

export default History;
