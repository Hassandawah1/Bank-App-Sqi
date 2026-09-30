const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    transactionType: {type: String, required: true, enum: ["credit", "debit", "withdrawal", "deposit", "transfer"]},
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    transactionStatus: { type: String, required: true, enum: ["pending", "completed", "failed"] },
    sender: {
        tyepe: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function (){
            return ["debit", "withdrawal", "transfer"].includes(this.transactionType)
        }
    }
},
 { timestamps: true, strict: "throw" }
)

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;