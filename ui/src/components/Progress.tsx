import { Component } from 'react';

import CountUp from 'react-countup';

import {
    CircularProgressbarWithChildren,
    buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { getPercentage, getRange } from '../helpers/mathFns';
import React from 'react';

class Progress extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            interval: 100,
            valuesIndex: 0,
        };
    }

    getIntervalArray() {
        return this.props.last <= this.props.total
            ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                  (x) =>
                      (100 *
                          (this.props.last +
                              (x * (this.props.total - this.props.last)) /
                                  10)) /
                      this.props.budget
              )
            : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                  (x) =>
                      (100 *
                          (this.props.last -
                              (x * (this.props.last - this.props.total)) /
                                  10)) /
                      this.props.budget
              );
    }

    runInterval() {
        const values = this.getIntervalArray();
        const interval = setInterval(() => {
            if (this.state.valuesIndex < values.length) {
                this.setState({
                    valuesIndex: this.state.valuesIndex + 1,
                });
            } else {
                clearInterval(interval);
            }
        }, this.state.interval);
    }

    componentDidMount() {
        this.runInterval();
    }

    componentWillReceiveProps(nextProps: any) {
        if (
            nextProps.last != this.props.last ||
            nextProps.total != this.props.total ||
            nextProps.budget != this.props.budget ||
            nextProps.amount != this.props.amount
        ) {
            this.setState({ valuesIndex: 0 });
            this.runInterval();
        }
    }

    render() {
        const range = getRange(this.props.total, this.props.budget);
        const values = this.getIntervalArray();
        const perc = getPercentage(this.props.total, this.props.budget);
        const lastPerc = getPercentage(this.props.last, this.props.budget);
        const progressBody = `OF BUDGET USED`;
        return (
            <div className="spendlo-ext-dropdown-progress">
                <CircularProgressbarWithChildren
                    value={values[this.state.valuesIndex]}
                    strokeWidth={5}
                    styles={buildStyles({
                        pathColor: `${range.colour}`,
                        trailColor: '#eee',
                        strokeLinecap: 'square',
                    })}
                >
                    <div className="spendlo-ext-dropdown-progress-content">
                        <div className={`spendlo-ext-dropdown-progress-header`}>
                            <CountUp duration={1} start={lastPerc} end={perc} />
                            <span className="spendlo-ext-dropdown-perc">%</span>
                        </div>
                        <div className="spendlo-ext-dropdown-progress-body spendlo-ext-small-cap-font">
                            {progressBody}
                        </div>
                    </div>
                </CircularProgressbarWithChildren>
            </div>
        );
    }
}

export default Progress;
