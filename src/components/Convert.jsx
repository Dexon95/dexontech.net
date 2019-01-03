import React from "react";
import axios from 'axios';
import M from "materialize-css";

export default class Convert extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      fromAmount: 1,
      fromSymbol: 'BTC',
      toSymbol: 'USD',
      conversion: '',
      autoRefresh: false,
      autoRefreshProgress: 0,
      autoRefreshTimer: null,
      autoRefreshProgressBarStyle: {
        display: 'none'
      }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doConvert = this.doConvert.bind(this);
  }

  componentDidMount() {
    M.AutoInit();
    
    this.doConvert();
    this.updateAutoRefreshProgress();
  }

  handleInputChange(event) {
    this.setState({autoRefresh: false});
    
    if(event.target.name !== 'autoRefresh')
      this.refs['ref_autoRefreshCheckbox'].checked = false;
    else
      if(!event.target.checked)
        this.setState({autoRefresh: false});
      else 
        this.setState({autoRefresh: true});
    
    if(event.target.name === 'fromAmount')
      this.setState({fromAmount: parseFloat(event.target.value)});
    else if(event.target.name === 'fromSymbol')
      this.setState({fromSymbol: String(event.target.value).toUpperCase()});
    else if(event.target.name === 'toSymbol')
      this.setState({toSymbol: String(event.target.value).toUpperCase()});
  }

  doConvert() {
    axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${this.state.fromSymbol}&tsyms=${this.state.toSymbol}`)
    .then(res => {
      if(res.data["Response"] === "Error")
        this.setState({conversion: `Invalid pairs. (${this.state.fromSymbol}/${this.state.toSymbol})`});
      else{
        this.setState({conversion: `${this.state.fromAmount} ${this.state.fromSymbol} is ${parseFloat((this.state.fromAmount * res.data[this.state.toSymbol]).toFixed(6))} ${this.state.toSymbol}`, autoRefreshProgress: 0});
      }
        
    }).catch(err => {
      this.setState({conversion: `Invalid pairs. (${this.state.fromSymbol}/${this.state.toSymbol})`});
      console.error(err);
    });
  }
  
  updateAutoRefreshProgress() {
    if(this.state.autoRefresh){
      this.setState({autoRefreshProgressBarStyle: {height: '2px'}});
      if(this.state.autoRefreshProgress >= 100){
        this.setState({autoRefreshProgress: 0});
        this.doConvert();
      }else{
        let newProgress = this.state.autoRefreshProgress + 0.5;
        this.setState({autoRefreshProgress: newProgress});
      }
    }else this.setState({autoRefreshProgressBarStyle: {display: 'none'}, autoRefreshProgress: 0});
    let timer = setTimeout(() => {this.updateAutoRefreshProgress()}, 200);
    this.setState({autoRefreshTimer: timer});
  }
  
  render() {
    const containerStyle = {
      position: 'absolute',
      top: '0', right: '0', bottom: '0', left: '0',
      boxShadow: '0 0 300px 70px rgba(0, 0, 0, 0.2) inset',
      backgroundColor: '#2c3e50',
      backgroundImage: 'url(/images/noise.png), url(/images/sl.png)',
      color: '#7f8c8d'
    };
    
    const wrapperStyle = {
      height: '100%',
      textAlign: 'center',
      position: 'relative'
    };
    
    const inputStyle = {
      color: '#fff'
    };
    
    return (
      <section style={containerStyle}>
        
        <div className="row valign-wrapper" style={wrapperStyle}>
          <div className="col s12">
            <div className="container">
              <div className="row">
                <div className="col s12">
                  <div class="progress blue-grey lighten-5" style={this.state.autoRefreshProgressBarStyle}>
                    <div class="determinate blue-grey lighten-2" style={{width: this.state.autoRefreshProgress + '%'}}></div>
                  </div>
                  <h4 style={{color: '#ecf0f1'}}>{this.state.conversion}</h4>
                </div>
              </div>
              <div className="row">
                <div className="col s12 m8 l6 offset-m2 offset-l3">
                  <div className="row">
                    <div className="col m2 s5 input-field">
                      <input className="form-control" name="fromAmount" type="number" min="0" placeholder="1" defaultValue="1" autocomplete="off" onChange={this.handleInputChange} style={inputStyle}/>
                      <label className="active">Amount</label>
                    </div>
                    <div className="col m5 s7 input-field">
                      <input type="text" name="fromSymbol" placeholder="BTC" defaultValue="BTC" autocomplete="off" onChange={this.handleInputChange} style={inputStyle}/>
                      <label className="active">From Symbol</label>
                    </div>
                    <div className="col m5 s12 input-field">
                      <input type="text" name="toSymbol" placeholder="USD" defaultValue="USD" autocomplete="off" onChange={this.handleInputChange} style={inputStyle}/>
                      <label className="active">To Symbol</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col s12">
                  <button class="btn waves-effect" onClick={this.doConvert}>
                    Convert
                  </button>
                  <p>Auto refresh price</p>
                  <div className="switch">
                    <label>
                      Off
                      <input name="autoRefresh" ref="ref_autoRefreshCheckbox" type="checkbox" onChange={this.handleInputChange}/>
                      <span className="lever"></span>
                      On
                    </label>
                  </div>
                  <p>Powered by <a href="https://www.cryptocompare.com/" target="_blank" rel="noopener noreferrer">CryptoCompare</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}