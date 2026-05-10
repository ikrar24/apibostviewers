import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./src/DB/connection.js";
import scrapeRoutes from "./src/routes/scrapeRoutes.js";
import CheckOldScrapeRoute from "./src/routes/CheckOldScrapeRoute.js";
import thumbnailsDownloadRoute from "./src/routes/thumbnailsDownloadRoute.js";
import viewRoutes from "./src/routes/viewRoutes.js";
import generetedDescrptionRoute from "./src/routes/generetedDescrptionRoute.js";
import titleSuggetionRoutes from "./src/routes/titleSuggetionRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import UserRouter from "./src/routes/UserRouter.js";
import { startCleanupJob } from "./src/utils/cronJob.js";
import cookieParser from "cookie-parser";
import passwordRoute from "./src/routes/passwordRouts.js"
import downloadRoutes from "./src/routes/downloadRoutes.js"
import thumbnailRoute from "./src/routes/thumbnailRoute.js"
import AuthByOriginMiddleware from "./middleware/AuthByOriginMiddleware.js";
import {createToken} from "./src/Auth/createToken.js";
import verifyCookie from "./middleware/AuthCheck.js";

// after express.json() 
dotenv.config();
const app = express();

// ✅ First: Apply CORS
app.use(cors({
  origin: [
    "https://bostviwes.netlify.app/",
    "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Database Connection
connection();

// auth token 
app.get("/create-token" , createToken ) ;

// ✅ Origin Security Middleware (After cors & cookie parsing)
// app.use(AuthByOriginMiddleware);
// app.use(verifyCookie);

// ✅ Routes
app.use("/api", scrapeRoutes, console.log("Hit"));
app.use("/api", passwordRoute);
app.use("/api", CheckOldScrapeRoute);
app.use("/api", thumbnailsDownloadRoute);
app.use("/api/views", viewRoutes);
app.use("/api", generetedDescrptionRoute);
app.use("/api", titleSuggetionRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/user", UserRouter);
app.use("/api/download", downloadRoutes);
app.use("/api", thumbnailRoute);

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("✅ Server Running Successfully | Clipdrop + Cloudinary API Ready");
});

startCleanupJob();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
