const { Router } = require("express");
const { createServicePurchased, getAllServicePurchased, searchServicePurchased, getAllServicePurchasedByCompany, createPhonePePayment, checkPhonePePaymentStatus } = require("../service-purchased/service-purchased-controller");

const router = Router();

router.post("/create-service-purchased", createServicePurchased);

router.get("/get-all-service-purchased", getAllServicePurchased);

router.get("/get-all-service-purchased-by-company/:id", getAllServicePurchasedByCompany);

router.post("/search-service-purchased/:term", searchServicePurchased);

router.post("/make-payment", createPhonePePayment);

router.post("/check-payment-status/:merchantTransactionId/:merchantId", checkPhonePePaymentStatus);


module.exports = router;