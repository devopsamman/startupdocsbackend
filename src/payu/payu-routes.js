const { Router } = require("express");
const { createHash, success, failure,createHashForServices } = require("./payu-controller");

const router = Router();

router.post("/hash", createHash);

router.post("/success", success);

router.post("/failure", failure);

router.post("/hash-for-services", createHashForServices);

module.exports = router;