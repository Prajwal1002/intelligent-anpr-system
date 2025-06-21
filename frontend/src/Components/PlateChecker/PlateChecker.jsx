import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Form from "../Form/Form";

const PlateChecker = () => {
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const plate = localStorage.getItem("plate");
  const navigate = useNavigate();

  useEffect(() => {
    if (!plate) return;

    axios
      .get(`http://localhost:5000/api/search-plate?plate=${plate}`)
      .then((res) => {
        if (res.data.found) {
          setCarInfo(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching plate info:", err);
        setLoading(false);
      });
  }, [plate]);

  if (loading) return <div className="text-center mt-5">🔄 Checking plate in database...</div>;

  return (
    <div className="container mt-5">
      {carInfo ? (
        <div className="card shadow p-4">
          <h4 className="mb-3 text-success">✅ Car Found in Database</h4>
          <p><strong>Number Plate:</strong> {carInfo.number_plate}</p>
          <p><strong>Name:</strong> {carInfo.name}</p>
          <p><strong>Car Model:</strong> {carInfo.car_model}</p>
          <p><strong>Email:</strong> {carInfo.email}</p>

          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/upload")}
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          <h4 className="text-danger mb-3">❌ No car found for this plate</h4>
          <Form />
        </>
      )}
    </div>
  );
};

export default PlateChecker;
