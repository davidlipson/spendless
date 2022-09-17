import { Component } from 'react';
import ReactLogo from '../SpendLess.svg';

class TopBar extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }


  render() {
    return (
    <div className="spendless-ext-dropdown-top-bar">
       <div className="spendless-ext-icon"> <img src={ReactLogo} alt="React Logo" /></div>
        {process.env.NODE_ENV == "development" ? <div className="spendless-ext-logout-button" onClick={this.props.logout}>Logout</div> : <div className="spendless-ext-logout-button"></div>}
    </div>
    );
  }
}

export default TopBar;
