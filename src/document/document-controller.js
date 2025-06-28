const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const sendResponse = require("../../middleware/response");
const ErrorHandler = require("../../utils/ErrorHandler");
const { sharedDocument } = require("../../utils/mail");
const Document = require("./document-model");
const fs = require("fs");

exports.createDocument = catchAsyncErrors(async (req, res, next) => {
    try {
        const fileType = req?.file?.mimetype;

        console.log(req?.file)

        const newDocument = await Document.create({ ...req.body, file: req.file.filename, type: fileType });

        const populatedUser = await newDocument.populate('user_id company_id');
        
        if (populatedUser) {
            await sharedDocument({
                email: populatedUser?.user_id?.email,
                first_name: populatedUser?.user_id?.first_name,
                last_name: populatedUser?.user_id?.last_name,
                company_name: populatedUser?.company_id?.company_name,
                document_name: req?.body?.name
            });
        }

        sendResponse(res, 200, "Document Created Successfully", newDocument);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.updateDocument = catchAsyncErrors(async (req, res, next) => {
    try {

        const companyId = req.params.id;

        const updatedDocument = await Document.findByIdAndUpdate(companyId, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedDocument) {
            return next(new ErrorHandler("Document Not Found", 404));
        }

        sendResponse(res, 200, "Document Updated Successfully", updatedDocument);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.deleteDocument = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const deletedDocument = await Document.findByIdAndDelete(companyId);

        if (!deletedDocument) {
            return next(new ErrorHandler("Document Not Found", 404));
        }

        if (deletedDocument) {
            fs.unlink(`uploads/documents/${deletedDocument?.file}`, (error) => {
                if (error) {
                }
            })
        }


        sendResponse(res, 200, "Document Deleted Successfully", deletedDocument);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.getAllDocuments = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const totalDocument = await Document.countDocuments();

        const companies = await Document.find({})
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "Document Fetched Successfully", {
            totalDocument,
            totalPages: Math.ceil(totalDocument / 15),
            currentPage: parseInt(pageNumber, 10),
            companies
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})


exports.getDocumentsByCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const { pageNumber } = req.query;
        const companyId = req.params.id;
        const category = req.body.category;
        const categoryFilter = category === 'All Documents' ? {} : { category: category }

        const totalDocuments = await Document.countDocuments({ company_id: companyId, ...categoryFilter });

        const documents = await Document.find({ company_id: companyId, ...categoryFilter })
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15)
            .populate('user_id', 'first_name last_name')

        sendResponse(res, 200, "Documents Fetched Successfully", {
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / 15),
            currentPage: parseInt(pageNumber, 10),
            documents
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.getDocumentsNameByCompany = catchAsyncErrors(async (req, res, next) => {
    try {
        const companyId = req.params.id;

        const documents = await Document.find({ company_id: companyId })
            .sort({ created_at: -1 })
            .select('name')

        sendResponse(res, 200, "Documents Name Fetched Successfully", documents);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})

exports.searchDocuments = catchAsyncErrors(async (req, res, next) => {
    try {
        const { term } = req.params;

        const pageNumber = req.query.pageNumber;

        const categoryFilter = req.body.category === 'All Documents' ? {} : { category: req.body.category }

        const query = {
            $or: [
                { name: { $regex: term, $options: "i" } },
                { type: { $regex: term, $options: "i" } },
            ],
            company_id: req?.body?.company_id,
            ...categoryFilter
        };

        const totalDocuments = await Document.countDocuments(query);

        const documents = await Document.find(query)
            .sort({ created_at: -1 })
            .skip((pageNumber - 1) * 15)
            .limit(15);

        sendResponse(res, 200, "Documents Fetched Successfully", {
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / 15),
            currentPage: parseInt(pageNumber, 10),
            documents,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
})