import React from "react";
import M from "materialize-css";
import Bitcoin from "bitcoinjs-lib";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEdit } from '@fortawesome/free-solid-svg-icons';

class Vanitygen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isGenerating: false,
      hasError: false,
      P2SH: false,
      prefixInput: '',
      hps: 0,
      result: ''
    };
    
    this.ref_prefixInput = React.createRef();
    this.ref_P2SHCheckbox = React.createRef();
    this.ref_inputHelperText = React.createRef();
    this.ref_exampleAddyRest = React.createRef();
    this.ref_genButton = React.createRef();
    
    this.genRandomHex = this.genRandomHex.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleGenerate = this.handleGenerate.bind(this);
    this.generate = this.generate.bind(this);
    
    this.amountHashes = 0;
    this.hpsTimer = null;
  }

  componentDidMount() {
    M.AutoInit();
    
    this.ref_exampleAddyRest.current.innerText = this.genRandomHex(33);
  }
  
  genRandomHex(length) {
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let string = "";
    for(let i=0; i<length; i++){
      string += alphabet[Math.floor(Math.random()*alphabet.length)];
    }
    return string;
  }
  
  handleInputChange(event) {
    if(event.target.id === 'prefixInput'){
      const value = event.target.value;
      
      if(value.length === 0){
        event.target.classList.remove("valid");
        event.target.classList.remove("invalid");
        this.setState({prefixInput: value, hasError: false});
      }else{
        if(!new RegExp("^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{0,8}$").test(value)){
          event.target.classList.remove("valid");
          event.target.classList.add("invalid");
          this.setState({hasError: true});
        }else{
          event.target.classList.add("valid");
          event.target.classList.remove("invalid");
          this.setState({prefixInput: value, hasError: false});
        }
      }
      
      this.setState({custom: event.target.value});
      this.ref_exampleAddyRest.current.innerText = this.genRandomHex(33 - value.length);
    }else if(event.target.id === 'P2SH'){
      if(event.target.checked)
        this.setState({P2SH: true});
      else
        this.setState({P2SH: false});
    }
  }
  
  handleGenerate() {
    if(this.state.hasError) return;
    
    if(this.state.isGenerating){
      this.setState({isGenerating: false, hps: 0}, () => {
        this.ref_genButton.current.classList.remove('grey');
        this.ref_genButton.current.classList.add('blue');
        this.ref_genButton.current.innerText = "Generate";
        this.ref_prefixInput.current.disabled = false;
        this.ref_P2SHCheckbox.current.disabled = false;
        this.amountHashes = 0;
      });
    }else if(!this.state.isGenerating){
      this.setState({isGenerating: true, hps: 0, result: {}}, () => {
        this.ref_genButton.current.classList.remove('blue');
        this.ref_genButton.current.classList.add('grey');
        this.ref_genButton.current.innerText = "Stop";
        this.ref_prefixInput.current.disabled = true;
        this.ref_P2SHCheckbox.current.disabled = true;
        this.amountHashes = 0;
        
        this.hpsTimer = setInterval(()=>{
          this.setState({hps: this.amountHashes}, () => {
            this.amountHashes = 0;
          });
          
          if(!this.state.isGenerating) clearInterval(this.hpsTimer);
        }, 1000);
        
        this.generate(this.state.prefixInput, this.state.P2SH);
      });
    }else return;
  }
  
  generate(goal, P2SH) {
    if(!this.state.isGenerating) return;
    let result = null;
    if(P2SH){
      const keyPair = Bitcoin.ECPair.makeRandom();
      const {address} = Bitcoin.payments.p2sh({
        redeem: Bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey })
      });
      
      result = {
        pub: address,
        priv: keyPair.toWIF()
      };
      
      if(result.pub.substring(0, goal.length+1) === "3"+goal){
        // Addy found.
        this.setState({isGenerating: false, hps: 0, result: {pub: result.pub, priv: result.priv}}, () => {
          this.ref_genButton.current.classList.remove('grey');
          this.ref_genButton.current.classList.add('blue');
          this.ref_genButton.current.innerText = "Generate";
          this.ref_prefixInput.current.disabled = false;
          this.ref_P2SHCheckbox.current.disabled = false;
          this.amountHashes = 0;
        });
        return console.log(result);
      }
    }else{
      const keyPair = Bitcoin.ECPair.makeRandom();
      const {address} = Bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
      
      result = {
        pub: address,
        priv: keyPair.toWIF()
      };
      
      if(result.pub.substring(0, goal.length+1) === "1"+goal){
        // Addy found.
        this.setState({isGenerating: false, hps: 0, result: {pub: result.pub, priv: result.priv}}, () => {
          this.ref_genButton.current.classList.remove('grey');
          this.ref_genButton.current.classList.add('blue');
          this.ref_genButton.current.innerText = "Generate";
          this.ref_prefixInput.current.disabled = false;
          this.ref_P2SHCheckbox.current.disabled = false;
          this.amountHashes = 0;
        });
        return console.log(result);
      }
    }
    
    this.amountHashes++;
    
    window.requestAnimationFrame(()=>{this.generate(goal, P2SH)});
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
    
    const iconStyle = {
      fontSize: '20px',
      top: '1rem'
    };
    
    const inputStyle = {
      color: '#fff'
    };
    
    const exampleAddyStartStyle = {
      color: '#EC9D35'
    };
    
    const exampleAddyPrefixStyle = {
      color: '#FFFFFF'
    };
    
    const generateButtonStyle = {
      display: this.state.hasError ? 'hidden' : 'inline-block'
    };
    
    return (
      <section style={containerStyle}>
        
        <div className="row valign-wrapper" style={wrapperStyle}>
          <div className="col s12">
            
            <div className="container">
              <div className="row">
                <div className="col s12 m10 offset-m1">
                  
                  <div className="input-field col s9">
                    <FontAwesomeIcon icon={faEdit} className='material-icons prefix' style={iconStyle} />
                    <input className="validate" ref={this.ref_prefixInput} id="prefixInput" type="text" maxLength="8" data-length="8" style={inputStyle} onChange={this.handleInputChange} />
                    <label for="prefixInput">Prefix</label>
                    <span className="helper-text" ref={this.ref_inputHelperText} data-error="Alphanumeric characters only and no ambiguity (O,l,0 or I)" data-success=""> </span>
                  </div>
                  
                  <div className="input-field col s2">
                    <p>
                      <label>
                        <input id="P2SH" ref={this.ref_P2SHCheckbox} type="checkbox" onChange={this.handleInputChange} />
                        <span>SegWit P2SH</span>
                      </label>
                    </p>
                  </div>
                  
                  <div className="input-field col s12">
                    <h5>Ex. <span id="exampleAddyStart" style={exampleAddyStartStyle}>{this.state.P2SH ? '3' : '1'}</span><span style={exampleAddyPrefixStyle}>{this.state.prefixInput}</span><span ref={this.ref_exampleAddyRest}></span></h5>
                    <h6>{this.state.hps > 0 ? this.state.hps+' Hashes per seconds' : ''}</h6>
                    <h6>{this.state.result.pub?'Address: '+this.state.result.pub:''}</h6>
                    <h6>{this.state.result.priv?'WIF: '+this.state.result.priv:''}</h6>
                  </div>
                  
                  <div className="col s12">
                    <button className="btn waves-effect waves-light blue" ref={this.ref_genButton} style={generateButtonStyle} onClick={this.handleGenerate}>Generate</button>
                  </div>
                  
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </section>
    );
  }
}
export default Vanitygen;