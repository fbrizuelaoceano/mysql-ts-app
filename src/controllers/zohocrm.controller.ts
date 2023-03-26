import {Request, response, Response} from 'express';
import {connect} from '../database';
import {Post} from '../interface/Post';
import axios from 'axios';

const client_id = '1000.T72N5NPONN17W5SGDOAW7X71KBX63P';
const client_secret = '49074729516e9195f2fd44ae0c15af6d00c1d9aa39';
const refresh_token = '1000.214a2a3371b67b5b4971600c4028e5b2.e8e65686b98119a43db542883ab93ac4';
let workToken = '';

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
const data = new URLSearchParams();
data.append('grant_type', 'refresh_token');
data.append('refresh_token', refresh_token);
data.append('client_id', client_id);
data.append('client_secret', client_secret);

const urlZoho = 'https://www.zohoapis.com/crm/v2';

export async function getOAuthKeyWork(req: Request, res: Response): Promise<Response> {
    try {
        if (workToken.length <= 0) {
            const response = await axios.post(`https://accounts.zoho.com/oauth/v2/token`,
                data, {
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            console.log("response",response.data);

            workToken = response.data.access_token
            console.log("workToken",workToken);

            return res.json({
                response: response.data
            });
        }else{
            return res.json({
                messagge: "Ya hay un token",
                workToken: workToken
            });
        }
    } catch (error) {
        console.log("error:",error);
        return res.json({
            error: error
        });
    }
}
export async function getTestOAuthKeyWork(req: Request, res: Response): Promise<Response> {
    console.log("workToken", workToken);
    return res.json({
        response: workToken
    });
}

export async function getContacts(req: Request, res: Response): Promise<Response> {
    try {
        if (workToken.length > 0) {
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
export async function getContactById(req: Request, res: Response): Promise<Response> {

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
export async function insertContact(req: Request, res: Response): Promise<Response> {

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
// export async function getOAuthKeyWork(req: Request, res: Response){
//     const newPost: Post = req.body;
//     console.log(newPost);
//     const conn = await connect();
//     await conn.query('INSERT INTO posts SET ?', [newPost]);   
//     return res.json({
//         message: 'Post Created'
//     });
// }
