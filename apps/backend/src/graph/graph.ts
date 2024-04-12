import * as fs from "fs";
import * as path from "path";
// import { parse } from "csv-parse/sync";
//import { Prisma } from "database";
import PrismaClient from "../bin/database-connection.ts";
import { aStarSearch } from "./a-star-search.ts";

export enum Floor {
  L2 = "L2",
  L1 = "L1",
  F1 = "1",
  F2 = "2",
  F3 = "3",
}

const floorNameArray = ["L2", "L1", "1", "2", "3"];
const floorArray = [Floor.L2, Floor.L1, Floor.F1, Floor.F2, Floor.F3];

const floorValueDict = {
  [Floor.L2]: 1,
  [Floor.L1]: 2,
  [Floor.F1]: 3,
  [Floor.F2]: 4,
  [Floor.F3]: 5,
};

export enum NodeType {
  CONF = "CONF",
  DEPT = "DEPT",
  HALL = "HALL",
  LABS = "LABS",
  REST = "REST",
  SERV = "SERV",
  ELEV = "ELEV",
  EXIT = "EXIT",
  STAI = "STAI",
  RETL = "RETL",
  INFO = "INFO",
  BATH = "BATH",
}

export class GraphNode {
  //Attributes
  id: string;
  xCoord: number;
  yCoord: number;
  floor: Floor;
  building: string;
  type: NodeType;
  longName: string;
  shortName: string;

  //Constructor
  constructor(
    id: string,
    xCoord: number,
    yCoord: number,
    floor: Floor,
    building: string,
    type: NodeType,
    longName: string,
    shortName: string,
  ) {
    this.id = id;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.floor = floor;
    this.building = building;
    this.type = type;
    this.longName = longName;
    this.shortName = shortName;
  }
}

export class Edge {
  start: GraphNode;
  end: GraphNode;
  blocked: boolean;

  constructor(start: GraphNode, end: GraphNode) {
    this.start = start;
    this.end = end;
    this.blocked = false;
  }

  public distance(): number {
    const x1 = this.start.xCoord;
    const x2 = this.end.xCoord;
    const y1 = this.start.yCoord;
    const y2 = this.end.yCoord;
    const z1 = floorValueDict[this.start.floor];
    const z2 = floorValueDict[this.end.floor];

    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
  }

  public neighborOf(node: GraphNode | string): GraphNode | undefined {
    let id: string;
    if (node instanceof GraphNode) {
      id = node.id;
    } else {
      id = node;
    }

    if (this.start.id == id) {
      return this.end;
    } else if (this.end.id == id) {
      return this.start;
    }
    return undefined;
  }
}

export class Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, Edge[]>;

  searchAlgorithm: (
    graph: Graph,
    start: string,
    end: string,
  ) => Map<string, string>;

  constructor() {
    this.nodes = new Map<string, GraphNode>();
    this.edges = new Map<string, Edge[]>();
    this.searchAlgorithm = aStarSearch;
  }

  pathfind(start: string, end: string) {
    const came_from = this.searchAlgorithm(this, start, end);
    const path: string[] = this.backtrack(came_from, start, end);
    this.printPath(path);
    return path;
  }

  async loadNodesFromDB() {
    const dbContent = await PrismaClient.nodeDB.findMany();

    for (const record of dbContent) {
      const node = new GraphNode(
        record.nodeID,
        record.xcoord,
        record.ycoord,
        floorArray[floorNameArray.indexOf(record.floor)],
        record.building,
        NodeType[record.nodeType as keyof typeof NodeType],
        record.longName,
        record.shortName,
      );

      this.nodes.set(node.id, node);
      this.edges.set(node.id, []);
    }
  }

  async loadEdgesFromDB() {
    const dbContent = await PrismaClient.edgeDB.findMany();

    for (const record of dbContent) {
      const edge = new Edge(
        this.nodes.get(record.startNodeID)!,
        this.nodes.get(record.endNodeID)!,
      );

      // check if edge is valid
      if (edge.start === undefined || edge.end === undefined) {
        console.error(
          "reading edge",
          "(",
          record.startNodeID,
          "->",
          record.endNodeID,
          ")",
          "failed",
        );
        continue;
      }

      // add bidirectional edges
      this.edges.get(edge.start.id)?.push(edge);
      this.edges.get(edge.end.id)?.push(edge);
    }
  }
  // loadNodesFromCSV(pathString: string) {
  //   const csvFilePath = path.resolve(__dirname, pathString);
  //   const headers = [
  //     "nodeID",
  //     "xcoord",
  //     "ycoord",
  //     "floor",
  //     "building",
  //     "nodeType",
  //     "longName",
  //     "shortName",
  //   ];
  //   const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  //
  //   const result = parse(fileContent, {
  //     delimiter: ",",
  //     columns: headers,
  //     from_line: 2,
  //   });
  //
  //   for (const data of result) {
  //     const node = new GraphNode(
  //       data["nodeID"],
  //       parseInt(data["xcoord"]),
  //       parseInt(data["ycoord"]),
  //       Floor[data["floor"] as keyof typeof Floor],
  //       data["building"],
  //       NodeType[data["nodeType"] as keyof typeof NodeType],
  //       data["longName"],
  //       data["shortName"],
  //     );
  //
  //     // add node and empty edge array
  //     this.nodes.set(node.id, node);
  //     this.edges.set(node.id, []);
  //   }
  // }

  // public loadEdgesFromCSV(pathString: string) {
  //   const csvFilePath = path.resolve(__dirname, pathString);
  //   const headers = ["startNodeID", "endNodeID"];
  //   const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  //
  //   const result = parse(fileContent, {
  //     delimiter: ",",
  //     columns: headers,
  //     from_line: 2,
  //   });
  //
  //   for (const data of result) {
  //     const edge = new Edge(
  //       this.nodes.get(data["startNodeID"])!,
  //       this.nodes.get(data["endNodeID"])!,
  //     );
  //
  //     // check if edge is valid
  //     if (edge.start === undefined || edge.end === undefined) {
  //       console.error(
  //         "reading edge",
  //         "(",
  //         data["startNodeID"],
  //         "->",
  //         data["endNodeID"],
  //         ")",
  //         pathString,
  //         "failed",
  //       );
  //       continue;
  //     }
  //
  //     // add bidirectional edges
  //     this.edges.get(edge.start.id)?.push(edge);
  //     this.edges.get(edge.end.id)?.push(edge);
  //   }
  // }

  public saveGraph() {
    const nodeData = this.saveNodes();
    const edgeData = this.saveEdges();

    nodeData.forEach((row) => {
      console.log(row.join(" "));
    });

    console.log("");

    edgeData.forEach((row) => {
      console.log(row.join(" "));
    });

    this.saveToCSV(nodeData, "nodeData.csv");
    this.saveToCSV(edgeData, "edgeData.csv");
  }

  private saveNodes(): string[][] {
    const nodeData: string[][] = [];

    nodeData.push([
      "nodeID",
      "xcoord",
      "ycoord",
      "floor",
      "building",
      "nodeType",
      "longName",
      "shortName",
    ]);
    this.nodes.forEach((node) => {
      const nodeValues = [
        node.id,
        node.xCoord.toString(),
        node.yCoord.toString(),
        node.floor,
        node.building,
        NodeType[node.type],
        node.longName,
        node.shortName,
      ];

      nodeData.push(nodeValues);
    });

    return nodeData;
  }

  private saveEdges() {
    const edgeData: string[][] = [];
    const processedEdges = new Set<string>();

    edgeData.push(["startNodeID", "endNodeID", "blockedFlag"]);
    this.edges.forEach((edgesArray) => {
      edgesArray.forEach((edge) => {
        const edgeId = `${edge.start.id}-${edge.end.id}`;

        if (
          !processedEdges.has(edgeId) &&
          !processedEdges.has(`${edge.end.id}-${edge.start.id}`)
        ) {
          const edgeValues = [
            edge.start.id,
            edge.end.id,
            edge.blocked.toString(),
          ];

          edgeData.push(edgeValues);
          processedEdges.add(edgeId);
        }
      });
    });

    return edgeData;
  }

  private saveToCSV(data: string[][], filename: string): void {
    const csvContent = data.map((row) => row.join(",")).join("\n");
    const filePath = path.join(__dirname, filename);

    fs.writeFile(filePath, csvContent, "utf8", (err) => {
      if (err) {
        console.error("An error occurred:", err);
        return;
      }
      //console.log(`success`);
    });
  }

  public addEdge(startNodeId: string, endNodeId: string): void {
    const startNode = this.nodes.get(startNodeId);
    const endNode = this.nodes.get(endNodeId);

    if (!startNode || !endNode) {
      console.error("One or both nodes not found in the graph");
      return;
    }

    const newEdge = new Edge(startNode, endNode);

    // Add the new edge to the start node's edges
    const startEdges = this.edges.get(startNodeId) || [];
    startEdges.push(newEdge);
    this.edges.set(startNodeId, startEdges);

    // Add the new edge to the end node's edges
    const endEdges = this.edges.get(endNodeId) || [];
    const reverseEdge = new Edge(endNode, startNode);
    endEdges.push(reverseEdge);
    this.edges.set(endNodeId, endEdges);
  }

  public removeEdge(startNodeId: string, endNodeId: string): void {
    const startNode = this.nodes.get(startNodeId);
    const endNode = this.nodes.get(endNodeId);

    if (!startNode || !endNode) {
      console.error("One or both nodes not found in the graph");
      return;
    }

    const startEdges = this.edges.get(startNodeId) || [];
    const endEdges = this.edges.get(endNodeId) || [];

    const edgeToDelete = startEdges.find((edge) => edge.end === endNode);
    if (edgeToDelete) {
      const indexInStartEdges = startEdges.indexOf(edgeToDelete);
      startEdges.splice(indexInStartEdges, 1);
      this.edges.set(startNodeId, startEdges);
    }

    const reverseEdgeToDelete = endEdges.find((edge) => edge.end === startNode);
    if (reverseEdgeToDelete) {
      const indexInEndEdges = endEdges.indexOf(reverseEdgeToDelete);
      endEdges.splice(indexInEndEdges, 1);
      this.edges.set(endNodeId, endEdges);
    }
  }

  public addNode(aNode: GraphNode) {
    // Node already exists, return the existing node
    if (this.nodes.has(aNode.id)) {
      return aNode;
    }

    this.nodes.set(aNode.id, aNode);
    return aNode;
  }

  public removeNode(aNode: GraphNode): void {
    // Remove Node as a Neighbor
    const neighbors = this.edges.get(aNode.id);
    if (neighbors) {
      for (const edge of neighbors) {
        const neighborNodeId =
          edge.start.id === aNode.id ? edge.end.id : edge.start.id;
        this.removeEdge(aNode.id, neighborNodeId);
      }
    }

    // Remove Node itself
    this.nodes.delete(aNode.id);
    this.edges.delete(aNode.id);
  }

  printPath(path: string[] | undefined) {
    // check if no path
    if (path === undefined || path.length == 0) {
      return;
    }

    let string = "Path: ";
    string = string.concat(path!.join(" -> "));
    console.log(string);
  }

  cost(StartNodeID: string, EndNodeID: string): number {
    const startNode = this.nodes.get(StartNodeID)!;
    const endNode = this.nodes.get(EndNodeID)!;
    const startZ = floorValueDict[startNode.floor];
    const endZ = floorValueDict[endNode.floor];
    const cost =
      ((startNode.xCoord - endNode.xCoord) ** 2 +
        (startNode.yCoord - endNode.yCoord) ** 2) **
        (1 / 2) +
      Math.abs(startZ - endZ) * 50;
    return cost;
  }

  backtrack(
    came_from: Map<string, string>,
    start: string,
    end: string,
  ): string[] {
    // check that path exists
    if (!came_from.get(end)) {
      console.log(
        "\x1b[31m%s\x1b[0m", // output color to make debugging easier
        "PATH FINDING FAILED: NO PATH FROM " + start + " TO " + end,
      );
      return [];
    }

    // backtrack and create path
    const path: string[] = [];
    let tmp: string = end;

    while (tmp !== start) {
      path.push(tmp);
      tmp = came_from.get(tmp)!;
    }
    path.push(tmp);

    return path;
  }
}
