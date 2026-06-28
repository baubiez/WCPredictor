import { useState } from 'react';
import { API, authFetch } from '../config.js';
import { useLang } from '../LanguageContext.jsx';

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (p) => p.length >= 8 },
  { label: 'Au moins une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Au moins une minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Au moins un chiffre',    test: (p) => /[0-9]/.test(p) },
];

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
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

function Flash({ msg }) {
  if (!msg?.text) return null;
  return (
    <div className={`px-4 py-3 rounded-lg text-sm mb-5 font-medium ${
      msg.isError
        ? 'bg-red-500/15 border border-red-500/40 text-red-400'
        : 'bg-green-500/15 border border-green-500/40 text-green-400'
    }`}>
      {msg.text}
    </div>
  );
}

/* ── Section : changer l'email ── */
function EmailSection({ currentEmail, t }) {
  const [newEmail, setNewEmail]             = useState('');
  const [currentPwd, setCurrentPwd]         = useState('');
  const [showPwd, setShowPwd]               = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [flash, setFlash]                   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEmail || !currentPwd) return;
    setSaving(true);
    setFlash(null);
    try {
      const res = await authFetch(`${API}/api/users/profile`, {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPwd, new_email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setFlash({ text: t('profile.success'), isError: false });
      setNewEmail('');
      setCurrentPwd('');
    } catch (err) {
      setFlash({ text: err.message, isError: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-4">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
        {t('profile.section.email')}
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        {t('profile.current_email')} <span style={{ color: 'var(--accent)' }} className="font-semibold">{currentEmail}</span>
      </p>

      <Flash msg={flash} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {t('profile.field.new_email')}
          </label>
          <input
            type="email"
            required
            className="form-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={currentEmail}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {t('profile.field.current_password')}
          </label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              required
              className="form-input pr-11"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}>
              <EyeIcon open={showPwd} />
            </button>
          </div>
        </div>
        <button type="submit" disabled={saving || !newEmail || !currentPwd}
          className="btn btn-primary text-sm px-6 py-2">
          {saving ? '…' : t('profile.btn.save')}
        </button>
      </form>
    </div>
  );
}

/* ── Section : changer le mot de passe ── */
function PasswordSection({ t }) {
  const [currentPwd, setCurrentPwd]         = useState('');
  const [newPwd, setNewPwd]                 = useState('');
  const [confirmPwd, setConfirmPwd]         = useState('');
  const [showCurrent, setShowCurrent]       = useState(false);
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [flash, setFlash]                   = useState(null);

  const rulesOk = PASSWORD_RULES.every(({ test }) => test(newPwd));
  const match   = newPwd === confirmPwd && confirmPwd.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!match) {
      setFlash({ text: t('profile.error.password_mismatch'), isError: true });
      return;
    }
    if (!rulesOk) return;
    setSaving(true);
    setFlash(null);
    try {
      const res = await authFetch(`${API}/api/users/profile`, {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setFlash({ text: t('profile.success'), isError: false });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setFlash({ text: err.message, isError: true });
    } finally {
      setSaving(false);
    }
  };

  const pwdField = (label, value, setValue, show, setShow, autocomplete, extra) => (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          className={`form-input pr-11${extra ? ' ' + extra : ''}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete={autocomplete}
        />
        <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
        {t('profile.section.password')}
      </h3>

      <Flash msg={flash} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {pwdField(t('profile.field.current_password'), currentPwd, setCurrentPwd, showCurrent, setShowCurrent, 'current-password')}

        {pwdField(t('profile.field.new_password'), newPwd, setNewPwd, showNew, setShowNew, 'new-password')}

        {/* Règles mot de passe */}
        {newPwd.length > 0 && (
          <ul className="space-y-1 -mt-1">
            {PASSWORD_RULES.map(({ label, test }) => {
              const ok = test(newPwd);
              return (
                <li key={label} className="flex items-center gap-1.5 text-xs"
                  style={{ color: ok ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <span>{ok ? '✓' : '·'}</span>
                  {label}
                </li>
              );
            })}
          </ul>
        )}

        {pwdField(
          t('profile.field.confirm_password'),
          confirmPwd,
          setConfirmPwd,
          showConfirm,
          setShowConfirm,
          'new-password',
          confirmPwd.length > 0 ? (match ? 'border-green-500/60' : 'border-red-500/60') : ''
        )}

        {confirmPwd.length > 0 && !match && (
          <p className="text-xs text-red-400 -mt-2">{t('profile.error.password_mismatch')}</p>
        )}

        <button
          type="submit"
          disabled={saving || !currentPwd || !newPwd || !confirmPwd || !rulesOk || !match}
          className="btn btn-primary text-sm px-6 py-2">
          {saving ? '…' : t('profile.btn.save')}
        </button>
      </form>
    </div>
  );
}

/* ── Page principale ── */
export default function Profile() {
  const { t } = useLang();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>
          {t('profile.title')}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('profile.subtitle')}
        </p>
      </div>

      <EmailSection currentEmail={user?.email || ''} t={t} />
      <PasswordSection t={t} />
    </div>
  );
}
