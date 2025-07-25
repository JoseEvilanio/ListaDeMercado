import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  footer
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Verificar inicialmente
    checkIfMobile();

    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkIfMobile);

    // Limpar listener
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Alternar sidebar no mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-30 bg-white dark:bg-neutral-800 shadow-sm">
          <div className="container-responsive">
            <div className="flex items-center justify-between h-16">
              {isMobile && sidebar && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Toggle sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              )}
              {header}
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para desktop */}
        {sidebar && !isMobile && (
          <aside className="w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-y-auto">
            <div className="p-4">{sidebar}</div>
          </aside>
        )}

        {/* Sidebar para mobile */}
        {sidebar && isMobile && (
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out bg-white dark:bg-neutral-800 overflow-y-auto ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4">{sidebar}</div>
          </aside>
        )}

        {/* Overlay para mobile quando sidebar está aberta */}
        {sidebar && isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-neutral-900 bg-opacity-50 transition-opacity"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50 dark:bg-neutral-900">
          <div className="container-responsive mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <div className="container-responsive py-4">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default ResponsiveLayout;