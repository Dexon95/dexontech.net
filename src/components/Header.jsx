import React from "react";

import { Link, withRouter } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faJsfiddle, faGithub } from '@fortawesome/free-brands-svg-icons';

class Header extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showGoBack: false
    };
  }
  
  componentDidMount() {
    this.verifyGoBack();
    this.props.history.listen((location, action) => {
      this.verifyGoBack(location);
    });
  }
  
  verifyGoBack(newLocation = null) {
    if(newLocation)
      if(newLocation.pathname !== "/")
        this.setState({showGoBack: true});
      else
        this.setState({showGoBack: false});
    else
      if(this.props.location.pathname !== "/")
        this.setState({showGoBack: true});
      else
        this.setState({showGoBack: false});
  }
  
  render() {
    const containerStyle = {
      position: 'absolute',
      width: '100%'
    };
    
    const iconLinkStyle = {
      marginRight: '10px',
      lineHeight: '32px'
    };
    
    const iconStyle = {
      marginTop: '4px',
      marginRight: '7px'
    };
    
    const goBackButtonStyle = {
      display: (this.state.showGoBack ? 'inline-block' : 'none'),
      float: 'left',
      color: '#fff'
    };
    
    return (
      <header>
        <div className="row" style={containerStyle}>
          <div className="col s12" style={{textAlign: 'right', paddingTop: '10px'}}>
            <Link to="/" className="waves-effect btn-flat" style={goBackButtonStyle}><FontAwesomeIcon icon={faHome}/></Link>
            <a className="waves-effect waves-light btn-small blue" href="https://jsfiddle.net/user/Dexon95/fiddles" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
              <FontAwesomeIcon icon={faJsfiddle} className='material-icons left' style={iconStyle}/> JSFiddle
            </a>
            <a className="waves-effect waves-light btn-small blue-grey darken-4" href="https://github.com/Dexon95" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
              <FontAwesomeIcon icon={faGithub} className='material-icons left' style={iconStyle}/> Github
            </a>
          </div>
        </div>
      </header>
    );
  }
}
export default withRouter(Header);