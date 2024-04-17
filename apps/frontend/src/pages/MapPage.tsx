import { useEffect, useState } from "react";
//import MapCanvas from "../components/Map/MapCanvas.tsx";
import {Grid, Box, Typography, TextField} from "@mui/material";
import LocationDropdown from "../components/LocationDropdown.tsx";
import MapCanvas from "../components/Map/MapCanvas.tsx";
import MenuItem from "@mui/material/MenuItem";

export default function MapPage() {
  useEffect(() => {
    document.title = "Map";
  });

  const algos = [
    {title:'A-Star', api:'astar', helper:'The quickest route'},
    {title:'Breadth First', api:'bfs', helper:'A decent route'},
    {title:'Depth First', api:'dfs', helper:'The scenic route'},
  ];
  const [startLocation, setStartLocation] = useState("Abrams Conference Room");
  const [endLocation, setEndLocation] = useState("Abrams Conference Room");
  const [searchAlgorithm, setSearchAlgorithm] = useState(0);
  return (
    <Grid
      container
      direction="row"
      justifyContent="stretch"
      alignItems="stretch"
      height='90vh'
    >
      <Grid
        item
        xs={3}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
          <Box  sx={{
              width: '90%',
              height: '100%',
              backgroundColor: 'whitesmoke',
              borderRadius: '23px',
              boxShadow: 3,
              m: '3%',
              mX: '10%',
          }}>
              <Box
                  sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: '#012d5a',
                      color: '#f6bd38',
                      p: 2,
                      borderRadius: '23px 23px 0 0',
                  }}
              >
                  <Typography
                      style={{fontFamily: 'Open Sans', fontWeight: 600}}
                      variant="h6"
                      component="h1"
                      align="center"
                  >
                      NAVIGATION MENU
                  </Typography>
              </Box>
              {/* start location dropdown menu */}
              <Box sx={{ p: 2, width: "100%" }}>
                  <LocationDropdown
                      onChange={(v: string) => {
                          setStartLocation(v);
                      }}
                      value={startLocation}
                      filterTypes={["HALL"]}
                      label={"Start "}
                  />
              </Box>

              {/* end location dropdown menu */}
              <Box sx={{ p: 2, width: "100%" }}>
                  <LocationDropdown
                      onChange={(v: string) => {
                          setEndLocation(v);
                      }}
                      value={endLocation}
                      filterTypes={["HALL"]}
                      label={"End "}
                  />
              </Box>
              {/* Algorithm choose */}
              <Box sx={{ p: 2, width: "100%" }}>
                  <TextField
                      select
                      onChange={(e)=>{
                          setSearchAlgorithm(parseInt(e.target.value));
                      }}
                      sx={{
                          width:'100%'
                      }}
                      value={searchAlgorithm}
                      label={"Algorithm "}
                      helperText={algos[searchAlgorithm].helper}
                  >
                      {
                          algos.map((a, i)=><MenuItem key={a.api} value={i}>{a.title}</MenuItem>)
                      }
                  </TextField>
                  <Typography>*reserved space for other features*</Typography>
              </Box>
          </Box>



      </Grid>

      <Grid item xs={9}>
        <MapCanvas
          defaultFloor={2}
          pathfinding={algos[searchAlgorithm].api}
          startLocation={startLocation}
          endLocation={endLocation}
          onDeselectEndLocation={() => {
            setEndLocation("");
          }}
        />
      </Grid>
    </Grid>
  );
}
