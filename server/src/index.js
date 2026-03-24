import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./seedAdmin.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import sliderRoutes from "./routes/sliderRoutes.js";
import siteConfigRoutes from "./routes/siteConfigRoutes.js";
import bankAccountRoutes from "./routes/bankAccountRoutes.js";
import sellRequestRoutes from "./routes/sellRequestRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: chấp nhận mọi origin
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

connectDB().then(() => seedAdmin());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/site/config", siteConfigRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/sell-requests", sellRequestRoutes);
app.use("/api/admin/reports", reportRoutes);
app.use(sitemapRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
