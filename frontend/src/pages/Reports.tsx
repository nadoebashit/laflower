import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/services';
import { Package, TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [period, setPeriod] = useState('today');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportsApi.get(period),
  });

  const chartData = [
    {
      name: 'Выбранный период',
      Доход: parseFloat(data?.total_income || '0'),
      Прибыль: parseFloat(data?.total_profit || '0'),
      Себестоимость: parseFloat(data?.total_cost || '0'),
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-surface-100 gap-4">
        <h2 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
          <FileText className="text-brand-600" /> Отчеты
        </h2>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-surface-50 border border-surface-200 text-surface-900 text-sm font-bold rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3 outline-none cursor-pointer shadow-sm min-w-[200px]"
        >
          <option value="today">Сегодня</option>
          <option value="this_week">Эта неделя</option>
          <option value="last_week">Прошлая неделя</option>
          <option value="this_month">Этот месяц</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-10 text-center animate-pulse duration-1000 bg-white rounded-3xl border border-surface-100">
           <div className="h-6 w-32 bg-surface-200 mx-auto rounded-full mb-4"></div>
           <p className="text-surface-400 font-bold">Сбор аналитики...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Продано букетов" value={data?.total_bouquets || 0} icon={Package} bg="bg-blue-50" color="text-blue-600" />
            <StatCard title="Общий доход" value={`${data?.total_income || 0} ₸`} icon={Activity} bg="bg-brand-50" color="text-brand-600" />
            <StatCard title="Себестоимость" value={`${data?.total_cost || 0} ₸`} icon={DollarSign} bg="bg-orange-50" color="text-orange-600" />
            <StatCard title="Чистая прибыль" value={`${data?.total_profit || 0} ₸`} icon={TrendingUp} bg="bg-green-50" color="text-green-600" />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-surface-100 lg:h-[450px]">
            <h3 className="text-xl font-bold mb-8 text-surface-800">Финансовые показатели (₸)</h3>
            <div className="h-72 lg:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                  <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                  <Bar dataKey="Доход" fill="#4f46e5" radius={[8, 8, 8, 8]} />
                  <Bar dataKey="Себестоимость" fill="#f97316" radius={[8, 8, 8, 8]} />
                  <Bar dataKey="Прибыль" fill="#16a34a" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, bg, color }: any) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-100 flex items-center space-x-5 card-hover transition-all">
      <div className={`p-4 rounded-2xl ${bg} ${color}`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-surface-500 font-bold text-sm uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-surface-900 mt-1">{value}</h3>
      </div>
    </div>
  );
}
