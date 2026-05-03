import { MapPin, Phone, Mail } from 'lucide-react';
import { Facebook, Twitter, Instagram } from "lucide-react";

//import {Globe} from 'lucide-react';
export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t-4 border-accent mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info */}
        <div>
          <h3 className="text-white font-serif font-bold text-lg mb-4 uppercase border-b border-slate-700 pb-2 inline-block">
            Contact Information
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <span>
                Ngong Road, Dagoretti Corner<br />
                P.O. Box 30259-00100<br />
                Nairobi, Kenya
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-accent" />
              <span>+254 20 386 7880 / 5</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-accent" />
              <span>info@meteo.go.ke</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
           <h3 className="text-white font-serif font-bold text-lg mb-4 uppercase border-b border-slate-700 pb-2 inline-block">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wmo.int/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline decoration-accent">WMO Website</a></li>
            <li><a href="https://meteo.go.ke/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline decoration-accent">National Meteorological Services</a></li>
            <li><a href="https://severeweather.wmo.int/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline decoration-accent">Severe Weather Information Centre</a></li>
            <li><a href="https://worldweather.wmo.int/" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline decoration-accent">World Weather Information Service</a></li>
          </ul>
        </div>

        {/* Social media Links */}
        <div>
  <h3 className="text-white font-serif font-bold text-lg mb-4 uppercase border-b border-slate-700 pb-2 inline-block">
    Our Social Media Links
  </h3>

  <ul className="space-y-3 text-sm">
    <li>
      <a
        href="https://www.facebook.com/KenyaMeteorologicalDepartment/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-white hover:underline decoration-accent"
      >
        <Facebook className="w-4 h-4" />
        Facebook
      </a>
    </li>

    <li>
      <a
        href="https://x.com/MeteoKenya/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-white hover:underline decoration-accent"
      >
        <Twitter className="w-4 h-4" />
        X (Twitter)
      </a>
    </li>

    <li>
      <a
        href="https://www.instagram.com/officialkmd_/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-white hover:underline decoration-accent"
      >
        <Instagram className="w-4 h-4" />
        Instagram
      </a>
    </li>
  </ul>
</div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Regional Specialized Meteorological Centre. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
