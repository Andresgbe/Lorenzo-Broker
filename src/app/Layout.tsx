import { Outlet } from 'react-router-dom';
import { Navbar } from '../widgets/navbar';
import { Footer } from '../widgets/footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
