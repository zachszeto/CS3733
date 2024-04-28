import React, {useEffect, useState} from "react";
import {
  Accordion, AccordionDetails,
  AccordionSummary,
  Box, Checkbox,
  Fab,
  IconButton,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup, Typography
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import {FLOOR_IDS, FLOOR_NAMES} from "../../helpers/MapHelper.ts";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TimelineIcon from '@mui/icons-material/Timeline';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {ICONS} from "./MapIcons.tsx";

type MapControlProps = {
  floor: number;
  zoom: number;
  zoomSpeed: number;
  onSetFloorIndex: (floorIndex: number) => void;
  onSetZoom: (zoom: number) => void;
  onResetMap: () => void;
  viewMode: string;
  showViewModeSelector:boolean;
  onSetViewMode: (m:string)=>void;
  mobile?:boolean;
  showIcons:boolean[];
  onSetShowIcons: (b:boolean[])=>void;
};

export default function MapControls(props: MapControlProps) {
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setNotification("Viewing "+ FLOOR_NAMES[props.floor]);
  }, [props.floor]);

  if(props.mobile){
    return (
      <Accordion
        defaultExpanded={false}
        sx={{
          width:'96vw',
          m:0,
          position:'absolute',
          top:'12vh',
          left:'2vw',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
          <Typography variant={"h6"}>{FLOOR_NAMES[props.floor]}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              width:'100%',
              display:'flex',
              flexDirection:'row',
              justifyContent:'space-evenly',
              pb:1
            }}
          >
          {FLOOR_IDS.map((floor, index) => {
            return (
              <Fab
                size={"medium"}
                sx={{
                  bgcolor: 'white',
                }}
                key={floor}
                onClick={() => {
                  props.onSetFloorIndex(index);
                }}
              >
                {floor}
              </Fab>);
          })}
          </Box>
          <Box
            sx={{
              width:'100%',
              display:'flex',
              flexDirection:'row',
              justifyContent:'space-evenly',
              pb:1
            }}
          >
            <Fab
              size={'medium'}
              sx={{
                bgcolor:'white',
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                props.onSetZoom(props.zoom - props.zoomSpeed);
              }}
            >
              <ZoomInIcon/>
            </Fab>
            <Fab
              size={'medium'}
              sx={{
                bgcolor:'white',
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                props.onSetZoom(props.zoom + props.zoomSpeed);
              }}
            >
              <ZoomOutIcon/>
            </Fab>
            <Fab
              size={'medium'}
              sx={{
                bgcolor:'white',
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                props.onResetMap();
              }}
            >
              <CenterFocusWeakIcon/>
            </Fab>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: '12vh',
        right: 16,
        display: "flex",
        flexDirection: "column",
        flexWrap: "nowrap",
      }}
    >
      <Accordion
        defaultExpanded={false}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
          Icons
        </AccordionSummary>
        <AccordionDetails>
          {
            ICONS.map((ico, index)=>{
              return(
                <Box
                  key={ico.name}
                  sx={{
                    display:'flex',
                    flexDirection:'row',
                  }}
                >
                  <Typography variant={'caption'}>{ico.name}</Typography>
                  <Checkbox
                    value={index}
                    checked={props.showIcons[index]}
                    onChange={()=>{
                      const a = props.showIcons;
                      a[index] = !a[index];
                      props.onSetShowIcons(a);
                    }}
                  />
                </Box>
              );
            })
          }
        </AccordionDetails>
      </Accordion>
      <Box
        sx={{
          display:'flex',
          flexDirection:'column-reverse',
          justifyContent:'flex-start',
          alignItems:'flex-end',
          gap:1,
        }}
      >
        <br/>
        <Fab
          size={'medium'}
          sx={{
            bgcolor:'white',
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.onSetZoom(props.zoom - props.zoomSpeed);
          }}
        >
          <ZoomInIcon/>
        </Fab>
        <Fab
          size={'medium'}
          sx={{
            bgcolor:'white',
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.onSetZoom(props.zoom + props.zoomSpeed);
          }}
        >
          <ZoomOutIcon/>
        </Fab>
        <Fab
          size={'medium'}
          sx={{
            bgcolor:'white',
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.onResetMap();
          }}
        >
          <CenterFocusWeakIcon/>
        </Fab>
        <br/>
        {FLOOR_IDS.map((floor, index) => {
              return (
                <Fab
                  size={'medium'}
                  sx={{
                    bgcolor:'white',
                  }}
                  key={floor}
                  onClick={() => {
                    props.onSetFloorIndex(index);
                  }}
                >
                  {floor}
                </Fab>
              );
            })
        }
      </Box>
      { props.showViewModeSelector && (<ToggleButtonGroup
          value={props.viewMode}
          exclusive
          onChange={(e,n)=>{
            if(n===null)return;
            props.onSetViewMode(n);
          }}
          sx={{
            bgcolor:'white'
          }}
        >
          <ToggleButton value="normal"><TimelineIcon /></ToggleButton>
          <ToggleButton value="edit"><EditIcon /></ToggleButton>
          <ToggleButton value="heatmap"><LocalFireDepartmentIcon /></ToggleButton>
        </ToggleButtonGroup>)}
        <Snackbar
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
          open={notification !== ''}
          onClose={() => {
            setNotification('');
          }}
          autoHideDuration={5000}
          message={notification}
          key={"Notif"}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              sx={{p: 0.5}}
              onClick={() => {
                setNotification('');
              }}
            >
              <CloseIcon/>
            </IconButton>
          }
        />
    </Box>
  );
}
