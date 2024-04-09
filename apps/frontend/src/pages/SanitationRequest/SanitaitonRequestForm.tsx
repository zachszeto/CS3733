import { ChangeEvent, useState } from "react";
import { SanitationFormFields } from "./sanitationFields.ts";
import RequestList from "../../helpers/requestList.ts";
import Checkbox from "../../components/Form Elements/Checkbox.tsx";
import Radio from "../../components/Form Elements/Radio.tsx";
import sanitationImage from "../../assets/sanitation_background.jpg";
import LocationSelectFormDropdown from "../../components/locationSelectFormDropdown.tsx";
import {
  TextField,
  FormControl,
  MenuItem,
  Button,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const sanitationRequests = new RequestList();

function SanitationRequestForm() {
  const [submittedRequests, setSubmittedRequests] = useState<
    SanitationFormFields[]
  >([]);

  const [formInput, setFormInput] = useState<SanitationFormFields>({
    name: "",
    priority: "",
    location: "",
    type: "",
    size: "",
    assignmentStatus: "",
  });

  function handleNameInput(e: ChangeEvent<HTMLInputElement>) {
    setFormInput({ ...formInput, name: e.target.value });
  }

  function handleTypeInput(v: string) {
    console.log(v);
    // @ts-expect-error Specified type more specifically and typescript doesn't like that
    const boxes: NodeListOf<HTMLInputElement> =
      document.getElementsByName("type");
    let checkedBoxes = "";
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].checked) {
        checkedBoxes += boxes[i].value + ", ";
      }
    }
    setFormInput({ ...formInput, type: checkedBoxes });
  }

  function updateSizeInput(input: string) {
    setFormInput({ ...formInput, size: input });
  }

  function isComplete(): boolean {
    return (
      formInput.name != "" &&
      formInput.priority != "" &&
      formInput.location != "" &&
      formInput.type != "" &&
      formInput.size != "" &&
      formInput.assignmentStatus != ""
    );
  }

  function submitForm() {
    setSubmittedRequests((prevRequests) => [...prevRequests, formInput]);
    sanitationRequests.addRequestToList(formInput);
    clearForm();
    console.log(sanitationRequests.requests); // Print the array of requests to the console
  }

  function clearForm() {
    setFormInput({
      ...formInput,
      name: "",
      priority: "",
      location: "",
      type: "",
      size: "",
      assignmentStatus: "",
    });
    const form = document.getElementById("sanitationForm");
    if (form == null) {
      return;
    } else {
      // @ts-expect-error Declaring form as an HTMLFormElement causes errors with getting
      form.reset();
    }
  }

  return (
    <Box
      position="relative"
      sx={{
        backgroundImage: `url(${sanitationImage})`,
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        backgroundSize: "cover",
      }}
    >
      <Box
        position="absolute"
        top={70}
        sx={{
          width: "500px",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#012d5a",
          color: "#f6bd38",
          p: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center">
          Sanitation Request
        </Typography>
      </Box>

      <Box position="absolute" top={150} sx={{ width: "500px" }}>
        <form
          id="sanitationForm"
          style={{
            backgroundColor: "whitesmoke",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <FormControl
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "top",
            }}
          >
            <TextField
              required
              label="Employee Name"
              onChange={handleNameInput}
              margin="normal"
              value={formInput.name}
              fullWidth
            />

            <TextField
              required
              select
              id="priority-select"
              label={"Priority"}
              margin="normal"
              value={formInput.priority}
              onChange={(event) => {
                setFormInput({
                  ...formInput,
                  priority: event.target.value,
                });
              }}
            >
              <MenuItem value={"Low"}>Low</MenuItem>
              <MenuItem value={"Medium"}>Medium</MenuItem>
              <MenuItem value={"High"}>High</MenuItem>
              <MenuItem value={"Emergency"}>Emergency</MenuItem>
            </TextField>

            <LocationSelectFormDropdown
              value={formInput.location}
              onChange={(v: string) => {
                setFormInput({ ...formInput, location: v });
              }}
            />

            <Checkbox
              label={"Type of mess (Choose all that apply):"}
              onChange={handleTypeInput}
              groupName={"type"}
              items={["Solid Waste", "Liquid Spill", "Other"]}
            />

            <Radio
              label={"Mess Size"}
              onChange={updateSizeInput}
              groupName={"messSize"}
              items={["Small", "Medium", "Large"]}
            />

            <TextField
              required
              select
              value={formInput.assignmentStatus}
              label={"Status"}
              margin="normal"
              onChange={(event) => {
                setFormInput({
                  ...formInput,
                  assignmentStatus: event.target.value,
                });
              }}
            >
              <MenuItem value={"Unassigned"}>Unassigned</MenuItem>
              <MenuItem value={"Assigned"}>Assigned</MenuItem>
              <MenuItem value={"In Progress"}>In Progress</MenuItem>
              <MenuItem value={"Closed"}>Closed</MenuItem>
            </TextField>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
              pb={"30px"}
            >
              <Button
                type="button"
                variant="contained"
                color="secondary"
                sx={{
                  margin: 1,
                }}
                onClick={clearForm}
              >
                Clear
              </Button>

              <Button
                type="button"
                variant="contained"
                color="secondary"
                sx={{
                  margin: 1,
                }}
                disabled={!isComplete()}
                onClick={submitForm}
              >
                Submit
              </Button>
            </Box>
          </FormControl>
        </form>
      </Box>

      <Box position="absolute" top={1000} sx={{ width: "80%" }}>
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                backgroundColor: "#012d5a",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "#f6bd38" }}>Name</TableCell>
                <TableCell sx={{ color: "#f6bd38" }}>Priority</TableCell>
                <TableCell sx={{ color: "#f6bd38" }}>Location</TableCell>
                <TableCell sx={{ color: "#f6bd38" }}>Type</TableCell>
                <TableCell sx={{ color: "#f6bd38" }}>Size</TableCell>
                <TableCell sx={{ color: "#f6bd38" }}>
                  Assignment Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submittedRequests.map((request, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {request.name}
                  </TableCell>
                  <TableCell>{request.priority}</TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.size}</TableCell>
                  <TableCell>{request.assignmentStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default SanitationRequestForm;
