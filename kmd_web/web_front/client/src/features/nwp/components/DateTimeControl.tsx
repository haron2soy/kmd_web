import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

interface DateTimeControlProps {
  datetime: string;
  setDatetime: Dispatch<SetStateAction<string>>;
}

export default function DateTimeControl({ setDatetime }: DateTimeControlProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");

  // Prepopulate with current datetime on mount
  useEffect(() => {
    const now = new Date();
    setYear(now.getFullYear().toString());
    setMonth(String(now.getMonth() + 1).padStart(2, "0"));
    setDay(String(now.getDate()).padStart(2, "0"));
    setHour(String(now.getHours()).padStart(2, "0"));
  }, []);

  // Only update datetime when user clicks "Check"
  const handleCheck = () => {
    if (!year || !month || !day || !hour) return;
    setDatetime(`${year}-${month}-${day}_${hour}:00:00`);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-lg font-bold mb-2 block">DateTime:</label>

      {/* First row: Year & Month */}
      <div className="flex gap-4 mb-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 w-24"
            placeholder="YYYY"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Month</label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value.padStart(2, "0"))}
            className="border p-2 w-20"
            placeholder="MM"
            min={1}
            max={12}
          />
        </div>
      </div>

      {/* Second row: Day & Hour */}
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Day</label>
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value.padStart(2, "0"))}
            className="border p-2 w-20"
            placeholder="DD"
            min={1}
            max={31}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Hour</label>
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value.padStart(2, "0"))}
            className="border p-2 w-20"
            placeholder="HH"
            min={0}
            max={23}
          />
        </div>
      </div>

      {/* Check button */}
      <button
        onClick={handleCheck}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-32 mt-2"
      >
        Check
      </button>
    </div>
  );
}
