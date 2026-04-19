import { useState, useCallback, useRef } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // OTP states
  const [otpMode, setOtpMode] = useState(false);         // signin OTP login mode
  const [otp, setOtp] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);  // signup: OTP has been sent, waiting for verification
  const [signupOtp, setSignupOtp] = useState('');              // signup: the OTP code entered
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);           // countdown for resend

  // Email check for signup
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    if (score <= 1) return { label: 'Weak', color: '#c0392b', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: '#f39c12', width: '40%' };
    if (score <= 3) return { label: 'Good', color: '#3498db', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: '#27ae60', width: '80%' };
    return { label: 'Very Strong', color: '#1e8449', width: '100%' };
  };

  const checkEmailExists = useCallback((emailVal: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
      setEmailExists(false);
      setEmailChecking(false);
      return;
    }
    setEmailChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/auth/check-email', { params: { email: emailVal } });
        if (res.data.exists) {
          setEmailExists(true);
          setToast({ message: 'This email is already registered. Please sign in instead.', type: 'warning' });
        } else {
          setEmailExists(false);
        }
      } catch {
        // ignore
      } finally {
        setEmailChecking(false);
      }
    }, 600);
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError('');
    if (mode === 'signup') {
      checkEmailExists(val);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setError('');
    setOtpMode(false);
    setOtp('');
    setEmailExists(false);
    setShowPassword(false);
    setShowConfirm(false);
    setAgreeTerms(false);
    setConfirmPassword('');
    setFullName('');
    setSignupOtpSent(false);
    setSignupOtp('');
    setResetOtpSent(false);
    setResetOtp('');
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ════════════════════════════════════
    // RESET FLOW
    // ════════════════════════════════════
    if (mode === 'reset') {
      if (resetOtpSent) {
        if (!resetOtp || resetOtp.length < 4) { setError('Please enter the verification code.'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
          await api.post('/auth/reset-password/verify', { email, otp: resetOtp, newPassword: password });
          setToast({ message: 'Password reset successful! You can now sign in.', type: 'success' });
          switchMode('signin');
        } catch (err: any) {
          setError(err.response?.data?.message || 'Verification failed.');
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // Step 1: Send OTP
      if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return; }
      setLoading(true);
      try {
        await api.post('/auth/reset-password/send-otp', { email });
        setResetOtpSent(true);
        startResendTimer();
        setToast({ message: `Password reset code sent to ${email}`, type: 'success' });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send reset code.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ════════════════════════════════════
    // SIGNUP FLOW
    // ════════════════════════════════════
    if (mode === 'signup') {
      // Step 2: Verify OTP and complete registration
      if (signupOtpSent) {
        if (!signupOtp || signupOtp.length < 4) {
          setError('Please enter the verification code sent to your email.');
          return;
        }
        setLoading(true);
        try {
          const res = await api.post('/auth/register/verify', {
            fullName: fullName.trim(),
            email,
            password,
            otp: signupOtp,
          });
          setToast({ message: 'Account created successfully!', type: 'success' });
          finishLogin(res.data);
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Verification failed. Please try again.';
          setError(msg);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Step 1: Validate form and send OTP
      if (!fullName.trim()) { setError('Please enter your full name.'); return; }
      if (emailExists) { setToast({ message: 'This email is already registered. Please sign in instead.', type: 'warning' }); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
      if (!agreeTerms) { setError('Please agree to the Terms & Conditions.'); return; }

      setLoading(true);
      try {
        await api.post('/auth/register/send-otp', {
          fullName: fullName.trim(),
          email,
          password,
        });
        setSignupOtpSent(true);
        startResendTimer();
        setToast({ message: `Verification code sent to ${email}`, type: 'success' });
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to send verification code.';
        const code = err.response?.data?.code;
        if (code === 'EMAIL_EXISTS') {
          setToast({ message: msg, type: 'warning' });
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ════════════════════════════════════
    // SIGNIN FLOW
    // ════════════════════════════════════
    setLoading(true);
    try {
      // OTP login flow
      if (otpMode && !otp) {
        await api.post('/auth/request-otp', { email });
        setOtpMode(true);
        setToast({ message: `OTP sent to ${email}`, type: 'success' });
        setLoading(false);
        return;
      } else if (otpMode && otp) {
        const res = await api.post('/auth/verify-otp', { email, otp });
        finishLogin(res.data);
        return;
      }

      // Password login
      const res = await api.post('/auth/login', { email, password });
      finishLogin(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/send-otp', {
        fullName: fullName.trim(),
        email,
        password,
      });
      startResendTimer();
      setToast({ message: `New verification code sent to ${email}`, type: 'success' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (data: { token: string; role: string; fullName?: string; email?: string }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    if (data.fullName) localStorage.setItem('fullName', data.fullName);
    if (data.email) localStorage.setItem('email', data.email);
    window.location.href = data.role === 'ADMIN' ? '/admin' : '/';
  };

  const strength = mode === 'signup' || mode === 'reset' ? getPasswordStrength(password) : null;
  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  // Eye icon SVG
  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      )}
    </svg>
  );

  // Determine header text
  const getHeaderTitle = () => {
    if (mode === 'reset') return 'Reset Password';
    if (mode === 'signin') return 'Sign In';
    if (signupOtpSent) return 'Verify Email';
    return 'Create Account';
  };

  const getHeaderSubtitle = () => {
    if (mode === 'reset') return resetOtpSent ? `We've sent a reset code to ${email}. Enter it below along with your new password.` : 'Enter your email to receive a password reset code.';
    if (mode === 'signin') return 'Enter your credentials to access your account.';
    if (signupOtpSent) return `We've sent a 6-digit verification code to ${email}. Enter it below to complete your registration.`;
    return 'Fill in your details to get started.';
  };

  const getSubmitLabel = () => {
    if (mode === 'reset') return resetOtpSent ? 'Set New Password' : 'Send Reset Code';
    if (mode === 'signin') {
      if (otpMode) return otp ? 'Verify Code' : 'Send Code';
      return 'Sign In';
    }
    if (signupOtpSent) return 'Verify & Create Account';
    return 'Send Verification Code';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left — Image Panel */}
      <div style={{
        flex: 1,
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem',
        position: 'relative', minHeight: '100vh',
      }}>
        <div>
          <div className="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', color: '#f0ede6', fontSize: '1.8rem', letterSpacing: '14px', fontFamily: "'Cormorant Garamond', serif", textTransform: 'uppercase' }}>VOGUE</div>
        </div>
        <div style={{ color: 'white', maxWidth: '420px' }}>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 2px 12px rgba(0,0,0,0.3)', lineHeight: 1.1 }}>
            {mode === 'signin' ? 'Welcome\nBack' : mode === 'reset' ? 'Reset\nPassword' : signupOtpSent ? 'Almost\nThere' : 'Join The\nCommunity'}
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.7 }}>
            {mode === 'signin'
              ? 'Premium menswear crafted for the modern gentleman. Sign in to access your exclusive collections.'
              : mode === 'reset'
              ? 'Regain access to your account with a quick password reset.'
              : signupOtpSent
              ? 'Just one more step! Verify your email to unlock your premium menswear experience.'
              : 'Create your account and discover timeless pieces curated just for you. Premium quality, always.'}
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', fontSize: '0.8rem', opacity: 0.6 }}>
            <div><strong style={{ fontSize: '1.4rem', display: 'block', opacity: 1 }}>2K+</strong>Products</div>
            <div><strong style={{ fontSize: '1.4rem', display: 'block', opacity: 1 }}>15K+</strong>Customers</div>
            <div><strong style={{ fontSize: '1.4rem', display: 'block', opacity: 1 }}>4.9★</strong>Rating</div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 10%', backgroundColor: 'var(--bg-primary)', overflowY: 'auto',
      }}>
        <div style={{ maxWidth: '420px', width: '100%' }} className="fade-in" key={`${mode}-${signupOtpSent}`}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 className="serif" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              {getHeaderTitle()}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {getHeaderSubtitle()}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              color: 'var(--error)', padding: '0.8rem 1rem',
              border: '1px solid var(--error)', borderRadius: 'var(--radius)',
              marginBottom: '1.5rem', fontSize: '0.85rem', backgroundColor: '#c0392b08',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1rem' }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={submitAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* ═══════ RESET PASSWORD FIELDS ═══════ */}
            {mode === 'reset' && (
              <>
                {resetOtpSent ? (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                      background: '#111', borderRadius: 'var(--radius)', marginBottom: '0.5rem', border: '1px solid #222'
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-gold), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', color: 'white', fontWeight: 700, flexShrink: 0,
                      }}>✉</div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{email}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verification code sent</div>
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Verification Code</label>
                      <input
                        type="text" value={resetOtp}
                        onChange={e => { setResetOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                        className="input-field" placeholder="Enter 6-digit code"
                        maxLength={6} autoFocus
                        style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: 600 }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                          required className="input-field" placeholder="••••••••"
                          autoComplete="new-password"
                          style={{ paddingRight: '3rem' }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                            padding: '4px', display: 'flex', alignItems: 'center',
                          }}>
                          <EyeIcon show={showPassword} />
                        </button>
                      </div>
                      {password && strength && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: strength.width, backgroundColor: strength.color,
                              transition: 'all 0.3s ease', borderRadius: '3px',
                            }} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: strength.color, marginTop: '0.25rem', fontWeight: 500 }}>
                            {strength.label}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={labelStyle}>Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                          required className="input-field" placeholder="••••••••"
                          autoComplete="new-password"
                          style={{
                            paddingRight: '3rem',
                            borderColor: passwordsMismatch ? '#c0392b' : passwordsMatch ? '#27ae60' : undefined,
                          }}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                            padding: '4px', display: 'flex', alignItems: 'center',
                          }}>
                          <EyeIcon show={showConfirm} />
                        </button>
                      </div>
                      {passwordsMismatch && (
                        <div style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: '0.3rem' }}>Passwords do not match</div>
                      )}
                      {passwordsMatch && (
                        <div style={{ fontSize: '0.78rem', color: '#27ae60', marginTop: '0.3rem' }}>✓ Passwords match</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                      required className="input-field" placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                )}
              </>
            )}

            {/* ═══════ SIGNUP OTP VERIFICATION STEP ═══════ */}
            {mode === 'signup' && signupOtpSent && (
              <>
                {/* Email display (read-only) */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem',
                  background: '#111', borderRadius: 'var(--radius)', marginBottom: '0.5rem', border: '1px solid #222'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', color: 'white', fontWeight: 700, flexShrink: 0,
                  }}>✉</div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{email}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verification code sent</div>
                  </div>
                </div>

                {/* OTP Input */}
                <div>
                  <label style={labelStyle}>Verification Code</label>
                  <input
                    type="text" value={signupOtp}
                    onChange={e => { setSignupOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="input-field" placeholder="Enter 6-digit code"
                    maxLength={6} autoFocus
                    style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px', fontWeight: 600 }}
                  />
                </div>

                {/* Resend Timer */}
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {resendTimer > 0 ? (
                    <span>Resend code in <strong style={{ color: 'var(--accent)' }}>{resendTimer}s</strong></span>
                  ) : (
                    <span>
                      Didn't receive the code?{' '}
                      <button type="button" onClick={handleResendOtp}
                        style={{
                          background: 'none', border: 'none', color: 'var(--accent)',
                          cursor: 'pointer', textDecoration: 'underline', fontSize: '0.82rem', padding: 0,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        Resend
                      </button>
                    </span>
                  )}
                </div>
              </>
            )}

            {/* ═══════ SIGNUP FORM FIELDS (before OTP) ═══════ */}
            {mode === 'signup' && !signupOtpSent && (
              <>
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    required className="input-field" placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email" value={email} onChange={e => handleEmailChange(e.target.value)}
                      required className="input-field" placeholder="you@example.com"
                      autoComplete="email"
                      style={{
                        borderColor: emailExists ? '#c0392b' : undefined,
                        paddingRight: '2.5rem',
                      }}
                    />
                    {emailChecking && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <div style={{
                          width: '16px', height: '16px', border: '2px solid var(--border)',
                          borderTopColor: 'var(--accent)', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      </div>
                    )}
                    {!emailChecking && email && /\S+@\S+\.\S+/.test(email) && (
                      <div style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '1rem', color: emailExists ? '#c0392b' : '#27ae60',
                      }}>
                        {emailExists ? '✕' : '✓'}
                      </div>
                    )}
                  </div>
                  {emailExists && (
                    <div style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: '0.3rem' }}>
                      This email is already registered.{' '}
                      <button type="button" onClick={() => switchMode('signin')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.78rem', padding: 0 }}>
                        Sign in instead
                      </button>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                      required className="input-field" placeholder="••••••••"
                      autoComplete="new-password"
                      style={{ paddingRight: '3rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        padding: '4px', display: 'flex', alignItems: 'center',
                      }}>
                      <EyeIcon show={showPassword} />
                    </button>
                  </div>
                  {password && strength && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ height: '3px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: strength.width, backgroundColor: strength.color,
                          transition: 'all 0.3s ease', borderRadius: '3px',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: strength.color, marginTop: '0.25rem', fontWeight: 500 }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                      required className="input-field" placeholder="••••••••"
                      autoComplete="new-password"
                      style={{
                        paddingRight: '3rem',
                        borderColor: passwordsMismatch ? '#c0392b' : passwordsMatch ? '#27ae60' : undefined,
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        padding: '4px', display: 'flex', alignItems: 'center',
                      }}>
                      <EyeIcon show={showConfirm} />
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <div style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: '0.3rem' }}>Passwords do not match</div>
                  )}
                  {passwordsMatch && (
                    <div style={{ fontSize: '0.78rem', color: '#27ae60', marginTop: '0.3rem' }}>✓ Passwords match</div>
                  )}
                </div>

                {/* Terms */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.3rem',
                }}>
                  <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                  <span>
                    I agree to the <a href="#" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Terms of Service</a>{' '}
                    and <a href="#" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Privacy Policy</a>
                  </span>
                </label>
              </>
            )}

            {/* ═══════ SIGNIN FORM FIELDS ═══════ */}
            {mode === 'signin' && (
              <>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                    required className="input-field" placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {/* Password — not in OTP mode */}
                {!otpMode && (
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                        required className="input-field" placeholder="••••••••"
                        autoComplete="current-password"
                        style={{ paddingRight: '3rem' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                          padding: '4px', display: 'flex', alignItems: 'center',
                        }}>
                        <EyeIcon show={showPassword} />
                      </button>
                    </div>
                  </div>
                )}

                {/* OTP field */}
                {otpMode && (
                  <div>
                    <label style={labelStyle}>One-Time Code</label>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                      className="input-field" placeholder="Enter 6-digit code" maxLength={6} />
                  </div>
                )}
              </>
            )}

            {/* Submit button */}
            <button type="submit" className="filled-btn"
              disabled={loading || (mode === 'signup' && !signupOtpSent && emailExists)}
              style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', width: '100%' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Please wait...
                </span>
              ) : getSubmitLabel()}
            </button>

            {/* Back to edit details (during OTP step) */}
            {mode === 'signup' && signupOtpSent && (
               <button type="button" className="text-btn" onClick={() => { setSignupOtpSent(false); setSignupOtp(''); setError(''); }}
                 style={{ fontSize: '0.82rem', textAlign: 'center' }}>
                 ← Back to edit details
               </button>
             )}
            {mode === 'reset' && resetOtpSent && (
               <button type="button" className="text-btn" onClick={() => { setResetOtpSent(false); setResetOtp(''); setError(''); setPassword(''); setConfirmPassword(''); }}
                 style={{ fontSize: '0.82rem', textAlign: 'center' }}>
                 ← Back to edit email
               </button>
             )}
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            margin: '1.8rem 0', color: 'var(--text-muted)', fontSize: '0.8rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Bottom links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
            <button className="text-btn" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ fontSize: '0.88rem' }}>
              {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
            {mode === 'signin' ? (
              <button className="text-btn" onClick={() => { switchMode('reset'); setError(''); }}
                style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                Forgot password? Reset it
              </button>
            ) : mode === 'reset' ? (
              <button className="text-btn" onClick={() => { switchMode('signin'); setError(''); }}
                style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                ← Back to Sign In
              </button>
            ) : null}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.4rem', fontSize: '0.78rem',
  fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
  color: 'var(--text-muted)',
};
