import React from "react";
import Particles from 'react-particles-js';

import { Link } from "react-router-dom";

export default class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
    this.state.particlesParams = {
      "particles": {
        "number": {
          "value": 160,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#fff"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          }
        },
        "opacity": {
          "value": 0.1,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 0.1,
            "opacity_min": 0,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 4,
            "size_min": 0.3,
            "sync": false
          }
        },
        "line_linked": {
          "enable": false,
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 1,
          "direction": "none",
          "random": true,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 600
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "bubble"
          },
          "onclick": {
            "enable": true,
            "mode": "repulse"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 400,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 150,
            "size": 0,
            "duration": 2,
            "opacity": 0,
            "speed": 3
          },
          "repulse": {
            "distance": 400,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    };
  }
  
  render() {
    const ParticlesContainerStyle = {
      position: "absolute",
      width: "100%",
      height: "100%"
    };
    
    return [
      <link rel="stylesheet" type="text/css" href="styles/bulma.min.css" />,
      <link rel="stylesheet" type="text/css" href="styles/default.css" />,
      <link rel="stylesheet" type="text/css" href="styles/Home.css" />,
      
      <section className="hero is-fullheight">
        <Particles style={ParticlesContainerStyle} params={this.state.particlesParams} />
    
        <div className="hero-head">
          <header className="navbar">
            <div className="container">
              <div className="navbar-brand">
                <span className="navbar-item">
                  <img src="https://s.gravatar.com/avatar/b2f6f3b0db367c654fc1405913d4fda1?s=80" alt="Avatar"/>
                </span>
              </div>
              <div id="navbarMenuHeroC" className="navbar-menu">
                <div className="navbar-end">
                  <span className="navbar-item">
                    <a className="button is-info is-inverted" href="https://jsfiddle.net/user/Dexon95/fiddles/" target="_blank" rel="noopener noreferrer">
                      <span className="icon">
                        <i className="fa fa-jsfiddle" />
                      </span>
                      <span>JSFiddle</span>
                    </a>
                  </span>
                  <span className="navbar-item">
                    <a className="button is-inverted" href="https://github.com/Dexon95" target="_blank" rel="noopener noreferrer">
                      <span className="icon">
                        <i className="fa fa-github" />
                      </span>
                      <span>Github</span>
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </header>
        </div>
    
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="title">I build Web Applications</h1>
            <h2 className="subtitle">contact@dexontech.net</h2>
          </div>
        </div>
    
        <div className="hero-foot">
          <nav className="tabs is-boxed is-fullwidth">
            <div className="container">
              <ul>
                <li><Link to="/c">Convert</Link></li>
              </ul>
            </div>
          </nav>
        </div>
      </section>
    ];
  }
}
