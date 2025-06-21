const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Body parser for JSON data

// Ensure uploads directory exists

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

function cleanUploadsFolder() {
    fs.readdirSync(uploadDir).forEach(file => {
        fs.unlinkSync(path.join(uploadDir, file));
    });
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cleanUploadsFolder();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });


// Upload Route
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filename = req.file.originalname;
    const filePath = path.join(uploadDir, filename);
    const pythonScript = path.join(__dirname, "plate_recognition.py");
    const command = `python "${pythonScript}" "${filePath}"`;

    console.log(`🚀 Executing: ${command}`);

    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Python script error:", stderr);
            return res.status(500).json({ error: "Script execution failed", detail: stderr });
        }

        console.log("📤 Full Python stdout:\n", stdout);

        try {
            // Split stdout into lines and find the last valid JSON line
            const lines = stdout.trim().split("\n");
            const jsonLine = lines.find(line => line.trim().startsWith("{") && line.trim().endsWith("}"));

            if (!jsonLine) {
                console.error("❌ No valid JSON found in Python stdout.");
                return res.status(500).json({ error: "No valid JSON output from Python script" });
            }

            const result = JSON.parse(jsonLine);
            console.log("✅ Parsed license plate:", result.license_plate);

            res.json({
                message: "Success",
                plate_number: result.license_plate,
                imageUrl: `/uploads/${filename}`
            });
        } catch (parseError) {
            console.error("❌ Failed to parse Python output:", parseError);
            return res.status(500).json({ error: "Invalid JSON output from Python script" });
        }
    });
});

// Route to search license plate in DB
app.get("/api/search-plate", (req, res) => {
    const plate = req.query.plate?.trim();

    console.log("🔍 Incoming plate to search:", `[${plate}]`);

    if (!plate || plate === "Processing...") {
        console.warn("⚠️ Invalid or missing license plate:", plate);
        return res.status(400).json({ error: "Invalid or missing license plate" });
    }

    const query = "SELECT * FROM car_info WHERE LOWER(number_plate) = LOWER(?)";
    console.log("🧠 Executing query:", query);
    console.log("📦 Query parameter:", `[${plate}]`);

    db.query(query, [plate], (err, results) => {
        if (err) {
            console.error("❌ DB error:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length > 0) {
            console.log("✅ Plate found in DB:", results[0]);
            res.json({
                license_plate: plate,
                found: true,
                data: results[0],
            });
        } else {
            console.log("❌ Plate NOT found. Queried:", `[${plate}]`);
            res.json({ license_plate: plate, found: false });
        }
    });
});


// MySQL INSERT endpoint
app.post("/api/insert-car", (req, res) => {
    const { number_plate, name, car_model, email } = req.body;

    if (!number_plate || !name || !car_model || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO car_info (number_plate, name, car_model, email) VALUES (?, ?, ?, ?)";
    const values = [number_plate, name, car_model, email];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            return res.status(500).json({ error: "Failed to insert data" });
        }
        res.status(200).json({ message: "✅ Car info inserted successfully!" });
    });
});


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
