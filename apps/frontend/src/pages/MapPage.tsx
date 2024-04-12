import { useEffect, useState } from "react";
import MapCanvas from "../components/MapCanvas.tsx";
import { Grid, Box, Typography } from "@mui/material";
import LocationDropdown from "../components/LocationDropdown.tsx";

export default function MapPage() {
  useEffect(() => {
    document.title = "Map";
  });
  const [startLocation, setStartLocation] = useState("CCONF001L1");
  const [endLocation, setEndLocation] = useState("CCONF001L1");
  return (
    <Grid
      container
      direction="row"
      justifyContent="stretch"
      alignItems="stretch"
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
        <Typography
          fontFamily={"open-sans"}
          variant={"h3"}
          sx={{
            p: 2,
          }}
        >
          Navigate
        </Typography>

        {/* start location dropdown menu */}
        <Box sx={{ p: 2, width: "100%" }}>
          <LocationDropdown
            onChange={(v: string) => {
              setStartLocation(v);
            }}
            value={startLocation}
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
            label={"End "}
          />
        </Box>

        <Typography>*reserved space for other features*</Typography>
      </Grid>

      <Grid item xs={9}>
        <MapCanvas
          defaultFloor={2}
          pathfinding={true}
          startLocation={startLocation}
          endLocation={endLocation}
        />
      </Grid>
    </Grid>
  );
}