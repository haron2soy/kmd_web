// Variable selector

export default function LayerControl({ variable, setVariable }: any) {
  return (
    <select
      value={variable}
      onChange={(e) => setVariable(e.target.value)}
      className="border p-2"
    >
      <option value="T2">Temperature</option>
      <option value="wind">Wind</option>
      <option value="PRECIP">Rainfall</option>
    </select>
  );
}
