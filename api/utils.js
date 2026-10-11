function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function parseRequestBody(reqBody) {
    if (!reqBody) return null;
    let data = reqBody;

    if (reqBody.data && typeof reqBody.data === 'string') {
        try {
            const decoded = Buffer.from(reqBody.data, 'base64').toString('utf-8');
            data = JSON.parse(decoded);
        } catch (e) {
            console.error('Base64 decode failed:', e.message);
        }
    } else if (typeof reqBody === 'string') {
        try {
            data = JSON.parse(reqBody);
        } catch (e) {
            return null;
        }
    }

    if (typeof data !== 'object' || data === null) return null;
    return data;
}

async function getIPInfo(ip) {
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`, {
            headers: { 'User-Agent': 'vercel-serverless' }
        });
        const resultData = await res.json();
        if (resultData && !resultData.error) {
            const cityCode = resultData.city ? resultData.city.charAt(0).toUpperCase() : '';
            return `${resultData.city}(${cityCode}) | ${resultData.country_name}(${resultData.country_code})`;
        }
    } catch (e) {
        console.error('[IP_LOOKUP] Failed:', e.message);
    }
    return 'Unknown';
}

module.exports = {
    escapeHtml,
    parseRequestBody,
    getIPInfo
};