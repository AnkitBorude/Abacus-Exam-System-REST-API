import express from "express";
import { studentRouter } from "./routes/student.router.js";
import { adminRouter } from "./routes/admin.router.js";
import { examRouter } from "./routes/exam.router.js";
import { resultRouter } from "./routes/result.router.js";
import helmet from "helmet";
const app=express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(helmet());
app.use("/api/v1/student",studentRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/exam",examRouter);
app.use("/api/v1/result",resultRouter);

app.get('/api/v1/echo', (req, res) => {
    res.json({echoed:true});
  })
export {app};