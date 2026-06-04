import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Fingerprint, ArrowRight, Terminal, Globe, Cpu } from 'lucide-react';
import { auth, db, doc, getDoc, collection, addDoc } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { Button, Input } from '../lib/ui';

interface AdminGateProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export default function AdminGate({ onSuccess, onBack }: AdminGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Real Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verify Admin Role in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data() as { role?: string } | undefined;

      if (userSnap.exists() && userData?.role === 'admin') {
        // 3. Log Login Activity
        await addDoc(collection(db, 'login_logs'), {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          platform: 'adminx'
        });

        sessionStorage.setItem('modaui_admin_token', 'active_session');
        onSuccess(email);
      } else {
        // Not an admin, sign out immediately
        await signOut(auth);
        setError('鉴权失败：您没有管理员访问权限。');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      let msg = '鉴权失败，请检查凭据。';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = '无效的管理员邮箱或访问密钥。';
      } else if (err.code === 'auth/too-many-requests') {
        msg = '请求过多，请稍后再试。';
      }
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,155,240,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 border-b border-zinc-800 bg-zinc-950/50 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShieldCheck className="w-8 h-8 text-blue-500 relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">
                MODAUI <span className="text-blue-500">ADMINX</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">
                PAY.MODAUI.COM • 安全入口
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="管理员邮箱 / ADMIN EMAIL"
                type="email"
                placeholder="admin@modaui.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Fingerprint className="w-4 h-4" />}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-700"
              />
              <Input
                label="访问密钥 / ACCESS KEY"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-700"
              />
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                >
                  <p className="text-[10px] text-rose-400 font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl transition shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>执行安全鉴权</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-mono text-zinc-600 bg-black px-4">
                System Status
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-center">
                <Terminal className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                <span className="text-[8px] font-mono text-zinc-500 uppercase">Engine OK</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-center">
                <Globe className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
                <span className="text-[8px] font-mono text-zinc-500 uppercase">CDN Live</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                <Cpu className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
                <span className="text-[8px] font-mono text-zinc-500 uppercase">SLA 99.9%</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
            <button 
              onClick={onBack}
              className="text-[10px] text-zinc-500 hover:text-white transition-colors font-mono"
            >
              ← 返回公共门户 / BACK TO PORTAL
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-zinc-600 font-mono">
          UNAUTHORIZED ACCESS IS PROHIBITED • SESSION LOGGED
        </p>
      </motion.div>
    </div>
  );
}
