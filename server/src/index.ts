import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { expressjwt as jwt } from "express-jwt";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// app.use(
//   jwt({
//     secret: "shhhhhhared-secret",
//     algorithms: ["HS256"],
//   }).unless({ path: ["/token"] })
// );

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
