// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all pages
import Home from "./Components/home/Home";
import DragAndDrop from "./Components/DragAndDrop/DragAndDrop";
import Form from "./Components/Form/Form";
import PlateChecker from "./Components/PlateChecker/PlateChecker";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<DragAndDrop />} />
        <Route path="/form" element={<Form />} />
        <Route path="/check" element={<PlateChecker />} />
      </Routes>
    </Router>
  );
};

export default App;
