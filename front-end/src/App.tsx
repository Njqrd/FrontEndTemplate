import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SodefiFundComponent from './SodefiFundComponent';
import FactsheetAdmin from './components/FactsheetAdmin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-gray-300">Factsheet Viewer</Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-gray-300">Admin Panel</Link>
            </li>
          </ul>
        </nav> */}
        <main>
          <Routes>
            <Route path="/" element={<SodefiFundComponent />} />
            <Route path="/admin" element={<FactsheetAdmin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
