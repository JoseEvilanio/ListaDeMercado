import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: MenuItem[];
}

interface ResponsiveMenuProps {
  items: MenuItem[];
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  variant?: 'light' | 'dark';
}

const ResponsiveMenu: React.FC<ResponsiveMenuProps> = ({
  items,
  logo,
  rightContent,
  variant = 'light'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fechar menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Alternar dropdown
  const toggleDropdown = (index: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Classes baseadas na variante
  const navClasses = variant === 'light'
    ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shadow-sm border-b border-neutral-200 dark:border-neutral-700'
    : 'bg-primary-600 text-white shadow-md';
    
  const mobileMenuClasses = variant === 'light'
    ? 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-t border-neutral-200 dark:border-neutral-700'
    : 'bg-primary-700 text-white';
    
  const itemClasses = variant === 'light'
    ? 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
    : 'hover:bg-primary-700';
    
  const dropdownClasses = variant === 'light'
    ? 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg'
    : 'bg-primary-700 shadow-lg';
  
  return (
    <nav className={`${navClasses} sticky top-0 z-50`} ref={menuRef}>
      <div className="container-responsive mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {items.map((item, index) => (
              <div key={index} className="relative">
                {item.children ? (
                  <div className="group relative">
                    <button
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${itemClasses}`}
                      onClick={() => toggleDropdown(index)}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                      <svg
                        className="ml-1 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="hidden group-hover:block absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10">
                      <div className={`${dropdownClasses} rounded-md py-1`}>
                        {item.children.map((child, childIndex) => (
                          <div key={childIndex}>
                            {child.href ? (
                              <Link
                                to={child.href}
                                className={`block px-4 py-2 text-sm ${itemClasses}`}
                              >
                                {child.icon && <span className="mr-2">{child.icon}</span>}
                                {child.label}
                              </Link>
                            ) : (
                              <button
                                className={`block w-full text-left px-4 py-2 text-sm ${itemClasses}`}
                                onClick={child.onClick}
                              >
                                {child.icon && <span className="mr-2">{child.icon}</span>}
                                {child.label}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  item.href ? (
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${itemClasses}`}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${itemClasses}`}
                      onClick={item.onClick}
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          
          {/* Right Content */}
          <div className="hidden lg:flex lg:items-center">
            {rightContent}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                variant === 'light' ? 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200' : 'text-white hover:text-white hover:bg-primary-700'
              }`}
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${mobileMenuClasses} ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {items.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${itemClasses}`}
                    onClick={() => toggleDropdown(index)}
                  >
                    <div className="flex items-center">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </div>
                    <svg
                      className={`h-4 w-4 transform ${openDropdowns[index] ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {openDropdowns[index] && (
                    <div className="pl-4 pr-2 py-2 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <div key={childIndex}>
                          {child.href ? (
                            <Link
                              to={child.href}
                              className={`block px-3 py-2 rounded-md text-base font-medium ${itemClasses}`}
                            >
                              {child.icon && <span className="mr-2">{child.icon}</span>}
                              {child.label}
                            </Link>
                          ) : (
                            <button
                              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${itemClasses}`}
                              onClick={child.onClick}
                            >
                              {child.icon && <span className="mr-2">{child.icon}</span>}
                              {child.label}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                item.href ? (
                  <Link
                    to={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${itemClasses}`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${itemClasses}`}
                    onClick={item.onClick}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile Right Content */}
        {rightContent && (
          <div className="pt-4 pb-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="px-2 space-y-1">
              {rightContent}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ResponsiveMenu;