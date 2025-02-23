
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="pl-64 pt-16">
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
