const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/passports");
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
    },
});

const upload = multer({ storage: storage });

const { uploadPassport, getPassport} = require("./passport-controller");


router.post("/upload-passport", upload.single("file"), uploadPassport);

router.get("/get-passport/:id",  getPassport);

module.exports = router;