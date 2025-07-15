const Quote = require('../../models/quote');
const quoteLine = require('../../models/quoteLine');
const mongoose = require('mongoose');
const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const request_url = `${process.env.SERVICE_NOW_URL}/api/sn_customerservice/case`;
    const quote_id = req.params.id;
    const qIdObj = new mongoose.Types.ObjectId(quote_id);
    const quote = await Quote.findById(quote_id).populate("account", "sys_id name");
    const qLine = await quoteLine.findOne({quote: qIdObj}).populate("product_offering","sys_id name productSpecification prodSpecCharValueUse");

    const payload = {
    "pont": "false",
    "orderCurrency": quote.currency, //quoteline.priceList.currency
    "priority": 2,
    "orderDate": new Date().toISOString().split('T')[0], //currentDate
    "channel": [
        {
        "id": "e561aae4c3e710105252716b7d40dd8f",
        "name": "Web"
        }
    ],
    "productOrderItem": [
        {
        "id": qIdObj.toString(),//external_id for the orderlineItem
        "ponr": "false",
        "quantity": 1, //quoteline.quantity
        "priority": 2,
        "action": "add",
        "itemPrice": [
            {
            "priceType": "recurring",
            "recurringChargePeriod": "month",
            "price": {
                "taxIncludedAmount": {
                "unit": quote.currency,//quoteline.priceList.currency
                "value": qLine.unit_price //quoteline.unit_price
                }
            }
            },
            {
            "priceType": "nonRecurring",
            "price": {
                "taxIncludedAmount": {
                "unit": quote.currency,//quoteline.priceList.currency
                "value": "0"
                }
            }
            }
        ],
        "product": {
            "@type": "Product",
            "productCharacteristic": qLine?.product_offering?.prodSpecCharValueUse.map(car=>{
              return {
                "name": car.name,
                "valueType": car.valueType,
                "value": car.productSpecCharacteristicValue[0].value,
                "previousValue": ""
              }
            }),
            "productSpecification": {
            "id": qLine.product_offering?.productSpecification
            }
        },
        "productOffering": {
            "id": qLine.product_offering?.sys_id
        },
        "state": "draft",
        "version": "1",
        "@type": "ProductOrderItem"
        }
    ],
    "relatedParty": [
        {
        "id": quote.account?.sys_id,
        "name": quote.account?.name,
        "@type": "RelatedParty",
        "@referredType": "Customer"
        }
    ],
    "state": "draft",
    "version": "1",
    "@type": "ProductOrder"
    };

    const snResponse = await axios.post(
          request_url,
          {
            priority: 2,
            short_description:`Case from API quote ${quote.number}`,
            description: JSON.stringify(payload,null,2),
            state:"10",
            x_1598581_omt_dx_0_order_related:"true"
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.snAccessToken}`,
              'Content-Type': 'application/json',
            }
          }
        );


    return res.status(201).json(snResponse.data.result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
