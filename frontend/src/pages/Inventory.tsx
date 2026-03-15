import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowersApi } from '../api/services';
import type { Flower } from '../api/services';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', purchase_price: '', markup_percent: '', stock_quantity: '' });
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['flowers'],
    queryFn: flowersApi.list,
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => editingId ? flowersApi.update(editingId, payload) : flowersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      setIsOpen(false);
      resetForm();
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Ошибка сохранения'),
  });

  const deleteMutation = useMutation({
    mutationFn: flowersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flowers'] }),
    onError: (err: any) => alert(err.response?.data?.detail || 'Ошибка удаления'),
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', purchase_price: '', markup_percent: '', stock_quantity: '' });
  };

  const handleEdit = (flower: Flower) => {
    setEditingId(flower.id);
    setFormData({
      name: flower.name,
      purchase_price: flower.purchase_price,
      markup_percent: flower.markup_percent,
      stock_quantity: String(flower.stock_quantity),
    });
    setIsOpen(true);
  };

  const calculateSalePrice = (buy: string, mk: string) => {
     const b = parseFloat(buy) || 0;
     const m = parseFloat(mk) || 0;
     return (b + b * (m / 100)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-surface-100 gap-4">
        <h2 className="text-3xl font-extrabold text-surface-900">Склад Цветов</h2>
        {(isAdmin || user.role === 'employee') && (
           <button
             onClick={() => { resetForm(); setIsOpen(true); }}
             className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full font-bold shadow-md transition-all card-hover w-full sm:w-auto justify-center"
           >
             <PlusCircle size={20} />
             <span>Добавить цветок</span>
           </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4 pt-10 px-4">
             <div className="h-4 bg-surface-200 rounded w-full"></div>
             <div className="h-4 bg-surface-200 rounded w-3/4"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-surface-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-surface-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Название</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Закупка</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Наценка</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Цена продажи</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-surface-500 uppercase tracking-wider">Остаток</th>
                  {isAdmin && <th className="px-6 py-4 text-right text-xs font-bold text-surface-500 uppercase tracking-wider">Действия</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-100">
                {data?.items.map((flower) => (
                  <tr key={flower.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-surface-900">{flower.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-surface-600">{flower.purchase_price} ₸</td>
                    <td className="px-6 py-4 whitespace-nowrap text-surface-600">{flower.markup_percent} %</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-600">
                      {calculateSalePrice(flower.purchase_price, flower.markup_percent)} ₸
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${flower.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                         {flower.stock_quantity} шт.
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(flower)} className="text-brand-600 hover:text-brand-900 mr-4 transition-colors">
                           <Edit size={18} />
                        </button>
                        <button onClick={() => { if(confirm('Удалить?')) deleteMutation.mutate(flower.id); }} className="text-red-500 hover:text-red-700 transition-colors">
                           <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!data?.items || data.items.length === 0) && (
              <div className="p-10 text-center text-surface-500 font-medium">Склад пуст</div>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-surface-900">{editingId ? 'Редактировать цветок' : 'Добавить цветок'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-1">Название</label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-semibold text-surface-800 mb-1">Закупка (₸)</label>
                   <input required type="number" step="0.01" min="0.01" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                          value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-surface-800 mb-1">Наценка (%)</label>
                   <input required type="number" step="0.01" min="0" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                          value={formData.markup_percent} onChange={e => setFormData({...formData, markup_percent: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-1">Остаток (шт.)</label>
                <input required type="number" min="0" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                       value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-surface-100 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-surface-600 hover:bg-surface-100 rounded-xl font-semibold transition-colors">Отмена</button>
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-bold shadow-md transition-colors disabled:opacity-50">
                   Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
