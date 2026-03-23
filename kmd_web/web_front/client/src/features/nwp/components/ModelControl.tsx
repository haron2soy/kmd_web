// nwp/components/ModelControl.tsx
import type { NWPModel } from "../api";

type Props = {
  models: NWPModel[];
  selectedModel: NWPModel | null;
  setModel: (model: NWPModel) => void;
};

export default function ModelControl({ models, selectedModel, setModel }: Props) {
  if (!models || models.length === 0) {
    return <p className="text-gray-500 text-sm">No models available</p>;
  }

  return (
    <div className="w-full">
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-600 mb-1">
        Model
      </label>

      <select
        id="model-select"
        value={selectedModel?.id ?? ""}
        onChange={(e) => {
          const m = models.find((x) => String(x.id) === e.target.value);
          if (m) setModel(m);
        }}
        className="w-full mt-1 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} {m.status === "pending" ? "(Pending)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}