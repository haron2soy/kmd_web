// src/components/Navbar.jsx
import { Link } from 'react-router-dom';


export default function Navbar() {
return (
<nav className="bg-blue-800">
<ul className="container mx-auto px-4 flex gap-6 text-sm py-2">
<li><Link to="/" className="hover:underline">Home</Link></li>
<li><Link to="/pages/about" className="hover:underline">About</Link></li>
<li><Link to="/pages/mandate" className="hover:underline">Mandate</Link></li>
<li><Link to="/pages/services" className="hover:underline">Services</Link></li>
<li><Link to="/pages/publications" className="hover:underline">Publications</Link></li>
<li><Link to="/pages/contact" className="hover:underline">Contact</Link></li>
</ul>
</nav>
);
}