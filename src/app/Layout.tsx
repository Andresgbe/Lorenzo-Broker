import { Outlet } from 'react-router-dom';
import { Navbar } from '../widgets/navbar';
import { Footer } from '../widgets/footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
