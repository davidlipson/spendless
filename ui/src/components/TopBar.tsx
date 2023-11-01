import React from 'react';
import { Component } from 'react';

class TopBar extends Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className="spendlo-ext-dropdown-top-bar">
                <div className="spendlo-header-text">Spendlo</div>
                <div className="spendlo-right-top">
                    <span
                        onClick={() => {
                            this.props.setEditBudget(!this.props.editBudget);
                        }}
                        className="spendlo-ext-summary-line spendlo-ext-small-cap-font"
                    >
                        {this.props.editBudget ? 'KEEP BUDGET' : 'EDIT BUDGET'}
                    </span>
                    <div className="spendlo-ext-logout-button"></div>
                </div>
            </div>
        );
    }
}

export default TopBar;
