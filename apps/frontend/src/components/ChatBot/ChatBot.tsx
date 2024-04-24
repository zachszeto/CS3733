import OpenAI from "openai";
import {useState} from "react";
import Button from "@mui/material/Button";
import {Box, TextField, Typography} from "@mui/material";
import NaturalLanguageDirection from "../NaturalLanguageDirection/naturalLanguageDirection.tsx";
import axios from "axios";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const openai = new OpenAI({apiKey:'', dangerouslyAllowBrowser: true});
const seed: string = "You are an AI Chatbot for my mock brigham and women's hospital";

async function sendToChatGPT(
    userMessage: string,
    chatMessages: { role: string; content: string }[]
): Promise<{ chatMessages: { role: string; content: string }[]; error: string | null }> {
    try {
        if(openai.apiKey === ''){
          const keyX = await axios.get("https://matthagger.me/apps/softeng/key.json");
          if(keyX.status !== 200){
            return {chatMessages, error: "Sorry, could not get the API key."};
          }
          console.log(keyX.data);
          openai.apiKey = keyX.data.key;

          //Seeding ChatGPT
          const seedMessage = await openai.chat.completions.create({
            messages: [{role: "system", content: seed!}],
            model: "gpt-3.5-turbo",
          });
          console.log(seedMessage);
        }


        const response = await openai.chat.completions.create({
            messages: [{role: "user", content: userMessage}],
            model: "gpt-3.5-turbo",
        });

        const assistantMessage = response.choices[0].message?.content;

        if (!assistantMessage) {
            return {chatMessages, error: "No response received from ChatGPT"};
        }

        return {
            chatMessages: [{role: "assistant", content: assistantMessage},{role: "user", content: userMessage},  ...chatMessages],
            error: null,
        };
    } catch (error) {
        console.error("Error getting response:", error);
        return {chatMessages, error: "Sorry, there was an error getting the response."};
    }
}

function checkUserMessage(message: string): { start: string; end: string } {
    const pattern = /^How do I get from (.*) to (.*)\?$/;
    const match = message.match(pattern);

    if (match) {
        const [, start, end] = match;
        return {start, end};
    } else {
        return {start: '', end: ''};
    }
}

type ChatbotProps = {
  open:boolean;
  onClose:()=>void;
};

export default function Chatbot(props:ChatbotProps) {
    console.log("Initialization Done");
    const [chatMessages, setChatMessages] = useState([{
        role: "system",
        content: "Hi! I am a friendly AI ChatBot here to help!"
    }]);

    const [userMessage, setUserMessage] = useState('');


    async function sendUserMessage() {
        setUserMessage('');
        if(userMessage.trim().length === 0){
          return;
        }
        setChatMessages((prevMessages) => [
            {role: "user", content: userMessage},
          ...prevMessages,
        ]);


        //Hijacking for Natural Language
        const {start, end} = checkUserMessage(userMessage);
        if (start !== '' && end !== '') {
            const res = await NaturalLanguageDirection(start, end, 0);
            const path = ['Path text error'];
            if (res !== undefined) {
              for(const d of res){
                path.push(d.message);
              }
            }
            setChatMessages((prevMessages) => [
                {role: "ChatBot", content: 'Path from ' + start + ' to ' + end + ': ' + path},
              ...prevMessages,
            ]);
            return;
        }

        const {chatMessages: updatedChatMessages, error} = await sendToChatGPT(userMessage, chatMessages);
        setChatMessages(updatedChatMessages);
        if (error) {
            console.error(error);
        }
    }

    return (
        <Box sx={{
          height: '65vh',
          position: 'fixed',
          width: '30%',
          bottom: '5%',
          right: '5%',
          boxShadow: 5,
          borderRadius: '2rem',
          overflow:'clip',
          transition:'all .3s ease-in-out',
          opacity: (props.open ? '1' : '0'),
          pointerEvents: (props.open ? 'all' : 'none'),
        }}>
            <Box sx={{
                height: '12%',
                backgroundColor: '#012d5a',
                display: 'flex',
                justifyContent: 'space-between',
                alignContent: 'center',
                px:3,

            }}>
              <Typography variant={"h6"} sx={{
                  color:'white',
                  lineHeight: 2.3,
                  gap: 2,
                  display: 'flex',
                  alignItems: 'center',
              }}>
                  CHATBOT
              </Typography>

                <Button
                onClick={props.onClose}
                sx={{
                  color:'white',
                    ml: '17vw'
                }}
              >
                    X
                </Button>
            </Box>
            <Box sx={{
                backgroundColor: 'white',
            }}>
                <Box sx={{
                  overflowY: 'scroll',
                  height: "48vh",
                  display:'flex',
                  flexDirection:'column-reverse',
                  flexWrap:'nowrap',
                  alignItems:'flex-start',
                  gap:1,
                  p:1,
                  pb:2
                }}>
                    {chatMessages.map((message, index) => (
                        <Box
                          key={index}
                          sx={{
                            width:'100%',
                            display:'flex',
                            flexDirection:'row',
                            justifyContent: (message.role === "user" ? 'flex-end' : 'flex-start'),

                          }}
                        >
                            <Box sx={{
                              backgroundColor: message.role === "user" ? '#012d5a' : '#f6bd38',
                              width: 'fit-content',
                              maxWidth:'70%',
                              borderRadius:  message.role === "user" ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                              padding: '10px',
                            }}>
                                <Box sx={{
                                    color: message.role === "user" ? 'white' : 'black',
                                }}>
                                    {message.role === "user" ? (
                                        <Typography variant={"h6"} sx={{
                                            gap: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}>
                                            <PersonIcon/>
                                            You
                                        </Typography>
                                    ) : (
                                        <>
                                            <Typography variant={"h6"} sx={{
                                                gap: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <SmartToyIcon/>
                                                ChatBot
                                            </Typography>
                                        </>
                                    )}
                                    {message.content}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box sx={{
                    display: 'flex',
                    backgroundColor: 'white',
                    outline: 'black',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height:'4rem',
                    pb:'1rem',
                    filter:'drop-shadow(0px -5px 10px #00000020)',
                }}>
                    <TextField
                        id="outlined-basic"
                        label="Type Your Message"
                        variant="standard"
                        style={{width: '70%'}}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') sendUserMessage();
                        }}
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                    />
                    <Button
                        onClick={sendUserMessage}
                        sx={{
                            backgroundColor: '#012d5a',
                            borderRadius: '2rem',
                            ml: '5%',
                            mt: '2%',
                            "&:hover": {
                                background: "#1a426a",
                                color: "white"
                            },
                        }}
                    >
                        <Typography sx={{
                            fontSize: '15px',
                            color: 'white'
                        }}>
                            Send
                        </Typography>
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
