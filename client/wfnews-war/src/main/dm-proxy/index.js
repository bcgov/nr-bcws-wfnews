const express = require('express');
const morgan = require("morgan");
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express Server
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
const DM_URL = "https://d1wfapi.vividsolutions.com"

// Logging
app.use(morgan('dev'));

var token
app.put('/auth/:token', ( req,res,next) => {
    token = req.params.token
    res.send( 'token set' )
} )

app.use('/doc-man', createProxyMiddleware({
    target: DM_URL,
    changeOrigin: true,
    pathRewrite: {
        [`^/doc-man`]: '/wfdm-document-management-api',
    },
    headers: {
        'Authorization': 'Bearer ' + token
    },
    logLevel: 'debug',
    onProxyReq: function ( proxyReq, req, res ) {
        proxyReq.setHeader( 'Authorization', 'Bearer ' + token )
    }
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
    console.log(`Starting Proxy at ${HOST}:${PORT}`);
});

