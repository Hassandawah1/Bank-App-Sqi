const UserModel = require("../models/user.model")


const transferFunds = async (req, res) => {
    const {accountNumber, amount, description} = req.body
    const {id} = req.user
    try {
        const receiver = await UserModel.findOne({accountNumber})

        if(!receiver){
            return res.status(404).send({
                message: ""
            })
        }
    } catch (error) {
        
    }
}