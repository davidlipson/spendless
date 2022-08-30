import { Component } from 'react';
import '../App.css';
import { getCurrency } from '../helpers/mathFns';
import { shortenText } from '../helpers/shortenText';
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp';

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
          {this.props.editMode && <td onClick={() => this.handleIgnore()} className="ignore-button"><HighlightOffSharpIcon className="cancel-button"/></td>}
            <td className="table-label">
              <div className="history-name">{name == "" ? "Unknown Transaction" : name}</div>
              <div className="history-timestamp">{this.convertToDateString(this.props.data.timestamp)}</div>
            </td>
            <td className="table-amount">{getCurrency(this.props.data.amount)}</td>
        </tr>
    )
  }
}

export default HistoryEntry;
