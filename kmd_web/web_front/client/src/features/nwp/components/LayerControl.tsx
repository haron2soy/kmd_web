export default function LayerControl({ variable, setVariable }: any) {
  const options = [
    { value: "T2", label: "Temperature" },
    { value: "wind", label: "Wind" },
    { value: "PRECIP", label: "Rainfall" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setVariable(opt.value)}
          className={`px-1 py-2 border rounded transition
            ${
              variable === opt.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
          {opt.label}
        </button>
      ))}
    </div>
  );
}