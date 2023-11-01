import { Component } from 'react';
import Progress from './Progress';
import History from './History';
import { getRange } from '../helpers/mathFns';
import Cookies from 'universal-cookie';
import { loginUser, onboardUser } from '../api/login';
import { getHistory } from '../api/history';
import { ignoreTransaction } from '../api/ignore';
import BudgetSummary from './BudgetSummary';
import TopBar from './TopBar';
import { updateBudget } from '../api/budget';
import SyncNotice from './SyncNotice';
import Onboard from './Onboard';
import React from 'react';
import { host } from '../environment';
import { SPENDLO_COOKIE } from '../types';

const cookies = new Cookies();

class App extends Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            user: false,
            sync: true,
            spent: 0,
            last: 0,
            price: 0,
            history: [],
            page: '',
            pendingAmount: 0,
            editBudget: false,
            onboarded: false,
        };
    }

    onboardUser = async () => {
        try {
            if (this.state.user) {
                const result = await onboardUser(this.state.user.id);
                this.setState({ user: result, onboarded: result.onboarded });
                this.history(this.state.user.id);
            }
        } catch (e) {
            console.log(e);
        }
    };

    loginGoogleProfile = async () => {
        try {
            let s = this;
            chrome.identity.getProfileUserInfo(async (userInfo) => {
                let email = userInfo.email;
                if (email && email !== '') {
                    await s.login({ email });
                } else {
                    this.setState({ sync: false });
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    async componentDidMount() {
        const currentUser = cookies.get(SPENDLO_COOKIE as string);
        if (currentUser) {
            await this.setUser(currentUser);
        } else {
            await this.loginGoogleProfile();
        }
    }

    setUser = async (uid: string) => {
        try {
            const url = `${host}/user?uid=${uid}`;
            const response = await fetch(url);
            const data = await response.json();
            this.setState({ user: data[0], onboarded: data[0].onboarded });
            this.history(this.state.user.id);
        } catch (error) {
            await this.loginGoogleProfile();
            console.log(error);
        }
    };

    handleLogin = async (data: any) => {
        await this.login(data.profileObj);
    };

    login = async (profile: any) => {
        const user = await loginUser(profile, true);
        if (user) {
            this.setState({ user, onboarded: user.onboarded });
            this.history(this.state.user.id);
        } else {
            this.setState({ user, history: [], spent: 0 });
        }
    };

    history = async (uid: string) => {
        const { history, spent } = await getHistory(uid);
        this.setState({ history, spent });
    };

    handleLoginFailure = async (data: any) => {
        alert(data);
    };

    ignoreTransaction(data: any) {
        this.ignore(true, data);
    }

    ignore = async (c: boolean, d: any) => {
        try {
            if (c == true) {
                await ignoreTransaction(this.state.user.id, d.id);
                const newLast = this.state.spent + this.state.price;
                const newSpent = Math.max(this.state.spent - d.amount, 0);
                this.setState({ last: newLast, spent: newSpent });
                await this.history(this.state.user.id);
            }
        } catch (error) {
            console.log(error);
        }
    };

    submitNewBudget = async (budget: number) => {
        await updateBudget(this.state.user.id, budget);
        this.setUser(this.state.user.id);
    };

    initialize() {
        cookies.remove(SPENDLO_COOKIE as string, {
            path: '/',
        });
        this.setState({
            user: false,
            spent: 0,
            last: 0,
            price: 0,
            history: [],
            onboarded: false,
        });
    }

    logout() {
        this.initialize();
    }

    render() {
        const range = getRange(
            this.state.price + this.state.spent,
            this.state.user.budget
        );
        if (!this.state.user || !this.state.sync) {
            return (
                <div className="spendlo-ext-app spendlo-ext-dropdown">
                    <SyncNotice />
                </div>
            );
        }
        return (
            <div className="spendlo-ext-app spendlo-ext-dropdown">
                {this.state.onboarded ? (
                    <>
                        <TopBar
                            logout={this.logout.bind(this)}
                            editBudget={this.state.editBudget}
                            setEditBudget={(v: boolean) =>
                                this.setState({ editBudget: v })
                            }
                        />
                        <Progress
                            amount={this.state.price}
                            last={this.state.last}
                            total={this.state.price + this.state.spent}
                            budget={this.state.user.budget}
                        />
                        <div className="overall-summary">
                            <BudgetSummary
                                editBudget={this.state.editBudget}
                                setEditBudget={(v: boolean) =>
                                    this.setState({ editBudget: v })
                                }
                                submitNewBudget={this.submitNewBudget.bind(
                                    this
                                )}
                                spent={this.state.spent}
                                budget={this.state.user.budget}
                            />
                            <div className="spendlo-ext-divider-bar"></div>
                            <div className="spendlo-ext-dropdown-history">
                                <History
                                    ignore={this.ignoreTransaction.bind(this)}
                                    data={this.state.history.slice(0, 3)}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <Onboard onboardUser={this.onboardUser} />
                )}
            </div>
        );
    }
}

export default App;
