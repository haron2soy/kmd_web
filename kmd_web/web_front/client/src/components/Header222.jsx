// src/components/Header.jsx
import Navbar from './Navbar';


export default function Header() {
return (
<header className="bg-blue-900 text-white">
<div className="container mx-auto px-4 py-4">
<h1 className="text-2xl font-semibold">Regional Specialized Meteorological Centre</h1>
<p className="text-sm opacity-90">Operational meteorology and climate services</p>
</div>
<Navbar />
</header>
);
}