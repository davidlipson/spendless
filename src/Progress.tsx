import React from 'react';
import { Component } from 'react';
import './App.css';

import CountUp from 'react-countup';

import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class Progress extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = { 
      interval: 100,
      valuesIndex: 0,
      values: [0,1,2,3,4,5,6,7,8,9,10].map(x => 10*x*this.props.total/this.props.budget)
    };
  }

  componentDidMount() {
    const interval = setInterval(() => {
      if(this.state.valuesIndex < this.state.values.length){
        this.setState({
          valuesIndex: this.state.valuesIndex + 1
        });
      }
      else{
        clearInterval(interval)
      }
    }, this.state.interval);
  }

  render() {
    return (
      <div className="spend-progress">
        <CircularProgressbarWithChildren
          value={this.state.values[this.state.valuesIndex]}
          strokeWidth={3}
          styles={buildStyles({
            pathColor: "rgb(75,176,248)",
            trailColor: "#eee",
            strokeLinecap: "round",
            rotation: 0.65
          })}
        >
        <div className="spend-progress-content">
          <div className="progress-header">
            $<CountUp duration={1} delay={0.25} start={this.props.spent} end={this.props.total}/>
          </div>
          <div className="progress-body">
            You'd hit {100*this.props.total/this.props.budget}% of your monthly budget
          </div>
        </div>  
        </CircularProgressbarWithChildren>
      </div>
    );
  }
}

export default Progress;
