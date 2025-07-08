import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import compression from "compression";

dotenv.config();

const app = express();
app.use(compression({ threshold: 1024 }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
