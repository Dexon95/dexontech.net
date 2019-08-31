import React from "react";
import M from "materialize-css";

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

class Footer extends React.Component {
  componentDidMount() {
    M.AutoInit();
  }
  
  render() {
    const containerStyle = {
      position: 'absolute',
      width: '100%',
      bottom: 0,
      textAlign: 'center'
    };
    
    const iconLinkStyle = {
      marginRight: '10px',
      lineHeight: '32px',
      color: '#ecf0f1'
    };
    
    const iconStyle = {
      marginTop: '4px',
      marginRight: '7px'
    };
    
    return (
      <footer>
        <div className="row" style={containerStyle}>
          <div className="col s12">
            <Link to="/c" className="waves-effect btn-flat" style={iconLinkStyle}>
              <FontAwesomeIcon icon={faCoins} className='material-icons left' style={iconStyle}/> Convertion tool
            </Link>
            <Link to="/vanitygen" className="waves-effect btn-flat" style={iconLinkStyle}>
              <FontAwesomeIcon icon={faBitcoin} className='material-icons left' style={iconStyle}/> Vanity Generator
            </Link>
            <Link to="/aipong" className="waves-effect btn-flat" style={iconLinkStyle}>
              <FontAwesomeIcon icon={faRobot} className='material-icons left' style={iconStyle}/> Machine Learning - Pong
            </Link>
          </div>
        </div>
        
      </footer>
    );
  }
}
export default Footer;