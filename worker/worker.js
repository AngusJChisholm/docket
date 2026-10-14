// Docket mailer: a Cloudflare Worker that emails the plan PDFs through Resend.
// Settings (Cloudflare dashboard > Worker > Settings > Variables and secrets):
//   RESEND_API_KEY  (secret)  your Resend API key
//   FROM_EMAIL      (text)    e.g.  Docket <plans@getdocket.com.au>   (must be on your verified Resend domain)
//   ALLOWED_ORIGIN  (text)    the site address(es), comma separated, e.g. https://angusjchisholm.github.io
//   SITE_URL        (text)    e.g. https://angusjchisholm.github.io/docket/plan.html

const MAX_FILES = 12;
const MAX_BASE64 = 6_000_000; // about 4.5MB of PDFs in total
const recent = new Map();      // light per-IP limit: 5 sends per 10 minutes per instance

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': okOrigin ? origin : (allowed[0] || ''),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { error: 'Use POST' });
    if (!okOrigin) return reply(403, { error: 'Not allowed from this site' });

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const hits = (recent.get(ip) || []).filter(t => now - t < 600_000);
    if (hits.length >= 5) return reply(429, { error: 'Too many sends, try again in a few minutes' });
    if (env.LIMITER) { const { success } = await env.LIMITER.limit({ key: ip }); if (!success) return reply(429, { error: 'Too many sends, try again shortly' }); }

    let b;
    try { b = await request.json(); } catch { return reply(400, { error: 'Bad request' }); }

    const to = String(b.to || '').trim();
    if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(to) || to.length > 200) return reply(400, { error: 'Check the email address' });
    const files = Array.isArray(b.attachments) ? b.attachments : [];
    if (!files.length || files.length > MAX_FILES) return reply(400, { error: 'No PDFs to send' });
    let size = 0;
    for (const f of files) {
      if (!/^[\w.-]{1,80}\.pdf$/.test(f.filename || '')) return reply(400, { error: 'Bad file name' });
      if (typeof f.content !== 'string' || !f.content.startsWith('JVBER')) return reply(400, { error: 'Files must be PDFs' });
      size += f.content.length;
    }
    if (size > MAX_BASE64) return reply(413, { error: 'PDFs too large' });

    const dinners = (Array.isArray(b.dinners) ? b.dinners : []).slice(0, 8).map(d => String(d).slice(0, 80));
    const num = v => Number.isFinite(+v) ? +v : 0;
    const money = (v, d = 2) => '$' + num(v).toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const store = esc(String(b.store || '').slice(0, 20));
    const kit = esc(String(b.kit || 'HelloFresh').slice(0, 30));
    const serves = Math.round(num(b.serves));
    const saved = num(b.saved);
    const site = env.SITE_URL || 'https://angusjchisholm.github.io/docket/plan.html';

    const html = `<!doctype html><html><body style="margin:0;background:#F4F7F2;font-family:Helvetica,Arial,sans-serif;color:#1C211E">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden">
<tr><td style="background:#CFEBD8;padding:24px 28px"><div style="font-size:30px;font-weight:900;color:#1F6B47;letter-spacing:-0.5px">Docket</div>
<div style="font-size:15px;font-weight:600;margin-top:4px">Your week is sorted.</div></td></tr>
<tr><td style="padding:24px 28px">
<p style="margin:0 0 14px;font-size:15px;line-height:1.5">Your shopping list and recipes are attached as PDFs. Here's the week at a glance:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6">
${dinners.map((d, i) => `<tr><td style="padding:6px 0;border-bottom:1px dashed #DCE3DC"><b style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#FFE58A;border-radius:11px;font-size:12px;margin-right:8px">${i + 1}</b>${esc(d)}</td></tr>`).join('')}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px"><tr>
<td style="background:#FFE58A;border-radius:12px;padding:12px 14px;font-weight:900;font-size:22px">${money(b.total, 0)}<div style="font-size:11px;font-weight:700;letter-spacing:1px">ESTIMATED SHOP${store ? ' · ' + store.toUpperCase() : ''}${serves ? ' · ' + serves + ' SERVES' : ''}</div></td>
</tr></table>
${saved > 0 ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px"><tr><td style="background:#CFEBD8;border-radius:12px;padding:12px 14px;color:#1F6B47;font-weight:700;font-size:15px">Kit Tax dodged: ${money(saved)} vs ${kit}. That's ${money(saved * 52, 0)} a year.</td></tr></table>` : ''}
<p style="margin:20px 0 0;font-size:14px"><a href="${esc(site)}" style="color:#1F6B47;font-weight:700">Plan next week on Docket</a></p>
</td></tr>
<tr><td style="padding:16px 28px 24px;font-size:12px;color:#59625C;border-top:1px solid #DCE3DC">Docket · Meal kit dinners. Supermarket prices.<br>You got this email because this address was entered on Docket. Prices are estimates; check them at the shelf.</td></tr>
</table></td></tr></table></body></html>`;

    const text = `Your Docket for the week\n\n${dinners.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nEstimated shop: ${money(b.total, 0)}${saved > 0 ? `\nKit Tax dodged: ${money(saved)} vs ${b.kit || 'HelloFresh'}` : ''}\n\nYour shopping list and recipes are attached as PDFs.\nPlan next week: ${site}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [to], subject: 'Your Docket for the week', html, text, attachments: files.map(f => ({ filename: f.filename, content: f.content })) })
    });
    if (!res.ok) { const t = await res.text(); console.log('Resend error', res.status, t); return reply(502, { error: 'Email service error' }); }
    hits.push(now); recent.set(ip, hits);
    return reply(200, { ok: true });
  }
};
