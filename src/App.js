import React from 'react';
import './App.css';
import './index.css';
import Button from '@mui/material/Button';
// import earthImg from "./myimages/earth_9985726.png";

function App() {
  return (
    <div className="App">
      <header className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center">
        <img
          src="/myimages/earth_9985726.png"
          className="w-40 h-40 animate-spin-slow"
          alt="Earth"
        />

        <p className="mt-4">
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <p className="font-bold text-pink-500 text-2xl">R.k Technology...</p>

        <h1 className="text-3xl font-bold text-green-400 underline mt-4">
          Tailwind CSS is working!
        </h1>

        <div className="mt-4">
          <Button variant="contained" color="primary">
            Click Me
          </Button>
        </div>
      </header>
    </div>
  );
}

export default App;
