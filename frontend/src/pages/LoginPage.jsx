import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import useAuthStore from '../store/authStore';
import '../components/auth/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/pathfinding');
    } catch {
      // error is set in the store
    } finally {
      setSubmitting(false);
    }
  };

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

        <h2 className="auth-card__title">Sign in to your account</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-form__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { clearError(); setEmail(e.target.value); }}
              required
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-form__input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => { clearError(); setPassword(e.target.value); }}
              required
            />
          </div>

          <button className="auth-form__submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-form__footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
