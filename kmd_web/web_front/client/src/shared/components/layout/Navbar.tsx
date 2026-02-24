import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export function Navbar() {
  const [location] = useLocation();

  // Home submenu (as before)
  const homeSubmenu = [
    { href: '/pages/about-rsmc', label: 'About RSMC' },
    { href: '/pages/mandate',     label: 'Mandate' },
    { href: '/pages/services',    label: 'Services' },
    { href: '/pages/products',    label: 'Products' },
    { href: '/publications',      label: 'Publications' },
    {
      href: '/contact',    label: 'Contact Us',  submenu: null,   },
  ];

  // Main navigation with dropdowns where needed
  const mainNav = [
    {
      href: '/nwp-models',
      label: 'NWP Models',
      submenu: null, // flat item
    },
    {
      href: '/products',
      label: 'Products',
      submenu: [
        { label: 'Regional Products', items: [
          { href: '/products/uk-tephigrams', label: 'UK Met Office Tephigrams' },
          { href: '/products/uk-eps', label: 'UK Met Office EPS' },
          { href: '/products/lake-victoria', label: 'Lake Victoria Products' },
        ]},
        { label: 'Global Products', items: [
          { href: '/products/noaa-ncep', label: 'NOAA NCEP African Desk' },
          { href: '/products/uk-africa-vcp', label: 'UK Africa VCP' },
        ]},
      ],
    },
    {
      href: '/forecasts',
      label: 'Forecasts',
      submenu: [
        { label: 'Short Range Forecasts (1-2 days)', items: [
          { href: '/forecasts/day-1', label: 'Day 1' },
          { href: '/forecasts/day-2', label: 'Day 2' },
          { href: '/forecasts/risk-table-short', label: 'Risk Table' },
          { href: '/forecasts/discussion-short', label: 'Discussion' },
        ]},
        { label: 'Medium Range Forecasts (3-5 days)', items: [
          { href: '/forecasts/day-3', label: 'Day 3' },
          { href: '/forecasts/day-4', label: 'Day 4' },
          { href: '/forecasts/day-5', label: 'Day 5' },
          { href: '/forecasts/risk-table-medium', label: 'Risk Table' },
          { href: '/forecasts/discussion-medium', label: 'Discussion' },
        ]},
        { href: '/forecasts/archive', label: 'RSMC Guidance Archive' },
      ],
    },
    
    {
      href: '/swfp-evaluation',
      label: 'SWFP Evaluation',
      submenu: [
        { href: '/swfp-evaluation/quarterly-report', label: 'Quarterly Report' },
        { href: '/swfp-evaluation/event-table', label: 'Event Table' },
      ],
    },
    {
      href: '/national',
      label: 'National Met Services',
      submenu: [
        { href: '/national/kenya', label: 'Kenya' },
        { href: '/national/ethiopia', label: 'Ethiopia' },
        { href: '/national/rwanda', label: 'Rwanda' },
        { href: '/national/tanzania', label: 'Tanzania' },
      ],
    },
    {
      href: '/regional-international',
      label: 'Regional',
      submenu: [
        { label: 'Regional and International Centers', items: [
          { href: '/regional-international/ecmwf', label: 'ECMWF' },
          { href: '/regional-international/noaa-ncep', label: 'NOAA NCEP African Desk' },
          { href: '/regional-international/uk-met', label: 'UK MET Office' },
          { href: '/regional-international/dwd', label: 'DWD' },
        ]},
        { label: 'Long Range Forecast Centers', items: [
          { href: '/regional-international/acmad', label: 'ACMAD' },
          { href: '/regional-international/kma', label: 'KMA' },
          { href: '/regional-international/icpac', label: 'ICPAC' },
        ]},
      ],
    },
  ];

  const isActive = (href: string) =>
    location === href || (location.startsWith(href) && href !== '/');

  const isHomeActive = location === '/' || homeSubmenu.some(l => isActive(l.href));

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start">
          <ul className="flex flex-wrap gap-1 md:gap-2 text-sm font-medium uppercase tracking-wider">

            {/* Home dropdown */}
            <li className="relative group">
              <Link href="/"
                className={cn(
                  "flex items-center gap-1 px-2 py-4 transition-colors hover:bg-white/10 border-b-4 border-transparent",
                  isHomeActive && "border-accent bg-white/10"
                )}>
                  Home
                  <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                
              </Link>
              <div className="absolute left-0 top-full hidden group-hover:block pt-1">
                <div className="bg-primary/95 backdrop-blur-sm border border-white/10 rounded-md shadow-xl min-w-[220px] py-2">
                  {homeSubmenu.map(link => (
                    <Link key={link.href} href={link.href}
                       className={cn(
                        "block px-5 py-2.5 text-sm hover:bg-white/10 transition-colors",
                        isActive(link.href) && "bg-white/15 font-semibold"
                      )}>
                        {link.label}
                      
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Main items with optional nested dropdowns */}
            {mainNav.map(item => {
              const itemActive = isActive(item.href) ||
                (item.submenu && item.submenu.some(sub =>
                  sub.href ? isActive(sub.href) : sub.items?.some(i => isActive(i.href))));

              return (
                <li key={item.href} className="relative group">
                  <Link href={item.href}
                     className={cn(
                      "flex items-center gap-1 px-2 py-4 transition-colors hover:bg-white/10 border-b-4 border-transparent",
                      itemActive && "border-accent bg-white/10"
                    )}>
                      {item.label}
                      {item.submenu && <ChevronDown className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                    
                  </Link>

                  {item.submenu && (
                    <div className="absolute left-0 top-full hidden group-hover:block pt-1">
                      <div className="bg-primary/95 backdrop-blur-sm border border-white/10 rounded-md shadow-xl min-w-[240px] py-2">
                        {item.submenu.map((sub, idx) => (
                          <div key={idx}>
                            {sub.label && (
                              <div className="px-5 py-2 text-xs font-bold uppercase tracking-wide opacity-80 border-b border-white/10">
                                {sub.label}
                              </div>
                            )}

                            {(sub.items || [sub]).map((link) => {
                              const isNational = link.href.startsWith("/national/") || link.href.startsWith("/regional-international/");

                              const baseClass = cn(
                                "block px-6 py-2.5 text-sm hover:bg-white/10 transition-colors",
                                isActive(link.href) && "bg-white/15 font-semibold"
                              );

                              return isNational ? (
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
        </div>
      </div>
    </nav>
  );
}