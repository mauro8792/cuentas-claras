"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Wallet,
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  MoreVertical,
  Users,
  UserPlus,
  Mail,
  Crown,
  Copy,
  Check,
  Link2
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useWalletSocket } from "@/hooks/useWalletSocket";
import { Navbar } from "@/components/ui/Navbar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Modal } from "@/components/ui/Modal";
import { useWalletStore } from "@/stores/wallet.store";
import { PersonalExpense, ExpenseCategory, Beneficiary } from "@/types";
import { 
  formatCurrency, 
  formatRelativeDate, 
  getMonthName,
  getMonthsOptions,
  getYearsOptions,
  getTodayISO,
  getCurrentMonthYear
} from "@/lib/date-utils";

export default function WalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  
  // Conectar al WebSocket para actualizaciones en tiempo real
  useWalletSocket(walletId);
  
  const { 
    currentWallet,
    expenses,
    categories,
    currencies,
    beneficiaries,
    summary,
    isLoading,
    selectedMonth,
    selectedYear,
    fetchWallet,
    fetchExpenses,
    fetchCategories,
    fetchCurrencies,
    fetchBeneficiaries,
    fetchSummary,
    createExpense,
    deleteExpense,
    createBeneficiary,
    deleteBeneficiary,
    inviteMember,
    removeMember,
    setSelectedMonth,
    setSelectedYear
  } = useWalletStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showBeneficiariesModal, setShowBeneficiariesModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  // Filtros y paginación
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const EXPENSES_LIMIT = 10;

  // Form state
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodayISO());
  const [expenseType, setExpenseType] = useState<"FIXED" | "VARIABLE">("VARIABLE");
  const [expenseCurrency, setExpenseCurrency] = useState("ARS");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseBeneficiary, setExpenseBeneficiary] = useState<string>("");

  // Beneficiary form
  const [newBeneficiaryName, setNewBeneficiaryName] = useState("");
  const [newBeneficiaryIcon, setNewBeneficiaryIcon] = useState("👤");

  useEffect(() => {
    if (user && walletId) {
      fetchWallet(walletId);
      fetchCategories();
      fetchCurrencies();
      fetchBeneficiaries(walletId);
    }
  }, [user, walletId]);

  useEffect(() => {
    if (currentWallet) {
      setExpenseCurrency(currentWallet.currency);
      fetchExpenses(walletId, selectedMonth, selectedYear);
      fetchSummary(walletId, selectedMonth, selectedYear);
    }
  }, [currentWallet, selectedMonth, selectedYear, walletId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription || !expenseCategory) {
      toast.error("Completá todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense(walletId, {
        amount: parseFloat(expenseAmount),
        currency: expenseCurrency,
        description: expenseDescription,
        date: expenseDate,
        type: expenseType,
        categoryId: expenseCategory,
        beneficiaryId: expenseBeneficiary || undefined,
      });
      toast.success("¡Gasto registrado!");
      setShowAddModal(false);
      resetForm();
      // Refresh summary
      fetchSummary(walletId, selectedMonth, selectedYear);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrar gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeneficiaryName.trim()) {
      toast.error("Ingresá un nombre");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBeneficiary(walletId, {
        name: newBeneficiaryName.trim(),
        icon: newBeneficiaryIcon,
      });
      toast.success("¡Beneficiario agregado!");
      setNewBeneficiaryName("");
      setNewBeneficiaryIcon("👤");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    if (!confirm("¿Eliminar este beneficiario?")) return;
    
    try {
      await deleteBeneficiary(walletId, beneficiaryId);
      toast.success("Beneficiario eliminado");
    } catch (error: any) {
      toast.error("Error al eliminar");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Ingresá un email");
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMember(walletId, inviteEmail.trim());
      toast.success("¡Miembro invitado!");
      setInviteEmail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al invitar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("¿Quitar este miembro de la billetera?")) return;
    
    try {
      await removeMember(walletId, memberId);
      toast.success("Miembro removido");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al remover");
    }
  };

  const copyInviteLink = async () => {
    if (!currentWallet?.inviteCode) return;
    
    const link = `${window.location.origin}/wallets/join/${currentWallet.inviteCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("¡Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores que no soportan clipboard
      toast.error("No se pudo copiar");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    
    try {
      await deleteExpense(walletId, expenseId);
      toast.success("Gasto eliminado");
      fetchSummary(walletId, selectedMonth, selectedYear);
    } catch (error: any) {
      toast.error("Error al eliminar");
    }
  };

  const resetForm = () => {
    setExpenseAmount("");
    setExpenseDescription("");
    setExpenseDate(getTodayISO());
    setExpenseType("VARIABLE");
    setExpenseCategory("");
    setExpenseBeneficiary("");
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code);
  };

  // Filtrar gastos por categoría
  const filteredExpenses = filterCategory
    ? expenses.filter(e => e.categoryId === filterCategory)
    : expenses;

  // Agrupar gastos por día (usando solo la parte de fecha, ignorando timezone)
  const groupExpensesByDay = (expensesList: PersonalExpense[]) => {
    const groups: { [key: string]: { label: string; expenses: PersonalExpense[] } } = {};
    
    // Obtener fecha de hoy y ayer en formato YYYY-MM-DD (local)
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    expensesList.forEach((expense) => {
      // Extraer solo la parte de fecha (YYYY-MM-DD) del string ISO
      // Esto evita problemas de timezone
      const dateStr = expense.date.toString();
      const dateKey = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
      
      if (!groups[dateKey]) {
        let label = '';
        
        if (dateKey === todayKey) {
          label = 'Hoy';
        } else if (dateKey === yesterdayKey) {
          label = 'Ayer';
        } else {
          // Crear fecha desde el string para formatear (agregamos hora noon para evitar timezone issues)
          const [year, month, day] = dateKey.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day, 12, 0, 0);
          label = displayDate.toLocaleDateString('es-AR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short' 
          });
          // Capitalizar primera letra
          label = label.charAt(0).toUpperCase() + label.slice(1);
        }
        
        groups[dateKey] = { label, expenses: [] };
      }
      
      groups[dateKey].expenses.push(expense);
    });

    // Ordenar por fecha descendente
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([_, value]) => value);
  };

  // Aplicar límite y agrupar
  const expensesToShow = showAllExpenses 
    ? filteredExpenses 
    : filteredExpenses.slice(0, EXPENSES_LIMIT);
  
  const groupedExpenses = groupExpensesByDay(expensesToShow);
  const hasMoreExpenses = filteredExpenses.length > EXPENSES_LIMIT;

  // Obtener categorías únicas de los gastos del mes
  const usedCategories = categories.filter(cat => 
    expenses.some(e => e.categoryId === cat.id)
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!currentWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-dark-500" />
          <p className="text-dark-400">Billetera no encontrada</p>
          <Link href="/wallets" className="btn btn-primary mt-4">
            Volver a billeteras
          </Link>
        </div>
      </div>
    );
  }

  const walletCurrency = getCurrencyInfo(currentWallet.currency);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <BottomNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/wallets" 
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis billeteras
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              {currentWallet.name}
            </h1>
            <p className="text-dark-400 mt-1">
              {walletCurrency?.flag} {currentWallet.currency}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Botón Miembros */}
            <button
              onClick={() => setShowMembersModal(true)}
              className="btn btn-secondary"
              title="Invitar miembros"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Miembros</span>
              {currentWallet.members && currentWallet.members.length > 1 && (
                <span className="bg-emerald-500 text-white text-xs rounded-full px-1.5 ml-1">
                  {currentWallet.members.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowBeneficiariesModal(true)}
              className="btn btn-secondary"
              title="Gestionar beneficiarios"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Beneficiarios</span>
              {beneficiaries.length > 0 && (
                <span className="bg-violet-500 text-white text-xs rounded-full px-1.5 ml-1">
                  {beneficiaries.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-5 h-5" />
              Agregar gasto
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6 bg-dark-800/50 rounded-xl p-3">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="font-semibold text-lg capitalize">
              {getMonthName(selectedMonth)} {selectedYear}
            </div>
          </div>
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card bg-violet-500/10 border border-violet-500/20 p-4">
              <p className="text-xs text-dark-400 mb-1">Total</p>
              <p className="text-xl font-bold text-violet-400">
                {formatCurrency(summary.total, summary.currency)}
              </p>
            </div>
            <div className="card bg-blue-500/10 border border-blue-500/20 p-4">
              <p className="text-xs text-dark-400 mb-1">Fijos</p>
              <p className="text-lg font-semibold text-blue-400">
                {formatCurrency(summary.totalFixed, summary.currency)}
              </p>
            </div>
            <div className="card bg-orange-500/10 border border-orange-500/20 p-4">
              <p className="text-xs text-dark-400 mb-1">Variables</p>
              <p className="text-lg font-semibold text-orange-400">
                {formatCurrency(summary.totalVariable, summary.currency)}
              </p>
            </div>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="card bg-dark-800/50 border border-dark-700 p-4 text-left hover:border-violet-500/30 transition-colors"
            >
              <p className="text-xs text-dark-400 mb-1">vs mes anterior</p>
              <p className={`text-lg font-semibold flex items-center gap-1 ${
                (summary.comparison?.percentageChange || 0) <= 0 
                  ? 'text-emerald-400' 
                  : 'text-red-400'
              }`}>
                {(summary.comparison?.percentageChange || 0) <= 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {summary.comparison?.percentageChange || 0}%
              </p>
            </button>
          </div>
        )}

        {/* Category Breakdown */}
        {summary && summary.byCategory.length > 0 && (
          <div className="card mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-400" />
              Por categoría
            </h3>
            <div className="space-y-3">
              {summary.byCategory.slice(0, 5).map((cat) => (
                <div key={cat.categoryId} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${cat.categoryColor}20` }}
                  >
                    {cat.categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium truncate">{cat.categoryName}</span>
                      <span className="text-sm text-dark-400">{cat.percentage}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.categoryColor 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {formatCurrency(cat.total, summary.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Gastos del mes
              {filteredExpenses.length > 0 && (
                <span className="text-sm text-dark-400 font-normal">
                  ({filteredExpenses.length})
                </span>
              )}
            </h3>
          </div>

          {/* Filtros por categoría */}
          {usedCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => {
                  setFilterCategory(null);
                  setShowAllExpenses(false);
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !filterCategory
                    ? 'bg-violet-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                Todos
              </button>
              {usedCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFilterCategory(filterCategory === cat.id ? null : cat.id);
                    setShowAllExpenses(false);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filterCategory === cat.id
                      ? 'text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                  style={filterCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="card text-center py-8">
              <Wallet className="w-10 h-10 mx-auto mb-3 text-dark-500" />
              <p className="text-dark-400">No hay gastos este mes</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary mt-4"
              >
                <Plus className="w-4 h-4" />
                Agregar primer gasto
              </button>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-dark-400">No hay gastos en esta categoría</p>
              <button
                onClick={() => setFilterCategory(null)}
                className="btn btn-secondary mt-4"
              >
                Ver todos los gastos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedExpenses.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  {/* Separador de día */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px bg-dark-700 flex-1" />
                    <span className="text-xs text-dark-400 font-medium uppercase tracking-wider">
                      {group.label}
                    </span>
                    <div className="h-px bg-dark-700 flex-1" />
                  </div>
                  
                  {/* Gastos del día */}
                  {group.expenses.map((expense) => (
                    <ExpenseItem 
                      key={expense.id} 
                      expense={expense}
                      walletCurrency={currentWallet.currency}
                      onDelete={() => handleDeleteExpense(expense.id)}
                    />
                  ))}
                </div>
              ))}

              {/* Botón "Ver más" */}
              {hasMoreExpenses && !showAllExpenses && (
                <button
                  onClick={() => setShowAllExpenses(true)}
                  className="w-full py-3 text-center text-violet-400 hover:text-violet-300 text-sm font-medium bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                >
                  Ver {filteredExpenses.length - EXPENSES_LIMIT} gastos más
                </button>
              )}
              
              {/* Botón "Ver menos" cuando se muestran todos */}
              {showAllExpenses && hasMoreExpenses && (
                <button
                  onClick={() => setShowAllExpenses(false)}
                  className="w-full py-3 text-center text-dark-400 hover:text-dark-300 text-sm font-medium bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors"
                >
                  Mostrar menos
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Agregar gasto"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          {/* Monto y Moneda */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Monto *
            </label>
            <div className="grid grid-cols-[115px_1fr] gap-2">
              <select
                value={expenseCurrency}
                onChange={(e) => setExpenseCurrency(e.target.value)}
                className="input"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input w-full"
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              className="input"
              placeholder="¿En qué gastaste?"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Categoría * {!expenseCategory && <span className="text-red-400 text-xs">(seleccioná una)</span>}
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setExpenseCategory(cat.id)}
                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center ${
                    expenseCategory === cat.id
                      ? 'border-violet-500 bg-violet-500/20 scale-105'
                      : 'border-dark-700 hover:border-dark-500 hover:bg-dark-700/50'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs mt-1 truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExpenseType("FIXED")}
                className={`p-3 rounded-xl border-2 transition-all ${
                  expenseType === "FIXED"
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <div className="text-sm font-medium">Fijo</div>
                <div className="text-xs text-dark-400">Alquiler, cuotas...</div>
              </button>
              <button
                type="button"
                onClick={() => setExpenseType("VARIABLE")}
                className={`p-3 rounded-xl border-2 transition-all ${
                  expenseType === "VARIABLE"
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <div className="text-sm font-medium">Variable</div>
                <div className="text-xs text-dark-400">Comida, salidas...</div>
              </button>
            </div>
          </div>

          {/* Beneficiario (opcional) */}
          {beneficiaries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                ¿Para quién? <span className="text-dark-500">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExpenseBeneficiary("")}
                  className={`px-3 py-2 rounded-xl border-2 transition-all text-sm ${
                    !expenseBeneficiary
                      ? 'border-violet-500 bg-violet-500/20'
                      : 'border-dark-700 hover:border-dark-500'
                  }`}
                >
                  Ninguno
                </button>
                {beneficiaries.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setExpenseBeneficiary(b.id)}
                    className={`px-3 py-2 rounded-xl border-2 transition-all text-sm flex items-center gap-1.5 ${
                      expenseBeneficiary === b.id
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Fecha
            </label>
            <input
              type="date"
              className="input"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          {/* Validation message */}
          {(!expenseAmount || !expenseDescription || !expenseCategory) && (
            <p className="text-xs text-amber-400 bg-amber-400/10 p-2 rounded-lg">
              ⚠️ Completá todos los campos marcados con *
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !expenseAmount || !expenseDescription || !expenseCategory}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title={`Resumen de ${getMonthName(selectedMonth)}`}
      >
        {summary && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-800 rounded-xl p-4">
                <p className="text-sm text-dark-400">Este mes</p>
                <p className="text-2xl font-bold text-violet-400">
                  {formatCurrency(summary.total, summary.currency)}
                </p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4">
                <p className="text-sm text-dark-400">Mes anterior</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.comparison?.previousMonth || 0, summary.currency)}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              (summary.comparison?.percentageChange || 0) <= 0
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {(summary.comparison?.percentageChange || 0) <= 0 ? (
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold ${
                  (summary.comparison?.percentageChange || 0) <= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}>
                  {(summary.comparison?.percentageChange || 0) <= 0 ? 'Gastaste menos' : 'Gastaste más'}
                </span>
              </div>
              <p className="text-sm text-dark-400 mt-1">
                {Math.abs(summary.comparison?.percentageChange || 0)}% respecto al mes anterior
              </p>
            </div>

            {summary.byCategory.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Desglose por categoría</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {summary.byCategory.map((cat) => (
                    <div 
                      key={cat.categoryId}
                      className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.categoryIcon}</span>
                        <span className="text-sm">{cat.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(cat.total, summary.currency)}
                        </p>
                        <p className="text-xs text-dark-400">{cat.count} gastos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Beneficiaries Modal */}
      <Modal
        isOpen={showBeneficiariesModal}
        onClose={() => setShowBeneficiariesModal(false)}
        title="Beneficiarios"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-400">
            Agregá beneficiarios para asociar gastos a mascotas, hijos, auto, etc. 
            Así podés sacar reportes más fácil.
          </p>

          {/* Add new beneficiary */}
          <form onSubmit={handleAddBeneficiary} className="space-y-3">
            {/* Icono */}
            <div>
              <label className="block text-sm text-dark-400 mb-1">Icono</label>
              <div className="flex flex-wrap gap-2">
                {["👤", "🐕", "🐈", "🐾", "👶", "👧", "👦", "🚗", "🏠", "❤️", "🌟"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewBeneficiaryIcon(emoji)}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                      newBeneficiaryIcon === emoji
                        ? 'bg-violet-500/30 border-2 border-violet-500 scale-110'
                        : 'bg-dark-700 border-2 border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm text-dark-400 mb-1">Nombre</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Ej: Pepe, Tomás, Auto..."
                value={newBeneficiaryName}
                onChange={(e) => setNewBeneficiaryName(e.target.value)}
                maxLength={50}
              />
            </div>

            {/* Botón agregar */}
            <button
              type="submit"
              disabled={isSubmitting || !newBeneficiaryName.trim()}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Agregar beneficiario
                </>
              )}
            </button>
          </form>

          {/* Beneficiaries list */}
          {beneficiaries.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-10 h-10 mx-auto mb-3 text-dark-500" />
              <p className="text-dark-400 text-sm">
                No tenés beneficiarios aún
              </p>
              <p className="text-dark-500 text-xs mt-1">
                Agregá uno para asociar gastos
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {beneficiaries.map((b) => (
                <div 
                  key={b.id}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.icon}</span>
                    <span className="font-medium">{b.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBeneficiary(b.id)}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => setShowBeneficiariesModal(false)}
              className="btn btn-secondary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title="Miembros de la billetera"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-400">
            Compartí el link para que otros se unan a esta billetera.
          </p>

          {/* Invite link */}
          {currentWallet?.inviteCode && (
            <div className="bg-dark-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-dark-300">
                <Link2 className="w-4 h-4" />
                Link de invitación
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  className="input flex-1 text-sm bg-dark-700 cursor-text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/wallets/join/${currentWallet.inviteCode}`}
                />
                <button
                  onClick={copyInviteLink}
                  className={`btn px-4 ${copied ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-dark-500">
                Cualquier persona con este link puede unirse
              </p>
            </div>
          )}

          {/* Members list */}
          <div>
            <h4 className="text-sm font-medium text-dark-300 mb-2">
              Miembros actuales
            </h4>
            {(!currentWallet?.members || currentWallet.members.length === 0) ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 mx-auto mb-2 text-dark-500" />
                <p className="text-dark-400 text-sm">Solo vos por ahora</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentWallet.members.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.user?.name || 'Usuario'}
                          {member.role === 'OWNER' && (
                            <Crown className="w-4 h-4 text-amber-400" />
                          )}
                        </p>
                        <p className="text-sm text-dark-400">{member.user?.email}</p>
                      </div>
                    </div>
                    {member.role !== 'OWNER' && member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowMembersModal(false)}
              className="btn btn-secondary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ExpenseItem({ 
  expense, 
  walletCurrency,
  onDelete 
}: { 
  expense: PersonalExpense;
  walletCurrency: string;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="card p-3 flex items-center gap-3 group">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${expense.category?.color || '#6366f1'}20` }}
      >
        {expense.category?.icon || '📦'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{expense.description}</p>
          {expense.beneficiary && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 flex items-center gap-1">
              {expense.beneficiary.icon} {expense.beneficiary.name}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            expense.type === 'FIXED' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-orange-500/20 text-orange-400'
          }`}>
            {expense.type === 'FIXED' ? 'Fijo' : 'Variable'}
          </span>
        </div>
        <p className="text-sm text-dark-400">
          {formatRelativeDate(expense.date)} • {expense.category?.name}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {formatCurrency(expense.amount, expense.currency)}
        </p>
        {expense.currency !== walletCurrency && (
          <p className="text-xs text-dark-500">
            {expense.currency}
          </p>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-dark-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-dark-400" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 py-1 min-w-32">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-dark-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

