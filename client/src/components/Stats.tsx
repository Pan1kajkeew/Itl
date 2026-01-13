import React from 'react';
import { StatsData } from '@/types';
import { cn } from '@/lib/utils';

interface StatsProps {
  stats: StatsData;
}

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="neo-card bg-blue-50 p-3 rounded-lg">
        <div className="text-xs font-bold uppercase text-blue-800 mb-1">Всего</div>
        <div className="text-2xl font-black font-mono">{stats.total}</div>
      </div>
      
      <div className="neo-card bg-green-50 p-3 rounded-lg">
        <div className="text-xs font-bold uppercase text-green-800 mb-1">Исправно</div>
        <div className="text-2xl font-black font-mono text-green-600">{stats.ok}</div>
      </div>
      
      <div className="neo-card bg-red-50 p-3 rounded-lg">
        <div className="text-xs font-bold uppercase text-red-800 mb-1">Сломано</div>
        <div className="text-2xl font-black font-mono text-red-600">{stats.broken}</div>
      </div>
      
      <div className="neo-card bg-yellow-50 p-3 rounded-lg">
        <div className="text-xs font-bold uppercase text-yellow-800 mb-1">Срочно</div>
        <div className="text-2xl font-black font-mono text-yellow-600">{stats.urgent}</div>
      </div>
    </div>
  );
};
