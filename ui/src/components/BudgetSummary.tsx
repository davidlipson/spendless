

import { Component } from 'react';
import '../App.css';
import { getCurrency } from '../helpers/mathFns';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NumericInput from 'react-numeric-input';

class BudgetSummary extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = {
      editBudget: false,
      text: "MONTHLY BUDGET",
      editValue: this.props.budget
    }
  }

  onMouseover (e:any) {
    this.setState({text : 'EDIT BUDGET'})
  }
  //clear the text
  onMouseout (e:any) {
    this.setState({text : 'MONTHLY BUDGET'})
  }

  handleEditBudget(e:any){
    this.setState({editValue: e})
  }

  submitNewBudget(){
    if(this.state.editValue > 0 && this.state.editValue < 10000 && this.state.editValue != this.props.budget){
      this.props.submitNewBudget(this.state.editValue)
    }
    else{
      alert("Invalid budget.")
    }
    this.setState({editBudget: false})
  }


  render() {
    return (
      <div className="budget-summary-lines">
        <div className="budget-summary-div">
          <span className="summary-value">{getCurrency(Math.ceil(this.props.spent)).replace('.00', '')}</span>
          <span className="summary-line small-cap-font">AMOUNT SPENT</span>
        </div>
        {this.state.editBudget ? 
        <div className="budget-summary-div budget-edit" >
          <div className="edit-budget-bar">
            <HighlightOffSharpIcon className="cancel-button" onClick={() => this.setState({editBudget: false})}/>
            <div className="budget-input-row">
              <span className="summary-value budget-dollar-sign">$</span>
              <NumericInput onChange={this.handleEditBudget.bind(this)} className="numeric-input-budget" min={0} max={10000} precision={0} style={false} value={this.state.editValue}/>
            </div>
            <CheckCircleOutlineRoundedIcon className="save-button" onClick={this.submitNewBudget.bind(this)}/>
          </div>
        </div>
        : 
        <div className="budget-summary-div budget-summary-total" 
        onMouseEnter={this.onMouseover.bind(this)}
        onMouseLeave={this.onMouseout.bind(this)}
        onClick={() => {
          if(!this.state.editBudget){
            this.setState({editBudget: true})
          }
        }}>
          <span className="summary-value">{getCurrency(this.props.budget).replace('.00', '')}</span>
          <span className="summary-line small-cap-font">{this.state.text}</span>
        </div>}
        </div>
    );
  }
}

export default BudgetSummary;
