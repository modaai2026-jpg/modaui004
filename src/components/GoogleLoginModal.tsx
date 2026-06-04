import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ShieldCheck, Chrome, KeyRound, Fingerprint, Github, MessageCircle, Smartphone, CheckCircle } from 'lucide-react';
import { auth, db, doc, collection, addDoc } from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { Button, Input, Modal } from '../lib/ui';
import { apiService } from '../services/api';

interface GoogleLoginModalProps {
  userEmail?: string;
  onSuccess: (email: string) => void;
  onCancel: () => void;
}

export default function GoogleLoginModal({ userEmail = 'guest@gmail.com', onSuccess, onCancel }: GoogleLoginModalProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'email'>('social');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password' | 'verify_email' | 'reset_password'>('signin');
  const [typedEmail, setTypedEmail] = useState(userEmail === 'guest@gmail.com' || userEmail === 'founder@gmail.com' ? '' : userEmail);
  const [password, setPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Helper for logging successful login
  const logLogin = async (user: any, method: string) => {
    try {
      await addDoc(collection(db, 'login_logs'), {
        uid: user.uid,
        email: user.email,
        method,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: 'portal'
      });
    } catch (e) {
      console.warn("Login logging failed:", e);
    }
  };

  // 1. Social Logins
  const handleSocialSignIn = async (providerType: 'google' | 'github' | 'wechat' | 'tiko') => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (providerType === 'google') {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          await logLogin(result.user, 'google');
          const payload = await apiService.auth.socialLogin(result.user.email || '', 'google', result.user.displayName || '', result.user.photoURL || '');
          if (payload.sessionId) {
            localStorage.setItem('sessionId', payload.sessionId);
            setSessionId(payload.sessionId);
          }
          onSuccess(result.user.email || '');
        }
      } else {
        window.location.href = `/api/auth/${providerType}/redirect`;
      }
    } catch (error: any) {
      setErrorMsg(error?.message || "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email/Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugToken(null);

    try {
      if (authMode === 'signin') {
        if (!typedEmail || !password) {
          setErrorMsg('请输入邮箱与密码');
          return;
        }
        setIsLoading(true);
        const payload = await apiService.auth.login(typedEmail, password);
        if (payload.sessionId) {
          localStorage.setItem('sessionId', payload.sessionId);
          setSessionId(payload.sessionId);
        }
        setSuccessMsg('登录成功，正在跳转...');
        onSuccess(typedEmail);
      } else if (authMode === 'signup') {
        if (!typedEmail || !password) {
          setErrorMsg('请提供邮箱与密码以完成注册');
          return;
        }
        setIsLoading(true);
        const payload = await apiService.auth.register(
          typedEmail,
          password,
          localStorage.getItem('preview_industry_id') || 'fashion',
          'standard',
          'free',
          'Merchant Owner'
        );
        setSuccessMsg('注册成功，请使用邮箱验证码验证账号。');
        if (payload.debugVerificationToken) {
          setDebugToken(payload.debugVerificationToken);
          setSuccessMsg('注册完成。开发环境令牌已生成。');
        }
        setAuthMode('verify_email');
      } else if (authMode === 'forgot_password') {
        if (!typedEmail) {
          setErrorMsg('请输入用于重置密码的邮箱地址');
          return;
        }
        setIsLoading(true);
        const payload = await apiService.auth.requestPasswordReset(typedEmail);
        setSuccessMsg('密码重置指令已发布，请检查邮箱。');
        if ((payload as any).debugResetToken) {
          setDebugToken((payload as any).debugResetToken);
        }
        setAuthMode('reset_password');
      } else if (authMode === 'verify_email') {
        if (!verificationToken) {
          setErrorMsg('请输入邮箱验证码');
          return;
        }
        setIsLoading(true);
        await apiService.auth.verifyEmail(verificationToken);
        setSuccessMsg('邮箱已验证。您现在可以登录。');
        setAuthMode('signin');
      } else if (authMode === 'reset_password') {
        if (!resetToken || !password) {
          setErrorMsg('请输入重置令牌和新密码');
          return;
        }
        setIsLoading(true);
        await apiService.auth.confirmPasswordReset(resetToken, password);
        setSuccessMsg('密码已重置，您现在可以登录。');
        setAuthMode('signin');
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let msg = error?.message || '认证失败，请重试';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} className="bg-[#09090B] border-[#2F3336] p-0 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 bg-black border-b border-[#2F3336]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D9BF0] to-[#00BA7C] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'signin' ? 'MODAUI 企业账号认证' : authMode === 'signup' ? '开启您的 AI 公司' : authMode === 'forgot_password' ? '重置通行密钥' : authMode === 'verify_email' ? '验证邮箱' : '确认密码重置'}
              </h3>
              <p className="text-xs text-[#8B949E]">
                {authMode === 'signin' ? '高能主权智能体接入中' : authMode === 'signup' ? '立即孵化您的数字团队' : authMode === 'forgot_password' ? '通过验证邮箱找回权限' : authMode === 'verify_email' ? '请输入邮箱验证码完成账号激活' : '请输入重置令牌并设置新密码'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Only for signin/signup) */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="flex border-b border-[#2F3336] bg-black/40">
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'social' ? 'text-[#1D9BF0] border-[#1D9BF0] bg-white/[0.02]' : 'text-[#8B949E] border-transparent hover:text-white'
              }`}
            >
              社交账号联接
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'email' ? 'text-[#1D9BF0] border-[#1D9BF0] bg-white/[0.02]' : 'text-[#8B949E] border-transparent hover:text-white'
              }`}
            >
              企业邮箱通道
            </button>
          </div>
        )}

        <div className="p-8 space-y-6">
          {activeTab === 'social' && (authMode === 'signin' || authMode === 'signup') ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-[#8B949E]">授权并联接您的社交账号，以此在加密的 AI 运营矩阵中保留您的所有者状态。</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialSignIn('google')}
                  variant="outline"
                  disabled={isLoading}
                  className="bg-black border-[#2F3336] hover:bg-neutral-900 h-14"
                >
                  <Chrome className="w-5 h-5 mr-2 text-[#4285F4]" />
                  Google
                </Button>
                <Button
                  onClick={() => handleSocialSignIn('github')}
                  variant="outline"
                  disabled={isLoading}
                  className="bg-black border-[#2F3336] hover:bg-neutral-900 h-14"
                >
                  <Github className="w-5 h-5 mr-2 text-white" />
                  GitHub
                </Button>
                <Button
                  onClick={() => handleSocialSignIn('wechat')}
                  variant="outline"
                  disabled={isLoading}
                  className="bg-black border-[#2F3336] hover:bg-neutral-900 h-14"
                >
                  <MessageCircle className="w-5 h-5 mr-2 text-[#07C160]" />
                  微信
                </Button>
                <Button
                  onClick={() => handleSocialSignIn('tiko')}
                  variant="outline"
                  disabled={isLoading}
                  className="bg-black border-[#2F3336] hover:bg-neutral-900 h-14"
                >
                  <Smartphone className="w-5 h-5 mr-2 text-[#FF3B30]" />
                  Tiko
                </Button>
              </div>

              <div className="text-center pt-4">
                <button 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-[#1D9BF0] hover:underline font-bold"
                >
                  {authMode === 'signin' ? '没有账号？立即注册' : '已有账号？返回登录'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <Input
                label="企业邮箱"
                placeholder="name@company.com"
                value={typedEmail}
                onChange={(e) => setTypedEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
                className="bg-black border-[#2F3336]"
              />
              {(authMode === 'signin' || authMode === 'signup' || authMode === 'reset_password') && (
                <Input
                  label="通行密码"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<KeyRound className="w-4 h-4" />}
                  required={true}
                  className="bg-black border-[#2F3336]"
                />
              )}

              {(authMode === 'verify_email' || authMode === 'reset_password') && (
                <Input
                  label={authMode === 'verify_email' ? '邮箱验证码' : '密码重置令牌'}
                  placeholder={authMode === 'verify_email' ? '输入验证码' : '输入重置令牌'}
                  value={authMode === 'verify_email' ? verificationToken : resetToken}
                  onChange={(e) => authMode === 'verify_email' ? setVerificationToken(e.target.value) : setResetToken(e.target.value)}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  required
                  className="bg-black border-[#2F3336]"
                />
              )}

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-neutral-200 font-bold h-12 mt-4"
              >
                {isLoading ? '处理中...' : authMode === 'signin' ? '认证登录' : authMode === 'signup' ? '立即注册' : authMode === 'forgot_password' ? '发送重置邮件' : authMode === 'verify_email' ? '验证邮箱' : '确认重置'}
              </Button>

              <div className="flex justify-between items-center px-1">
                <button 
                  type="button"
                  onClick={() => {
                    if (authMode === 'forgot_password' || authMode === 'reset_password' || authMode === 'verify_email') {
                      setAuthMode('signin');
                    } else {
                      setAuthMode('forgot_password');
                    }
                    setActiveTab('email');
                  }}
                  className="text-[10px] text-[#8B949E] hover:text-white transition-colors"
                >
                  {authMode === 'forgot_password' ? '返回登录' : authMode === 'reset_password' || authMode === 'verify_email' ? '回到登录' : '忘记密码？'}
                </button>
                {authMode === 'signin' && (
                  <button 
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-[10px] text-[#1D9BF0] hover:underline font-bold"
                  >
                    注册新公司
                  </button>
                )}
                {authMode === 'signup' && (
                  <button 
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-[10px] text-[#1D9BF0] hover:underline font-bold"
                  >
                    已有公司？登录
                  </button>
                )}
              </div>
            </form>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2 animate-shake">
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-400 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col items-start space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-400 leading-relaxed">{successMsg}</p>
              </div>
              {debugToken && (
                <div className="w-full rounded-lg bg-black/80 border border-emerald-500/20 p-3 text-[10px] text-emerald-200 font-mono break-words">
                  Debug 令牌: <span className="font-semibold text-white">{debugToken}</span>
                </div>
              )}
            </div>
          )}
          <div className="text-center pt-4 border-t border-[#2F3336]">
            <p className="text-[10px] text-[#8B949E] leading-relaxed italic">
              MODAUI 使用 Firebase JWT 加密认证架构。您的创始人秘钥将以高规格物理散列方式托管。
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
