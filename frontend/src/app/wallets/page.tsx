"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Wallet,
  ChevronRight,
  Loader2,
  PiggyBank,
  Users as UsersIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/Navbar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Modal } from "@/components/ui/Modal";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useWalletStore } from "@/stores/wallet.store";
import { Wallet as WalletType, Currency } from "@/types";
import { formatCurrency, getCurrentMonthYear, getMonthName } from "@/lib/date-utils";

export default function WalletsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    wallets, 
    currencies,
    isLoading, 
    fetchWallets, 
    fetchCurrencies,
    createWallet 
  } = useWalletStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("ARS");
  const [walletType, setWalletType] = useState<"PERSONAL" | "SHARED">("PERSONAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { month, year } = getCurrentMonthYear();

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchCurrencies();
    }
  }, [user, fetchWallets, fetchCurrencies]);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    setIsSubmitting(true);
    try {
      await createWallet(newWalletName.trim(), walletType, selectedCurrency);
      toast.success("¡Billetera creada!");
      setShowCreateModal(false);
      setNewWalletName("");
      setSelectedCurrency("ARS");
      setWalletType("PERSONAL");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear billetera");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrencyInfo = (code: string): Currency | undefined => {
    return currencies.find(c => c.code === code);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <BottomNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            Mis Billeteras
          </h1>
          <p className="text-dark-400">
            {getMonthName(month).charAt(0).toUpperCase() + getMonthName(month).slice(1)} {year} • Controlá tus gastos personales
          </p>
        </div>

        {/* Create button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            Nueva billetera
          </button>
        </div>

        {/* Wallets List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : wallets.length === 0 ? (
            <div className="card text-center py-12">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-dark-500" />
              <h3 className="text-lg font-medium mb-2">No tenés billeteras</h3>
              <p className="text-dark-400 mb-6">
                Creá una billetera para empezar a registrar tus gastos
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary mx-auto"
              >
                <Plus className="w-5 h-5" />
                Crear mi primera billetera
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {wallets.map((wallet: WalletType) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  currencyInfo={getCurrencyInfo(wallet.currency)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Wallet Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear billetera"
      >
        <form onSubmit={handleCreateWallet} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="input flex-1 pr-12"
                placeholder="Ej: Gastos Personales 💰"
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2">
                <EmojiPicker 
                  onEmojiSelect={(emoji) => setNewWalletName(prev => prev + emoji)}
                />
              </div>
            </div>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Moneda principal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {currencies.slice(0, 6).map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => setSelectedCurrency(currency.code)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedCurrency === currency.code
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{currency.flag}</div>
                  <div className="text-sm font-medium">{currency.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWalletType("PERSONAL")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  walletType === "PERSONAL"
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <Wallet className="w-5 h-5 mb-2 text-primary-400" />
                <div className="font-medium">Personal</div>
                <div className="text-xs text-dark-400">Solo vos</div>
              </button>
              <button
                type="button"
                onClick={() => setWalletType("SHARED")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  walletType === "SHARED"
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                }`}
              >
                <UsersIcon className="w-5 h-5 mb-2 text-violet-400" />
                <div className="font-medium">Compartida</div>
                <div className="text-xs text-dark-400">Pareja / Familia</div>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newWalletName.trim()}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Crear"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function WalletCard({ 
  wallet,
  currencyInfo
}: { 
  wallet: WalletType;
  currencyInfo?: Currency;
}) {
  return (
    <Link href={`/wallets/${wallet.id}`}>
      <div className="card group/card hover:border-violet-500/30 transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-200">
              {wallet.type === 'SHARED' ? (
                <UsersIcon className="w-6 h-6 text-white" />
              ) : (
                <Wallet className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover/card:text-violet-400 transition-colors">
                {wallet.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  {currencyInfo?.flag} {wallet.currency}
                </span>
                {wallet.type === 'SHARED' && wallet.members && (
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-3.5 h-3.5" />
                    {wallet.members.length}
                  </span>
                )}
                {wallet._count && (
                  <span>{wallet._count.expenses} gastos</span>
                )}
              </div>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-dark-500 group-hover/card:text-violet-400 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

