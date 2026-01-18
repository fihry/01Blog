const PROXY_CONFIG = {
    "/api": {
        "target": `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || '8000'}`,
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
    },
    "/media": {
        "target": `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || '8000'}`,
        "secure": false,
        "changeOrigin": true,
        "pathRewrite": {
            "^/media": "/api/media"
        },
        "logLevel": "debug"
    }
};

export default PROXY_CONFIG;
