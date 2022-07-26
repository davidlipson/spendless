import React from 'react';
import { Component } from 'react';
import './App.css';

import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { getCurrency } from './Helpers';
import ConfirmIgnore from './ConfirmIgnore';

class HistoryEntry extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  handleIgnore(){
    this.props.ignore(this.props.data);
  }

  convertToDateString(date:string){
    return date.split("T")[0].replaceAll("-", "/");
  }

  /*
 {this.state.ignoring == true ? 
              <td><Tooltip title="Ignore?">
              <IconButton >
                <DeleteIcon />
              </IconButton>
            </Tooltip></td> : <td></td>}
            */

  render() {
    return (
        <tr onClick={() => this.handleIgnore()}>
            <td className="table-label">{this.props.data.description.length > 15 ? `${this.props.data.description.substring(0,14)}...` : this.props.data.description}</td>
            <td className="table-amount">{getCurrency(this.props.data.amount)}</td>
            <td className='table-timestamp'>{this.convertToDateString(this.props.data.timestamp)}</td>
        </tr>
    )
  }
}

export default HistoryEntry;
