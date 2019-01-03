import React from "react";

class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
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
    
    return (
      <section style={containerStyle}>
        
        <div class="row valign-wrapper" style={{height: '100%', textAlign: 'center', position: 'relative'}}>
          <div class="col s12">
            <h4 style={{color: '#ecf0f1', margin: '0'}}>Hello, I build Web stuff</h4>
            <h5 style={{color: '#7f8c8d', margin: '1rem 0'}}>contact@dexontech.net</h5>
          </div>
        </div>
        
      </section>
    );
  }
}
export default Home;