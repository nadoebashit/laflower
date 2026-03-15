import { useQuery } from '@tanstack/react-query';
import { reportsApi, flowersApi } from '../api/services';
import { TrendingUp, Package, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports', 'today'],
    queryFn: () => reportsApi.get('today'),
  });

  const { data: flowers, isLoading: flowersLoading } = useQuery({
    queryKey: ['flowers'],
    queryFn: () => flowersApi.list(),
  });

  if (reportsLoading || flowersLoading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-surface-200 rounded w-3/4"></div></div></div>;
  }

  const statCards = [
    { title: 'Доход сегодня', value: `${reports?.total_income || 0} ₸`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Прибыль сегодня', value: `${reports?.total_profit || 0} ₸`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Продано букетов', value: reports?.total_bouquets || 0, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Общий остаток', value: `${flowers?.items.reduce((acc, f) => acc + f.stock_quantity, 0) || 0} шт.`, icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Dummy chart data as placeholder for daily stats
  const chartData = [
    { name: 'Пн', profit: Math.random() * 5000 + 1000 },
    { name: 'Вт', profit: Math.random() * 5000 + 1000 },
    { name: 'Ср', profit: Math.random() * 5000 + 1000 },
    { name: 'Чт', profit: Math.random() * 5000 + 1000 },
    { name: 'Пт', profit: Math.random() * 5000 + 1000 },
    { name: 'Сб', profit: Math.random() * 5000 + 1000 },
    { name: 'Вс', profit: Number(reports?.total_profit) || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <h2 className="text-3xl font-extrabold text-surface-900">Дашборд</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-surface-100 flex items-center space-x-5 card-hover">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
               <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-surface-500 font-medium text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold text-surface-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-surface-100">
        <h3 className="text-xl font-bold mb-6 text-surface-800">Прибыль по дням</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={4} dot={{r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
