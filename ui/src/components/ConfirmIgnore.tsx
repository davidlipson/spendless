import { Component } from 'react';
import '../App.css';
import { getCurrency } from '../helpers/mathFns';
import { shortenText } from '../helpers/shortenText';

class ConfirmIgnore extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  confirm(c:any){
      this.props.confirm(c, this.props.data);
  }

  render() {
    return (
      <div className="confirm-ignore">
       <span className="alert-message">Ignore the {getCurrency(this.props.data.amount)} spent on {shortenText(this.props.data.description, 2)} in your monthly budget?</span>
       <div className="confirm-buttons">
           <a onClick={() => this.confirm(true)}>Yes</a>
           <a onClick={() => this.confirm(false)}>No</a>
        </div>
      </div> 
    );
  }
}

export default ConfirmIgnore;
