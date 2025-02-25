
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { ChartCard } from './ChartCard';

interface DashboardChartsProps {
  stockTrend: Array<{ name: string; value: number }> | undefined;
}

export function DashboardCharts({ stockTrend }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard title="Stock Movement">
        <LineChart data={stockTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ChartCard>

      <ChartCard title="Recent Transactions">
        <BarChart data={stockTrend?.slice(-5)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ChartCard>
    </div>
  );
}
