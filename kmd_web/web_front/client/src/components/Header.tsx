import { Link } from "wouter";
import  logo  from "../assets/wmo.png";
import flagOfKenya from "../assets/kmd_image.png";

export function Header() {
  return (
    <header className="bg-white border-b-4 border-primary">
      <div className="container mx-auto px-4 py-4 flex items-center gap-6">

        <Link href="/">
          <a className="relative flex items-center gap-4 group cursor-pointer select-none caret-transparent">
            <img
              src={logo}
              alt="Regional Specialized Meteorological Centre (RSMC) Logo"
              className="h-28 md:h-32 w-[150px] md:w-[200px] object-contain opacity-100 z-0 transition-opacity duration-300 group-hover:opacity-80"
            />

            <div className="relative z-10 flex flex-col">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary uppercase tracking-wide text-center">
                Regional Specialized Meteorological Centre (RSMC) Nairobi
              </h1>
              <p className="mt-1 text-sm md:text-base font-medium text-muted-foreground">
                Serving the Region with Excellence in Meteorology
              </p>
            </div>
          </a>
        </Link>

        <div className="ml-auto hidden lg:block select-none caret-transparent">
          <img
            src={flagOfKenya}
            alt="Flag of Kenya"
            className="h-28 md:h-32 w-auto object-contain pointer-events-none"
          />
        </div>

      </div>
    </header>
  );
}
