// Recipe methods: loaded one at a time, only for people allowed to see them.
// Today they come from content/recipes/<id>.json. When Docket Pro launches, set recipeEndpoint in js/config.js
// to the Worker that checks the member's login before handing over the method.
window.DocketRecipes = (function () {
  const CFG = window.DOCKET_CONFIG || {};
  const cache = {}, pending = {};
  const url = id => (CFG.recipeEndpoint ? CFG.recipeEndpoint.replace(/\/?$/, '/') : 'content/recipes/') + encodeURIComponent(id) + '.json';

  function get(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (!pending[id]) pending[id] = fetch(url(id), { cache: 'no-cache', credentials: CFG.recipeEndpoint ? 'include' : 'same-origin' })
      .then(r => { if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? 'locked' : 'not found'); return r.json(); })
      .then(j => (cache[id] = j))
      .finally(() => { delete pending[id]; });
    return pending[id];
  }
  const load = ids => Promise.all(ids.map(id => get(id).catch(() => null)));
  const peek = id => cache[id] || null;

  // Who can see what. 'open' = everything; 'email' = this week's picks free, the rest free with an email (beta);
  // 'pro' = this week's picks free, the rest for members (later).
  const mode = () => CFG.recipeAccess || 'email';
  const read = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const member = () => read('docket-member');
  const unlocked = () => mode() === 'open' || (mode() === 'email' && !!member());
  function canSee(id, picks) { return unlocked() || (picks || []).includes(id); }

  async function unlock(email, source) {
    try { localStorage.setItem('docket-member', email); } catch (e) {}
    if (CFG.waitlistEndpoint) {
      try { await fetch(CFG.waitlistEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: source || 'recipe-unlock' }) }); } catch (e) {}
    }
  }
  return { get, load, peek, canSee, unlocked, unlock, member, mode };
})();
