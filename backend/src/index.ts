import express from "express";
import cors from "cors";
import "dotenv/config";

// Impor Rute API
import authRouter from "./routes/auth.js";
import customersRouter from "./routes/customers.js";
import servicesRouter from "./routes/services.js";
import ordersRouter from "./routes/orders.js";
import analyticsRouter from "./routes/analytics.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - Izinkan akses dari Frontend Port 3000
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  })
);

// Parse request body JSON
app.use(express.json());

// Log Middleware minimalis
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Mounting Rute API v1
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/analytics", analyticsRouter);

// Jalankan Server Express
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Laundry SaaS Backend API berjalan di Port: ${PORT}`);
  console.log(`===================================================`);
});
