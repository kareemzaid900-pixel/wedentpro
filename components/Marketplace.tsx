
import React from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Filter, Search, Clock, Info, CheckCircle, ShoppingBag } from 'lucide-react';

const Marketplace: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Marketplace</h2>
          <p className="text-slate-500">Buy and sell used dental equipment.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-900"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 bg-white">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PRODUCTS.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
               <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
               <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-700">
                 {product.condition}
               </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-2">
                   <span className="text-xs text-teal-600 font-semibold uppercase tracking-wider">{product.category}</span>
                   <h3 className="font-bold text-slate-800 text-lg leading-tight mt-1">{product.title}</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-auto mb-4">${product.price.toLocaleString()}</p>
              
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2 mt-auto">
                <button className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-sm font-semibold">
                    <Clock size={16} /> Book 1-hour consultation
                </button>
                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-semibold">
                        <CheckCircle size={16} /> Final Buy
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold" title="More Info">
                        <Info size={16} />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
