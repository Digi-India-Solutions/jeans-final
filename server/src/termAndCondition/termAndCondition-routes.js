// routes/termAndCondition-route.js
const { Router } = require("express");
const router     = Router();

const {
    getTermAndCondition,
    createTermAndCondition,
    updateTermAndCondition,
    deleteTermAndCondition,
} = require("./termAndCondition-controller");

// ✅ GET    — fetch current T&C (returns null data if none exists)
router.get("/get", getTermAndCondition);

// ✅ POST   — create T&C (only if none exists)
router.post("/create", createTermAndCondition);

// ✅ PUT    — update T&C by id
router.post("/update/:id", updateTermAndCondition);

// ✅ DELETE — soft delete T&C by id
router.get("/delete/:id", deleteTermAndCondition);

module.exports = router;