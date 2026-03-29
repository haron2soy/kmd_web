type Props = {
  variable: string;
  setVariable: (v: string) => void;
  options: string[]; // from backend
};

const LABEL_MAP: Record<string, string> = {
  T2: "Temperature",
  PRECIP: "Rainfall",
  WIND: "Wind",
};


export default function LayerControl({
  variable,
  setVariable,
  options,
}: Props) {
  if (!options || options.length === 0) {
    return (
      <p className="text-sm text-gray-500">No variables available</p>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setVariable(opt)}
          className={`px-3 py-2 border rounded transition text-sm
            ${
              variable === opt
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
        >
          {LABEL_MAP[opt] || opt}
        </button>
      ))}
    </div>
  );
}