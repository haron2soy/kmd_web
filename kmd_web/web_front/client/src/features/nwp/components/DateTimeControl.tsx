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

  useEffect(() => {
    const now = new Date();
    syncFromDate(now);
  }, []);

  const syncFromDate = (date: Date) => {
    setYear(date.getFullYear().toString());
    setMonth(String(date.getMonth() + 1).padStart(2, "0"));
    setDay(String(date.getDate()).padStart(2, "0"));
    setHour(String(date.getHours()).padStart(2, "0"));
  };

  const getCurrentDate = (): Date | null => {
    if (!year || !month || !day || !hour) return null;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour)
    );
  };

  const handleCheck = () => {
    if (!year || !month || !day || !hour) return;
    setDatetime(`${year}-${month}-${day}_${hour}:00:00`);
  };

  // 🔁 Increment / Decrement by 1 hour
  const adjustHour = (delta: number) => {
    const current = getCurrentDate();
    if (!current) return;

    current.setHours(current.getHours() + delta);

    syncFromDate(current);
     // Immediately update parent datetime
        setDatetime(
          `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(current.getDate()).padStart(2, "0")}_${String(
            current.getHours()
          ).padStart(2, "0")}:00:00`
        );
   };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-lg font-bold mb-2 block">DateTime:</label>

      {/* Inputs */}
        <div className="flex items-end gap-1 flex-nowrap overflow-x-auto max-w-full">
          
          {/* Year */}
          <div className="flex flex-col items-center flex-shrink-0">
            <label className="text-xs">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setYear(val);
              }}
              onBlur={() => {
                if (!year) return;
                setYear(year);
              }}
              className="border p-2 w-16"
            />
          </div>

          {/* Month */}
          <div className="flex flex-col items-center flex-shrink-0">
            <label className="text-xs">Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setMonth(val);
              }}
              onBlur={() => {
                if (!month) return;
                let m = Math.max(1, Math.min(12, parseInt(month)));
                setMonth(String(m).padStart(2, "0"));
              }}
              className="border p-2 w-12"
            />
          </div>

          {/* Day */}
          <div className="flex flex-col items-center flex-shrink-0">
            <label className="text-xs">Day</label>
            <input
              type="text"
              value={day}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setDay(val);
              }}
              onBlur={() => {
                if (!day) return;
                let d = Math.max(1, Math.min(31, parseInt(day)));
                setDay(String(d).padStart(2, "0"));
              }}
              className="border p-2 w-12"
            />
          </div>

          {/* Hour */}
          <div className="flex flex-col items-center flex-shrink-0">
            <label className="text-xs">Hour</label>
            <input
              type="text"
              value={hour}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setHour(val);
              }}
              onBlur={() => {
                if (!hour) return;
                let h = Math.max(0, Math.min(23, parseInt(hour)));
                setHour(String(h).padStart(2, "0"));
              }}
              className="border p-2 w-12"
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

      {/* ⬇️ Time Control Arrows */}
      <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => adjustHour(-1)}
              className="px-3 py-1 border rounded hover:bg-gray-200"
            >
              ◀
            </button>

            <span className="font-mono text-lg">
              {year}:{month}:{day}:{hour}
            </span>

            <button
              onClick={() => adjustHour(1)}
              className="px-3 py-1 border rounded hover:bg-gray-200"
            >
              ▶
            </button>
      </div>
    </div>
  );
}