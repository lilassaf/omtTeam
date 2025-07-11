const axios = require('axios');
const Opportunity = require('../../models/opportunity');
const PriceList = require('../../models/priceList'); 
const snConnection = require('../../utils/servicenowConnection');
const handleMongoError = require('../../utils/handleMongoError');
const Account = require('../../models/account');
const SCT = require('../../models/salesCycleType');
const Stage = require('../../models/stage');
const mongoose = require('mongoose');

async function createOpportunity(req, res=null) {
  try {

    if (req.body.estimated_closed_date) {
      const startDate = new Date(req.body.estimated_closed_date);
      const currentDate = new Date();
      
      if (isNaN(startDate.getTime())) {
        return res?.status(400).json({ error: 'Invalid start date format' });
      }
      
      if (startDate < currentDate) {
        return res?.status(400).json({ error: 'Start date cannot be in the future' });
      }
    }
    const { account, price_list, stage, sales_cycle_type, ...opportunityData } = req.body;
    
    // Step 1: Get sys_ids from MongoDB documents using their _id (if provided)
    let accountSysId = null;
    let priceListSysId = null;
    let accountDoc = null;
    let priceListDoc = null;
    let stageDoc = null;
    let SCTDoc = null;
    let stageSysId = null;
    let SCTSysId = null;
    
    // Get Account sys_id if account is provided
    if (account) {
      accountDoc = await Account.findById(account);
      if (!accountDoc) {
        return res.status(404).json({ error: `Account not found with id: ${account}` });
      }
      accountSysId = accountDoc.sys_id;
    }
    console.log(accountSysId);
    
    // Get PriceList sys_id if price_list is provided
    if (price_list) {
      priceListDoc = await PriceList.findById(price_list);
      if (!priceListDoc) {
        return res.status(404).json({ error: `PriceList not found with id: ${price_list}` });
      }
      priceListSysId = priceListDoc.sys_id;
    }
    console.log(priceListSysId)


    // Get stage sys_id if stage is provided 
    if(stage){
      stageDoc = await Stage.findById(stage);
      if (!stageDoc) {
        return res.status(404).json({ error: `stage not found with id: ${stage}` });
      }
      stageSysId = stageDoc.sys_id;
    }

    // Get Sales Cycle Type sys_id if sales_cycle_type is provided 
    if(sales_cycle_type){
      SCTDoc = await SCT.findById(sales_cycle_type);
      if (!SCTDoc) {
        return res.status(404).json({ error: `sales cycle not found with id: ${SCT}` });
      }
      SCTSysId = SCTDoc.sys_id;
    }
    

    const newId = new mongoose.Types.ObjectId();

    // Step 2: Prepare ServiceNow payload with sys_ids
    const serviceNowPayload = {
      ...opportunityData,
      external_id: newId,
      account: accountSysId,
      price_list: priceListSysId,
      stage: stageSysId,
      sales_cycle_type: SCTSysId
    };
    
    console.log('Creating opportunity in ServiceNow with payload:', serviceNowPayload);
    
    // Step 3: Create in ServiceNow
    const connection = snConnection.getConnection(req.session.snAccessToken);
    const snResponse = await axios.post(
      `${connection.baseURL}/api/now/table/sn_opty_mgmt_core_opportunity`,
      serviceNowPayload,
      { headers: connection.headers }
    );
    
    console.log('Opportunity created in ServiceNow:', snResponse.data.result.sys_id);
    
    // Step 4: Prepare MongoDB document with ObjectId references
    const mongoPayload = {
      _id: newId,
      ...snResponse.data.result,
      sys_id: snResponse.data.result.sys_id,
      number: snResponse.data.result.number,
      // Override with MongoDB ObjectId references
      ...(accountDoc && { account: accountDoc._id }),
      ...(priceListDoc && { price_list: priceListDoc._id }),
      ...(stageDoc && { stage: stageDoc._id }),
      ...(SCTDoc && { sales_cycle_type: SCTDoc._id })
    };
    
    // Step 5: update in MongoDB
    try {
      
      const opportunity = new Opportunity(mongoPayload);
      const savedOpportunity = await opportunity.save();

      // Populate the document for response
      const populatedOpportunity = await Opportunity.findById(savedOpportunity._id)
        .populate('account', 'name email country city industry')
        .populate('price_list', 'name')
        .populate('sales_cycle_type')
        .populate('stage');
      
      
      if(res){
        res.status(201).json({
        message: 'Opportunity created successfully in both ServiceNow and MongoDB',
        servicenow: snResponse.data.result,
        mongodb: populatedOpportunity,
        source: 'both'
      });
      }
      return populatedOpportunity;
    } catch (mongoError) {
      console.error('MongoDB creation failed:', mongoError);
      return handleMongoError(res, snResponse.data.result, mongoError, 'creation');
    }
    
    
  } catch (error) {
    console.error('Error creating opportunity:', error);
    if(res){
      // Handle MongoDB errors
    if (error.name && error.name.includes('Mongo')) {
      const mongoError = handleMongoError(error);
      return res.status(mongoError.status).json({ error: mongoError.message });
    }
    
    // Handle ServiceNow errors
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    res.status(status).json({ error: message });
    }
  }
}
// Original Express route handler for backward compatibility
module.exports = async (req, res) => {
  return createOpportunity(req, res);
};

module.exports.createOpportunity = createOpportunity;