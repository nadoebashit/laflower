import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, flowersApi } from '../api/services';
import { Plus, Image as ImageIcon, Camera } from 'lucide-react';

export default function Expenses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [flowerId, setFlowerId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesApi.list,
  });

  const { data: flowersData } = useQuery({
    queryKey: ['flowers'],
    queryFn: flowersApi.list,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: { payload: any, file?: File }) => expensesApi.create(data.payload, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['flowers'] });
      // Reset form
      setShowForm(false);
      setFlowerId('');
      setQuantity('');
      setAmount('');
      setDescription('');
      setFile(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Ошибка при добавлении затрат');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    if (flowerId) {
      payload.flower_id = parseInt(flowerId);
      payload.quantity = parseInt(quantity);
    }
    if (amount) {
      payload.amount = parseFloat(amount);
    }
    if (description) {
      payload.description = description;
    }

    createExpenseMutation.mutate({ payload, file: file || undefined });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('ru-RU');
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/api/')) return url;
    if (url.startsWith('/static/')) return `/api${url}`;
    return url;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Затраты и списания</h1>
          <p className="text-surface-500 mt-1">Регистрация обсохших цветов и прочих затрат</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Добавить запись</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Новая запись о затратах / списании</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-2">Выберите цветок (если это списание)</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                  value={flowerId}
                  onChange={(e) => setFlowerId(e.target.value)}
                >
                  <option value="">-- Не выбрано (другие затраты) --</option>
                  {flowersData?.items.map(f => (
                    <option key={f.id} value={f.id}>{f.name} (Доступно: {f.stock_quantity})</option>
                  ))}
                </select>
              </div>

              {flowerId && (
                <div>
                  <label className="block text-sm font-semibold text-surface-800 mb-2">Количество (штук)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-2">Общая сумма потерь (Опционально)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Оставьте пустым для авто-расчета"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-800 mb-2">Прикрепить фото</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 rounded-xl border border-surface-200 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-800 mb-2">Описание / Причина</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: Обсохли розы на витрине..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-surface-600 hover:bg-surface-100 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50"
              >
                {createExpenseMutation.isPending ? 'Сохранение...' : 'Сохранить затрату'}
              </button>
            </div>
          </form>
        </div>
      )}

      {expensesLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expensesData?.items.map((exp: any) => (
            <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
              {exp.photo_url ? (
                <div className="h-48 w-full bg-surface-100 relative">
                  <img src={getImageUrl(exp.photo_url)} alt="Expense photo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 w-full bg-surface-50 flex flex-col items-center justify-center text-surface-400">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-sm font-medium">Нет фото</span>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    -{parseFloat(exp.amount).toLocaleString('ru-RU')} ₸
                  </span>
                  <span className="text-xs text-surface-500 font-medium">
                    {formatDate(exp.created_at)}
                  </span>
                </div>
                
                {exp.flower_id ? (
                  <h3 className="text-lg font-bold text-surface-900 mb-1">
                    Списание цветка (ID: {exp.flower_id})
                  </h3>
                ) : (
                  <h3 className="text-lg font-bold text-surface-900 mb-1">
                    Прочая затрата
                  </h3>
                )}
                
                {exp.quantity && (
                  <p className="text-sm text-surface-600 font-medium mb-2">
                    Количество: <span className="text-surface-900">{exp.quantity} шт.</span>
                  </p>
                )}
                
                {exp.description && (
                  <p className="text-sm text-surface-500 italic">
                    "{exp.description}"
                  </p>
                )}
              </div>
            </div>
          ))}
          {(!expensesData || expensesData.items.length === 0) && (
            <div className="col-span-full py-12 text-center text-surface-500 bg-white rounded-2xl border border-dashed border-surface-300">
              <Camera size={48} className="mx-auto mb-4 text-surface-300" />
              <p className="font-medium text-lg">Затрат пока не добавлено</p>
              <p className="text-sm mt-1">Здесь будут отображаться списания обсохших цветов и другие расходы</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
