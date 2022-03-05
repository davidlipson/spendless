import React from 'react';
import { Component } from 'react';
import './App.css';

import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

class HistoryEntry extends Component<any,any>{
  constructor(props: any) {
    super(props);
  }

  handleDelete(id:any){
    this.props.delete(id);
  }

  render() {
    return (<tr>
            <td className="table-label">{this.props.data.label}</td>
            <td className="table-amount">{(this.props.data.amount).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}</td>
            <td>{this.props.data.date}</td>
            <td><Tooltip title="Remove from budget" onClick={() => this.handleDelete(this.props.data.id)}>
              <IconButton >
                <DeleteIcon />
              </IconButton>
            </Tooltip></td>
          </tr>)
  }
}

export default HistoryEntry;
