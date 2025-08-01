const express = require("express");
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const authjwt = require('./middleware/auth');
const connectDB = require('./utils/connectionMongodb');
const morgan = require('morgan'); // Optional: for request logging
const crypto = require('crypto');
const exec = require('child_process').exec;

//middleware
const checkRole = require('./middleware/checkRole');


// Route imports
const authRoutes = require('./api/auth/login');
const signupRoutes = require('./api/auth/signup');
const logoutRoutes = require('./api/auth/logout');
const ProductOfferingCatalog = require('./api/ProductOfferingCatalog/index')
const ProductOfferingCategory = require('./api/ProductOfferingCategory/index')
const ProductOffering = require('./api/ProductOffering/index')
const channel = require('./api/channel/index')
const ProductSpecification = require('./api/ProductSpecification/index');
const AiSearch = require('./api/ai-search/index')
const measurmentUnit = require('./api/unit-of-measurment/index')
const account = require('./api/account/index')
const contact = require('./api/contact/index')
const location = require('./api/location/index')
const opportunity = require("./api/opportunity/index");
const ProductOfferingPrice = require("./api/productOfferingPrice/index")
const opportunityLine = require("./api/OpportunityLine/index")
const priceList = require("./api/PriceList/index")
const nlpRoutes = require('./api/ai-search/nlp');
const chatbotCases = require('./api/ai-search/getCases');
const Quote = require('./api/quote/index');
const productsRouter = require('./controllers/ProductOffering/servicenowproducts');
const emailroutes = require('./email/router');
const contract = require('./api/contract');
const contractQuote = require('./api/contractQuote')
// const createAccount = require('./api/createAccount/index')
const knowledgeBaseRoute = require('./api/ai-search/chatboot');
const productOfferingRoute = require('./api/ai-search/productoffering');
const productSpecRoutes = require('./api/ProductSpecification/productSpecRoutes');
const clientRoutes = require('./api/client/index');
// Client
const authClient = require('./api/client/authClient');

const quoteClient = require('./api/client/Quote')

const order = require('./api/client/order/index');



require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to get raw body for GitHub webhook verification
app.use('/webhook', express.raw({ type: 'application/json' }));

// GitHub Webhook
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-hub-signature-256'];
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = Buffer.from('sha256=' + hmac.update(req.body).digest('hex'), 'utf8');
  const checksum = Buffer.from(sig, 'utf8');
  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return res.status(403).send('Forbidden');
  }
  try{
      exec('git pull origin main && npm install --production && pm2 restart app.js');
  }catch(error){
      console.error(error);
      res.status(400).send(error);
  }
  res.status(200).send('Deployment successful');
});

// Database connection
connectDB();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Limit each IP to 100 requests per window
});


// connection Kafka
// const producer = require('./utils/connectionKafka');
app.set('trust proxy', 1);

// Configuration

const allowedOrigins = [
    'https://omt-team-one.vercel.app',
    'https://omt-team-dhxpck1wp-jmili-mouads-projects.vercel.app',
    'https://delightful-sky-0cdf0611e.6.azurestaticapps.net',
    'http://localhost:5173',
    'https://api.github.com',
    'http://localhost:3000',
    'http://138.201.188.195',
    'http://138.201.188.195:3000',
    'https://superb-starburst-b1a498.netlify.app/'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));

app.use(limiter);
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '/client/dist')));  

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
    setHeaders: (res, path) => {
        res.set('X-Content-Type-Options', 'nosniff');
    }
}));

// Optional: Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logs requests in the 'dev' format
}
app.use('/', productsRouter);
app.use('/api/clients', clientRoutes);
// Routes
app.use('/api', [
    authRoutes, // Login
    signupRoutes, // Registration + confirmation
    emailroutes,
    // createAccount,
    contact,
    location,
    account,
    logoutRoutes,
    productOfferingRoute,
    knowledgeBaseRoute,
    ProductSpecification,
    productSpecRoutes,
    authClient,
    order


]);


// Protected routes
//admin
app.use('/api', authjwt, [
    // routes that need middaleware
    ProductOfferingCatalog,
    ProductOfferingCategory,
    ProductOffering,
    channel,
    ProductSpecification,
    AiSearch,
    measurmentUnit,
    priceList,
    opportunity,
    opportunityLine,
    ProductOfferingPrice,
    nlpRoutes,
    chatbotCases,
    contract,
    Quote,
    contractQuote
]);

//primaryContact
app.use('/api/client',checkRole('primarycontact'), [
 quoteClient,
]);







// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Handle React routing, return all requests to React app
app.get('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Graceful shutdown on SIGINT
process.on('SIGINT', async() => {
    console.log('\nGracefully shutting down...');
    // Perform DB cleanup or any other necessary shutdown tasks
    process.exit(0);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Optionally, add some custom cleanup here if necessary
});





app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Server running on http://localhost:${PORT}`);
    // Logging some environment settings for debugging purposes
    console.log('MongoDB URL:', process.env.MONGO_URI ? '[hidden]' : 'Not set');
    console.log('ServiceNow URL:', process.env.SERVICE_NOW_URL || 'Not set');
});
