// ----------------------------------------------------------
// IMPORTANDO
// ----------------------------------------------------------

import pkg from 'pg';
import "dotenv/config";

// ----------------------------------------------------------
// DECLARACION DE VARIABLES E INSTANCIANDO OBJETOS
// ----------------------------------------------------------

const {Pool} = pkg;


export const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    allowExitOnIdle: true
});

// ----------------------------------------------------------
// FUNCION - test
// ----------------------------------------------------------

const test = async function (){
    try {
        await pool.query("SELECT NOW()");
        console.log("First Step: Database connected");
    } catch (error) {
        console.log("Error: Database not connected");
        console.error(error);
    }
}

test();