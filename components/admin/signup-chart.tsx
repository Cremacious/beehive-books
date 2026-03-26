'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; count: number }[];
}

export default function SignupChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6 flex items-center justify-center h-48">
        <p className="text-sm text-white/80">No signup data for the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">New signups — last 30 days</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#252525',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: 12,
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            itemStyle={{ color: '#FFC300' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#FFC300"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#FFC300' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
