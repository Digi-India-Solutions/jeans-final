const express = require('express');
const router = express.Router();
const { createRolesByAdmin, getAllRoles  ,updateRolesByAdmin ,deleteRoleByAdmin} = require('./adminRole-controller');

router.post('/create-roles-by-admin', createRolesByAdmin);
router.get('/get-all-roles', getAllRoles);
router.post('/update-roles-by-admin/:id', updateRolesByAdmin);
router.get('/delete-roles-by-admin/:id', deleteRoleByAdmin);

module.exports = router;
