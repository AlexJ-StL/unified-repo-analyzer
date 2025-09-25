import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
