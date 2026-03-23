//import { Link } from "wouter";
import logo from "@/assets/wmo.png";
import flagOfKenya from "@/assets/kmd_image.png";
import { useAuth } from "../../../features/user_authentication/AuthContext";

export function Header() {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b-4 border-primary ">
      {/* Container */}
      <div className="mx-auto px-2 py-1 flex items-start gap-0 ">

        {/* LEFT BLOCK (Link wrapper) */}
          
          {/* Flag */}
            <div className="h-12 sm:h-16 md:h-24 w-auto ml-0 select-none caret-transparent mt-0 pt-0">
              <img
                src={flagOfKenya}
                alt="Flag of Kenya"
                className="h-12 sm:h-16 md:h-22 w-auto object-contain pointer-events-none mt-0 pt-0"
              />
            </div>

          {/* TEXT BLOCK */}
          <div className="relative z-10 flex flex-col p-2 mx-auto">
            
            {/* Title */}
            <h2 className="text-blue-900 text-lg md:text-2xl font-serif text-center font-bold tracking-wide">
              Regional Specialized Meteorological Centre (RSMC) <br /> Nairobi
            </h2>

            {/* Subtitle */}
            <p className="mt-1 text-sm md:text-base font-medium text-muted-foreground ">
              Serving the Region with Excellence in Meteorology
            </p>
          </div>
          
        

        {/* RIGHT BLOCK (Logo area) */}
        <div className="ml-auto">
          {/* Added ml-auto here ↑ */}
          <div className="select-none caret-transparent  p-2">
            <img
              src={logo}
              alt="Regional Specialized Meteorological Centre (RSMC) Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain pointer-events-none "
            />
          </div>
          {user && (
            <p className="text-sm md:text-base text-gray-700 whitespace-nowrap justify-self-end">
              Logged in as:{" "}
              <span className="font-semibold">
                {user.first_name}
              </span>
            </p>
          )}
        </div>

      </div>
    </header>
  );
}