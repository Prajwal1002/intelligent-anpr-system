# Intelligent Number Plate Recognition System

A deep learning-powered **Automatic Number Plate Recognition (ANPR)** system integrated with a **real-time full-stack web interface** for smart vehicle monitoring and access control.

## 🚀 Overview

This system detects and recognizes vehicle number plates in real time under varied conditions (e.g., lighting, angles, distortions). It combines advanced image processing with a modern web stack to deliver an intelligent and responsive solution.

## 🔧 Features

- Accurate plate detection using **WPOD-NET**
- Character segmentation via contour detection
- Character recognition using a **custom-trained CNN**
- Real-time operation with **Python, TensorFlow, OpenCV**
- **Full-stack integration**:
  - **Backend**: Node.js, MySQL
  - **Frontend**: React.js
- Live matching with database records
- Vehicle registration prompt for unknown plates
- Scalable, responsive, and user-friendly

## 🧠 Tech Stack

**Machine Learning / Image Processing**  
`Python` · `TensorFlow` · `OpenCV` · `Keras`

**Backend**  
`Node.js`  · `MySQL`

**Frontend**  
`React.js` 

## ⚙️ Installation

### Prerequisites
- Python 3.7+
- Node.js & npm
- MySQL Server

### Backend Setup
cd backend
npm install
#Configure DB in .env or db.js
node server.js

### Frontend Setup
cd frontend
npm install
npm start

### Model Training (Optional)
cd model_training
python train_model.py

### 🧩 How It Works
Upload/capture vehicle image
Detect plate using WPOD-NET
Segment and recognize characters using CNN
Match plate with database
Display result or prompt user registration

### Clone Repository
```bash
git clone https://github.com/Prajwal1002/intelligent-anpr-system.git
cd intelligent-anpr-system
