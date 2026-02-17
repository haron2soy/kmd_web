// Legend.tsx
//src/features/nwp/components/Legend.tsx
type LegendProps = {
  variable: string;
};

export default function Legend({ variable }: LegendProps) {
  return (
    <div className="bg-white p-3 shadow text-sm rounded">
      <div className="font-semibold mb-1">
        {getTitle(variable)}
      </div>

      <div className="flex items-center gap-2">
        <span>Low</span>
        <div className="w-32 h-2 bg-gradient-to-r from-blue-200 via-green-400 to-red-500" />
        <span>High</span>
      </div>
    </div>
  );
}

function getTitle(variable: string) {
  switch (variable) {
    case "T2":
      return "Temperature (K)";
    case "precip":
      return "Precipitation (mm)";
    default:
      return variable;
  }
}
