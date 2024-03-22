// ----------------------------------------------------------
// IMPORTANDO
// ----------------------------------------------------------

import {joyasModel} from "../models/joyas.model.js";

// ----------------------------------------------------------
// FUNCION - queryPaginationVerify
// ----------------------------------------------------------

const queryPaginationVerify = function(limits, page, order_by){

    let param, order, limitV, offset, pageV, order_byV;
    let errorExistPagination = false;
    let errorJsonPagination = {message:"", response: null};
    
    if(order_by && order_by!=undefined){

        const [_param, _order] = order_by.split("_");

        if(_param && (_param == "id" || _param == "nombre" || _param == "stock")){

            param = _param;

        }
        else{

            errorExistPagination = true;
            errorJsonPagination = {message:"Invalid query: order_by", response: null};

        }

        if(_order && (_order == "ASC" || _order == "DESC")){

            order = _order;
            order_byV = order_by
        }
        else{

            errorExistPagination = true;
            errorJsonPagination = {message:"Invalid query: order_by", response: null};

        }
    }
    else {

        param = "id";
        order = "ASC";
        order_byV = "id_ASC";

    }

    if(limits && !isNaN(limits) && limits!=undefined && limits>=0){

        limitV = parseInt(limits,10);

    }
    else if(limits && isNaN(limits) && limits!=undefined){

        errorExistPagination = true;
        errorJsonPagination = {message:"Invalid query: limits", response: null};

    }
    else{

        limitV = 0;

    }

    if(page && !isNaN(page) && page!=undefined && page>=1){

        offset = (parseInt(page,10)-1)*parseInt(limits,10);
        pageV = parseInt(page,10);

    }
    else if(page && isNaN(page) && page!=undefined){

        errorExistPagination = true;
        errorJsonPagination = {message:"Invalid query: page", response: null};

    }
    else{

        offset = 0;
        pageV = 1;

    }

    return {errorExistPagination, errorJsonPagination, param, order, limitV, offset, pageV, order_byV};

};

// ----------------------------------------------------------
// FUNCION - queryFilterVerify
// ----------------------------------------------------------

const queryFilterVerify = function ({price_min: price_min, price_max: price_max, category: category, metal: metal }){

    let price_minV, price_maxV, categoryV, metalV;
    let errorExistFilter = false;
    let errorJsonFilter = {message:"", response: null};

    if(price_min){

        if(!isNaN(price_min)){

            price_minV = price_min;

        }
        else{

            errorExistFilter = true;
            errorJsonFilter = {message:"Invalid query: price_min", response: null};

        }
    }
    else{

        price_minV = null;

    }

    if(price_max){

        if(!isNaN(price_max)){

            price_maxV = price_max;

        }
        else{

            errorExistFilter = true;
            errorJsonFilter = {message:"Invalid query: price_max", response: null};

        }
    }
    else{

        price_maxV = null;

    }

    if(price_minV > price_maxV){

        errorExistFilter = true;
        errorJsonFilter = {message:"Invalid query: price_min > price_max", response: null};

    }

    if(category){

        categoryV = category;

    }
    else{

        categoryV = null;

    }

    if(metal){

        metalV = metal;

    }
    else{

        metalV = null;

    }

    if(price_minV || price_maxV || categoryV || metalV){

        errorExistFilter = false;

    }
    else{

        errorExistFilter = true;
        errorJsonFilter = {message:"Invalid query: You need query data", response: null};

    }

    return {errorExistFilter, errorJsonFilter, price_minV, price_maxV, categoryV, metalV};

};

// ----------------------------------------------------------
// FUNCION - read
// ----------------------------------------------------------

const read = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.read: start");
    
    try {

        const {limits, page, order_by}= await req.query;
        const {errorExistPagination, errorJsonPagination, param, order, limitV, offset, pageV, order_byV} = queryPaginationVerify(limits, page, order_by);
        const total_pages = await joyasModel.countPages(limitV,{});

        if(errorExistPagination){

            return res.status(400).json(errorJsonPagination);

        }
        else if(pageV>total_pages){

            return res.status(404).json({message: "Not found", response: null});

        }
        else{

            const joyas = await joyasModel.findAllJoyas({param, order, limitV, offset, pageV, order_byV});
            joyasModel.ProcessConsole.add("joyas.controller.read: success");
            return res.status(200).json({message:"Success", response: joyas});

        }

    } catch (error) {

        joyasModel.ProcessConsole.add(error.message);
        return res.status(500).json({message: "Internal server error", response: error}); 

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.read: closed");
        next();

    }
};

// ----------------------------------------------------------
// FUNCION - readById
// ----------------------------------------------------------

const readById = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.readById: start");

    try {

        const id = await req.params.id;
        const joya = await joyasModel.findById(id);

        if(!joya){

            joyasModel.ProcessConsole.add("joyas.controller.readById: joya not found");
            return res.status(404).json({message:"Joyas not found", response: null});

        }
        else{

            joyasModel.ProcessConsole.add("joyas.controller.readById: success");
            return res.status(200).json({message:"Success", response: joya});

        }
    } catch (error) {

        return res.status(500).json({message: "Internal server error", response: error}); 

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.readById: closed");
        next();

    }
};

// ----------------------------------------------------------
// FUNCION - readByFilter
// ----------------------------------------------------------

const readByFilter = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.readByFilter: start");


    try {

        const {price_min, price_max, category, metal, limits, page, order_by}= await req.query;
        const {errorExistFilter, errorJsonFilter, price_minV, price_maxV, categoryV, metalV} = queryFilterVerify({price_min: price_min, price_max: price_max, category: category, metal: metal});
        const {errorExistPagination, errorJsonPagination, param, order, limitV, offset, pageV, order_byV} = queryPaginationVerify(limits, page, order_by);
        const total_pages = await joyasModel.countPages(limitV,{price_minV: price_minV, price_maxV: price_maxV, categoryV: categoryV, metalV: metalV });
        let errorJsonMessage = [];
        let errorJson = {message: "", response: null};

        if(errorExistFilter){

            errorJsonMessage.push(errorJsonFilter.message);
        }

        if(errorExistPagination){

            errorJsonMessage.push(errorJsonPagination.message);
        }

        if(errorExistFilter || errorExistPagination){

            errorJson = {message: errorJsonMessage.join(" & "), response: null};
            return res.status(400).json(errorJson);

        }
        else if(pageV>total_pages){

            errorJson = {message: "Not found", response: null};
            return res.status(404).json(errorJson);

        }
        else{

            const joyas = await joyasModel.findByFilter({price_minV, price_maxV, categoryV, metalV}, {param, order, limitV, offset, pageV, order_byV});
            joyasModel.ProcessConsole.add("joyas.controller.readByFilter: success");
            return res.status(200).json({message:"Success", response: joyas});

        }

    } catch (error) {

        joyasModel.ProcessConsole.add(error.message);
        return res.status(500).json({message: "Internal server error", response: error}); 

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.readByFilter: closed");
        next();

    }
};

// ----------------------------------------------------------
// FUNCION - create
// ----------------------------------------------------------

const create = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.create: start");

    try {

        const joya = await req.body;
        let newJoya;

        if(!joya){

            joyasModel.ProcessConsole.add("Post is required");
            return res.status(400).json({message:"Post is required", response: null});

        }
        else if(!joya.nombre || !joya.categoria || !joya.metal || !joya.precio || !joya.stock){

            joyasModel.ProcessConsole.add("Post data is required");
            return res.status(400).json({message:"Post data is required", response: null});
        }
        else{

            newJoya = {nombre: joya.nombre, categoria: joya.categoria, metal: joya.metal, precio: joya.precio, stock: joya.stock};
        }

        const posted = await joyasModel.createJoyas(newJoya);
        joyasModel.ProcessConsole.add("Posted");
        return res.status(201).json({message:"Posted", response: posted});

    } catch (error) {

        joyasModel.ProcessConsole.add(error.message);
        return res.status(500).json({message: "Internal server error", response: error});

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.create: closed");
        next();

    }
};

// ----------------------------------------------------------
// FUNCION - update
// ----------------------------------------------------------

const update = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.update: start");

    try {

        const id = await req.params.id;
        const joya = await req.body;
        let newJoya;

        if(!joya){

            joyasModel.ProcessConsole.add("Post is required");
            return res.status(400).json({message:"Post is required", response: null});

        }
        else{

            newJoya = {nombre: joya.nombre, categoria: joya.categoria, metal: joya.metal, precio: joya.precio, stock: joya.stock};

        }

        const posted = await joyasModel.updateById(id, newJoya);

        if(!posted){

            joyasModel.ProcessConsole.add("Not updated");
            return res.status(404).json({message:"Not updated", response: null});

        }
        else{

            joyasModel.ProcessConsole.add("Updated");
            return res.status(200).json({message:"Updated", response: posted});

        }
    } catch (error) {

        joyasModel.ProcessConsole.add(error.message);
        return res.status(500).json({message: "Internal server error", response: error});

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.update: closed");
        next();

    }
};

// ----------------------------------------------------------
// FUNCION - remove
// ----------------------------------------------------------

const remove = async (req, res, next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("joyas.controller.remove: start");

    
    try {

        const id = await req.params.id;
        const joya = await joyasModel.removeById(id);

        if(!joya){

            joyasModel.ProcessConsole.add("Element not found");
            return res.status(404).json({message:"Element not found", response: null});

        }
        else{

            joyasModel.ProcessConsole.add("Removed");
            return res.status(200).json({message:"Removed", response: joya});

        }
    } catch (error) {

        joyasModel.ProcessConsole.add(error.message);
        return res.status(500).json({message: "Internal server error", response: error});

    }
    finally{

        joyasModel.ProcessConsole.add("joyas.controller.remove: closed");
        next();
    }
};

// ----------------------------------------------------------
// FUNCION - notFoundRoute
// ----------------------------------------------------------

const notFoundRoute = async (req, res,next) => {

    joyasModel.ProcessConsole.delete();
    joyasModel.ProcessConsole.add("Not Found Route");
    res.status(404).json({message:"Not Found Route", response: null});
    next();

};

// ----------------------------------------------------------
// FUNCION - report
// ----------------------------------------------------------

const report =  function(){

    return (req, res, next) => {

        console.log("-------------------------------");
        console.log(`Request URL: ${req.originalUrl}`);
        console.log(`Request Type: ${req.method}`);
        next();
    };
};

// ----------------------------------------------------------
// FUNCION - reportDetail
// ----------------------------------------------------------

const reportDetail =  async (req, res) => {

        const stringReport = joyasModel.ProcessConsole.print();
        console.log(stringReport);
        return;

};

const welcome =  async (req, res) => {

    return res.status(200).json({message:"Welcome", response: null});

};

// ----------------------------------------------------------
// EXPORTANDO
// ----------------------------------------------------------

export const joyasController = {welcome, read, readById, readByFilter, create, update, remove, notFoundRoute, report, reportDetail};