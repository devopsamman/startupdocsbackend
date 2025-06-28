const { Router } = require("express");
const { createUserTransaction, getAllUserTransactions, searchUserTransactions, getAllUserTransactionsByUser,updateUserTransaction,
    deleteUserTransaction
 } = require("./user-transactions-controller");

const router = Router();

router.post("/create-user-transaction", createUserTransaction);

router.get("/get-all-user-transactions", getAllUserTransactions);

router.get("/get-all-user-transactions-by-user/:id", getAllUserTransactionsByUser);

router.post("/search-user-transactions/:term", searchUserTransactions);

router.post("/update-user-transaction/:id", updateUserTransaction);

router.post("/delete-user-transaction/:id", deleteUserTransaction);

module.exports = router;