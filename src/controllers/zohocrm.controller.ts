import {Request, response, Response} from 'express';
import {connect} from '../database';
import {Post} from '../interface/Post';
import axios from 'axios';

if(process.env.NODE_ENV !== 'PRODUCCION'){
    require('dotenv').config();// Llamada al método config() del módulo dotenv
}

const client_id = process.env.CLIENT_ID || 'Indefinido';
const client_secret = process.env.CLIENT_SECRET || 'Indefinido';
const refresh_token = process.env.REFRESH_TOKEN || 'Indefinido';

const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      'refresh_token': refresh_token,
      'client_id': client_id,
      'client_secret': client_secret,
      'grant_type': 'refresh_token'
    })
};
const urlZoho = process.env.URL_ZOHO ?? 'Indefinido';

async function VerifyTimeTokenZohoCRM(): Promise<Boolean> {

    const creat_at_token = Number(process.env.WORK_TOKEN_CREATE_DATE);
    const timeElapsed = new Date().getTime() - creat_at_token;
    // console.log("Parason los sieguientes milisegundos desde que se creo el token: ", timeElapsed);
    // console.log("Parason los sieguientes segundos desde que se creo el token: ", timeElapsed / 1000);
    console.log("Parason los siguientes minutos desde que se creo el token: ", timeElapsed / 60000);
    console.log("Parason menos de 55min ?: ", (timeElapsed / 60000 <= 55));
    return (timeElapsed / 60000 <= 55);//Si pasaron menos 55min desde que se creo el token. Dura 60min.
}
async function SolicitarNuevoWorkToken(){
    try {
        let workToken = process.env.WORK_TOKEN || 'Indefinido';
        console.log("testeo(), Para renovar token: workToken", workToken);

        const data = new URLSearchParams();
        data.append('grant_type', 'refresh_token');
        data.append('refresh_token', refresh_token);
        data.append('client_id', client_id);
        data.append('client_secret', client_secret);

        const response = await axios.post(`https://accounts.zoho.com/oauth/v2/token`,
            data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log("testeo(), solicitud de renovacion de token", response.data);
        process.env.WORK_TOKEN = response.data.access_token;
            console.log("testeo(), verificar que se grabo el token en el .env: process.env.WORK_TOKEN", process.env.WORK_TOKEN || 'Indefinido');

        process.env.WORK_TOKEN_CREATE_DATE = new Date().getTime().toString();
        // return process.env.WORK_TOKEN;

        // return res.json({
        //     data: "ok",
        //     time: "Pasaron mas de 55min. Se renueva el token.",
        //     response: response.data
        // });
    } catch (error) {
        console.log("error:",error);
        // return res.json({
        //     error: error
        // });
        throw new Error(`No se pudo obtener el token OAuth. ${error}`);
    }
}
async function ProcesarEnCRM(callback: Function){
    if(await VerifyTimeTokenZohoCRM()){//Usar token
        console.log("Se sigue utilizando el token. No pasaron mas de 55 minutos.");
      
        const response = await callback();

        // return res.json({
        //     status: "ok",
        //     time: "Se sigue utilizando el token. No pasaron mas de 55 minutos.",
        //     data: response.data
        // });
        return {
            status: "ok",
            time: "Se sigue utilizando el token. No pasaron mas de 55 minutos.",
            data: response
        };
    }else{//Renovar token
        console.log("Se intento renovar el token. Pasaron mas de 55 minutos.");
        SolicitarNuevoWorkToken();
        // return res.json({
        //     status: "ok",
        //     time: "Se intento renovar el token. Pasaron mas de 55 minutos.",
        // });
        return {
            status: "ok",
            time: "Se intento renovar el token. Pasaron mas de 55 minutos.",
        };
    }
};
// http://localhost:3000/zohocrm/Contacts
export async function getContacts(req: Request, res: Response): Promise<Response> {
    try {
        const response = await ProcesarEnCRM(async ()=>{
    
                console.log("testeo(), getContacts()");
                let workToken = process.env.WORK_TOKEN || 'Indefinido';
                console.log("testeo(), getContacts(), process.env.WORK_TOKEN", process.env.WORK_TOKEN );
    
                const response = await axios.get(
                    `${urlZoho}/Contacts`,
                    {
                        headers: {
                            'Authorization': `Zoho-oauthtoken ${workToken}`
                        }
                    }
                );
            
                console.log("testeo(), getContacts(), response", response.data.data);
    
                return response.data.data;
           });
            
           return res.json({response});
    } catch (error) {
        console.log("error:", error);
        return res.json({
            error: error
        });
    }
}
// http://localhost:3000/zohocrm/Contacts/5704643000000428002
export async function getContactById(req: Request, res: Response): Promise<Response> {
    console.log("getContactById()");
    try {
        const contactId = req.params.contactId;
        console.log("getContactById(), parametro contactId es: ", contactId);

        const response = await ProcesarEnCRM(async ()=>{
                // 5704643000000413195
                const response = await axios.get(`${urlZoho}/Contacts/search?criteria=(id:equals:${contactId})`, {
                        headers: {
                            'Authorization': `Zoho-oauthtoken ${process.env.WORK_TOKEN}`
                        }
                    }
                );
    
                console.log("response",response.data.data);
    
                return response.data.data || [];
        });
            
        return res.json({response});
    } catch (error) {
        console.log("error:", error);
        return res.json({
            error: error
        });
    }
}
// http://localhost:3000/zohocrm/Contacts
export async function insertContact(req: Request, res: Response): Promise<Response> {
    //mandarle esto por post como json
    // {
    //     "data": [
    //         {
    //             "First_Name": "John4",
    //             "Last_Name": "Doe4",
    //             "Email": "john4.doe4@example4.com",
    //             "Phone": "1244444444"
    //         }
    //     ]
    // }
    try {
        const response = await ProcesarEnCRM(async ()=>{

            const contactData = req.body;
            console.log("insertContact(), contactData para insertar en zoho:", contactData);

            // 5704643000000413195
            const response = await axios.post(
                `${urlZoho}/Contacts`,
                contactData,
                {
                    headers: {
                        'Authorization': `Zoho-oauthtoken ${process.env.WORK_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("insertContact(), response de la insersion en zoho: ",response.data.data);
            return response.data.data;
        });
            
            const contactBody = req.body;
            console.log("insertContact(), contactBody para insertar en zoho:", contactBody);

           return res.json({response});
    } catch (error) {
        console.log("error:", error);
        return res.json({
            error: error
        });
    }
}


export async function testeo(req: Request, res: Response): Promise<Response>{
    try {

    const response = await ProcesarEnCRM(async ()=>{

            console.log("testeo(), getContacts()");
            let workToken = process.env.WORK_TOKEN || 'Indefinido';
            console.log("testeo(), getContacts(), process.env.WORK_TOKEN", process.env.WORK_TOKEN );

            const response = await axios.get(
                `${urlZoho}/Contacts`,
                {
                    headers: {
                        'Authorization': `Zoho-oauthtoken ${workToken}`
                    }
                }
            );
        
            console.log("testeo(), getContacts(), response", response.data.data);

            return response.data.data;
       });
        
       return res.json({response});
    } catch (error) {
        console.log("error:", error);
        return res.json({
            error: error
        });
    }
} 