import React from 'react';
import './css/index.css';
import { words, quotes } from './wordbank.js';

var timeID, countdownID;

class Test extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 0,                    // Word count, timed, or quotes
      setCount: 50,               // The selected word count
      setTime: 0,                 // The selected time (0 if mode is word count or quotes)
      test: '',                   // The string derived from the word bank or quote
      input: '',                  // Input string used to match with the test string
      time: 0,                    // The current elapsed time
      count: 0,                   // The current number of words typed
      charcount: 0,               // The current number of characters typed
      wpm: 0,                     // The current calculated WPM of the test
      rawwpm: 0,                  // The current word count divided by current elapsed time
      cpm: 0,                     // The current characters per minutes typed
      correctInput: 0,            // Keep track of correct inputs
      accuracy: 0,                // correctInput / charcount
      completed: 0                // Used to display end screen
    };
  }

  generateTest(gameMode, wordCount, timer) {
    let tempTest = '';
    let r = 0;

    clearTimeout(timeID);
    clearInterval(countdownID);

    if(gameMode === 0) {           // Mode is word count
      for(let i = 0; i < Math.floor(wordCount * 2); i++) {
        r = Math.floor(Math.random() * words.length);
        tempTest += words[r];
        tempTest += ' ';
      }
    } else if(gameMode === 1) {    // Mode is timed
      for(let i = 0; i < (timer * 5); i++) {
        r = Math.floor(Math.random() * words.length);
        tempTest += words[r];
        tempTest += ' ';
      }
    } else if(gameMode === 2) {   // Mode is quotes
      r = Math.floor(Math.random() * quotes.length);
      tempTest = quotes[r];
    }

    // Set up new test and then reset all other values
    this.setState({test: tempTest,
                   input: '',
                   time: 0,
                   count: 0,
                   charcount: 0,
                   wpm: 0,
                   rawwpm: 0,
                   cpm: 0,
                   correctInput: 0,
                   accuracy: 0,
                   completed: 0});
    return;
  }

  changeMode(mode) {
    if(mode === 0) {
      this.setState({mode: mode, setCount: 50, setTime: 0}, () => {this.generateTest(this.state.mode, this.state.setCount, this.state.setTime)});
    } else if(mode === 1) {
      this.setState({mode: mode, setCount: 0, setTime: 15}, () => {this.generateTest(this.state.mode, this.state.setCount, this.state.setTime)});
    } else if(mode === 2) {
      this.setState({mode: mode, setCount:0, setTime: 0}, () => {this.generateTest(this.state.mode, this.state.setCount, this.state.setTime)});
    }
  }

  changeCounter(count) {
    this.setState({setCount: count}, () => {this.generateTest(this.state.mode, this.state.setCount, this.state.setTime)});
  }

  changeTimer(time) {
    this.setState({setTime: time}, () => {this.generateTest(this.state.mode, this.state.setCount, this.state.setTime)});
  }

  completeTest() {
    let timeMinutes = (this.state.time + 1) / 60;
    let calcwords = (this.state.correctInput / 5);
    let rawcalcwords = (this.state.charcount / 5);

    clearInterval(countdownID);
    clearTimeout(timeID);

    this.setState({time: (this.state.time),
                   wpm: (calcwords / timeMinutes).toFixed(2),
                   rawwpm: (rawcalcwords / timeMinutes).toFixed(2),
                   cpm: (this.state.charcount / timeMinutes).toFixed(2),
                   accuracy: ((this.state.correctInput / this.state.charcount) * 100).toFixed(2),
                   completed: 1});
  }

  checkCompletion() {
    if(this.state.count === this.state.setCount && this.state.mode === 0) {
      this.completeTest();
    }
  }

  keyInput(input) {
    if(input.key === 'Escape') {
      this.generateTest(this.state.mode, this.state.setCount, this.state.setTime);
      return;
    }

    if(input.key.length === 1) {
      // Start the timer if it's the first input

      if(this.state.completed || (this.state.mode === 2 && (this.state.input.length === this.state.test.length))) { return; }
      if(input.key === ' ' && (this.state.input.slice(-1) === ' ')) { return; }

      if(this.state.input.length === 0) {
        countdownID = setInterval(() => { this.setState({time: this.state.time + 1})}, 1000);

        if(this.state.mode === 1) {
          timeID = setTimeout(() => this.completeTest(), (this.state.setTime * 1000));
        }
      }
      this.setState({input: this.state.input + input.key, charcount: this.state.charcount + 1});

      if(this.state.test[this.state.input.length - 1] === ' ') { this.setState({count: this.state.count + 1}, () => this.checkCompletion()); }

      // Check if the input is correct against the test
      if(this.state.test[this.state.input.length - 1] === input.key) {
        this.setState({correctInput: this.state.correctInput + 1});

        // Check if the mode is quote and if the input is the same length as the test
        // If so, the test is complete for this mode
        if(this.state.mode === 2 && (this.state.test.length === this.state.input.length)) {
          this.setState({count: this.state.count + 1}, () => this.completeTest());
        }
      }
    }

    if(input.key === 'Backspace') {
      let position = this.state.input.length - 1;
      // Check if the previous input was correct
      if(this.state.input.length === 0) { return; }
      if(this.state.input[position] === this.state.test[position]) {
        // If the correct input was a space, don't allow backspace
        if(this.state.input[position] === ' ') { return; }
        // If the correct input was any other character, remove a charcount and correctInput count
        else { this.setState({input: this.state.input.slice(0, -1), charcount: this.state.charcount - 1, correctInput: this.state.correctInput - 1}); }
      } else {
        // If the test char is space and input is incorrect, remove an incorrect word count
        if(this.state.test[position] === ' ') {
          this.setState({count: this.state.count - 1});
        }
        // If removing incorrect input, don't change the charcount
        this.setState({input: this.state.input.slice(0, -1)});
      }
    }
  }

  getClass(char, id) {
    if(char === this.state.test[id]) { return "correct-char"; }
    else { return "incorrect-char"; }
  }

  // Generate a test based on the default mode and values and have the app listen to key presses
  componentWillMount() {
    this.generateTest(this.state.mode, this.state.setCount, this.state.setTime);
    const body = document.querySelector('body');
    body.addEventListener('keydown', this.keyInput.bind(this));
  }

  render () {
    let counterSelect, displayCounter, mainBody, displayInput;
    let lastSpaceIndex = -1;

    for(let i = this.state.input.lastIndexOf(' '); i >= 0; i--) {
      if(this.state.test[i] === ' ' && this.state.input[i] === ' ') {
        lastSpaceIndex = i;
        break;
      }
    }

    displayInput = this.state.input.split('').map((char, id) => {
      if(id > lastSpaceIndex) {
        return <span className={this.getClass(char,id)} key={id}>{char}</span>
      }
    });

    if(this.state.mode === 0) {
      counterSelect = <div className="counter-select disable-select">
                        <div className={"counter-button" + " " + ((this.state.setCount === 50) && "selected")} onClick={() => {this.changeCounter(50)}}>50</div>
                        <div className={"counter-button" + " " + ((this.state.setCount === 100) && "selected")} onClick={() => {this.changeCounter(100)}}>100</div>
                        <div className={"counter-button" + " " + ((this.state.setCount === 150) && "selected")} onClick={() => {this.changeCounter(150)}}>150</div>
                        <div className={"counter-button" + " " + ((this.state.setCount === 200) && "selected")} onClick={() => {this.changeCounter(200)}}>200</div>
                        <div className={"counter-button" + " " + ((this.state.setCount === 300) && "selected")} onClick={() => {this.changeCounter(300)}}>300</div>
                      </div>;
      displayCounter = <h3 className="counter-stat disable-select">{this.state.setCount - this.state.count}</h3>;
    } else if(this.state.mode === 1) {
      counterSelect = <div className="counter-select disable-select">
                        <div className={"counter-button" + " " + ((this.state.setTime === 15) && "selected")} onClick={() => {this.changeTimer(15)}}>15s</div>
                        <div className={"counter-button" + " " + ((this.state.setTime === 30) && "selected")} onClick={() => {this.changeTimer(30)}}>30s</div>
                        <div className={"counter-button" + " " + ((this.state.setTime === 60) && "selected")} onClick={() => {this.changeTimer(60)}}>60s</div>
                        <div className={"counter-button" + " " + ((this.state.setTime === 120) && "selected")} onClick={() => {this.changeTimer(120)}}>120s</div>
                      </div>;
      displayCounter = <h3 className="counter-stat disable-select">{this.state.setTime - this.state.time}</h3>;
    } else if(this.state.mode === 2) {
      counterSelect = <div className="counter-select"></div>;
      displayCounter = <div></div>;
    }

    if(this.state.completed === 0) {
      mainBody =  <div>
                    <div className="text-field">
                      {displayInput}
                      <span className="underline test-text">{this.state.test.slice(this.state.input.length, this.state.input.length + 1)}</span>
                      <span className="test-text">{this.state.test.slice(this.state.input.length + 1)}</span>
                    </div>
                    {displayCounter}
                  </div>;
    } else {
      mainBody = <StatScreen time={this.state.time} count={this.state.count} charcount={this.state.charcount} wpm={this.state.wpm} rawwpm={this.state.rawwpm} cpm={this.state.cpm} accuracy={this.state.accuracy}/>;
    }

    return (
      <div>
        <div className="mode-selection disable-select">
          <div className={"mode-button" + " " + ((this.state.mode === 0) && "selected")} onClick={() => {this.changeMode(0)}}>Word</div>
          <div className={"mode-button" + " " + ((this.state.mode === 1) && "selected")} onClick={() => {this.changeMode(1)}}>Time</div>
          <div className={"mode-button" + " " + ((this.state.mode === 2) && "selected")} onClick={() => {this.changeMode(2)}}>Quote</div>
          {counterSelect}
        </div>
        {mainBody}
      </div>
    );
  }
}

const StatScreen = ({time, count, charcount, wpm, rawwpm, cpm, accuracy}) => {
  return (
    <div className="end-screen disable-select">
      <div className="top-half">
        <div className="wpm-wrapper">
          <span className="wpm-val">{wpm}</span><span className="end-screen-med-text"> WPM</span>
        </div>
        <div className="accuracy-time-wrapper">
          <div className="end-screen-med-text">Accuracy</div>
          <div className="end-screen-med-val">{accuracy}%</div>
          <div className="end-screen-med-text">Time</div>
          <div className="end-screen-med-val">{time}s</div>
        </div>
      </div>
      <div className="bottom-half">
        <div className="bottom-wrapper">
          <div className="end-screen-small-text">Raw WPM</div>
          <div className="end-screen-small-val">{rawwpm}</div>
        </div>
        <div className="bottom-wrapper">
          <div className="end-screen-small-text">Words</div>
          <div className="end-screen-small-val">{count}</div>
        </div>
        <div className="bottom-wrapper">
          <div className="end-screen-small-text">CPM</div>
          <div className="end-screen-small-val">{cpm}</div>
        </div>
        <div className="bottom-wrapper">
          <div className="end-screen-small-text">Characters</div>
          <div className="end-screen-small-val">{charcount}</div>
        </div>
      </div>
    </div>
  );
}

export default Test;
