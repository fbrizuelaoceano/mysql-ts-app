import { Router } from "express";
const router = Router();
import { getOAuthKeyWork,  getContacts, getContactById, insertContact, testeo } from '../controllers/zohocrm.controller';

router.route('/getOAuthKeyWork')
    .get(getOAuthKeyWork);


router.route("/Contacts")
    .get(getContacts)
    .post(insertContact);

router.route('/Contacts/:contactId')
    .get(getContactById);

router.route('/testeo')
    .get(testeo);

export default router;
