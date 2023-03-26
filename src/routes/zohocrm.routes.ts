import { Router } from "express";
const router = Router();
import { getOAuthKeyWork, getTestOAuthKeyWork, getContacts, getContactById, insertContact } from '../controllers/zohocrm.controller';

router.route('/getOAuthKeyWork')
    .get(getOAuthKeyWork);
router.route('/getTestOAuthKeyWork')
    .get(getTestOAuthKeyWork);

router.route("/Contacts")
    .get(getContacts)
    .post(insertContact);

router.route('/:contactId')
    .get(getContactById);


export default router;
