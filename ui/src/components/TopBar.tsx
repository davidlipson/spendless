import { Component } from 'react';
import EditIcon from '@mui/icons-material/Edit';

class TopBar extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }


  render() {
    return (
    <div className="spendless-ext-dropdown-top-bar">
       <div className="spendlo-header-text">Spendlo</div>
        {process.env.NODE_ENV == "development" ? <div className="spendless-ext-logout-button" onClick={this.props.logout}>Logout</div> : 
        <div className="spendless-right-top">
          <EditIcon onClick={() => {this.props.setEditBudget(!this.props.editBudget)}}/>
          <div className="spendless-ext-logout-button"></div>
          </div>}
    </div>
    );
  }
}

export default TopBar;
