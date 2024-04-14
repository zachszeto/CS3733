import {ChangeEvent, useEffect, useState} from "react";
import LocationDropdown from "../../components/LocationDropdown.tsx";
import Calendar from "../../components/Calendar/Calendar.tsx";
import {
    TextField,
    FormControl,
    MenuItem,
    Button,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormLabel,
} from "@mui/material";

type form = {
    medicine: string;
    dosage: string;
    form: string;
    patientName: string;
    physicianName: string;
    location: string;
    priority: string;
    status: string;
};

function MedicineRequestForm() {
  useEffect(() => {
    document.title = "Medicine Request";
  });
  // const [formData, setFormData] = useState<form[]>([]);
    const [formInput, setFormInput] = useState<form>({
        medicine: "",
        dosage: "",
        form: "",
        patientName: "",
        physicianName: "",
        location: "",
        priority: "",
        status: "",
      });

    function isComplete(): boolean {
        return (
            formInput.medicine != "" &&
            formInput.dosage != "" &&
            formInput.form != "" &&
            formInput.patientName != "" &&
            formInput.physicianName != "" &&
            formInput.location != "" &&
            formInput.priority != "" &&
            formInput.status != ""
        );
    }

    function handlePhysicianNameInput(e: ChangeEvent<HTMLInputElement>) {
        setFormInput({...formInput, physicianName: e.target.value});
    }

    function handlePatientNameInput(e: ChangeEvent<HTMLInputElement>) {
        setFormInput({...formInput, patientName: e.target.value});
    }
    
  function submitForm() {
    let requestID = -1;
    if (isComplete()) {
      // Log the current state of service and details
      console.log("Submitting Request");

      // Configure requestID to a specific, unique value
      requestID = Date.now();
      requestID = parseInt(
          requestID.toString().substring(8) +
          parseInt(Math.random() * 1000 + "").toString(),
      );

      // Create a service request object
      const medicineRequest = {
        requestID: requestID,
        type: "MEDICINE",
        priority: formInput.priority,
        status: formInput.status,
        notes: "None",
        locationID: formInput.location,
        patientName: formInput.patientName,
        primaryPhysicianName: formInput.physicianName,
        medicine: formInput.medicine,
        dosage: parseInt(formInput.dosage),
        form: formInput.form,
      };
      console.log(JSON.stringify(medicineRequest));

      // Send a POST request to the server
      fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicineRequest),
      })
          .then((response) => {
            console.log(response);
          })

          .then((data) => console.log(data))
          .catch((error) => {
            console.error("Error:", error);
          });
    } else {
      // If service is "Null option", do not log anything
      console.log("No service request submitted.");
    }
    clearForm();
  }

    function clearForm() {
        setFormInput({
            ...formInput,
            medicine: "",
            dosage: "",
            form: "",
            patientName: "",
            physicianName: "",
            location: "",
            priority: "",
            status: "",
        });
    }

    return (
        <Box sx={{
            width: '100vw',
            display: 'flex'
        }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    justifyContent: 'center',
                    position: 'relative',
                    m: '3%',
                    mt: '6%',
                    width: '70%'
                }}
            >
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
                        variant="h4"
                        component="h1"
                        align="center"
                    >
                        MEDICINE REQUEST
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        backgroundColor: 'whitesmoke',
                        borderRadius: '0 0 23px 23px',
                        boxShadow: 3,
                    }}
                >
                    <form
                        id="medicineForm"
                        style={{
                            backgroundColor: 'whitesmoke',
                            display: 'flex',
                            justifyContent: 'center',
                            borderRadius: '0 0 23px 23px',
                            flexDirection: 'column',
                            margin: '2%',
                        }}
                    >
                        <FormControl
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "top",
                                padding: 2,
                                gap: 1,
                            }}
                        >
                            <TextField
                                required
                                label="Patient Name"
                                onChange={handlePatientNameInput}
                                margin="normal"
                                value={formInput.patientName}
                                fullWidth
                                sx={{marginY: 0}}
                            />

                            <TextField
                                required
                                label={"Name of Primary Physician"}
                                onChange={handlePhysicianNameInput}
                                margin="normal"
                                value={formInput.physicianName}
                                sx={{marginY: 0}}
                            />

            <TextField
              required
              select
              id="priority-select"
              label={"Priority"}
              margin="normal"
              inputProps={{ MenuProps: { disableScrollLock: true } }}
              value={formInput.priority}
              onChange={(event) => {
                setFormInput({
                  ...formInput,
                  priority: event.target.value,
                });
              }}
            >
              <MenuItem value={"LOW"}>Low</MenuItem>
              <MenuItem value={"MEDIUM"}>Medium</MenuItem>
              <MenuItem value={"HIGH"}>High</MenuItem>
              <MenuItem value={"EMERGENCY"}>Emergency</MenuItem>
            </TextField>

                            <Box sx={{marginY: 0}}><LocationDropdown
                                onChange={(v: string) => {
                                    setFormInput({...formInput, location: v});
                                }}
                                value={formInput.location}
                                filterTypes={["HALL"]}
                                label={"Location"}
                            /></Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginY: 0,
                                }}
                            >
                                <TextField
                                    required
                                    select
                                    id="medicine-select"
                                    label={"Medicine"}
                                    inputProps={{MenuProps: {disableScrollLock: true}}}
                                    value={formInput.medicine}
                                    onChange={(event) => {
                                        setFormInput({
                                            ...formInput,
                                            medicine: event.target.value,
                                        });
                                    }}
                                    sx={{width: "60%", pr: "5%"}}
                                >
                                    <MenuItem value={"PainKillers"}>PainKillers</MenuItem>
                                    <MenuItem value={"Tylenol"}>Tylenol</MenuItem>
                                    <MenuItem value={"Paracetamol"}>Paracetamol</MenuItem>
                                </TextField>

                                <TextField
                                    required
                                    sx={{width: "35%"}}
                                    label="Dosage"
                                    onChange={(event) => {
                                        setFormInput({
                                            ...formInput,
                                            dosage: event.target.value,
                                        });
                                    }}
                                    value={formInput.dosage}
                                />
                            </Box>

                            <Box sx={{marginY: 0}}>
                                <FormLabel id="medicine-form">Form</FormLabel>
                                <RadioGroup
                                    name="medicine-form"
                                    aria-labelledby="medicine-form"
                                    value={formInput.form}
                                    onChange={(event) => {
                                        setFormInput({
                                            ...formInput,
                                            form: event.target.value,
                                        });
                                    }}
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Box sx={{display: "flex"}}>
                                        <Box sx={{width: "10rem"}}><FormControlLabel
                                            value="POWDER"
                                            control={<Radio/>}
                                            label="Powder"
                                        /></Box>
                                        <Box><FormControlLabel
                                            value="TAB_OR_CAP"
                                            control={<Radio/>}
                                            label="Tab/Cap"
                                        /></Box>
                                    </Box>
                                    <Box sx={{display: "flex"}}>
                                        <Box sx={{width: "10rem"}}><FormControlLabel
                                            value="CHEWABLE"
                                            control={<Radio/>}
                                            label="Chewable"
                                        /></Box>
                                        <Box><FormControlLabel
                                            value="LIQUID"
                                            control={<Radio/>}
                                            label="Liquid"
                                        /></Box>
                                    </Box>
                                    <Box sx={{display: "flex"}}>
                                        <FormControlLabel
                                            value="INHALER"
                                            control={<Radio/>}
                                            label="Inhaler"
                                        />
                                    </Box>
                                </RadioGroup>
                            </Box>


                            <TextField
                                required
                                select
                                value={formInput.status}
                                label={"Status"}
                                margin="normal"
                                inputProps={{MenuProps: {disableScrollLock: true}}}
                                onChange={(event) => {
                                    setFormInput({
                                        ...formInput,
                                        status: event.target.value,
                                    });
                                }}
                                sx={{marginY: 0}}
                            >
                                <MenuItem value={"UNASSIGNED"}>Unassigned</MenuItem>
                                <MenuItem value={"ASSIGNED"}>Assigned</MenuItem>
                                <MenuItem value={"IN_PROGRESS"}>In Progress</MenuItem>
                                <MenuItem value={"CLOSED"}>Closed</MenuItem>
                            </TextField>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginY: 0,
                                }}
                            >
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="secondary"
                                    sx={{margin: 1}}
                                    onClick={clearForm}
                                >
                                    Clear
                                </Button>

                                <Button
                                    type="button"
                                    variant="contained"
                                    color="secondary"
                                    sx={{margin: 1}}
                                    disabled={!isComplete()}
                                    onClick={submitForm}
                                >
                                    Submit
                                </Button>
                            </Box>
                        </FormControl>
                    </form>

                </Box>
            </Box>

            <Box sx={{
                mt: '6%',
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
                        variant="h4"
                        component="h1"
                        align="center"
                    >
                        Date
                    </Typography>
                </Box>

                <Box
                    sx={{
                        backgroundColor: 'whitesmoke',
                        borderRadius: '0 0 23px 23px',
                        boxShadow: 3,
                        padding: '1%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Calendar/>

                </Box>
            </Box>
    </Box>
  );
}

export default MedicineRequestForm;
