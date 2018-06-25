import React from "react";
import axios from 'axios';

import { Link } from "react-router-dom";

export default class Convert extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      fromAmount: 1,
      fromSymbol: 'BTC',
      toSymbol: 'USD',
      conversion: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doConvert = this.doConvert.bind(this);
  }

  componentDidMount() {
    this.doConvert();
  }

  componentDidUpdate() {

  }

  handleInputChange(event) {
    if(event.target.id === 'fromAmount')
      this.setState({fromAmount: parseInt(event.target.value, 10)});
    else if(event.target.id === 'fromSymbol')
      this.setState({fromSymbol: String(event.target.value).toUpperCase()});
    else if(event.target.id === 'toSymbol')
      this.setState({toSymbol: String(event.target.value).toUpperCase()});
  }

  doConvert() {
    axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${this.state.fromSymbol}&tsyms=${this.state.toSymbol}`)
    .then(res => {
      if(res.data["Response"] === "Error")
        this.setState({conversion: `Invalid pairs. (${this.state.fromSymbol}/${this.state.toSymbol})`});
      else
        this.setState({conversion: `${this.state.fromAmount} ${this.state.fromSymbol} is ${(this.state.fromAmount * res.data[this.state.toSymbol])} ${this.state.toSymbol}`});
    }).catch(err => {
      this.setState({conversion: `Invalid pairs. (${this.state.fromSymbol}/${this.state.toSymbol})`});
    });
  }
  
  render() {

    return [
      <link rel="stylesheet" type="text/css" href="styles/bootstrap.min.css" />,
      <link rel="stylesheet" type="text/css" href="styles/default.css" />,
      <link rel="stylesheet" type="text/css" href="styles/Convert.css" />,
      
      <div className="site-wrapper">
        <div className="site-wrapper-inner">
          <div className="cover-container">
            <div className="masthead clearfix">
              <div className="inner">
                <h3 className="masthead-brand">Convert</h3>
                <nav>
                  <ul class="nav masthead-nav">
                    <li><Link to="/">Go Back</Link></li>
                  </ul>
                </nav>
              </div>
            </div>

            <div className="inner cover">
              <h1 className="cover-heading"><span id="conversion">{this.state.conversion}</span></h1>
              <form className="form-horizontal" onsubmit="return false">
                <div className="form-group form-group-lg">
                  <div className="col-sm-5">
                    <input className="form-control" type="number" min="0" id="fromAmount" placeholder="1" defaultValue="1" onChange={this.handleInputChange} />
                  </div>
                  <div className="col-sm-3">
                    <input className="form-control" type="text" id="fromSymbol" placeholder="BTC" defaultValue="BTC" onChange={this.handleInputChange} />
                  </div>
                  <label className="col-sm-1 control-label">to</label>
                  <div className="col-sm-3">
                    <input className="form-control" type="text" id="toSymbol" placeholder="USD" defaultValue="USD" onChange={this.handleInputChange} />
                  </div>
                </div>
                <a className="btn btn-info" id="convert_button" onClick={this.doConvert}>Convert</a>
              </form>
            </div>

            <div className="mastfoot">
              <div className="inner">
                <p>Using <a href="https://www.cryptocompare.com/" target="_blank" rel="noopener noreferrer">CryptoCompare</a>. Data fetched from over 20 different exchange websites.</p>
              </div>
            </div>
          </div>
        </div>
      </div>,

      <div id="market_list">
        <ul></ul>
      </div>
    ];
  }
}
