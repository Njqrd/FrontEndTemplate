import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SodefiFundComponent from './SodefiFundComponent';
import FactsheetAdmin from './components/FactsheetAdmin';
import './App.css';

function App() {
  return (
    <div className="App">
      <SodefiFundComponent />
    </div>
  );
}

export default App;
