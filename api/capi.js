const https = require('https');

const PIXEL_ID = process.env.META_PIXEL_ID || '807177452002489';
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN || 'EAAK4bV8X9M0BSrSObNuyvTvvZBIt8zGH4S67FWD4Nqpg5CAgH1hFPKpNZBZAZAA4ZCVw9YF0MlCvM8aj95LApXxTIotbsMHLLLoNXZCc9XBPY7BA9R9qNy883ELz0CQuAS7RkcHKxOUfqe70WQFOCwRZBbaoqzZAXt2SDbXF9rRdEuwYjDcgmptOE7nZBGfvpRUzCsAZDZD';

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    if (res.status) {
      return res.status(200).end();
    } else {
      res.writeHead(200);
      return res.end();
    }
  }

  if (req.method !== 'POST') {
    const errorMsg = JSON.stringify({ error: 'Method Not Allowed' });
    if (res.status) {
      return res.status(405).send(errorMsg);
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(errorMsg);
    }
  }

  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      try {
        body = body ? JSON.parse(body) : {};
      } catch (e) {
        body = {};
      }
    }

    // Determinar IP del cliente (priorizando encabezados proxy de Vercel/Cloudflare)
    const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    let clientIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '');
    
    // Si la IP es localhost o IPv6 loopback, usar IP de contingencia para evitar rechazo de Meta en local
    if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('::ffff:127.0.0.1')) {
      clientIp = '190.236.1.1'; // IP pública residencial peruana de muestra
    }

    const clientUserAgent = req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

    const eventName = body.event_name || 'PageView';
    const eventId = body.event_id || ('posturafit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
    const eventSourceUrl = body.event_source_url || req.headers['referer'] || 'https://tienda-peru.vercel.app/';

    // Construir user_data combinando datos del cliente con los del navegador
    const userData = Object.assign({
      client_ip_address: clientIp,
      client_user_agent: clientUserAgent
    }, body.user_data || {});

    // Estructura oficial de Meta Conversions API
    const metaPayload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: 'website',
          user_data: userData,
          custom_data: body.custom_data || {}
        }
      ]
    };

    if (body.test_event_code) {
      metaPayload.test_event_code = body.test_event_code;
    }

    const payloadString = JSON.stringify(metaPayload);

    const metaResponse = await new Promise((resolve, reject) => {
      const fbReq = https.request({
        hostname: 'graph.facebook.com',
        path: `/v19.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadString)
        }
      }, (fbRes) => {
        let rawData = '';
        fbRes.on('data', chunk => rawData += chunk);
        fbRes.on('end', () => {
          resolve({ statusCode: fbRes.statusCode, data: rawData });
        });
      });

      fbReq.on('error', reject);
      fbReq.write(payloadString);
      fbReq.end();
    });

    const responseJson = {
      success: metaResponse.statusCode === 200,
      statusCode: metaResponse.statusCode,
      event_name: eventName,
      event_id: eventId,
      meta_response: JSON.parse(metaResponse.data || '{}')
    };

    const responseString = JSON.stringify(responseJson);

    if (res.status) {
      res.status(metaResponse.statusCode || 200).json(responseJson);
    } else {
      res.writeHead(metaResponse.statusCode || 200, { 'Content-Type': 'application/json' });
      res.end(responseString);
    }

  } catch (error) {
    console.error('[CAPI Error]:', error);
    const errJson = JSON.stringify({ error: error.message || 'Internal Server Error' });
    if (res.status) {
      res.status(500).json({ error: error.message });
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(errJson);
    }
  }
};
