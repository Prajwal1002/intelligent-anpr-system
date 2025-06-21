import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/upload");
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="text-center">
        <h1 className="mb-4 text-primary fw-bold">Welcome to License Plate Checker 🚗</h1>
        <p className="mb-4 text-secondary fs-5">
          Upload an image to detect the number plate and check if it exists in the database.
        </p>
        <button className="btn btn-success px-4 py-2 rounded-pill" onClick={handleStart}>
          Upload Image
        </button>
      </div>
    </div>
  );
};

export default Home;
