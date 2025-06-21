import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // added for redirection
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const Form = () => {
  const plateFromStorage = localStorage.getItem("plate") || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    number_plate: plateFromStorage,
    name: "",
    car_model: "",
    email: ""
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await axios.post("http://localhost:5000/api/insert-car", formData);
      setStatus("✅ Car info sent successfully!");

      // Delay briefly before redirect
      setTimeout(() => {
        navigate("/upload");
      }, 1500);
    } catch (error) {
      setStatus("❌ Failed to insert data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "500px" }}>
        <h3 className="text-center mb-4 text-primary">Register Car Info</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Number Plate</label>
            <input
              type="text"
              name="number_plate"
              value={formData.number_plate}
              onChange={handleChange}
              className="form-control"
              required
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Owner's Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Car Model</label>
            <input
              type="text"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="e.g., Hyundai i20"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="e.g., user@example.com"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending...
              </>
            ) : (
              "Submit"
            )}
          </button>

          {status && (
            <div
              className={`mt-3 alert ${
                status.includes("success") ? "alert-success" : "alert-danger"
              } animate__animated animate__fadeIn`}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Form;
