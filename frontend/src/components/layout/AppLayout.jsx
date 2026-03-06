import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './AppLayout.css';

// Main app shell: navbar on top, routed content below.
// The content area takes up all remaining vertical space.

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
