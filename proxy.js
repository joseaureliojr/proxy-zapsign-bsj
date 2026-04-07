// Proxy CORS para ZapSign API — BSJ Advocacia
// Deploy no Vercel (gratuito)

export default async function handler(req, res) {
    // CORS headers — permite chamadas do navegador
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Pega o path da query string: /api/proxy?path=/api/v1/docs/
    const path = req.query.path;
    if (!path) {
        return res.status(400).json({ error: 'Parâmetro "path" é obrigatório. Ex: /api/proxy?path=/api/v1/docs/' });
    }

    // Monta a URL do ZapSign
    const env = req.query.env === 'sandbox'
        ? 'https://sandbox.api.zapsign.com.br'
        : 'https://api.zapsign.com.br';
    const targetUrl = `${env}${path}`;

    try {
        // Repassa a requisição para o ZapSign
        const headers = {};
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        headers['Content-Type'] = 'application/json';

        const fetchOptions = {
            method: req.method,
            headers,
        };

        // Inclui body para POST/PUT
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({
            error: 'Erro no proxy',
            message: error.message,
            targetUrl
        });
    }
}
