//src/features/nwp/components/LayerControl.tsx
// Variable selector

export default function LayerControl({ variable, setVariable }: any) {
  return (
    <select
      value={variable}
      onChange={(e) => setVariable(e.target.value)}
      className="border p-2"
    >
      <option value="T2">Temperature</option>
      <option value="RH">Humidity</option>
      <option value="RAINNC">Rainfall</option>
    </select>
  );
}
