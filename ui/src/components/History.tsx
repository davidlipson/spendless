import { Component } from 'react';
import HistoryEntry from './HistoryEntry';
import Button from '@mui/material/Button';
import React from 'react';

class History extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            editMode: false,
        };
    }

    render() {
        return (
            <div className="spendless-ext-dropdown-history-body">
                {this.props.data.length > 0 ? (
                    <>
                        <div className="spendless-ext-dropdown-transactions-title spendless-ext-small-cap-font">
                            RECENT TRANSACTIONS
                        </div>
                        <table className="purchase-history-table">
                            <tbody>
                                {this.props.data.map((h: any) => {
                                    return (
                                        <HistoryEntry
                                            editMode={this.state.editMode}
                                            data={h}
                                            ignore={this.props.ignore}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                        <Button
                            onClick={() =>
                                this.setState({
                                    editMode: !this.state.editMode,
                                })
                            }
                            className={`spendless-ext-dropdown-manage-transactions spendless-ext-dropdown-manage-transactions-${
                                this.state.editMode ? 'on' : 'off'
                            }`}
                            variant="contained"
                        >
                            {this.state.editMode
                                ? 'Done editing'
                                : 'Edit transactions'}
                        </Button>
                    </>
                ) : (
                    <div className="spendless-ext-dropdown-empty">
                        You do not have any recent transactions.
                    </div>
                )}
            </div>
        );
    }
}

export default History;
