require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express=require("express")

const ProductModel = require("../models/product.model")


const saveProduct=async(req, res)=>{
    const{productName, productPrice, productQuantity}=req.body
    const{id, role}= req.user
try {
    if(role!="admin" && role!="vendor"){
        res.status(403).send({
            message:"Forbidden resource"
        })
    }

    const prod = await ProductModel.create({...req.body, createdBy:req.user.id})

    res.status(201).send({
        message:"Product created successfully",
        data:prod
    })
} catch (error) {
    console.log(error);

    res.status(400).send({
        message:"Product creation failed",
    })
}
}


const getProducts=async(req, res)=>{
    try {
        const prod= await ProductModel.find().populate("createdBy")

        res.status(200).send({
           message:"Products fetched successfully",
           data:prod
        })
    } catch (error) {
        console.log(error);
    
    res.status(400).send({
        message:"Cannot fetch products at this time",
    })
    }
}

module.exports={
    saveProduct,
    getProducts
}