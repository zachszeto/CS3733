// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import express, { Router, Request, Response } from "express";
import {Prisma, PrismaClient} from "database";
import path from "path";
import { exportNodeDBToCSV } from "../helper/manageDatabases.ts";

const router: Router = express.Router();

router.get("/download/", async function (req: Request, res: Response) {
  const prisma = new PrismaClient();
  await exportNodeDBToCSV(prisma, "../../map/temp/nodesDownload.csv");
  res.download(path.join(__dirname, "../../map/temp/nodesDownload.csv"));
});

router.put("/update/", async function (req: Request, res: Response) {
    const prisma = new PrismaClient();
    const node: Prisma.NodeDBCreateInput = req.body;

    try {
        await prisma.nodeDB.upsert({
            where: {
                nodeID: node.nodeID,
            },
            update: node,
            create: node,
        })
    }
    catch (error) {
        console.error(error.message);
        res.sendStatus(400);
        return;
    }

    res.sendStatus(200);
});

router.delete("/delete/", async function (req: Request, res: Response) {
    const prisma = new PrismaClient();
    if (req.query.nodeID === undefined) {
        console.error("nodeID to delete must be specified");
        res.sendStatus(400);
        return;
    }

    try {
        await prisma.nodeDB.delete({
            where: {
                nodeID: req.query.nodeID,
            }
        })
    }
    catch (error) {
        console.error(error.message);
        res.sendStatus(400);
        return;
    }

    res.sendStatus(200);
});

export default router;
