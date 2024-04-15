import {Box, Paper, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {RequestInspectionDialogue} from "./RequestInspectionDialogue.tsx";
import axios, {AxiosResponse} from "axios";

export type RequestCard = {
    type:string;
}


type serviceRequest = {
    requestID: number,
    assignedEmployee: string,
    priority: string,
    status: string,
    type: string,
    giftDetail? : string,
    maintenanceDetail?: string,
    medicineDetail?: string,
    notes?: string,
}

export default function ServiceRequestOverview(){

    const [selectedCard, setSelectedCard] = useState<RequestCard | null>(null);
    const [reqs, setReqs] = useState<serviceRequest[]>([]);

    useEffect(()=>{
        axios.get('/api/service-requests').then((res: AxiosResponse) => {
            setReqs(res.data);
        });
    }, []);


    return(
        <>
            <Box
                sx={{
                    width:'100%',
                    overflowY:'scroll',
                    display:'flex',
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    alignItems:'flex-start',
                    pt:3,
                }}
            >
                {
                    reqs.map((service)=>{
                        return (
                            <Box
                                key={service.requestID}
                                sx={{
                                    width: ((100.0/reqs.length - 2)+"%"),
                                    minHeight:'85vh',
                                    height: 'fill-available',
                                    display:'flex',
                                    flexDirection:'column',
                                    justifyContent:'flex-start',
                                    alignItems:'flex-start',
                                    gap:'1rem',
                                }}
                            >
                                <Typography variant={"h4"}>{service.type}</Typography>
                                <Paper
                                    sx={{
                                        width:'100%',
                                        height:'300px',
                                        bgcolor:'white'
                                    }}
                                    elevation={5}
                                >

                                </Paper>

                            </Box>
                        );})
                }


            </Box>
            <RequestInspectionDialogue
                selectedRequest={selectedCard}
                onCloseDialogue={()=>{
                    setSelectedCard(null);
                }}
            />
        </>
    );
}
