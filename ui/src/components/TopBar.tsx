

import { Component } from 'react';
import '../App.css';
import ReactLogo from '../SpendLess.svg';

class TopBar extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }


  render() {
    return (
    <div className="top-bar">
       <div className="spendless-icon"> <img src={ReactLogo} alt="React Logo" /></div>
        {process.env.NODE_ENV == "development" ? <div className="logout-button" onClick={this.props.logout}>Logout</div> : <div className="logout-button"></div>}
    </div>
    );
  }
}

export default TopBar;
