import { Link } from "wouter";
import  logo  from "@/shared/assets/wmo.png";
import flagOfKenya from "@/shared/assets/kmd_image.png";

export function Header() {
  return (
    <header className="bg-white border-b-4 border-primary">
      <div className="container mx-auto px-4 py-4 flex items-center gap-6">

        <Link href="/"
           className="relative flex items-center gap-4 group cursor-pointer select-none caret-transparent">
            <img
              src={flagOfKenya}
              alt="Flag of Kenya"
              className="h-10 sm:h-12 md:h-16 w-auto object-contain pointer-events-none"
            />

            <div className="relative z-10 flex flex-col">
              <h2 className=" text-blue-900 text-lg md:text-2xl font-serif text-center font-bold tracking-wide">
                Regional Specialized Meteorological Centre (RSMC) Nairobi
              </h2>

              <p className="mt-1 text-sm md:text-base font-medium text-muted-foreground">
                Serving the Region with Excellence in Meteorology
              </p>
            </div>
          
        </Link>

        <div className="ml-auto select-none caret-transparent">
          <img
            src={logo}
            alt="Regional Specialized Meteorological Centre (RSMC) Logo"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain pointer-events-none"
          />
        </div>

      </div>
    </header>
  );
}
