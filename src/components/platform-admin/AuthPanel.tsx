import React from 'react';

export default function AuthPanel() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [session, setSession] = React.useState<any>(null);

  const register = async () => {
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: 'Platform Admin' }) });
      const j = await res.json();
      if (j.success) {
        setSession(j.sessionId);
        localStorage.setItem('sessionId', j.sessionId);
        window.location.reload();
      } else alert(JSON.stringify(j));
    } catch (e) { alert('register error'); }
  };

  const login = async () => {
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await res.json();
      if (j.success) {
        setSession(j.sessionId);
        localStorage.setItem('sessionId', j.sessionId);
        window.location.reload();
      } else alert(JSON.stringify(j));
    } catch (e) { alert('login error'); }
  };

  const logout = async () => {
    try {
      const sid = localStorage.getItem('sessionId');
      await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid }) });
      localStorage.removeItem('sessionId');
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => {
    const sid = localStorage.getItem('sessionId');
    if (sid) setSession(sid);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <input placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded px-3 py-2 bg-neutral-900 text-sm" />
      <input placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="rounded px-3 py-2 bg-neutral-900 text-sm" />
      {!session && (
        <>
          <button onClick={login} className="rounded bg-cyan-500 px-3 py-2 text-black font-semibold">登录</button>
          <button onClick={register} className="rounded bg-emerald-500 px-3 py-2 text-black font-semibold">注册(Admin)</button>
        </>
      )}
      {session && (
        <>
          <div className="text-sm text-neutral-300">已登录</div>
          <button onClick={logout} className="rounded bg-rose-500 px-3 py-2 text-black">登出</button>
        </>
      )}
    </div>
  );
}
