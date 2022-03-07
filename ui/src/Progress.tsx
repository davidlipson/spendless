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
import { getPercentage } from './Helpers';

class Progress extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = { 
      interval: 100,
      valuesIndex: 0,
    };
  }

  getIntervalArray(){
    return (this.props.last <= this.props.total) ? [0,1,2,3,4,5,6,7,8,9,10].map(x => 100*(this.props.last + x*(this.props.total-this.props.last)/10)/this.props.budget)
    : [0,1,2,3,4,5,6,7,8,9,10].map(x => 100*(this.props.last - x*(this.props.last-this.props.total)/10)/this.props.budget)
  }

  runInterval(){
    const values = this.getIntervalArray();
    const interval = setInterval(() => {
      if(this.state.valuesIndex < values.length){
        this.setState({
          valuesIndex: this.state.valuesIndex + 1
        });
      }
      else{
        clearInterval(interval)
      }
    }, this.state.interval);
  }

  componentDidMount() {
    this.runInterval();
  }

  componentWillReceiveProps(nextProps:any) {
    if(nextProps.last != this.props.last 
      || nextProps.total != this.props.total 
      || nextProps.budget != this.props.budget 
      || nextProps.amount != this.props.amount){
      this.setState({ valuesIndex: 0 });
      this.runInterval();
    }
  }

  getRange(){
    if (100*this.props.total/this.props.budget < 75){
      return {class: "below-budget", colour: "rgb(75,176,248)"}
    }
    else if (100*this.props.total/this.props.budget < 100){
      return {class: "approaching-budget", colour: "rgb(248,200,75)"}
    }
     else{
      return {class: "above-budget", colour: "rgb(248,75,75)"}
    }
  }

  render() {
    const range = this.getRange();
    const values = this.getIntervalArray();
    const perc = getPercentage(this.props.total, this.props.budget); 
    const progressBody = `${this.props.amount > 0 ? "You'd hit " : "You're at "} ${perc <= 100 ? perc : perc - 100}% ${perc <= 100 ? "of" : "over"} your monthly budget`
    return (
      <div className="spend-progress">
        <CircularProgressbarWithChildren
          value={values[this.state.valuesIndex]}
          strokeWidth={3}
          styles={buildStyles({
            pathColor: `${range.colour}`,
            trailColor: "#eee",
            strokeLinecap: "round",
            rotation: 0.65
          })}
        >
        <div className="spend-progress-content">
          <div className={`progress-header ${range.class}`}>
            $<CountUp duration={1} start={this.props.last} end={this.props.total}/>
          </div>
          <div className="progress-body">
            {progressBody}
          </div>
        </div>  
        </CircularProgressbarWithChildren>
      </div>
    );
  }
}

export default Progress;
