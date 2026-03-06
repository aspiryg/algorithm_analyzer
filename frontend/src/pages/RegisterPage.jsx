import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import useAuthStore from '../store/authStore';
import '../components/auth/Auth.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password });
      navigate('/pathfinding');
    } catch {
      // error is set in the store
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <span className="auth-card__logo-icon">
            <GitBranch size={18} color="#fff" />
          </span>
          Algo<span className="auth-card__logo-accent">Viz</span>
        </div>
        <p className="auth-card__subtitle">Algorithm Visualization Platform</p>

        <h2 className="auth-card__title">Create your account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {displayError && <div className="auth-form__error">{displayError}</div>}

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="username">Username</label>
            <input
              id="username"
              className="auth-form__input"
              type="text"
              placeholder="Pick a username"
              value={username}
              onChange={(e) => { clearError(); setLocalError(''); setUsername(e.target.value); }}
              required
              minLength={3}
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="auth-form__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { clearError(); setLocalError(''); setEmail(e.target.value); }}
              required
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="auth-form__input"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { clearError(); setLocalError(''); setPassword(e.target.value); }}
              required
              minLength={6}
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className="auth-form__input"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => { clearError(); setLocalError(''); setConfirmPassword(e.target.value); }}
              required
            />
          </div>

          <button className="auth-form__submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-form__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
