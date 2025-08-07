import { useMemo } from "react";

interface StudyChartProps {
  data: Record<string, number>;
}

export default function StudyChart({ data }: StudyChartProps) {
  const chartData = useMemo(() => {
    const entries = Object.entries(data);
    const total = entries.reduce((sum, [, time]) => sum + time, 0);
    
    return entries.map(([subject, time]) => ({
      subject,
      time,
      percentage: total > 0 ? (time / total) * 100 : 0,
    }));
  }, [data]);

  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-gray-500",
  ];

  if (chartData.length === 0) {
    return <p className="text-gray-500">No study time data available</p>;
  }

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={item.subject} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.subject}</span>
              <span className="text-gray-600">{Math.round(item.time / 60 * 10) / 10}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors[index % colors.length]}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {chartData.map((item, index) => (
          <div key={item.subject} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`} />
            <span>{item.subject}</span>
            <span className="text-gray-500">({item.percentage.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
