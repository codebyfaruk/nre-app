// src/components/layout/Layout.jsx - MOBILE RESPONSIVE
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Topbar title={title} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
