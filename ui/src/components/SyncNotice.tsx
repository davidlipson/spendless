import React from 'react';
import { Component } from 'react';

class SyncNotice extends Component<any, any> {
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
                    <div
                        className={`spendlo-ext-welcome-body spendlo-ext-onboard-body`}
                    >
                        In order to use Spendlo, you must have your{' '}
                        <a href="https://support.google.com/chrome/answer/185277?hl=en&co=GENIE.Platform%3DDesktop">
                            sync settings
                        </a>{' '}
                        turned on in Chrome.
                    </div>
                </div>
            </>
        );
    }
}

export default SyncNotice;
