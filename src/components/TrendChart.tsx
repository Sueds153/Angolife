import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ExchangeHistoryPoint } from '../types';

interface TrendChartProps {
  data: ExchangeHistoryPoint[];
  currency: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, currency }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-AO', { day: 'numeric', month: 'short' });
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-gold-primary/30 rounded-xl shadow-xl">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
            {currency} - {label ? formatDate(label) : ''}
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white">Informal:</span>
              <span className="text-xs font-black text-gold-primary">{payload[0].value.toFixed(2)} Kz</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-400">Formal:</span>
              <span className="text-xs font-bold text-gray-400">{payload[1].value.toFixed(2)} Kz</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[240px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInformal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212, 175, 55, 0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#4B5563"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            hide={true}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="informal"
            stroke="#D4AF37"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorInformal)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="formal"
            stroke="#9CA3AF"
            strokeWidth={1}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorFormal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
