import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import compression from "compression";
import connectToDB from "./utils/connect";
import userRouter from "./routes/user.route";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";
import corsHandler from "./config/corsHandler";

dotenv.config();

const app = express();

app.use(corsHandler);
app.use(compression({ threshold: 1024 }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(express.json());

app.use("/api/users", userRouter);

app.use("/api/auth", authRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  await connectToDB();
  console.log(`Server is running on port ${PORT}`);
});
