"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  UserPlus, 
  Calendar,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/Navbar";
import { Modal } from "@/components/ui/Modal";
import NotificationPrompt from "@/components/NotificationPrompt";
import { useGroupsStore } from "@/stores/groups.store";
import { Group } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { expenseService } from "@/services/api";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { groups, isLoading, fetchGroups, createGroup, joinGroup } = useGroupsStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [balance, setBalance] = useState<{ totalOwed: number; totalOwing: number; netBalance: number } | null>(null);

  useEffect(() => {
    if (user) {
      fetchGroups();
      loadBalance();
    }
  }, [user, fetchGroups]);

  const loadBalance = async () => {
    try {
      const data = await expenseService.getUserBalance();
      setBalance(data);
    } catch (error) {
      // Silently fail - balance is optional
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsSubmitting(true);
    try {
      await createGroup(newGroupName.trim());
      toast.success("¡Grupo creado!");
      setShowCreateModal(false);
      setNewGroupName("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsSubmitting(true);
    try {
      await joinGroup(inviteCode.trim());
      toast.success("¡Te uniste al grupo!");
      setShowJoinModal(false);
      setInviteCode("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Código de invitación inválido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("¡Código copiado!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <NotificationPrompt />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header con balance */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Hola, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-dark-400">Gestioná tus gastos compartidos</p>
        </div>

        {/* Balance Cards */}
        {balance && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Te deben</p>
                  <p className="text-xl font-semibold text-emerald-400">
                    ${balance.totalOwed.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Debés</p>
                  <p className="text-xl font-semibold text-red-400">
                    ${balance.totalOwing.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>

            <div className={`card ${balance.netBalance >= 0 ? 'bg-primary-500/10 border-primary-500/20' : 'bg-amber-500/10 border-amber-500/20'} border`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${balance.netBalance >= 0 ? 'bg-primary-500/20' : 'bg-amber-500/20'} flex items-center justify-center`}>
                  <Calculator className="w-5 h-5" style={{ color: balance.netBalance >= 0 ? '#14b8a6' : '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Balance neto</p>
                  <p className={`text-xl font-semibold ${balance.netBalance >= 0 ? 'text-primary-400' : 'text-amber-400'}`}>
                    {balance.netBalance >= 0 ? '+' : ''}${balance.netBalance.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            Crear grupo
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary"
          >
            <UserPlus className="w-5 h-5" />
            Unirme a grupo
          </button>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" />
            Mis grupos
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : groups.length === 0 ? (
            <div className="card text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-dark-500" />
              <h3 className="text-lg font-medium mb-2">No tenés grupos</h3>
              <p className="text-dark-400 mb-6">
                Creá un grupo para empezar a dividir gastos con tus amigos
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary mx-auto"
              >
                <Plus className="w-5 h-5" />
                Crear mi primer grupo
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map((group: Group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onCopyCode={() => copyInviteCode(group.inviteCode)}
                  isCopied={copiedCode === group.inviteCode}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear nuevo grupo"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre del grupo
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Asado de los sábados"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
            />
          </div>
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
              disabled={isSubmitting || !newGroupName.trim()}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Crear grupo"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Unirse a un grupo"
      >
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Código de invitación
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ingresá el código"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-dark-500 mt-2">
              Pedile el código a quien creó el grupo
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowJoinModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !inviteCode.trim()}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Unirme"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Calculator icon for balance (imported at top level)
import { Calculator } from "lucide-react";

function GroupCard({ 
  group, 
  onCopyCode, 
  isCopied 
}: { 
  group: Group; 
  onCopyCode: () => void;
  isCopied: boolean;
}) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="card group/card hover:border-primary-500/30 transition-all duration-200 cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover/card:text-primary-400 transition-colors">
                {group.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {group.members?.length || 0} miembros
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(group.createdAt), "d MMM yyyy", { locale: es })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopyCode();
              }}
              className="p-2 hover:bg-dark-700/50 rounded-lg transition-colors"
              title="Copiar código de invitación"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-dark-400" />
              )}
            </button>
            <ChevronRight className="w-5 h-5 text-dark-500 group-hover/card:text-primary-400 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

