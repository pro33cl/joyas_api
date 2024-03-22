// ----------------------------------------------------------
// IMPORTANDO
// ----------------------------------------------------------

import {joyasController} from "../controllers/joyas.controller.js";
import {Router} from "express";

// ----------------------------------------------------------
// DECLARACION DE VARIABLES
// ----------------------------------------------------------

const router = Router();

// ----------------------------------------------------------
// GET
// ----------------------------------------------------------

router.get("/", joyasController.welcome);

router.get("/joyas/", joyasController.read, joyasController.reportDetail);

router.get("/joyas/filtros/", joyasController.readByFilter, joyasController.reportDetail);

router.get("/joyas/joya/:id", joyasController.readById, joyasController.reportDetail);

// ----------------------------------------------------------
// POST
// ----------------------------------------------------------

router.post("/joyas/", joyasController.create, joyasController.reportDetail);

// ----------------------------------------------------------
// PUT
// ----------------------------------------------------------

router.put("/joyas/joya/:id", joyasController.update, joyasController.reportDetail);

// ----------------------------------------------------------
// DELETE
// ----------------------------------------------------------

router.delete("/joyas/joya/:id", joyasController.remove, joyasController.reportDetail);

// ----------------------------------------------------------
// EXPORTANDO
// ----------------------------------------------------------

export default router;
