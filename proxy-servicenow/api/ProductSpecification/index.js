// api/ProductSpecification/index.js
const express = require('express');
const router = express.Router();

// Import controllers
const getAllProductSpecifications = require('../../controllers/ProductSpecification/getAllProductSpecifications');
const getProductSpecificationById = require('../../controllers/ProductSpecification/getProductSpecificationById');
const syncFromServiceNow = require('../../controllers/ProductSpecification/syncFromServiceNow');
const updateProductSpecification = require('../../controllers/ProductSpecification/updateProductSpecification');
const deleteProductSpecification = require('../../controllers/ProductSpecification/deleteProductSpecification');

// Route for receiving product specifications from ServiceNow
router.post('/product-specification/send-specification', syncFromServiceNow);

// Route to get all product specifications
router.get('/product-specification', getAllProductSpecifications);

// Route to get product specification by _id
router.get('/product-specification/:id', getProductSpecificationById);

// Route pour mettre à jour une spécification de produit
router.patch('/product-specification/:sysId', updateProductSpecification);

// Route pour supprimer une spécification de produit
router.delete('/product-specification/:id', deleteProductSpecification);

module.exports = router;