import axios, { AxiosResponse } from "axios";

type node = {
    xcoord: number;
    ycoord: number;
    nodeID: string;
    nodeType: string;
    longName: string;
    building?: string;
    shortName?: string;
    floor?: string;
};

const PIXELS_PER_FOOT = 3;

function findNextNodeWithType(nodeTable: Array<node>, path: Array<string>, index: number){
    for (let i: number = index; i < path.length - 1; i++) {
        const currentNodeType = nodeTable.find(nodes => nodes.nodeID === path[i])!.nodeType;
        if(currentNodeType != 'HALL') {
            return nodeTable.find(nodes => nodes.nodeID === path[i])!.longName;
        }
    }
    return nodeTable.find(nodes => nodes.nodeID === path[index])!.nodeType;
}

async function getLanguageDirection(path: Array<string>): Promise<string[]>{
    const response: AxiosResponse = await axios.get("/api/map");

    const nodeTable: Array<node> = response.data.nodes;
    const nodeList: Array<node> = [];
    const directions: string[] = [];

    for (let i: number = 0; i < path.length - 2; i++) {
        const currentNode = nodeTable.find(nodes => nodes.nodeID === path[i])!;
        const currentNodeName = currentNode.shortName;
        nodeList.push(currentNode);
        const nextNode = nodeTable.find(nodes => nodes.nodeID === path[i+1])!;

        if (i === 0) {
            directions.push("You are currently at " + currentNodeName + " on floor " + currentNode.floor);
        }

        else if (currentNode.floor != nextNode.floor) {
            if (currentNode.nodeType === "ELEV") {
                directions.push(`Take elevator to floor ${nextNode.floor}`);
            }
            else {
                directions.push(`Take stairs to floor ${nextNode.floor}`);
            }
            // add the direction when exit the stair/elev
            // "head towards: " find the name of the next node in path that's not a hall
            i++;
            const nextNodeNameWithType = findNextNodeWithType(nodeTable, path, i+1);
            const nn =  nextNodeNameWithType.toUpperCase().indexOf('HALL') === -1 ? "towards "+nextNodeNameWithType : "down the hall";
            directions.push(`Head ${nn}`);

        }
        else {
            const dx: number = nextNode.xcoord - currentNode.xcoord;
            const dy: number = nextNode.ycoord - currentNode.ycoord;
            const angle: number = Math.atan2(dy, dx);


                // add filter for node with only 2 neighbours to walk straight??
                const previousNode = nodeTable.find(nodes => nodes.nodeID === path[i-1])!;
                const dxPrev: number = currentNode.xcoord - previousNode.xcoord;
                const dyPrev: number = currentNode.ycoord - previousNode.ycoord;

                const anglePrev = Math.atan2(dyPrev, dxPrev);

                let directionChange: number = (angle - anglePrev);

                //map angle from 0 to pi

                if (directionChange > Math.PI && directionChange < 2*Math.PI){
                    directionChange = directionChange - 2*Math.PI;
                }
                else if (directionChange < -Math.PI && directionChange > -2*Math.PI) {
                    directionChange = directionChange + 2*Math.PI;
                }


                if ((Math.abs(directionChange) < Math.PI / 4) || (Math.abs(directionChange - 2*Math.PI) < Math.PI / 4) || (Math.abs(directionChange + 2*Math.PI) < Math.PI / 4)) {
                    if (!directions[directions.length - 1].startsWith('Walk straight')){
                        const distance = Math.sqrt(dx**2 + dy**2);
                        directions.push("Walk straight " + Math.round(distance * PIXELS_PER_FOOT) +"ft");
                    }
                } else {
                  const cn = currentNodeName === undefined ? "" : currentNodeName!;console.log(cn);
                  const nn =  cn.toUpperCase().indexOf('HALL') === -1 ? (" at "+cn) : "";
                  if (directionChange > 0) {
                    directions.push("Turn right" + nn);
                  } else {
                    directions.push("Turn left" + nn);
                  }
                }
        }}
    const endNodeName = nodeTable.find(nodes => nodes.nodeID === path[path.length - 1])!.longName;
    directions.push("You are at: " + endNodeName);
    return directions;
}

async function fetchPathData(startLocation: string, endLocation:string, searchAlgorithm: string) {
    try {
        const response = await axios.get(`/api/pathfind?startNode=${endLocation}&endNode=${startLocation}&algorithm=${searchAlgorithm}`);
        return response.data.path; // Return the path in array
    } catch (error) {
        return ["no path"]; // Return no path if there's error ?probably doesn't work
    }
}


export default async function NaturalLanguageDirection(startLocation: string, endLocation:string, searchAlgorithm: number) {
    let searchAlgorithmString;
    if (searchAlgorithm === 0){
        searchAlgorithmString = "astar";
    }
    else if (searchAlgorithm === 1){
        searchAlgorithmString = "bfs";
    }
    else {
        searchAlgorithmString = "dfs";
    }

    const path = await fetchPathData(startLocation, endLocation, searchAlgorithmString);
    if(path.length === 0)
        return;
   return await getLanguageDirection(path);
}

