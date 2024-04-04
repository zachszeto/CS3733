import createError, { HttpError } from "http-errors";
import express, { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import exampleRouter from "./routes/example.ts";
import { PrismaClient } from "database";
import {
  // populateDatabase,
  exportNodeDBToCSV,
  exportEdgeDBToCSV,
} from "./helper/manageDatabases";
import { Graph } from "./graph/graph.ts";
import serviceRequestRouter from "./routes/service-requests.ts";
import mapRouter from "./routes/map.ts";
import pathfindingRouter from "./routes/pathfind.ts";
import nodesRouter from "./routes/nodes.ts";
import edgesRouter from "./routes/edges.ts";
import fileUpload from "express-fileupload";

const prisma = new PrismaClient();
const graph = new Graph();
(async () => {
  //await populateDatabase(prisma);

  await graph.loadNodesFromDB();
  await graph.loadEdgesFromDB();

  await exportNodeDBToCSV(prisma, "../../map/nodes.csv");
  await exportEdgeDBToCSV(prisma, "../../map/edges.csv");

  graph.printPath(graph.pathfind("CCONF001L1", "CCONF002L1")); // Should Work
  graph.printPath(graph.pathfind("CCONF001L1", "GHALL003L1")); // Should Fail
  // graph.loadNodesFromCSV("../../map/L1Nodes.csv");
  // graph.loadEdgesFromCSV("../../map/L1Edges.csv");
})();

const app: Express = express(); // Setup the backend

//const fileUpload = require("express-fileupload");
app.use(fileUpload());

// Setup generic middlewear
app.use(
  logger("dev", {
    stream: {
      // This is a "hack" that gets the output to appear in the remote debugger :)
      write: (msg) => console.info(msg),
    },
  }),
); // This records all HTTP requests
app.use(express.json()); // This processes requests as JSON
app.use(express.urlencoded({ extended: false })); // URL parser
app.use(cookieParser()); // Cookie parser

// Setup routers. ALL ROUTERS MUST use /api as a start point, or they
// won't be reached by the default proxy and prod setup
app.use("/api/high-score", exampleRouter);
app.use("/api/service-requests", serviceRequestRouter);
app.use("/api/map", mapRouter);
app.use("/api/astar-api", pathfindingRouter);
app.use("/api/pathfind", pathfindingRouter);
app.use("/nodes", nodesRouter);
app.use("/edges", edgesRouter);
app.use("/healthcheck", (req, res) => {
  res.status(200).send();
});

/**
 * Catch all 404 errors, and forward them to the error handler
 */
app.use(function (req: Request, res: Response, next: NextFunction): void {
  // Have the next (generic error handler) process a 404 error
  next(createError(404));
});

/**
 * Generic error handler
 */
app.use((err: HttpError, req: Request, res: Response): void => {
  res.statusMessage = err.message; // Provide the error message

  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Reply with the error
  res.status(err.status || 500);
});

export default app; // Export the backend, so that www.ts can start it
