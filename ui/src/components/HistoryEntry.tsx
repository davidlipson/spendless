import { Component } from 'react';
import { getCurrency } from '../helpers/mathFns';
import { shortenText } from '../helpers/shortenText';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';
import React from 'react';

class HistoryEntry extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  handleIgnore(){
    this.props.ignore(this.props.data);
  }

  convertToDateString(date:string){
    return new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  render() {
    const name = shortenText(this.props.data.description, 2)
    return (
        <tr>
          {this.props.editMode && <td onClick={() => this.handleIgnore()} className="spendless-ext-dropdown-ignore"><HighlightOffSharpIcon className="spendless-ext-dropdown-cancel"/></td>}
            <td className="spendless-ext-dropdown-table-label">
              <div className="spendless-ext-dropdown-history-name">{name == "" ? "Unknown Transaction" : name}</div>
              <div className="spendless-ext-dropdown-history-timestam">{this.convertToDateString(this.props.data.timestamp)}</div>
            </td>
            <td className="spendless-ext-dropdown-table-amount">{getCurrency(this.props.data.amount)}</td>
        </tr>
    )
  }
}

export default HistoryEntry;
