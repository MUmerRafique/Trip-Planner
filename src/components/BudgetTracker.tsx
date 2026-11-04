import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  PlusCircle,
  Receipt,
  Trash2,
  DollarSign,
  BedDouble,
  Utensils,
  Ticket,
  Bus,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { TripItinerary, SpentExpense } from '../types';
import { addExpenseToTrip, deleteExpenseFromTrip } from '../lib/storage';

interface BudgetTrackerProps {
  trip: TripItinerary;
  onTripUpdated: (updatedTrip: TripItinerary) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trip, onTripUpdated }) => {
  const currency = trip.estimatedBudget?.currency || 'USD';
  const estimatedTotal = trip.estimatedBudget?.total || 0;

  const actualExpenses = trip.actualExpenses || [];
  const actualTotal = actualExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Category totals for actual expenses
  const actualByCategory = actualExpenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  // Form states for adding expense
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<SpentExpense['category']>('food');
  const [dayNumber, setDayNumber] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !description.trim()) return;

    const newExpense: SpentExpense = {
      id: 'exp_' + Date.now(),
      dayNumber,
      category,
      description: description.trim(),
      amount: val,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    const updated = addExpenseToTrip(trip.id, newExpense);
    if (updated) {
      onTripUpdated(updated);
      setDescription('');
      setAmount('');
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = deleteExpenseFromTrip(trip.id, expenseId);
    if (updated) {
      onTripUpdated(updated);
    }
  };

  const percentSpent = estimatedTotal > 0 ? Math.min(Math.round((actualTotal / estimatedTotal) * 100), 100) : 0;

  const categoriesConfig: {
    key: SpentExpense['category'];
    label: string;
    icon: React.ReactNode;
    estimated: number;
  }[] = [
    {
      key: 'accommodation',
      label: 'Accommodation',
      icon: <BedDouble className="w-4 h-4 text-purple-600" />,
      estimated: trip.estimatedBudget?.accommodation || 0,
    },
    {
      key: 'food',
      label: 'Food & Dining',
      icon: <Utensils className="w-4 h-4 text-amber-600" />,
      estimated: trip.estimatedBudget?.food || 0,
    },
    {
      key: 'activities',
      label: 'Activities & Sightseeing',
      icon: <Ticket className="w-4 h-4 text-sky-600" />,
      estimated: trip.estimatedBudget?.activities || 0,
    },
    {
      key: 'transportation',
      label: 'Transportation',
      icon: <Bus className="w-4 h-4 text-emerald-600" />,
      estimated: trip.estimatedBudget?.transportation || 0,
    },
    {
      key: 'shopping',
      label: 'Misc & Shopping',
      icon: <ShoppingBag className="w-4 h-4 text-rose-500" />,
      estimated: trip.estimatedBudget?.miscellaneous || 0,
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Budget & Expense Tracker</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Estimated budget created by AI vs. your real-time logged expenses.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? 'Close Logger' : 'Log New Expense'}</span>
        </button>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Estimated Budget</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {estimatedTotal.toLocaleString()} <span className="text-xs font-bold text-slate-500">{currency}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">AI generated calculation</p>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">Actual Logged</span>
          <p className="text-2xl font-extrabold text-teal-950 mt-1">
            {actualTotal.toLocaleString()} <span className="text-xs font-bold text-teal-700">{currency}</span>
          </p>
          <p className="text-[11px] text-teal-700 mt-1 font-medium">{actualExpenses.length} transaction(s)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Remaining</span>
          <p className={`text-2xl font-extrabold mt-1 ${estimatedTotal - actualTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {(estimatedTotal - actualTotal).toLocaleString()} <span className="text-xs font-bold">{currency}</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {estimatedTotal - actualTotal >= 0 ? 'Within budget' : 'Over estimated budget'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
          <span>Overall Budget Used ({percentSpent}%)</span>
          <span>{actualTotal.toLocaleString()} / {estimatedTotal.toLocaleString()} {currency}</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 90 ? 'bg-rose-500' : percentSpent > 70 ? 'bg-amber-500' : 'bg-teal-600'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>
      </div>

      {/* Log Expense Drawer / Form */}
      {isAdding && (
        <form onSubmit={handleAddExpense} className="p-5 rounded-2xl bg-slate-50 border border-teal-200 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>Record Actual Expense</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Currency: {currency}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch at Ramen Spot"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              >
                <option value="food">Food & Dining</option>
                <option value="activities">Activities</option>
                <option value="transportation">Transportation</option>
                <option value="accommodation">Accommodation</option>
                <option value="shopping">Shopping & Misc</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Day</label>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
              >
                {trip.days.map((d) => (
                  <option key={d.dayNumber} value={d.dayNumber}>
                    Day {d.dayNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-2xs"
            >
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Category Breakdown Progress Bars */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoriesConfig.map((cat) => {
            const spent = actualByCategory[cat.key] || 0;
            const est = cat.estimated;
            const catPercent = est > 0 ? Math.min(Math.round((spent / est) * 100), 100) : 0;

            return (
              <div key={cat.key} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    {cat.icon}
                    <span>{cat.label}</span>
                  </div>
                  <div className="text-right font-semibold">
                    <span className="text-slate-900 font-bold">{spent.toLocaleString()}</span> /{' '}
                    <span className="text-slate-500">{est.toLocaleString()} {currency}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${catPercent > 100 ? 'bg-rose-500' : 'bg-teal-600'}`}
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logged Expenses List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Logged Transactions</h3>

        {actualExpenses.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500 font-medium">
            No expenses logged yet. Click "Log New Expense" above to track actual spending during your trip.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {actualExpenses.map((exp) => (
              <div key={exp.id} className="p-3 sm:px-4 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                    Day {exp.dayNumber}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{exp.description}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{exp.category} &bull; {exp.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900">
                    {exp.amount.toLocaleString()} {currency}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
