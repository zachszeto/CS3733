import { useRef, useEffect } from "react";
import axios from "axios";

type mapCanvasProps = {
  image: typeof Image;
};

export function MapCanvas(props: mapCanvasProps) {
  const canvasRef = useRef(null);
  let nodes, edges;
  updateMapPaths();
  console.log(nodes + edges);

  async function updateMapPaths() {
      await axios.get("/api/map").then((res) => {
          nodes = res.data.nodes;
          edges = res.data.edges;
      });
  }

    const MAX_SNAP_DIST = 75;
    type vec2 = {
        x: number;
        y: number;
    };
    type node = {
        point: vec2;
        id: string;
    };
    type edge = {
        startNodeID: node;
        endNodeID: node;
    };
    type findClosestPointOnGraphProps = {
        x: number;
        y: number;
        nodes: node[];
        edges: edge[];
    };

    function dot(ax:number, ay:number, bx:number, by:number):number{
        return ax * bx + ay * by;
    }

    function clamp(val: number, min: number, max: number):number {
        return Math.min(Math.max(val, min), max);
    }

    function distance(a: vec2, b: vec2):number{
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function graphHelper(props: findClosestPointOnGraphProps){
        let closestPoint: vec2 | null = null;
        let closestDist: number = Infinity;

        for(let i = 0; i < props.edges.length; i++) {
            const edge = props.edges[i];
            const startNode = edge.startNodeID;
            const endNode = edge.endNodeID;
            if (!startNode || !endNode) continue;

            const pa: vec2 = {
                x: nodes.filter((node) => node.nodeID === startNode)[0].xcoord,
                y: nodes.filter((node) => node.nodeID === startNode)[0].ycoord
            };
            const pb: vec2 = {
                x: nodes.filter((node) => node.nodeID === endNode)[0].xcoord,
                y: nodes.filter((node) => node.nodeID === endNode)[0].ycoord
            };

            // TODO adjust pa and pb for screen scaling of the image
            // let x1 = startNode.x * zoomScale + offset.x;
            // let y1 = startNode.y * zoomScale + offset.y;
            // let x2 = endNode.x * zoomScale + offset.x;
            // let y2 = endNode.y * zoomScale + offset.y;

            const t:number =
                clamp(
                    dot(props.x - pa.x, props.y - pa.y, pb.x - pa.x, pb.y - pa.y) /
                    dot(pb.x - pa.x, pb.y - pa.y, pb.x - pa.x, pb.y - pa.y),
                    0, 1);

            const d:vec2 = { x: pa.x + t * (pb.x - pa.x), y: pa.y + t * (pb.y - pa.y) };
            const mousePos: vec2 = {x: props.x, y: props.y};
            const dist:number = distance(d, mousePos);
            if (dist < closestDist && dist <= MAX_SNAP_DIST){
                closestDist = dist;
                closestPoint = d;
            }


        }

        //console.log(closestPoint);
        return closestPoint;
    }

  /**
   * Draw a path between several nodes
   * @param nodes Array of node ids in order of connection
   */
  function createPath(nodes: string[]) {
    for (let i = 0; i < nodes.length - 1; i++) {
      connectNodes(nodes[i], nodes[i + 1]);
    }
  }

  /**
   * Create a line between two valid nodes when passing their nodeID as a string
   * @param startNodeStr The nodeID of the starting node
   * @param endNodeStr The nodeID of the ending node
   */
  async function connectNodes(startNodeStr: string, endNodeStr: string) {
    let startNode: object, endNode: object;
    await axios.get("/api/map").then((res) => {
      startNode = res.data.nodes.filter((node) => node.nodeID == startNodeStr);
      endNode = res.data.nodes.filter((node) => node.nodeID == endNodeStr);
    });
    if (startNode !== undefined && endNode !== undefined) {
      drawLine(
        startNode[0].xcoord,
        startNode[0].ycoord,
        endNode[0].xcoord,
        endNode[0].ycoord,
      );
    }
  }

  /**
   * Draw a line on the canvas between the specified positions
   * @param startX X-coordinate of the start point
   * @param startY Y-coordinate of the start point
   * @param endX X-coordinate of the end point
   * @param endY Y-coordinate of the end point
   */
  function drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.moveTo(startX, startY); // Start position
    context.lineTo(endX, endY);
    context.lineWidth = 5;
    context.strokeStyle = "blue"; // Line color
    context.lineCap = "round"; // Make ends of lines rounded
    context.stroke(); // Draw line
  }

  useEffect(() => {
    const image = new Image();
    image.src = props.image;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
      canvas.addEventListener('click', function(e) {

          const rect = canvas.getBoundingClientRect();  // get element's abs. position
          const x = (e.clientX-rect.left)/(rect.right - rect.left) * canvas.width;
          const y = (e.clientY - rect.top)/(rect.bottom - rect.top) * canvas.height;

          // Move point to nearest edge
          try {
              const coords = graphHelper({x, y, nodes, edges});
              // Draw circle
              context.beginPath();
              context.lineWidth = 15;
              context.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
              context.stroke();
          } catch (TypeError) {
            console.log("Selected point too far from any path");
          }


      });
    image.onload = () => {
      context.drawImage(image, 0, 0, 5000, 3400); // Change parameters to zoom in and pan around the image
      createPath(["CHALL004L1", "CLABS005L1", "CREST002L1"]); // Hardcoded path for now.
    };
  });

  return (
    <>
      <canvas ref={canvasRef} width={5000} height={3400} />
    </>
  );
}

export default MapCanvas;

// /api/a-star-api/startNode=c7utht?endNode=C7jgfg
