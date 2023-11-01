import { Component } from 'react';
import { getCurrency } from '../helpers/mathFns';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NumericInput from 'react-numeric-input';
import React from 'react';

class BudgetSummary extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            text: 'MONTHLY BUDGET',
            editValue: this.props.budget,
        };
    }
    onMouseover(e: any) {
        this.setState({ text: 'EDIT BUDGET' });
    }
    //clear the text
    onMouseout(e: any) {
        this.setState({ text: 'MONTHLY BUDGET' });
    }

    handleEditBudget(e: any) {
        this.setState({ editValue: e });
    }

    submitNewBudget() {
        if (
            this.state.editValue > 0 &&
            this.state.editValue < 10000 &&
            this.state.editValue != this.props.budget
        ) {
            this.props.submitNewBudget(this.state.editValue);
        } else {
            alert('Invalid budget.');
        }
        this.props.setEditBudget(false);
    }

    render() {
        return (
            <div className="spendlo-ext-summary-lines">
                <div className="spendlo-ext-summary-div">
                    <span className="spendlo-ext-summary-value">
                        {getCurrency(Math.ceil(this.props.spent)).replace(
                            '.00',
                            ''
                        )}
                    </span>
                    <span className="spendlo-ext-summary-line spendlo-ext-small-cap-font">
                        AMOUNT SPENT
                    </span>
                </div>
                {this.props.editBudget ? (
                    <div className="spendlo-ext-summary-div spendlo-ext-dropdown-budget-edit">
                        <div className="spendlo-ext-dropdown-edit-budget-bar">
                            <HighlightOffSharpIcon
                                className="cancel-button"
                                onClick={() => this.props.setEditBudget(false)}
                            />
                            <div className="spendlo-ext-dropdown-budget-input-row">
                                <span className="spendlo-ext-summary-value spendlo-ext-dropdown-budget-dollar-sign">
                                    $
                                </span>
                                <NumericInput
                                    onChange={this.handleEditBudget.bind(this)}
                                    className="spendlo-ext-dropdown-numeric-input-budget"
                                    min={0}
                                    max={10000}
                                    precision={0}
                                    style={false}
                                    value={this.state.editValue}
                                />
                            </div>
                            <CheckCircleOutlineRoundedIcon
                                className="spendlo-ext-dropdown-save"
                                onClick={this.submitNewBudget.bind(this)}
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        className="spendlo-ext-summary-div spendlo-ext-dropdown-summary-total"
                        onMouseEnter={this.onMouseover.bind(this)}
                        onMouseLeave={this.onMouseout.bind(this)}
                        onClick={() => {
                            if (!this.props.editBudget) {
                                this.props.setEditBudget(true);
                            }
                        }}
                    >
                        <span className="spendlo-ext-summary-value">
                            {getCurrency(this.props.budget).replace('.00', '')}
                        </span>
                        <span className="spendlo-ext-summary-line spendlo-ext-small-cap-font">
                            {this.state.text}
                        </span>
                    </div>
                )}
            </div>
        );
    }
}

export default BudgetSummary;
