import logo from './logo.svg';
import './App.css';
import './index.css';
import Button from '@mui/material/Button';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p className="font-bold text-pink-500 text-2xl">R.k Technology...</p>
        <h1 className="text-3xl font-bold text-green-500 underline mt-4">
          Tailwind CSS is working!
        </h1>
        <div className='mt-2'>
          <Button variant="contained" color="primary">
            Click Me
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
