import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from public directory

// Basic route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WebGPU Learning</title>
      </head>
      <body>
        <h1>Welcome to WebGPU Learning Server</h1>
        <p>Server is running on port ${PORT}</p>
      </body>
    </html>
  `);
});

// API route example
app.get("/api/status", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
