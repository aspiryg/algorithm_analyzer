import { NavLink, useNavigate } from 'react-router-dom';
import { GitBranch, LogOut, LogIn, UserPlus, Route, BarChart3, TreePine, Sigma, Target } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

// Top navigation bar.
// Shows algorithm module links on the left.
// Right side: user info + logout if logged in, or sign-in/register links if anonymous.

const navModules = [
  { path: '/pathfinding', label: 'Path Finding', icon: Route },
  { path: '/sorting', label: 'Sorting', icon: BarChart3 },
  // future modules -- uncomment when implemented
  // { path: '/sorting', label: 'Sorting', icon: BarChart3 },
  // { path: '/trees', label: 'Trees', icon: TreePine },
  // { path: '/dynamic', label: 'Dynamic Prog.', icon: Sigma },
  // { path: '/optimization', label: 'Optimization', icon: Target },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand">
        <span className="navbar__brand-icon">
          <GitBranch size={14} color="#fff" />
        </span>
        Algo<span className="navbar__brand-accent">Viz</span>
      </NavLink>

      <nav className="navbar__nav">
        {navModules.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar__actions">
        {isAuthenticated ? (
          <>
            <div className="navbar__user">
              <span className="navbar__user-avatar">{initial}</span>
              {user.username}
            </div>
            <button className="navbar__logout" onClick={handleLogout}>
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar__auth-link">
              <LogIn size={14} />
              Sign In
            </NavLink>
            <NavLink to="/register" className="navbar__auth-link navbar__auth-link--primary">
              <UserPlus size={14} />
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
