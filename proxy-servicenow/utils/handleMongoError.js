module.exports = (res, serviceNowData, error, operation) => {
    console.error(`MongoDB ${operation} error:`, error);
    const jsonBody = {
      error: `Operation partially failed - Success in ServiceNow but failed in MongoDB (${operation})`,
      serviceNowSuccess: serviceNowData,
      mongoError: error.message
    };
    return res?.status ? res.status(500).json(jsonBody): res.json(jsonBody);
  };