import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DragAndDrop = ({ onProcessingDone = () => {} }) => {
  const [image, setImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const delayedFile = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      delayedFile.current = droppedFile;
      setFile(droppedFile);
      setImage(URL.createObjectURL(droppedFile));
      uploadFile(droppedFile);
    } else {
      alert("Only image files are allowed!");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      delayedFile.current = selectedFile;
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      uploadFile(selectedFile);
    } else {
      alert("Only image files are allowed!");
    }
  };

  const uploadFile = async (uploadFile) => {
    console.log("📤 Uploading file:", uploadFile.name);
  
    setPlateNumber("Processing...");
    setLoading(true);
    setProgress(0);
    setPreviewImage(URL.createObjectURL(uploadFile));
  
    const formData = new FormData();
    formData.append("image", uploadFile);
  
    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });
  
      console.log("📬 Response from backend:", response.data);
  
      const plate = response.data.plate_number || response.data.license_plate; // fallback
  
      if (!plate || plate === "Processing...") {
        console.error("❌ Invalid or empty plate received:", plate);
        setPlateNumber("Recognition failed.");
        return;
      }
  
      console.log("✅ License plate extracted:", plate);
  
      setPlateNumber(plate);
      onProcessingDone(plate);
      localStorage.setItem("plate", plate);
  
      console.log("🚀 Navigating to /check with plate:", plate);
      navigate("/check");
  
    } catch (error) {
      console.error("❌ Upload error:", error.response?.data || error.message);
      setPlateNumber("Upload failed.");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 py-5 bg-light">
      <div className="container" style={{ maxWidth: "1100px" }}>
        <div className="row g-4 align-items-center">
          {/* Upload Box */}
          <div className="col-md-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              className={`border border-3 rounded-4 p-5 text-center bg-white shadow upload-box ${
                dragActive ? "border-info drag-active" : "border-secondary"
              }`}
              style={{ transition: "all 0.3s", cursor: "pointer", height: "340px" }}
              onClick={() => delayedFile.current && delayedFile.current.click()}
            >
              <p className="fw-bold text-primary fs-5 mb-2">
                Drag & drop or click to upload an image
              </p>
              <p className="text-muted small mb-3">(Only image files allowed)</p>

              {file && (
                <div className="text-muted small mt-2">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}

              {loading && (
                <div className="progress mt-4" style={{ height: "8px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="text-center mt-3">
              <input
                type="file"
                accept="image/*"
                ref={delayedFile}
                hidden
                onChange={handleFileSelect}
              />
              <button
                className="btn btn-outline-primary px-4 rounded-pill"
                onClick={() => delayedFile.current && delayedFile.current.click()}
              >
                Select File
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="col-md-6">
            <div className="preview-box border rounded-4 bg-white p-3 shadow-sm">
              <h5 className="text-center text-secondary mb-3">Preview Window</h5>

              <div
                className="border rounded p-2 bg-light d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "280px", maxHeight: "280px" }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="img-fluid mb-3"
                    style={{ maxHeight: "120px", objectFit: "contain" }}
                  />
                ) : (
                  <span className="text-muted">Image preview will appear here</span>
                )}
              </div>

              {plateNumber && (
                <div className="text-success fw-bold fs-6 text-center mt-3">
                  {plateNumber === "Processing..."
                    ? "Processing..."
                    : `Plate Detected: ${plateNumber}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragAndDrop;
