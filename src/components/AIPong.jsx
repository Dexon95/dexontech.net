import React from "react";
import BrainJS from "brain.js";
import Random from "random";

class AIPong extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: null,
      height: null,
      humanPoints: 0,
      aiPoints: 0,
      humanY: 0,
      aiY: 0,
      ballX: null,
      ballY: null,
      ballOriginX: null,
      ballOriginY: null,
      ballTargetX: null,
      ballTargetY: null,
      ballSpeed: 5,
      lastBallUpdate: null,
      aiHistory: [],
      gameState: "iddle"
    };

    this.getPercent = this.getPercent.bind(this);
    this.getValue = this.getValue.bind(this);
    this.onresize = this.onresize.bind(this);
    this.onmousemove = this.onmousemove.bind(this);
    this.onclick = this.onclick.bind(this);
    this.draw = this.draw.bind(this);
    this.teachAI = this.teachAI.bind(this);

    this.ai = new BrainJS.NeuralNetwork();
  }

  getPercent(n, t) {
    return parseFloat(n / t);
  }

  getValue(p, t) {
    return parseFloat(t * p);
  }

  componentDidMount() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
      humanY: window.innerHeight / 2 - 30,
      aiY: window.innerHeight / 2 - 30,
      ballX: window.innerWidth / 2 - 5,
      ballY: window.innerHeight / 2 - 5,
      ballOriginX: window.innerWidth / 2 - 5,
      ballOriginY: window.innerHeight / 2 - 5,
      ballTargetX: null,
      ballTargetY: null,
      ballSpeed: 5,
      lastBallUpdate: new Date().getTime(),
      aiHistory: [],
      gameState: "iddle"
    });

    window.addEventListener("resize", this.onresize);

    this.draw();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onresize);
  }

  onresize() {
    const canvas = this.refs.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.setState({
      width: canvas.width,
      height: canvas.height,
      ballX: (canvas.width * this.state.ballX) / this.state.width,
      ballY: (canvas.height * this.state.ballY) / this.state.height,
      ballOriginX: (canvas.width * this.state.ballOriginX) / this.state.width,
      ballOriginY:
        (canvas.height * this.state.ballOriginY) / this.state.height,
      ballTargetX: (canvas.width * this.state.ballTargetX) / this.state.width,
      ballTargetY:
        (canvas.height * this.state.ballTargetY) / this.state.height,
      humanY: Math.max(
        0,
        Math.min(
          this.state.height - 60,
          (canvas.height * this.state.humanY) / this.state.height
        )
      ),
      aiY: Math.max(
        0,
        Math.min(
          this.state.height - 60,
          (canvas.height * this.state.aiY) / this.state.height
        )
      )
    });
  }

  onmousemove(event) {
    this.setState({
      humanY: Math.max(
        0,
        Math.min(this.state.height - 60, event.clientY - 30)
      )
    });
  }

  onclick() {
    if (this.state.gameState === "iddle") {
      this.setState({
        gameState: "playing",
        ballOriginX: this.state.ballX,
        ballOriginY: this.state.ballY,
        ballTargetX: this.state.humanPoints >= this.state.aiPoints ? 0 : this.state.width,
        ballTargetY: this.state.ballY
      });
    }
  }

  draw() {
    const canvas = this.refs.canvas;
    if(!canvas) return;
    
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, this.state.width, this.state.height);

    const drawBallEntity = () => {
      ctx.fillStyle = "white";

      let x = this.state.ballX;
      let y = this.state.ballY;
      ctx.fillRect(x, y, 10, 10);

      if (
        this.state.gameState === "playing" &&
        new Date().getTime() > this.state.lastBallUpdate + 16
      ) {
        if (this.state.ballTargetX !== null) {
          if (this.state.ballX !== this.state.ballTargetX) {
            x += (this.state.ballTargetX - (this.state.ballTargetX < this.state.width / 2 ? this.state.width : 0)) / (1000 - (this.state.ballSpeed * 100));
          }
        }

        if (this.state.ballTargetY !== null) {
          if (this.state.ballY !== this.state.ballTargetY) {
            y += ((this.state.ballOriginY + this.state.ballTargetY) - this.state.ballOriginY) / (1000 - (this.state.ballSpeed * 100));
          }
        }

        if (
          x <= 15 &&
          y <= this.state.humanY + 60 &&
          y + 10 >= this.state.humanY
        ) {
          const ballIsUnderMid = y + 10 < this.state.humanY + 30;
          const ballIsOverMid = y > this.state.humanY + 30;
          const ballIsOnMid = y < this.state.humanY + 30 && y + 10 > this.state.humanY + 30;

          let ballDist = 0;

          if(ballIsUnderMid){
            ballDist = Math.max(-29, y + 10 - (this.state.humanY + 30));
          }else if(ballIsOverMid){
            ballDist = Math.min(29, y - (this.state.humanY + 30));
          }else if(ballIsOnMid){
            const midTopDist = (this.state.humanY + 30) - y;
            const midBottomDist = y + 10 - (this.state.humanY + 30);
            ballDist = midTopDist > midBottomDist ? midTopDist * -1 : midBottomDist;
          }

          const newTargetX = this.state.width;
          const newTargetY = this.state.height * (this.getPercent(ballDist, 30));

          this.teachAI(this.state, true);

          return this.setState(prevState => ({
            ballX: Math.max(0, Math.min(prevState.width - 10, x)),
            ballY: Math.max(0, Math.min(prevState.height - 10, y)),
            lastBallUpdate: new Date().getTime(),
            ballTargetX: newTargetX,
            ballTargetY: newTargetY,
            ballOriginX: x,
            ballOriginY: y,
            ballSpeed: (prevState.ballSpeed += 0.2)
          }));
        }

        if (
          x + 10 >= this.state.width - 15 &&
          y <= this.state.aiY + 60 &&
          y + 10 >= this.state.aiY
        ) {
          const ballIsUnderMid = y + 10 < this.state.aiY + 30;
          const ballIsOverMid = y > this.state.aiY + 30;
          const ballIsOnMid = y < this.state.aiY + 30 && y + 10 > this.state.aiY + 30;

          let ballDist = 0;

          if(ballIsUnderMid){
            ballDist = Math.max(-29, y + 10 - (this.state.aiY + 30));
          }else if(ballIsOverMid){
            ballDist = Math.min(29, y - (this.state.aiY + 30));
          }else if(ballIsOnMid){
            const midTopDist = (this.state.aiY + 30) - y;
            const midBottomDist = y + 10 - (this.state.aiY + 30);
            ballDist = midTopDist > midBottomDist ? midTopDist * -1 : midBottomDist;
          }

          const newTargetX = 0;
          const newTargetY = this.state.height * (this.getPercent(ballDist, 30));

          this.teachAI(this.state, false, true);

          return this.setState(prevState => ({
            ballX: Math.max(0, Math.min(prevState.width - 10, x)),
            ballY: Math.max(0, Math.min(prevState.height - 10, y)),
            lastBallUpdate: new Date().getTime(),
            ballTargetX: newTargetX,
            ballTargetY: newTargetY,
            ballOriginX: x,
            ballOriginY: y,
            ballSpeed: (prevState.ballSpeed += 0.2)
          }));
        }

        if (y <= 0) {
          y = 1;
          const newTargetY = Random.float(this.state.height * 0.1, this.state.height * 1.5);

          return this.setState(prevState => ({
            ballX: Math.max(0, Math.min(prevState.width - 10, x)),
            ballY: Math.max(0, Math.min(prevState.height - 10, y)),
            lastBallUpdate: new Date().getTime(),
            ballTargetY: newTargetY,
            ballOriginX: x,
            ballOriginY: y
          }));
        }

        if (y >= this.state.height - 10) {
          y = this.state.height - 11;
          const newTargetY = this.state.height - Random.float(this.state.height * 0.1, this.state.height * 1.5);

          return this.setState(prevState => ({
            ballX: Math.max(0, Math.min(prevState.width - 10, x)),
            ballY: Math.max(0, Math.min(prevState.height - 10, y)),
            lastBallUpdate: new Date().getTime(),
            ballTargetY: newTargetY,
            ballOriginX: x,
            ballOriginY: y
          }));
        }

        if (this.state.gameState === "playing") {
          if (x <= 0) {
            console.log("AI SCORED");
            return this.setState({
              gameState: "iddle",
              ballX: canvas.width / 2 - 5,
              ballY: canvas.height / 2 - 5,
              ballTargetX: null,
              ballTargetY: null,
              ballSpeed: 5,
              aiPoints: this.state.aiPoints + 1
            });
          } else if (x + 10 >= this.state.width) {
            console.log("HUMAN SCORED");
            this.teachAI(this.state);
            return this.setState({
              gameState: "iddle",
              ballX: canvas.width / 2 - 5,
              ballY: canvas.height / 2 - 5,
              ballTargetX: null,
              ballTargetY: null,
              ballSpeed: 5,
              humanPoints: this.state.humanPoints + 1
            });
          }
        }

        this.setState(prevState => ({
            ballX: Math.max(0, Math.min(prevState.width - 10, x)),
            ballY: Math.max(0, Math.min(prevState.height - 10, y)),
            lastBallUpdate: new Date().getTime()
          }), () => {
            if(this.state.aiHistory.length > 0){
              const aiAction = this.ai.run({
                ballY: this.getPercent(this.state.ballY, this.state.height)
              });
              this.setState(prevState => ({
                aiY: Math.max(
                  0,
                  Math.min(
                    prevState.height - 60,
                    this.getValue(parseFloat(aiAction.y), prevState.height)
                  )
                )
              }));
            }
          }
        );
      }
    };

    const drawPlayerEntity = () => {
      ctx.fillStyle = "white";

      let x = 5;
      let y =
        this.state.humanY !== null
          ? this.state.humanY
          : this.state.height / 2 - 30;
      ctx.fillRect(x, y, 10, 60);
    };

    const drawAiEntity = () => {
      ctx.fillStyle = "white";

      let x = this.state.width - 15;
      let y =
        this.state.aiY !== null ? this.state.aiY : this.state.height / 2 - 30;
      ctx.fillRect(x, y, 10, 60);
    };

    const drawMiddleLine = () => {
      ctx.fillStyle = "white";

      let x = this.state.width / 2 - 1;
      let y = 5;
      while (y < this.state.height - 15) {
        ctx.fillRect(x, y, 2, 15);
        y += 30;
      }
    };

    const drawScore = () => {
      ctx.font = "25px PressStart2P";
      ctx.fillStyle = "white";
      ctx.textAlign = "right";
      ctx.fillText(this.state.humanPoints, this.state.width / 2 - 30, 50);
      ctx.textAlign = "left";
      ctx.fillText(this.state.aiPoints, this.state.width / 2 + 30, 50);
    };

    drawBallEntity();

    drawPlayerEntity();
    drawAiEntity();

    drawMiddleLine();
    drawScore();

    window.requestAnimationFrame(this.draw);
  }

  teachAI(state, fromUser = false, fromAi = false) {
    const aiHistory = this.state.aiHistory;
    const newTraining = {
      input: { ballY: this.getPercent(state.ballY, state.height) },
      output: {
        y: this.getPercent(
          Math.max(
            0,
            Math.min(
              this.state.height - 60,
              fromUser ? state.humanY : fromAi ? state.aiY : state.ballY - 25
            )
          ),
          state.height
        )
      }
    };

    aiHistory.push(newTraining);

    this.setState(
      {
        aiHistory: aiHistory
      },
      () => {
        this.ai.train(this.state.aiHistory, {
          callback: res => {
            if (parseFloat(res.error) >= 0.4) {
              return console.error("AI Failed to learn.");
            }
          }
        });
      }
    );
  }

  render() {
    const canvasStyle = {
      backgroundColor: '#000000',
      width: `${this.state.width}px`,
      height: `${this.state.height}px`,
      position: 'relative',
      zIndex: '10'
    }

    return (
      <canvas
        ref="canvas"
        width={this.state.width}
        height={this.state.height}
        style={canvasStyle}
        onMouseMove={this.onmousemove}
        onClick={this.onclick}
      />
    );
  }
}
export default AIPong;