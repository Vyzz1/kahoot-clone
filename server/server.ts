import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import connectToDB from "./utils/connect";
import userRouter from "./routes/user.route";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";
import corsHandler from "./config/corsHandler";
import quizRouter from "./routes/quiz.route";
import questionRouter from "./routes/question.route";
import migrationRouter from "./routes/migration.route";
import loadEnv, { isProduction } from "./config/env";
import loadSwaggerDocs, { openSwaggerDocs } from "./docs/step-up";
import { exit } from "node:process";
loadEnv();
const app = express();

app.use(corsHandler);
app.use(compression({ threshold: 1024 }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/questions", questionRouter);
app.use("/api/migrate", migrationRouter);

app.use(errorHandler);

const PORT = process.env.PORT as string;

app.listen(PORT, async () => {
  try {
    await connectToDB();
    console.log(`Server is running on port ${PORT}`);

    if (!isProduction) {
      loadSwaggerDocs(app);
      openSwaggerDocs(PORT);
    }
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    exit(1);
  }
});
