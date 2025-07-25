const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const ProductOfferingCategory = require('../../models/ProductOfferingCategory');
const handleMongoError = require('../../utils/handleMongoError');
const deleteCatalogCategoryRelationship = require('../CatalogCategroyRelationship/delete');


const router = express.Router();
require('dotenv').config();



// DELETE
router.delete('/product-offering-category/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing category
    const existingCategory = await ProductOfferingCategory.findById( id );
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

            try {
                await deleteCatalogCategoryRelationship(
                    null,
                    existingCategory,
                    req.session.snAccessToken
                );
            } catch (error) {
                return res.status(500).json({
                    error: 'Failed to delete catalog-category relationship',
                    details: error.message
                });
            }
 

    // ServiceNow Delete
    const snResponse = await axios.delete(
      `${process.env.SERVICE_NOW_URL}/api/now/table/sn_prd_pm_product_offering_category/${existingCategory.sys_id}`,
      {
        headers: { 'Authorization': `Bearer ${req.session.snAccessToken}` }
      }
    );

    // MongoDB Delete
    try {
      await ProductOfferingCategory.findByIdAndDelete(id);
    } catch (mongoError) {
      return handleMongoError(res, snResponse.data, mongoError, 'deletion');
    }



    res.status(204).end();

  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      return res.status(status).json({
        error: status === 404 ? 'Not found' : 'ServiceNow delete failed',
        details: error.response?.data || error.message
      });
    }
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;