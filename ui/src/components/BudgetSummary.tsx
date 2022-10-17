

import { Component } from 'react';
import { getCurrency } from '../helpers/mathFns';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NumericInput from 'react-numeric-input';

class BudgetSummary extends Component<any,any>{
  constructor(props: any) {
    super(props);
    this.state = {
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
    this.props.setEditBudget(false)
  }

  render() {
    return (
      <div className="spendless-ext-summary-lines">
        <div className="spendless-ext-summary-div">
          <span className="spendless-ext-summary-value">{getCurrency(Math.ceil(this.props.spent)).replace('.00', '')}</span>
          <span className="spendless-ext-summary-line spendless-ext-small-cap-font">AMOUNT SPENT</span>
        </div>
        {this.props.editBudget ? 
        <div className="spendless-ext-summary-div spendless-ext-dropdown-budget-edit" >
          <div className="spendless-ext-dropdown-edit-budget-bar">
            <HighlightOffSharpIcon className="cancel-button" onClick={() => this.props.setEditBudget(false)}/>
            <div className="spendless-ext-dropdown-budget-input-row">
              <span className="spendless-ext-summary-value spendless-ext-dropdown-budget-dollar-sign">$</span>
              <NumericInput onChange={this.handleEditBudget.bind(this)} className="spendless-ext-dropdown-numeric-input-budget" min={0} max={10000} precision={0} style={false} value={this.state.editValue}/>
            </div>
            <CheckCircleOutlineRoundedIcon className="spendless-ext-dropdown-save" onClick={this.submitNewBudget.bind(this)}/>
          </div>
        </div>
        : 
        <div className="spendless-ext-summary-div spendless-ext-dropdown-summary-total" 
        onMouseEnter={this.onMouseover.bind(this)}
        onMouseLeave={this.onMouseout.bind(this)}
        onClick={() => {
          if(!this.props.editBudget){
            this.props.setEditBudget(true)
          }
        }}>
          <span className="spendless-ext-summary-value">{getCurrency(this.props.budget).replace('.00', '')}</span>
          <span className="spendless-ext-summary-line spendless-ext-small-cap-font">{this.state.text}</span>
        </div>}
        </div>
    );
  }
}

export default BudgetSummary;
