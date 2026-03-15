import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { flowersApi, bouquetsApi } from '../api/services';
import type { Flower } from '../api/services';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export default function Sale() {
  const { data: flowersResponse, isLoading } = useQuery({
    queryKey: ['flowers'],
    queryFn: flowersApi.list,
  });

  const [cart, setCart] = useState<{flowerId: number, quantity: number}[]>([]);
  const flowers = flowersResponse?.items || [];

  const bouquetMutation = useMutation({
    mutationFn: bouquetsApi.create,
    onSuccess: () => {
      alert('Букет успешно продан!');
      setCart([]);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Ошибка продажи букета');
    }
  });

  const addToCart = (flower: Flower) => {
    setCart(prev => {
      const existing = prev.find(item => item.flowerId === flower.id);
      if (existing) {
        if (existing.quantity >= flower.stock_quantity) return prev;
        return prev.map(item => item.flowerId === flower.id ? {...item, quantity: item.quantity + 1} : item);
      }
      if (flower.stock_quantity <= 0) return prev;
      return [...prev, { flowerId: flower.id, quantity: 1 }];
    });
  };

  const updateQuantity = (flowerId: number, delta: number) => {
     setCart(prev => prev.map(item => {
       if (item.flowerId === flowerId) {
         const flower = flowers.find(f => f.id === flowerId);
         const maxStock = flower?.stock_quantity || 0;
         const newQ = item.quantity + delta;
         if (newQ > 0 && newQ <= maxStock) {
           return { ...item, quantity: newQ };
         }
       }
       return item;
     }));
  };

  const removeFromCart = (flowerId: number) => {
     setCart(prev => prev.filter(item => item.flowerId !== flowerId));
  };

  const calculateSalePrice = (buy: string, mk: string) => {
     const b = parseFloat(buy) || 0;
     const m = parseFloat(mk) || 0;
     return b + b * (m / 100);
  };

  const totals = useMemo(() => {
    let cost = 0;
    let price = 0;
    cart.forEach(item => {
      const flower = flowers.find(f => f.id === item.flowerId);
      if (flower) {
        cost += parseFloat(flower.purchase_price) * item.quantity;
        price += calculateSalePrice(flower.purchase_price, flower.markup_percent) * item.quantity;
      }
    });
    return { cost, price, profit: price - cost };
  }, [cart, flowers]);

  const handleSale = () => {
     if (cart.length === 0) return;
     bouquetMutation.mutate({ items: cart.map(i => ({ flower_id: i.flowerId, quantity: i.quantity })) });
  };

  if (isLoading) return <div className="p-8 text-center text-surface-500 font-medium animate-pulse">Загрузка склада...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-100 mb-6">
          <h2 className="text-3xl font-extrabold text-surface-900 mb-2">Цветы</h2>
          <p className="text-surface-500 font-medium">Выберите цветы для составления букета</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {flowers.map(flower => (
            <div key={flower.id} onClick={() => addToCart(flower)}
                 className={`bg-white p-5 rounded-3xl shadow-sm border ${flower.stock_quantity > 0 ? 'border-surface-200 cursor-pointer card-hover hover:border-brand-300' : 'border-red-100 opacity-60 cursor-not-allowed'}`}>
               <div className="flex justify-between items-start mb-4">
                 <h4 className="font-bold text-surface-900 text-lg leading-tight">{flower.name}</h4>
                 <span className={`text-xs font-bold px-2 py-1 rounded-lg ${flower.stock_quantity > 0 ? 'bg-surface-100 text-surface-600' : 'bg-red-50 text-red-600'}`}>
                    Остаток: {flower.stock_quantity}
                 </span>
               </div>
               <div className="mt-2 text-brand-600 font-extrabold text-xl">
                 {calculateSalePrice(flower.purchase_price, flower.markup_percent).toFixed(2)} ₸
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-surface-100 lg:sticky lg:top-8 flex flex-col lg:h-[calc(100vh-4rem)] max-h-[80vh] lg:max-h-none">
          <div className="flex items-center space-x-3 pb-4 border-b border-surface-100 mb-4">
             <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
               <ShoppingCart size={24} />
             </div>
             <h3 className="text-2xl font-extrabold text-surface-900">Новый Букет</h3>
          </div>

          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {cart.length === 0 ? (
               <div className="text-center text-surface-400 py-10 font-medium">
                 Корзина пуста. Добавьте цветы из списка.
               </div>
            ) : (
              cart.map(item => {
                const flower = flowers.find(f => f.id === item.flowerId);
                if (!flower) return null;
                const price = calculateSalePrice(flower.purchase_price, flower.markup_percent);
                return (
                  <div key={item.flowerId} className="flex flex-col bg-surface-50 p-4 rounded-2xl border border-surface-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-surface-800">{flower.name}</span>
                      <span className="font-bold text-brand-600">{(price * item.quantity).toFixed(2)} ₸</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-white rounded-lg shadow-sm w-max overflow-hidden border border-surface-200">
                        <button onClick={() => updateQuantity(item.flowerId, -1)} className="p-2 text-surface-500 hover:bg-surface-100 hover:text-brand-600 transition-colors"><Minus size={14}/></button>
                        <span className="px-4 font-bold text-sm text-surface-900 w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.flowerId, 1)} className="p-2 text-surface-500 hover:bg-surface-100 hover:text-brand-600 transition-colors"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.flowerId)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="pt-6 border-t border-surface-200 mt-auto space-y-3">
             <div className="flex justify-between text-surface-500 font-medium text-sm">
               <span>Себестоимость:</span>
               <span>{totals.cost.toFixed(2)} ₸</span>
             </div>
             <div className="flex justify-between text-green-600 font-bold text-sm">
               <span>Ожидаемая прибыль:</span>
               <span>{totals.profit.toFixed(2)} ₸</span>
             </div>
             <div className="flex justify-between items-center pt-2">
               <span className="text-xl font-extrabold text-surface-900">Итого:</span>
               <span className="text-3xl font-extrabold text-brand-600">{totals.price.toFixed(2)} ₸</span>
             </div>
             <button
               disabled={cart.length === 0 || bouquetMutation.isPending}
               onClick={handleSale}
               className="w-full py-4 mt-6 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95 flex justify-center items-center"
             >
               {bouquetMutation.isPending ? 'Проведение...' : 'Оформить продажу'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
