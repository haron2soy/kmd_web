// Time control
//src/features/nwp/components/TimeSlider.tsx
interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function TimeSlider({ value, onChange }: Props) {
  return (
    <input
      type="range"
      min={0}
      max={48}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
