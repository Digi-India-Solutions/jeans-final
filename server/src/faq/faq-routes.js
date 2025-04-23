const express = require('express');
const { createFaq, getAllFaqs, getFaqById, updateFaq, deleteFaq, faqStatus } = require('./faq-controller',);

const router = express.Router();

router.post("/create-faq", createFaq);

router.get("/get-al-faq", getAllFaqs);

router.get("/get-faq-by-id/:id", getFaqById);

router.post("/update-faq/:id", updateFaq);

router.get("/delete-faq/:id", deleteFaq);

router.post("/faq-status/:id", faqStatus)

module.exports = router;