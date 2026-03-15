import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Ошибка авторизации. Проверьте данные.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-50 px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LaFlower
          </h1>
          <p className="text-surface-500 font-medium">Добро пожаловать в систему</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-surface-800 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all shadow-sm"
              placeholder="admin@flowers.com"
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
            disabled={loginMutation.isPending}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
