export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="w-full">
    <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              {Array(columns).fill(0).map((_, i) => (
                <th key={i} className="px-6 py-4 font-medium"><div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array(rows).fill(0).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50">
                {Array(columns).fill(0).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-full max-w-[150px]"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-1/4"></div>
  </div>
);
