import React from 'react';
import { SkillGradeItem, SkillGradeLetter } from '../../types';

interface SkillGradeTableProps {
  grades: SkillGradeItem[];
  filterCategory?: string;
}

export const SkillGradeTable: React.FC<SkillGradeTableProps> = ({ grades, filterCategory }) => {
  const filtered = filterCategory
    ? grades.filter((g) => g.category.toLowerCase().includes(filterCategory.toLowerCase()))
    : grades;

  const getGradeBadge = (grade: SkillGradeLetter) => {
    let colorClass = 'text-neutral-400 bg-neutral-800 border-neutral-700';
    if (grade.startsWith('A')) {
      colorClass = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    } else if (grade.startsWith('B')) {
      colorClass = 'text-sky-400 bg-sky-500/15 border-sky-500/30';
    } else if (grade.startsWith('C')) {
      colorClass = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    } else if (grade.startsWith('D') || grade === 'F') {
      colorClass = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    }

    return (
      <span className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2 py-0.5 rounded border ${colorClass}`}>
        {grade}
      </span>
    );
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f1422]">
      <table className="w-full text-xs text-left">
        <thead className="bg-[#141a2a] text-neutral-400 font-mono text-[10px] uppercase border-b border-white/5">
          <tr>
            <th className="py-2.5 px-4">Evaluation Metric</th>
            <th className="py-2.5 px-4">Category</th>
            <th className="py-2.5 px-4">Observed Metric</th>
            <th className="py-2.5 px-4">League Percentile</th>
            <th className="py-2.5 px-4 text-right">FOA Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
          {filtered.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-2.5 px-4 text-white font-semibold">
                {item.statistic}
              </td>
              <td className="py-2.5 px-4 text-neutral-400">
                {item.category}
              </td>
              <td className="py-2.5 px-4 text-neutral-200 font-bold">
                {item.value}
              </td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full"
                      style={{ width: `${item.percentile}%` }}
                    />
                  </div>
                  <span className="text-neutral-400">{item.percentile}th</span>
                </div>
              </td>
              <td className="py-2.5 px-4 text-right">
                {getGradeBadge(item.grade)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
