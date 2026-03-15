import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { bouquetsApi, flowersApi } from '../api/services';

export default function History() {
  const { data: bouquetsResp, isLoading: bLoad } = useQuery({
    queryKey: ['bouquets'],
    queryFn: bouquetsApi.list,
  });

  const { data: flowersResp, isLoading: fLoad } = useQuery({
    queryKey: ['flowers'],
    queryFn: flowersApi.list,
  });

  if (bLoad || fLoad) return <div className="p-10 animate-pulse bg-white rounded-3xl h-64 shadow-sm border border-surface-100 flex items-center justify-center text-surface-400 font-bold">Получение данных...</div>;

  const getFlowerName = (id: number) => {
    return flowersResp?.items.find(f => f.id === id)?.name || 'Неизвестный цветок';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-extrabold text-surface-900">История продаж</h2>
        <span className="bg-brand-50 text-brand-700 px-4 py-2 text-sm font-bold rounded-xl shadow-sm">
           Всего чеков: {bouquetsResp?.total || 0}
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200">
            <thead className="bg-surface-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Дата и время</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Состав букета</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Себестоимость</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Цена</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Прибыль</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-surface-100">
              {bouquetsResp?.items.map((b) => (
                <tr key={b.id} className="hover:bg-brand-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-surface-900 font-medium">
                    {format(new Date(b.created_at), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap max-w-sm">
                      {b.items.map(item => (
                        <span key={item.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-surface-100 text-surface-700 border border-surface-200">
                           {getFlowerName(item.flower_id)} <span className="text-brand-600 ml-1">x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-surface-500">{b.total_cost} ₸</td>
                  <td className="px-6 py-5 whitespace-nowrap font-bold text-surface-900">{b.total_price} ₸</td>
                  <td className="px-6 py-5 whitespace-nowrap font-bold text-green-600">+{b.total_profit} ₸</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!bouquetsResp?.items || bouquetsResp.items.length === 0) && (
            <div className="p-10 text-center text-surface-500 font-medium text-lg">
              История пока пуста. Проведите первую продажу.
            </div>
        )}
      </div>
    </div>
  );
}
