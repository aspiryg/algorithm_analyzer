import { Link } from 'react-router-dom';
import { Route, BarChart3, TreePine, Sigma, Target, Boxes } from 'lucide-react';
import './HomePage.css';

/*
  HomePage -- the landing page after login.
  Shows the available algorithm modules in a grid.
  Modules that aren't implemented yet are greyed out.
*/

const modules = [
  { path: '/pathfinding', name: 'Path Finding', icon: Route, available: true },
  { path: '/sorting', name: 'Sorting', icon: BarChart3, available: true },
  { path: '/trees', name: 'Trees', icon: TreePine, available: false },
  { path: '/dynamic', name: 'Dynamic Programming', icon: Sigma, available: false },
  { path: '/optimization', name: 'Optimization', icon: Target, available: false },
  { path: '/other', name: 'More Coming', icon: Boxes, available: false },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__hero">
        <h1 className="home-page__title">
          Visualize <span className="home-page__title-accent">Algorithms</span>,<br />
          Understand Them Deeply
        </h1>
        <p className="home-page__subtitle">
          Step through algorithms one instruction at a time.
          Watch queues fill, stacks grow, and paths emerge.
          Build intuition that reading code alone can't give you.
        </p>
      </div>

      <div className="home-page__modules">
        {modules.map(({ path, name, icon: Icon, available }) => (
          <Link
            key={path}
            to={available ? path : '#'}
            className={`home-page__module ${!available ? 'home-page__module--disabled' : ''}`}
          >
            <div className="home-page__module-icon">
              <Icon size={22} />
            </div>
            <span className="home-page__module-name">{name}</span>
            <span className={`home-page__module-status ${available ? 'home-page__module-status--available' : ''}`}>
              {available ? 'Available' : 'Coming soon'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
