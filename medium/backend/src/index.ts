import { Hono } from "hono";
import v1routes from "./routes";
import jwt from "jsonwebtoken";
const app = new Hono();

app.route("/api/v1", v1routes);

export default app;
