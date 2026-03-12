import { Link } from "wouter";

type Props = {
  href: string;
  label: string;
};

export default function LinkCard({ href, label }: Props) {
  return (
    <Link href={href}>
      <div className="group relative p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/40 transition-all duration-200 bg-white">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
          {label}
        </h3>
      </div>
    </Link>
  );
}