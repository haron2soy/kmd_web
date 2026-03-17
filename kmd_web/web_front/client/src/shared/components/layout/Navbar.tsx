import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/features/user_authentication/AuthContext'; // adjust path if needed

export function Navbar() {
  const [location] = useLocation();
  const { logout, user, loading } = useAuth(); // user is null if not logged in
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!user && !loading;

  // ────────────────────────────────────────────────
  // Home submenu
  // ────────────────────────────────────────────────
  const homeSubmenu = [
    { href: '/pages/about-rsmc', label: 'About RSMC' },
    { href: '/pages/mandate', label: 'Mandate' },
    { href: '/pages/services', label: 'Services' },
    { href: '/pages/products', label: 'Products' },
    { href: '/publications', label: 'Publications' },
    { href: '/contact', label: 'Contact Us' },
  ];

  // ────────────────────────────────────────────────
  // Main navigation items
  // ────────────────────────────────────────────────
  const mainNav = [
    { href: '/nwp-models', label: 'NWP', submenu: null },
    {
      href: '/products',
      label: 'Products',
      submenu: null,
    },
    {
      href: '/forecasts',
      label: 'Forecasts',
      submenu: [
        { label: null, items: [
          { href: '/guidance', label: 'Guidance' },
        ]},
        { label: null, items: [
          { href: '/forecasts', label: 'Forecasts' },
        ]},
      ],
    },
    
    {
      href: '/swfp-evaluation',
      label: 'SWFP Evaluations',
      submenu: [
        { label: 'Evaluations', items: [
          { href: '/swfp-evaluation/quarterly-report', label: 'Quarterly Report' },
          { href: '/swfp-evaluation/event-table', label: 'Event Table' },
        ]},
      ],
    },
    {
      href: '/national',
      label: 'National Met',
      submenu: null,
    },
    {
      href: '/regional-international',
      label: 'Regional',
      submenu: null,
    },
  ];

  const isActive = (href: string) =>
    location === href || (location.startsWith(href) && href !== '/');

  const isHomeActive = location === '/' || homeSubmenu.some(l => isActive(l.href));

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar – logo / menu button / desktop nav */}
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop menu – hidden on mobile */}
          <ul className="hidden lg:flex flex-nowrap items-center gap-1 md:gap-2 text-normal font-medium  tracking-wider">
            {/* Home */}
            <li className="relative group">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-1 px-2 py-4 transition-colors hover:bg-white/10 border-b-4 border-transparent",
                  isHomeActive && "border-accent bg-white/10"
                )}
              >
                Home
                <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50">
                <div className="bg-primary/95 backdrop-blur-sm border border-white/10 rounded-md shadow-xl min-w-[100px] py-2">
                  {homeSubmenu.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-5 py-2.5 text-sm hover:bg-white/10 transition-colors",
                        isActive(link.href) && "bg-white/15 font-semibold"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Main items */}
            {mainNav.map(item => {
              const itemActive =
                (item.href && isActive(item.href)) ||
                (item.submenu?.some(sub =>
                  (sub.items?.some(i => i.href && isActive(i.href)))
                  ) ?? false);

              return (
                <li key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-2 py-4 transition-colors hover:bg-white/10 border-b-4 border-transparent",
                      itemActive && "border-accent bg-white/10"
                    )}
                  >
                    {item.label}
                    {item.submenu && <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                  </Link>

                  {item.submenu && (
                    <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50">
                      <div className="bg-primary/95 backdrop-blur-sm border border-white/10 rounded-md shadow-xl min-w-[240px] py-2">
                        {item.submenu.map((sub, idx) => (
                          <div key={idx}>
                            {sub.label && (
                              <div className="px-5 py-2 text-xs font-bold uppercase tracking-wide opacity-80 border-b border-white/10">
                                {sub.label}
                              </div>
                            )}
                            {(sub.items || [sub]).map(link => {
                              const isExternal = link.href?.startsWith('/national/') ||
                                                link.href?.startsWith('/regional-international/');

                              const baseClass = cn(
                                "block px-6 py-2.5 text-sm hover:bg-white/10 transition-colors",
                                isActive(link.href) && "bg-white/15 font-semibold"
                              );

                              return isExternal ? (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={baseClass}
                                >
                                  {link.label}
                                </a>
                              ) : (
                                <Link key={link.href} href={link.href} className={baseClass}>
                                  {link.label}
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {/* Desktop Logout */}
            {isAuthenticated && (
              <li className="ml-6">
                <button
                  onClick={() => logout()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium",
                    "bg-white/10 hover:bg-white/20 active:bg-white/30",
                    "border border-white/20 hover:border-white/40 transition-colors"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary/98 border-t border-white/10">
          <div className="container mx-auto px-4 py-5">
            <ul className="flex flex-col space-y-2 text-base font-medium uppercase tracking-wide">
              {/* Home */}
              <li>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={cn(
                    "block py-3 px-4 rounded hover:bg-white/10 transition-colors",
                    isHomeActive && "bg-white/15"
                  )}
                >
                  Home
                </Link>
              </li>

              {/* Main items – simplified (no nested dropdowns on mobile) */}
              {mainNav.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "block py-3 px-4 rounded hover:bg-white/10 transition-colors",
                      isActive(item.href) && "bg-white/15"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Mobile Logout */}
              {isAuthenticated && (
                <li className="pt-4 mt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 w-full py-3 px-4 rounded hover:bg-white/10 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}