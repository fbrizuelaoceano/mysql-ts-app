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
export async function testeo(req: Request, res: Response): Promise<Response>{
    try {

        if(await VerifyTimeTokenZohoCRM()){//Usar token
            console.log("Se sigue utilizando el token. No pasaron mas de 55 minutos.");

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

            return res.json({
                status: "ok",
                time: "Se sigue utilizando el token. No pasaron mas de 55 minutos.",
                data: response.data
            });
        }else{//Renovar token
            console.log("Se intento renovar el token. Pasaron mas de 55 minutos.");
            SolicitarNuevoWorkToken();
            return res.json({
                status: "ok",
                time: "Se intento renovar el token. Pasaron mas de 55 minutos.",
            });
        }
        
    } catch (error) {
        console.log("error:", error);
        return res.json({
            error: error
        });
    }
} 

async function EenvioZohoCRM(): Promise<string> {

    const refresh_token = process.env.REFRESH_TOKEN || 'Indefinido';
    
    try {
        
            return process.env.WORK_TOKEN || 'Indefinido';
    } catch (error) {
        console.log("error:",error);
        throw new Error("No se pudo obtener el token OAuth.");
    }
}

async function getOAuthKeyWorkToken(): Promise<string> {
    
    console.log("getOAuthKeyWorkToken(), client_id",client_id);
    console.log("getOAuthKeyWorkToken(), client_secret",client_secret);
    console.log("getOAuthKeyWorkToken(), refresh_token",refresh_token);
    
    try {
        let workToken = process.env.WORK_TOKEN || 'Indefinido';
        console.log("workToken", workToken);

        if (workToken.length > 0) {
            return workToken;
        } else {
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

            console.log("response",response.data);
            process.env.WORK_TOKEN = response.data.access_token;
                console.log("process.env.WORK_TOKEN", process.env.WORK_TOKEN || 'Indefinido');

            return process.env.WORK_TOKEN || 'Indefinido';
        }
    } catch (error) {
        console.log("error:",error);
        throw new Error("No se pudo obtener el token OAuth.");
    }
}

export async function getContacts(req: Request, res: Response): Promise<Response> {
    console.log("getContacts()");
    let workToken = process.env.WORK_TOKEN || 'Indefinido';
    try {
        const workToken = await getOAuthKeyWorkToken();
        const response = await axios.get(
            `${urlZoho}/Contacts`,
            {
                headers: {
                    'Authorization': `Zoho-oauthtoken ${workToken}`
                }
            }
        );

        console.log("response",response.data.data);

        return res.json({
            data: response.data.data
        });
    } catch (error) {
        console.log("error:",error);
        return res.json({
            error: error
        });
    }
}
export async function getContactById(req: Request, res: Response): Promise<Response> {
    let workToken = process.env.WORK_TOKEN || 'Indefinido';

    const contactId = req.params.contactId;

    console.log("contactId", contactId);
   
    try {
        if (workToken.length > 0) {
            // 5704643000000413195
            const response = await axios.get(`${urlZoho}/Contacts/search?criteria=(id:equals:${contactId})`, {
                    headers: {
                        'Authorization': `Zoho-oauthtoken ${workToken}`
                    }
                }
            );

            console.log("response",response.data.data);

            return res.json({
                data: response.data.data
            });
        }else{
              // Si no hay token, devuelve un error 401 (No autorizado)
            return res.status(401).json({
                error: "No se proporcionó un token de autenticación"
            });
        }
    } catch (error) {
        console.log("error:",error);
        return res.json({
            error: error
        });
    }
}
export async function insertContact(req: Request, res: Response): Promise<Response> {
    let workToken = process.env.WORK_TOKEN || 'Indefinido';

    const contactBody = req.body;

    console.log("contactBody", contactBody);
    try {
        if (workToken.length > 0) {
            // 5704643000000413195
            const response = await axios.post(
                `${urlZoho}/Contacts`,
                {
                    data: [
                        {
                            First_Name: "John3",
                            Last_Name: "Doe3",
                            Email: "john3.doe3@example3.com",
                            Phone: "1233333333"
                        }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Zoho-oauthtoken ${workToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("response",response.data.data);

            return res.json({
                data: response.data.data
            });

        }else{
            return res.json({
                messagge: "Hubo un error"
            });
        }
    } catch (error) {
        console.log("error:",error);
        return res.json({
            error: error
        });
    }
}
export async function getOAuthKeyWork(req: Request, res: Response): Promise<Response> {
    let workToken = process.env.WORK_TOKEN || 'Indefinido';
    console.log("getOAuthKeyWork, workToken", workToken);
    
    try {

        //Si es valido tengo esto 
        // {
        //     "access_token": "1000.2c7bf06e523f23d6b5b4e866c78935c4.00bd56aaa2ae9227533964741f0ad74d",
        //     "api_domain": "https://www.zohoapis.com",
        //     "token_type": "Bearer",
        //     "expires_in": 3600
        // }
        // else
        // {
        //     "error": "invalid_code"
        // }
        if (workToken.length <= 0) {
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

            console.log("getOAuthKeyWork, response",response.data);

            workToken = response.data.access_token
            console.log("getOAuthKeyWork, workToken",workToken);

            process.env.WORK_TOKEN = response.data.access_token;
                console.log("getOAuthKeyWork, process.env.WORK_TOKEN", process.env.WORK_TOKEN || 'Indefinido');


            return res.json({
                responseZOHOCRM: response.data,
                envWorkToken: process.env.WORK_TOKEN || 'Indefinido'
            });
        }else{
            return res.json({
                messagge: "Ya hay un token",
                workToken: workToken
            });
        }
    } catch (error) {
        console.log("getOAuthKeyWork, error:",error);
        return res.json({
            error: error
        });
    }
}
export async function getTestOAuthKeyWork(req: Request, res: Response): Promise<Response> {
    console.log("getTestOAuthKeyWork, process.env.WORK_TOKEN", process.env.WORK_TOKEN || 'Indefinido');
    let workToken = process.env.WORK_TOKEN || 'Indefinido';
    console.log("getTestOAuthKeyWork, workToken", workToken);

    return res.json({
        response: workToken
    });
}
