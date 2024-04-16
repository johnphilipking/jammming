
import "./App.css";
import JammmingUi from './Ui';

function App() {
  

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="poppins-black app-logo">
          <img src="./waveform-svgrepo-com.svg" height="30px" alt="sine wave graphic" className="sinewave" />
          jammming
        </h1>
      </header>
      <main id="main">
        <JammmingUi />
      </main>
      
      <footer className="App-footer">
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </footer>
    </div>
  );
}

export default App;
