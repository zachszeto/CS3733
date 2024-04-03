import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  graphHelper,
  pointHelper,
  customPathHelper,
} from "../helpers/clickCorrectionMath.ts";
import { vec2, node, edge } from "../helpers/typestuff.ts";

type mapCanvasProps = {
  image: string;
  startLocation: string;
};

/**
 * Make an API call to determine the path between two nodes.
 * @param startNode The nodeID of the starting node
 * @param endNode The nodeID of the ending node
 * @param endCoord The XY coordinate of a selected point, if desired
 */
function getPath(
  startNode: string,
  endNode: string,
  endCoord: vec2 | null,
  nodes: node[],
  ctx: CanvasRenderingContext2D,
) {
  axios
    .get("/api/astar-api?startNode=" + startNode + "&endNode=" + endNode)
    .then((res) => {
      createPath(res.data.path, endCoord, nodes, ctx);
    });
}

/**
 * Draw a path between several nodes
 * @param pathNodes Array of node ids in order of connection
 */
function createPath(
  nodeIDs: string[],
  endCoord: vec2 | null,
  nodes: node[],
  ctx: CanvasRenderingContext2D,
) {
  const pathNodes: node[] = [];
  for (const s of nodeIDs) {
    const n = nodes.find((no: node) => {
      return no.nodeID === s;
    });
    if (n === undefined) continue;
    pathNodes.push(n);
  }

  if (pathNodes === undefined || pathNodes.length === 0) {
    console.error("no path");
    return;
  }

  const pathLength = pathNodes.length;
  if (endCoord === null) {
    for (let i = 0; i < nodes.length - 1; i++) {
      drawLine(pathNodes[i].point, pathNodes[i + 1].point, ctx);
    }
    return;
  }
  for (let i = 0; i < pathLength - 2; i++) {
    drawLine(pathNodes[i].point, pathNodes[i + 1].point, ctx);
  }
  if (
    customPathHelper({ path: pathNodes, end: endCoord, nodes: nodes }) !=
    pathNodes[pathLength - 2]
  ) {
    drawLine(
      pathNodes[pathLength - 2].point,
      pathNodes[pathLength - 1].point,
      ctx,
    );
    drawLine(pathNodes[pathLength - 1].point, endCoord, ctx);
  } else {
    drawLine(pathNodes[pathLength - 2].point, endCoord, ctx);
  }
}

/**
 * Draw a line on the canvas between the specified positions
 * @param startX X-coordinate of the start point
 * @param startY Y-coordinate of the start point
 * @param endX X-coordinate of the end point
 * @param endY Y-coordinate of the end point
 */
function drawLine(a: vec2, b: vec2, ctx: CanvasRenderingContext2D) {
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "blue"; // Line color
  ctx.lineCap = "round"; // Make ends of lines rounded
  ctx.stroke(); // Draw line
}

export function MapCanvas(props: mapCanvasProps) {
  const [nodes, _setNodes] = useState<node[] | null>(null);
  const [edges, _setEdges] = useState<edge[] | null>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function setNodes(nodes: node[]) {
    nodesRef.current = nodes;
    _setNodes(nodes);
  }
  function setEdges(edges: edge[]) {
    edgesRef.current = edges;
    _setEdges(edges);
  }

  useEffect(() => {
    axios.get("/api/map").then((res) => {
      const ns: node[] = [];
      const es: edge[] = [];

      for (const r of res.data.nodes) {
        const v: vec2 = { x: r.xcoord, y: r.ycoord };
        const n: node = { nodeID: r.nodeID, point: v };
        ns.push(n);
      }

      for (const r of res.data.edges) {
        const start: node | undefined = ns.find((n: node) => {
          return n.nodeID === r.startNodeID;
        });
        if (start === undefined) continue;
        const end: node | undefined = ns.find((n: node) => {
          return n.nodeID === r.endNodeID;
        });
        if (end === undefined) continue;
        const e: edge = { startNode: start, endNode: end };
        es.push(e);
      }

      setNodes(ns);
      setEdges(es);
    });
  }, []);
  useEffect(() => {
    console.log(props.startLocation);
    console.log("aaa");
    const canvasElement = canvasRef.current;
    if (canvasElement === null) {
      return;
    }

    const image: CanvasImageSource = new Image();
    image.src = props.image;
    const context = canvasElement.getContext("2d");
    if (context === null) return;

    function render(e: MouseEvent) {
      if (canvasElement === null || context === null) {
        console.error("canv null");
        return;
      }
      const rect = canvasElement.getBoundingClientRect(); // get element's abs. position
      const x =
        ((e.clientX - rect.left) / (rect.right - rect.left)) *
        canvasElement.width;
      const y =
        ((e.clientY - rect.top) / (rect.bottom - rect.top)) *
        canvasElement.height;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.drawImage(image, 0, 0, 5000, 3400); // Change parameters to zoom in and pan around the image
      // Move point to nearest edge
      if (nodesRef.current === null || edgesRef.current === null) return;
      const coords = graphHelper({
        x,
        y,
        nodes: nodesRef.current,
        edges: edgesRef.current,
      });
      if (coords === null) return;

      // Draw circle
      context.beginPath();
      context.lineWidth = 15;
      context.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
      context.stroke();

      const closestNode = pointHelper({
        x: coords.x,
        y: coords.y,
        nodes: nodesRef.current,
      });
      if (closestNode === null) return;

      getPath(
        closestNode,
        props.startLocation,
        coords,
        nodesRef.current,
        context,
      );
    }
    canvasElement.addEventListener("click", render);
    image.onload = () => {
      context.drawImage(image, 0, 0, 5000, 3400); // Change parameters to zoom in and pan around the image
    };

    return () => canvasElement.removeEventListener("click", render);
  });

  return (
    <>
      <canvas width={5000} height={3400} ref={canvasRef} />
    </>
  );
}

export default MapCanvas;
