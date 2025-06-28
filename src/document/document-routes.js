const express = require("express");
const { createDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentsByCompany, searchDocuments, getDocumentsNameByCompany } = require("./document-controller");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/documents");
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
    },
});

const upload = multer({ storage: storage });

router.post("/create-document", upload.single("file"), createDocument);

router.post("/update-document/:id", updateDocument);

router.post("/delete-document/:id", deleteDocument);

router.get("/get-all-document", getAllDocuments);

router.post("/get-documents-by-company/:id", getDocumentsByCompany);

router.post("/search-documents/:term", searchDocuments);

router.get("/get-documents-name-by-company/:id", getDocumentsNameByCompany);


module.exports = router;