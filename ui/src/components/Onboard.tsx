import { Component } from 'react';
import Button from '@mui/material/Button';
import React from 'react';

class Onboard extends Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                <div className="onboarding-body">
                    <div className="spendlo-header-text">
                        Welcome to Spendlo
                    </div>
                    <div className="spendlo-ext-divider-bar"></div>
                    <div className="spendlo-ext-welcome-body spendlo-ext-dropdown-subline-onboard">
                        We built Spendlo to help people spend less money on
                        online shopping.
                    </div>
                    <div
                        className={`spendlo-ext-welcome-body spendlo-ext-onboard-body`}
                    >
                        All you have to do is <b>set a monthly budget</b> and
                        we’ll show you how much of your budget you’ve already
                        spent on online checkout pages whenever you’re using the
                        Chrome web browser.
                    </div>
                    <div
                        className={`spendlo-ext-welcome-body spendlo-ext-onboard-body`}
                    >
                        <Button
                            onClick={() => this.props.onboardUser()}
                            className={`spendlo-ext-dropdown-manage-transactions spendlo-ext-dropdown-manage-transactions-on spendlo-ext-onboard-button`}
                            variant="contained"
                        >
                            Get Started
                        </Button>{' '}
                        and set your custom monthly budget now.
                    </div>
                </div>
            </>
        );
    }
}

export default Onboard;
