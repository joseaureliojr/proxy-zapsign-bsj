// Proxy CORS para ZapSign API - BSJ Advocacia
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.query.path;
    if (!path) {
        return res.status(400).json({ error: 'Parametro path obrigatorio' });
    }

    const env = req.query.env === 'sandbox'
        ? 'https://sandbox.api.zapsign.com.br'
        : 'https://api.zapsign.com.br';
    const targetUrl = env + path;

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const options = { method: req.method, headers: headers };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            options.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, options);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
