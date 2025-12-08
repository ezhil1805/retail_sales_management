import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SalesDashboard from './components/SalesDashboard';

import './components/SalesDashboard.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SalesDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
