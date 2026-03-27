import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/features/user_authentication/AuthContext';
import LogoutButton from '@/features/user_authentication/LogoutButton';

export function Navbar() {
  const [location] = useLocation();
  const { logout, user, loading } = useAuth();
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
    { href: '/products', label: 'Products', submenu: null },
    {
      href: '/forecasts',
      label: 'Forecasts',
      submenu: [
        { label: null, items: [{ href: '/guidance', label: 'Guidance' }] },
        { label: null, items: [{ href: '/forecasts', label: 'Forecasts' }] },
      ],
    },
    {
      href: '/swfp-evaluation',
      label: 'SWFP Evaluations',
      submenu: [
        {
          label: 'Evaluations',
          items: [
            { href: '/swfp-evaluation/quarterly-report', label: 'Quarterly Report' },
            { href: '/swfp-evaluation/event-table', label: 'Event Table' },
          ],
        },
      ],
    },
    { href: '/national', label: 'National Met', submenu: null },
    { href: '/regional-international', label: 'Regional', submenu: null },
  ];

  const isActive = (href: string) =>
    location === href || (location.startsWith(href) && href !== '/');

  const isHomeActive = location === '/' || homeSubmenu.some((l) => isActive(l.href));

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20 xl:h-24 2xl:h-28">
          {/* Logo / Brand *
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl tracking-tight min-w-0"
          >
            RSMC
          </Link>*/}

          {/* Desktop Navigation */}
          <ul className="hidden md:flex lg:flex xl:flex 2xl:flex items-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium tracking-wide">
            {/* Home with submenu */}
            <li className="relative group">
              <Link
                href="/"
                className={cn(
                  "flex items-center  px-1 py-1 md:px- lg:px-2 xl:px-3 2xl:px-4 md:py-1 lg:py-2 xl:py-3 transition-all hover:bg-white/10 rounded-lg md:rounded-xl lg:rounded-2xl border-b-2 md:border-b-4 border-transparent",
                  isHomeActive && "border-accent bg-white/10 shadow-md"
                )}
              >
                Home
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
              </Link>

              <div className="absolute left-0 top-full pt-1 md:pt-2 lg:pt-3 z-50 hidden group-hover:block min-w-[100px] md:min-w-[120px] lg:min-w-[150px] xl:min-w-[240px]">
                <div className="bg-primary/95 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-3xl shadow-2xl py-1.5 md:py-2 lg:py-3 min-w-[150px]">
                  {homeSubmenu.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block px-1 py-1 md:px-2 md:py-2 text-xs md:text-sm lg:text-base hover:bg-white/10 transition-colors rounded-xl",
                        isActive(link.href) && "bg-white/15 font-semibold shadow-sm"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Main Navigation Items */}
            {mainNav.map((item) => {
              const itemActive =
                isActive(item.href) ||
                (item.submenu?.some((sub) =>
                  sub.items?.some((i) => i.href && isActive(i.href))
                ) ?? false);

              return (
                <li key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-0 py-0 md:px-1 lg:px-2 xl:px-3 2xl:px-4 md:py-2 lg:py-3 xl:py-4 transition-all hover:bg-white/10 rounded-lg md:rounded-xl lg:rounded-2xl border-b-2 md:border-b-4 border-transparent",
                      itemActive && "border-accent bg-white/10 shadow-md"
                    )}
                  >
                    {item.label}
                    {item.submenu && (
                      <ChevronDown className="h-3 w-3 md:h-4 md:w-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Desktop Dropdown */}
                  {item.submenu && (
                    <div className="absolute left-0 top-full pt-1 md:pt-2 lg:pt-3 z-50 hidden group-hover:block min-w-[100px] md:min-w-[1800px] lg:min-w-[200px]">
                      <div className="bg-primary/95 backdrop-blur-md border border-white/10 rounded-2xl lg:rounded-3xl shadow-2xl py-1.5 md:py-2 lg:py-3">
                        {item.submenu.map((sub, idx) => (
                          <div key={idx}>
                            {sub.label && (
                              <div className="px-4 py-2 md:px-6 md:py-2.5 lg:text-xs xl:text-sm font-bold uppercase tracking-widest opacity-75 border-b border-white/10">
                                {sub.label}
                              </div>
                            )}
                            {(sub.items || [sub]).map((link) => {
                              const isExternal = link.href?.startsWith('/national/') ||
                                                link.href?.startsWith('/regional-international/');

                              const baseClass = cn(
                                "block px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm lg:text-base hover:bg-white/10 transition-colors rounded-xl",
                                isActive(link.href) && "bg-white/15 font-semibold shadow-sm"
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
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={closeMobileMenu}
                                  className={baseClass}
                                >
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
          </ul>

          {/* Desktop Auth */}
          <div className="hidden md:hidden lg:block xl:block 2xl:block ml-auto">
            {isAuthenticated && <LogoutButton />}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 sm:p-2 md:-mr-2 text-primary-foreground hover:bg-white/10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/98 border-t border-white/10 backdrop-blur-md">
          <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <ul className="flex flex-col space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg font-medium">
              {/* Home */}
              <li>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={cn(
                    "block px-4 sm:px-5 py-4 sm:py-5 rounded-2xl hover:bg-white/10 transition-all duration-200 shadow-sm",
                    isHomeActive && "bg-white/15 font-semibold shadow-md ring-2 ring-accent/30"
                  )}
                >
                  Home
                </Link>
              </li>

              {/* Main Items */}
              {mainNav.map((item, _idx) => (
                <li key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "block px-4 sm:px-5 py-4 sm:py-5 rounded-2xl hover:bg-white/10 transition-all duration-200 shadow-sm",
                      isActive(item.href) && "bg-white/15 font-semibold shadow-md ring-2 ring-accent/30"
                    )}
                  >
                    {item.label}
                  </Link>
                  
                  {/* Mobile submenus - accordion style */}
                  {item.submenu && (
                    <div className="ml-6 border-l-2 border-accent/30 pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      {item.submenu.map((sub, subIdx) => (
                        <div key={subIdx}>
                          {sub.label && (
                            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider opacity-80 bg-accent/10 rounded-xl border border-accent/20">
                              {sub.label}
                            </div>
                          )}
                          {(sub.items || [sub]).map((link, linkIdx) => (
                            <Link
                              key={linkIdx}
                              href={link.href}
                              onClick={closeMobileMenu}
                              className={cn(
                                "block px-4 py-3 text-sm hover:bg-white/10 transition-colors rounded-xl border-l-4 border-transparent hover:border-accent/50",
                                isActive(link.href) && "bg-white/15 font-semibold border-accent shadow-sm"
                              )}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}

              {/* Mobile Auth */}
              {isAuthenticated && (
                <li className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t-2 border-white/10">
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 w-full px-4 sm:px-5 py-4 sm:py-5 rounded-2xl hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-accent/30 text-left group"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Logout</span>
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
