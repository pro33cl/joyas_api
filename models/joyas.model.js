// ----------------------------------------------------------
// IMPORTANDO
// ----------------------------------------------------------

import {pool} from "../database/connection.js";
import format from "pg-format";

// ----------------------------------------------------------
// DECLARACION DE CLASE - ProcessConsole
// ----------------------------------------------------------

class ProcessConsole {
    static processArray = [];

    static add(stringProcess){
        ProcessConsole.processArray.push(stringProcess);
    };

    static delete(){
        ProcessConsole.processArray = [];
    }

    static print(){
        return ProcessConsole.processArray.join("\n");
    }
};

// ----------------------------------------------------------
// FUNCION - formatResponseHATEOAS
// ----------------------------------------------------------

/**
 * 
 * @param {Array} resultJoyasArray Arreglo de objetos con resultado de la busqueda Get
 * @param {String} stringUrlGetBase Url base para busqueda Get por Id (Ej: https://localhost:3000/joyas/)
 * @param {String} stringUrlGet Url base para busqueda Get en general (Ej: https://localhost:3000/joyas/ ó https://localhost:3000/joyas/filtros/)
 * @param {Object} param3 Objeto con parámetros para busqueda ordenada {limitV, pageV, order_byV, total_pages}
 * @param {Object} param4 Objeto con parámetros para busqueda filtrada {price_maxV, price_minV, categoryV, metalV}
 * @returns Retorna respuesta en formato HATEOAS {count, previous, next, results}
 */

const formatResponseHATEOAS = function(resultJoyasArray,stringUrlGetBase,stringUrlGet, {limitV=null, pageV=null, order_byV=null, total_pages=null}, {price_maxV=null, price_minV=null, categoryV=null, metalV=null}){
    
    ProcessConsole.add("joyas.model.formatResponseHATEOAS: start");
    const count = resultJoyasArray.length;

    const urlGet = ()=>{

        let stringUrlBase = stringUrlGet;

        if(price_maxV || price_minV || categoryV || metalV){

            stringUrlBase +="?";
            let filterArray = [];
            price_minV? filterArray.push(`price_min=${price_minV}`):null;
            price_maxV? filterArray.push(`price_max=${price_maxV}`):null;
            categoryV? filterArray.push(`category=${categoryV}`):null;
            metalV? filterArray.push(`metal=${metalV}`):null;
            stringUrlBase = `${stringUrlBase}${filterArray.join("&")}`;

        }
        else{
            stringUrlBase +="?";
        }

        return stringUrlBase;

    }; 

    const results = resultJoyasArray.map((joya)=>{

        return {id: joya.id, name: joya.nombre, stock: joya.stock, url: `${stringUrlGetBase}/joya/${joya.id}`}

    });

    const previousPage= ()=>{

        if((limitV && pageV && order_byV && total_pages && (pageV-1)>=1)){

            if(price_maxV || price_minV || categoryV || metalV){

                return `${urlGet()}&limits=${limitV}&page=${pageV-1}&order_by=${order_byV}`;

            }
            else{

                return `${urlGet()}limits=${limitV}&page=${pageV-1}&order_by=${order_byV}`;

            }
        }
        else{

            return null;

        }
    };

    const nextPage = ()=>{

        if(limitV && pageV && order_byV && total_pages && (pageV+1)<=Number(total_pages)){

            if(price_maxV || price_minV || categoryV || metalV){

                return `${urlGet()}&limits=${Number(limitV)}&page=${pageV+1}&order_by=${order_byV}`;

            }
            else{

                return `${urlGet()}limits=${Number(limitV)}&page=${pageV+1}&order_by=${order_byV}`;

            }
        }
        else{

            return null;

        }
    };

    ProcessConsole.add("joyas.model.formatResponseHATEOAS: closed");
    return {

        count: count,
        previous: previousPage(),
        next: nextPage(),
        results: results

    };  
};

// ----------------------------------------------------------
// FUNCION - countPages
// ----------------------------------------------------------

/**
 * 
 * @param {Integer} limitV Limite verificado
 * @param {Object} param1 Objeto con datos verificados: {price_minV: price_minV, price_maxV: price_maxV, categoryV: categoryV, metalV: metalV }
 * @returns Retorna cantidad de páginas: total_pages
 */

const countPages = async function(limitV, {price_minV: price_minV, price_maxV: price_maxV, categoryV: categoryV, metalV: metalV }){

    ProcessConsole.add("joyas.model.countPages: start");

    let queryCount, formattedQuery;
    let values = [];
    let queryValues =[];
    let total_rows;
    let total_pages;

    if(price_minV || price_maxV || categoryV || metalV){
        
        queryCount = 'SELECT COUNT(*) FROM inventario WHERE';

        if(price_minV){

            values.push(price_minV);
            queryValues.push('precio >= %s');

        }

        if(price_maxV){

            values.push(price_maxV);
            queryValues.push('precio <= %s');

        }

        if(categoryV){

            values.push(categoryV);
            queryValues.push(`categoria = '%s'`);

        }

        if(metalV){

            values.push(metalV);
            queryValues.push(`metal = '%s'`);

        }

        queryCount = `${queryCount} ${queryValues.join(' AND ')}`;
        formattedQuery = format(queryCount, ...values);
        const {rows:countResults} = await pool.query(formattedQuery);
        total_rows = parseInt(countResults[0].count,10);

    }
    else{

        queryCount = 'SELECT COUNT(*) FROM inventario';
        const {rows:countResults} = await pool.query(queryCount);
        total_rows = parseInt(countResults[0].count,10);

    }

    total_pages = limitV>0? Math.ceil(total_rows/limitV):1;
    ProcessConsole.add("joyas.model.countPages: closed");
    return total_pages;
   
};

// ----------------------------------------------------------
// FUNCION - findAllJoyas
// ----------------------------------------------------------

/**
 * 
 * @param {Object} param0 Objeto con datos verificados: {param, order, limitV, offset, pageV, order_byV}
 * @returns Resultado en formato HATEOAS
 */


const findAllJoyas = async function({param, order, limitV, offset, pageV, order_byV}){
    
    ProcessConsole.add("joyas.model.findAllJoyas: start");
    const total_pages = await countPages(limitV, {});

    let query;
    let formattedQuery;

    if(limitV<=0){

        query = 'SELECT * FROM inventario ORDER BY %s %s ';
        formattedQuery = format(query, param, order);

    }
    else{

        query = 'SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s';
        formattedQuery = format(query, param, order, limitV, offset);

    }

    const {rows} = await pool.query(formattedQuery);
    const resultHATEOAS = formatResponseHATEOAS(rows, "http://localhost:3000/joyas", "http://localhost:3000/joyas",{limitV, pageV, order_byV, total_pages},{});
    
    ProcessConsole.add("joyas.model.findAllJoyas: closed");
    return resultHATEOAS;
};

// ----------------------------------------------------------
// FUNCION - findById
// ----------------------------------------------------------

/**
 * 
 * @param {Integer} id 
 * @returns Retorna objeto: {id, nombre, categoria, metal, precio, stock}  
 */

const findById = async function(id){

    ProcessConsole.add("joyas.model.findById: start");
    const query = "SELECT * FROM inventario WHERE id = %s";
    const values = id;
    const formattedQuery = format(query, values);
    const {rows} = await pool.query(formattedQuery);
    ProcessConsole.add("joyas.model.findById: closed");
    return rows[0];

};

// ----------------------------------------------------------
// FUNCION - findByFilter
// ----------------------------------------------------------

/**
 * 
 * @param {Object} param0 Objeto con datos verificados: {price_minV, price_maxV, categoryV, metalV}
 * @param {Object} param1 Objeto con datos verificados: {param, order, limitV, offset, pageV, order_byV}
 * @returns Resultado en formato HATEOAS
 */

const findByFilter = async function ({price_minV, price_maxV, categoryV, metalV}, {param, order, limitV, offset, pageV, order_byV}){
    
    ProcessConsole.add("joyas.model.findByFilter: start");
    const total_pages = await countPages(limitV, {price_minV, price_maxV, categoryV, metalV});

    let query;
    let values = [];
    let queryValues = [];
    let formattedQuery;
  
    query = 'SELECT * FROM inventario WHERE';

    if(price_minV){

        values.push(price_minV);
        queryValues.push('precio >= %s');

    }

    if(price_maxV){

        values.push(price_maxV);
        queryValues.push('precio <= %s');

    }

    if(categoryV){

        values.push(categoryV);
        queryValues.push(`categoria = '%s'`);

    }

    if(metalV){

        values.push(metalV);
        queryValues.push(`metal = '%s'`);

    }

    query = `${query} ${queryValues.join(' AND ')}`;

    if(limitV){

        values.push(param);
        values.push(order);

        if(limitV<=0){

            query = `${query} ORDER BY %s %s`;
            formattedQuery = format(query, ...values);

        }
        else{

            values.push(limitV);
            values.push(offset);
            query = `${query} ORDER BY %s %s LIMIT %s OFFSET %s`;
            formattedQuery = format(query, ...values);

        }
    }
    else{

        formattedQuery = format(query, ...values);

    }
    
    const {rows} = await pool.query(formattedQuery);
    const resultHATEOAS = formatResponseHATEOAS(rows, "http://localhost:3000/joyas", "http://localhost:3000/joyas/filtros/",{limitV, pageV, order_byV, total_pages},{price_maxV, price_minV, categoryV, metalV});
    ProcessConsole.add("joyas.model.findByFilter: closed");
    return resultHATEOAS;
};

// ----------------------------------------------------------
// FUNCION - createJoyas
// ----------------------------------------------------------

/**
 * 
 * @param {Object} joya Objeto: {nombre, categoria, metal, precio, stock} 
 * @returns Retorna objeto posteado: {id, nombre, categoria, metal, precio, stock}
 */

const createJoyas = async function(joya){

    ProcessConsole.add("joyas.model.createJoyas: start");
    const query = "INSERT INTO inventario (nombre, categoria, metal, precio, stock) VALUES ('%s', '%s', '%s', %s, %s) RETURNING *";
    const values = [joya.nombre, joya.categoria, joya.metal, joya.precio, joya.stock];
    const formattedQuery = format(query, ...values);
    const {rows} = await pool.query(formattedQuery);
    ProcessConsole.add("joyas.model.createJoyas: closed");
    return rows[0]; 
};

// ----------------------------------------------------------
// FUNCION - updateById
// ----------------------------------------------------------

/**
 * 
 * @param {Integer} id 
 * @param {Object} joya Objeto: {nombre, categoria, metal, precio, stock} 
 * @returns Retorna objeto actualizado: {id, nombre, categoria, metal, precio, stock}
 */

const updateById = async function(id, joya){
    
    ProcessConsole.add("joyas.model.updateById: start");
    let query;
    let formattedQuery;

    if(joya.nombre && joya.nombre != undefined && isNaN(joya.nombre)){

        query = `UPDATE inventario SET nombre = '%s' WHERE id = %s`;
        formattedQuery = format(query, joya.nombre, id);
        let {rows} = await pool.query(formattedQuery);

    }

    if(joya.categoria && joya.categoria != undefined && isNaN(joya.categoria)){

        query = `UPDATE inventario SET categoria = '%s' WHERE id = %s`;
        formattedQuery = format(query, joya.categoria, id);
        let {rows} = await pool.query(formattedQuery);

    }

    if(joya.metal && joya.metal != undefined && isNaN(joya.metal)){

        query = `UPDATE inventario SET metal = '%s' WHERE id = %s`;
        formattedQuery = format(query, joya.metal, id);
        let {rows} = await pool.query(formattedQuery);

    }

    if(joya.precio && joya.precio != undefined && isNaN(joya.precio)){

        query = `UPDATE inventario SET precio = %s WHERE id = %s`;
        formattedQuery = format(query, joya.precio, id);
        let {rows} = await pool.query(formattedQuery);

    }

    if(joya.stock && joya.stock != undefined && isNaN(joya.stock)){

        query = `UPDATE inventario SET stock = %s WHERE id = %s`;
        formattedQuery = format(query, joya.stock, id);
        let {rows} = await pool.query(formattedQuery);

    }

    const response = await findById(Number(id));
    ProcessConsole.add("joyas.model.updateById: closed");
    return response;
};

// ----------------------------------------------------------
// FUNCION - removeById
// ----------------------------------------------------------

/**
 * 
 * @param {Integer} id 
 * @returns Retorna objeto eliminado: {id, nombre, categoria, metal, precio, stock}
 */

const removeById = async function(id){

    ProcessConsole.add("joyas.model.removeById: start");
    const query = "DELETE FROM inventario WHERE id = %s RETURNING *";
    const formattedQuery = format(query, Number(id));
    const {rows} = await pool.query(formattedQuery);
    ProcessConsole.add("joyas.model.removeById: closed");
    return rows[0];

};

// ----------------------------------------------------------
// EXPORTANDO
// ----------------------------------------------------------

export const joyasModel = {findAllJoyas, findById, findByFilter, createJoyas, updateById, removeById, countPages, ProcessConsole};