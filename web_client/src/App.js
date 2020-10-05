import React from 'react';
import logo from './logo.svg';
import {AlgorithmsList} from './features/algorithms/AlgorithmsList'
import {AlgorithmForm} from "./features/algorithms/AlgorithmForm";
import {Csrf} from "./features/csrf/csrf";
import './App.css';

function App() {
  return (
      <div>
        <Csrf/>
        <AlgorithmsList/>
        <AlgorithmForm/>
      </div>
  );
}

export default App;
