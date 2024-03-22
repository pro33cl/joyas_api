// ----------------------------------------------------------
// IMPORTANDO
// ----------------------------------------------------------

import express from 'express';
import cors from 'cors';
import "dotenv/config";
import joyasRoute from "./routes/joyas.route.js";
import {joyasController} from "./controllers/joyas.controller.js"

// ----------------------------------------------------------
// DECLARACION DE VARIABLES
// ----------------------------------------------------------

const app = express();
const SERVER = process.env.SERVER || "http://localhost:";
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------

app.use(express.json());
app.use(cors());
app.use("/", joyasController.report(), joyasRoute);

app.use((req,res)=>{
    return res.status(404).json({message:"Route not found", response: null});
});




// ----------------------------------------------------------
// LEVANTAR SERVIDOR
// ----------------------------------------------------------

app.listen(PORT, ()=>{
    console.log(`SERVER BACKEND ON, PORT: ${PORT}`)
    console.log(`Server: ${SERVER}${PORT}`)
});