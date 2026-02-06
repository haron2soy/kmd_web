// src/components/Footer.jsx
export default function Footer() {
return (
<footer className="bg-gray-800 text-gray-200 text-sm">
<div className="container mx-auto px-4 py-6">
<p>© {new Date().getFullYear()} Regional Specialized Meteorological Centre</p>
<p>All rights reserved.</p>
</div>
</footer>
);
}