import Box from "@mui/material/Box";
import ItemCard from "../../components/Card/ItemCard.tsx";
import Button from "@mui/material/Button";
import {useEffect, useState} from "react";
import React from "react";
import {useNavigate, useLocation} from "react-router-dom";
import Info from "../CheckoutPage/MUI Checkout/Info.tsx";
import axios, {AxiosResponse} from "axios";

export type Item = {
    id: string;
    type: string;
    imageURL: string;
    name: string;
    price: string;
    description: string;
};

// type ItemCardData = {
//     id: string;
//     imageURL: string;
//     title: string;
//     price: string;
//     description: string;
// };

// const items: ItemCardData[] = [
//     {
//         id: "1-tedd",
//         imageURL: "https://cdn.nodenium.com/3d10056f-1f66-4071-b9bc-2eab34dc5bf1",
//         title: "Teddy Bear",
//         price: "12",
//         description: "A cute Teddy Bear",
//     },
//     {
//         id: "2-choc",
//         imageURL: "https://cdn.nodenium.com/e03b0f04-9153-4c5b-8370-8da3be2a2760",
//         title: "Chocolates",
//         price: "15",
//         description: "Taste good",
//     },
//     {
//         id: "3-cake",
//         imageURL: "https://cdn.nodenium.com/32c982b8-4c41-4e5a-be07-8079d6f9c319",
//         title: "Cake",
//         price: "40",
//         description: "chocolate cake",
//     },
//     {
//         id: "4-ps5",
//         imageURL: "https://cdn.nodenium.com/4372f71b-2caf-440e-b238-c2085499f95b",
//         title: "PS5",
//         price: "600",
//         description: "ps5",
//     },
//     {
//         id: "1-rose",
//         imageURL: "https://cdn.nodenium.com/37eed916-975b-4788-a5a4-b8ff64490f04",
//         title: "Rose",
//         price: "20",
//         description: "Rose",
//     },
//     {
//         id: "2-dais",
//         imageURL: "https://cdn.nodenium.com/d5074553-86a1-4351-93a0-f720b503dada",
//         title: "Daisy",
//         price: "30",
//         description: "Daisy",
//     },
//     {
//         id: "3-tuli",
//         imageURL: "https://cdn.nodenium.com/38afd65e-4f26-46c8-b853-66cf863b975d",
//         title: "Tulip",
//         price: "35",
//         description: "Tulip",
//     },
//     {
//         id: "4-forg",
//         imageURL: "https://cdn.nodenium.com/a7aa8e0a-c057-46ee-b99b-212908aebe73",
//         title: "Forget-Me-Not",
//         price: "12",
//         description: "Flower",
//     },
// ];

export const StoreContext = React.createContext(null);

function GiftRequestPage() {

    const navigate = useNavigate();
    const location = useLocation();
    const initialCart: Item[] = location.state?.cart || [];

    const pageType = (location.pathname == "/flower-request")? "FLOWER" : "GIFT";

    const [cart, setCart] = useState(initialCart);
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => { // todo fix bug that causes api to be called twice
        document.title = "Gift Request";

        axios.get<Item[]>("/api/cart-items").then((res: AxiosResponse) => {
            setItems(res.data.filter(
                (item: Item) => {
                    return item.type === pageType;
                }
            ));
        });

    }, [pageType]);

    const handleDeleteItem = (indexToRemove: number) => {
        console.log(indexToRemove);
        const newCart = cart.filter((item, index) => index !== indexToRemove);
        setCart(newCart); // This will update the state and trigger a re-render
    };

    function addItem(item: Item) {
        setCart([...cart, item]);
        console.log("added item", item.id);
    }

    const handleSubmit = () => {
        navigate("/gift-checkout", {state: {cart}});
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
                marginTop: '10vh'
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    height: "fit-content",
                    bgcolor: "#FFFFFF",
                    width: '30vw',
                    position: "relative",
                    top: 0,
                    left: 0,
                    gap: 5,
                    overflowY: "scroll",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        p: '3vh',
                        maxWidth: '30vw',
                        marginTop: '80vh',
                        position: 'fixed',
                    }}>
                    <Box sx={{
                        marginLeft: '20%'
                    }}>
                        <Info cart={cart} onDeleteItem={handleDeleteItem}/>
                        <Box
                            sx={{
                                display: "flex",
                                ml: '-20%'

                            }}
                        >
                            <Button
                                type="button"
                                variant="contained"
                                color="secondary"
                                style={{minWidth: "10vw"}}
                                sx={{margin: 1}}
                                onClick={() => setCart([])}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                style={{minWidth: "10vw"}}
                                sx={{margin: 1}}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: {xs: "100vw", md: "70vw"},
                    backgroundColor: "#F1F1F1",
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        width: '80%',
                        m: '3vh',
                        justifyContent: 'justify-start',
                        gap: '3vh',
                        '& > *': {
                            '&:hover': {
                                transform: 'translateY(-8px)',
                            },
                        },
                    }}
                >
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            id={item.id}
                            imageURL={item.imageURL}
                            title={item.name}
                            price={item.price}
                            description={item.description}
                            handleAdd={addItem}
                        />
                    ))}

                </Box>
            </Box>
        </Box>

    );
}

export default GiftRequestPage;
