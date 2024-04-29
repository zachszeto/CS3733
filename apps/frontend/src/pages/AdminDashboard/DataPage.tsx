import axios, {AxiosResponse} from "axios";
import React, {useState, useEffect} from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import { motion } from "framer-motion";

// import DownloadCSV from "../../components/DataHandling/DownloadCSV.tsx";
import DataTable from "../../components/DataHandling/DataTable.tsx";
import {Node} from "./../../helpers/typestuff.ts";


type edge = {
    startNodeID: string;
    endNodeID: string;
    blocked: boolean;
};

type employee = {
    id:number;
    firstName:string;
    lastName:string;
    assignedRequests?:{requestID:number}[];
};

export default function DataPage(){
    const [nodeTable, setNodeTable] = useState<Node[]>([]);
    const [edgeTable, setEdgeTable] = useState<edge[]>([]);
    const [employeeTable, setEmployeeTable] = useState<employee[]>([]);
    const [tab, setTab] = useState<number>(0);

    useEffect(() => {
        axios.get<[]>("/api/map").then((response: AxiosResponse) => {
            setNodeTable(response.data.nodes);
            setEdgeTable(response.data.edges);
        });
        axios.get<[]>("/api/employees").then((response: AxiosResponse) => {
            setEmployeeTable(response.data);
        });
    }, []);

    return(
        <>
            <Box sx={{width: '100%', height: '15vh', }}>
                <Typography variant={"h4"} sx={{height: '10vh', padding: 3}}>
                    Data Analytics
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'row', width: '95vw', height: '5vh'}}>
                    {["Nodes", "Edges", "Employee"].map((value, i) => {
                        return(
                            <>
                                <ButtonBase
                                    onClick={() => setTab(i)}
                                    sx={{
                                        p: 0,
                                        width: '5vw',
                                        marginLeft: '1vw',
                                        height: '100%',
                                        textAlign: 'center',
                                    }}
                                    key={i}
                                >
                                    <Typography>
                                        {value}
                                    </Typography>
                                    {i === tab ?
                                        (<motion.div
                                            style={{
                                                backgroundColor: "#f6bd38",
                                                width: '5vw',
                                                marginTop: '5vh',
                                                height: '0.2vh',
                                                position: 'absolute'
                                            }} layoutId={"tab_underline"}/>) : null}
                                </ButtonBase>

                            </>
                        );
                    })}
                </Box>
                {tab === 0 && (
                    <Box>
                        {/*<DownloadCSV*/}
                        {/*    url={"/api/nodes/download"}*/}
                        {/*    filename={"nodes.csv"}*/}
                        {/*    title={"Nodes"}*/}
                        {/*/>*/}
                        <DataTable
                            title={"Edges"}
                            headers={["Node ID", "Short Name", "Long Name", "X", "Y", "Floor", "Building", "Type"]}
                            rows={
                                nodeTable.map((n)=>{return [n.nodeID, n.shortName, n.longName, n.xcoord+"", n.ycoord+"", n.floor, n.building, n.nodeType];})
                            }
                        />
                    </Box>
                )}
                {tab === 1 && (
                    <Box>
                        {/*<DownloadCSV*/}
                        {/*    url={"/api/edges/download"}*/}
                        {/*    filename={"edges.csv"}*/}
                        {/*    title={"Edges"}*/}
                        {/*/>*/}
                        <DataTable
                            title={"Edges"}
                            headers={["Index","Start","End","Blocked"]}
                            rows={
                                edgeTable.map((e,i)=>{return [i+"",e.startNodeID,e.endNodeID,e.blocked+""];})
                            }
                        />
                    </Box>
                )}
                {tab === 2 && (
                    <Box>
                        <Box>
                            {/*<DownloadCSV*/}
                            {/*    url={"/api/employees/download"}*/}
                            {/*    filename={"employees.csv"}*/}
                            {/*    title={"Employees"}*/}
                            {/*/>*/}
                            <DataTable
                                title={"Employees"}
                                headers={["Employee ID", "First", "Last"]}
                                rows={
                                    employeeTable.map((e)=>{return [e.id+"", e.firstName, e.lastName];})
                                }
                            />
                        </Box>
                    </Box>
                )}

            </Box>

        </>
    );
}
