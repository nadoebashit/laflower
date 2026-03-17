import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/services';
import { UserPlus } from 'lucide-react';

export default function Employees() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createEmployeeMutation = useMutation({
    mutationFn: authApi.createEmployee,
    onSuccess: () => {
      setSuccess('Сотрудник успешно создан!');
      setEmail('');
      setPassword('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Ошибка создания сотрудщика. Проверьте данные.');
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    createEmployeeMutation.mutate({ email, password });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-surface-200">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Сотрудники</h1>
          <p className="text-surface-500 mt-1">Добавление сотрудников для вашего бизнеса</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-surface-200 max-w-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <UserPlus size={24} />
          </div>
          <h2 className="text-xl font-bold text-surface-900">Создать сотрудника</h2>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
             {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-6 bg-green-100 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
             {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-surface-800 mb-2">Email сотрудника</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
              placeholder="employee@flowers.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-800 mb-2">Пароль</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={createEmployeeMutation.isPending}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createEmployeeMutation.isPending ? 'Загрузка...' : 'Добавить сотрудника'}
          </button>
        </form>
      </div>
    </div>
  );
}
