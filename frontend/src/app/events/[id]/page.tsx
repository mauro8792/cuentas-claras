"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Gift,
  UtensilsCrossed,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  DollarSign,
  Users,
  ArrowRight,
  Check,
  Lock,
  Trash2,
  Receipt,
  UserCircle,
  CreditCard,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { Navbar } from "@/components/ui/Navbar";
import { Modal } from "@/components/ui/Modal";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { eventService, expenseService, groupService, guestService, bankAliasService } from "@/services/api";
import { Event, Expense, Debt, User, Group, GuestMember } from "@/types";
import { Pencil } from "lucide-react";

interface Settlement {
  id: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  amount: number;
  isPaid?: boolean;
  fromType?: 'user' | 'guest';
  toType?: 'user' | 'guest';
  isFromGuest?: boolean;
  isToGuest?: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const { user } = useAuth();
  const { joinEvent, leaveEvent, joinGroup, leaveGroup, onExpenseCreated, onExpenseDeleted, onDebtPaid, onEventSettled, onGuestAdded, onGuestRemoved } = useSocket();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [guestMembers, setGuestMembers] = useState<GuestMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [settlement, setSettlement] = useState<Settlement[]>([]);
  const [creditorAliases, setCreditorAliases] = useState<Record<string, { alias: string; bankName?: string; priority: number }[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editEventName, setEditEventName] = useState("");
  
  // Expense form - ahora incluye quién pagó y participantes
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidByType: "user" as "user" | "guest", // Si es usuario o invitado
    paidById: "", // ID del usuario o invitado que pagó
    participantIds: [] as string[],
    guestParticipantIds: [] as string[],
    customParticipants: false, // Si es true, usar participantes personalizados
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Conectar al WebSocket para recibir actualizaciones en tiempo real
  useEffect(() => {
    if (eventId) {
      joinEvent(eventId);
      
      // Escuchar cuando se crea un nuevo gasto
      const unsubCreate = onExpenseCreated((expense) => {
        toast.success(`💸 Nuevo gasto: ${expense.description}`, { icon: '🔔' });
        loadEventData(); // Recargar datos
      });
      
      // Escuchar cuando se elimina un gasto
      const unsubDelete = onExpenseDeleted(() => {
        toast.success('Gasto eliminado', { icon: '🗑️' });
        loadEventData();
      });
      
      // Escuchar cuando se marca una deuda como pagada
      const unsubPaid = onDebtPaid(({ debtId }) => {
        toast.success('Pago registrado', { icon: '✅' });
        // Actualizar solo la deuda específica en el estado
        setSettlement(prev => prev.map(item => 
          item.id === debtId ? { ...item, isPaid: true } : item
        ));
      });
      
      // Escuchar cuando se liquida el evento
      const unsubSettled = onEventSettled(() => {
        toast.success('¡Evento liquidado!', { icon: '🎉' });
        loadEventData();
      });

      // Escuchar cuando se agrega un invitado al grupo
      const unsubGuestAdded = onGuestAdded(({ guest }) => {
        toast.success(`👤 ${guest.name} agregado al grupo`, { icon: '🔔' });
        loadEventData(); // Recargar para ver las deudas recalculadas
      });

      // Escuchar cuando se elimina un invitado del grupo
      const unsubGuestRemoved = onGuestRemoved(({ guestName }) => {
        toast.success(`👤 ${guestName} eliminado del grupo`, { icon: '🔔' });
        loadEventData(); // Recargar para ver las deudas recalculadas
      });
      
      return () => {
        leaveEvent(eventId);
        unsubCreate();
        unsubDelete();
        unsubPaid();
        unsubSettled();
        unsubGuestAdded();
        unsubGuestRemoved();
      };
    }
  }, [eventId, joinEvent, leaveEvent, onExpenseCreated, onExpenseDeleted, onDebtPaid, onEventSettled, onGuestAdded, onGuestRemoved]);

  // Unirse al canal del grupo para recibir actualizaciones de invitados
  useEffect(() => {
    if (group?.id) {
      joinGroup(group.id);
      return () => {
        leaveGroup(group.id);
      };
    }
  }, [group?.id, joinGroup, leaveGroup]);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const [eventData, expensesData, settlementData] = await Promise.all([
        eventService.getById(eventId),
        expenseService.getByEventId(eventId),
        expenseService.getOptimalSettlement(eventId),
      ]);
      setEvent(eventData);
      setExpenses(expensesData);
      setSettlement(settlementData);

      // Cargar grupo e invitados para el selector de "quién pagó"
      const [groupData, guestsData, debtsData] = await Promise.all([
        groupService.getById(eventData.groupId),
        guestService.getByGroupId(eventData.groupId),
        expenseService.getEventDebts(eventId),
      ]);
      setGroup(groupData);
      setGuestMembers(guestsData || []);
      setDebts(debtsData);

      // Cargar alias bancarios de los acreedores (solo usuarios, no invitados)
      if (user && settlementData.length > 0) {
        const creditorIds = settlementData
          .filter((s: any) => s.fromUserId === user.id && s.toUserId && !s.toGuestId)
          .map((s: any) => s.toUserId);
        
        const uniqueCreditorIds = Array.from(new Set(creditorIds)) as string[];
        const aliasesMap: Record<string, any[]> = {};
        
        await Promise.all(
          uniqueCreditorIds.map(async (creditorId) => {
            try {
              const aliases = await bankAliasService.getUserAliases(creditorId);
              aliasesMap[creditorId] = aliases;
            } catch (e) {
              // Si no tiene alias, no pasa nada
            }
          })
        );
        setCreditorAliases(aliasesMap);
      }

      // Por defecto, el usuario actual es quien paga
      if (user) {
        setExpenseForm(prev => ({ ...prev, paidById: user.id, paidByType: "user" }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cargar evento");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.amount || !expenseForm.paidById) return;

    setIsSubmitting(true);
    try {
      await expenseService.create(eventId, {
        description: expenseForm.description.trim(),
        amount: parseFloat(expenseForm.amount),
        // Enviar paidById o paidByGuestId según el tipo
        ...(expenseForm.paidByType === "user" 
          ? { paidById: expenseForm.paidById }
          : { paidByGuestId: expenseForm.paidById }
        ),
        // Solo enviar participantes si se personalizaron
        ...(expenseForm.customParticipants && {
          participantIds: expenseForm.participantIds,
          guestParticipantIds: expenseForm.guestParticipantIds,
        }),
      });
      toast.success("¡Gasto agregado!");
      setShowExpenseModal(false);
      // Reset form pero manteniendo el usuario actual como pagador por defecto
      setExpenseForm({ 
        description: "", 
        amount: "", 
        paidByType: "user",
        paidById: user?.id || "",
        participantIds: [],
        guestParticipantIds: [],
        customParticipants: false,
      });
      loadEventData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("¿Seguro que querés eliminar este gasto?")) return;
    try {
      await expenseService.delete(expenseId);
      toast.success("Gasto eliminado");
      loadEventData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar gasto");
    }
  };

  const handleSettleEvent = async () => {
    try {
      await eventService.settle(eventId);
      toast.success("¡Evento liquidado!");
      setShowSettleModal(false);
      loadEventData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al liquidar evento");
    }
  };

  const handleDeleteEvent = async () => {
    const confirmMsg = expenses.length > 0
      ? `¿Seguro que querés eliminar este evento? Tiene ${expenses.length} gasto(s) que también se eliminarán.`
      : "¿Seguro que querés eliminar este evento?";
    
    if (!confirm(confirmMsg)) return;

    try {
      await eventService.delete(eventId);
      toast.success("Evento eliminado");
      router.push(`/groups/${event?.groupId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar evento");
    }
  };

  const openEditEventModal = () => {
    setEditEventName(event?.name || "");
    setShowEditEventModal(true);
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await eventService.update(eventId, { name: editEventName.trim() });
      toast.success("¡Evento actualizado!");
      setShowEditEventModal(false);
      loadEventData(); // Recargar datos del evento
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDebtPaid = async (debtId: string) => {
    // Optimistic update - actualizar UI inmediatamente
    setSettlement(prev => prev.map(item => 
      item.id === debtId ? { ...item, isPaid: true } : item
    ));
    
    try {
      await expenseService.markDebtAsPaid(debtId, eventId);
      toast.success("¡Pago registrado!");
    } catch (error: any) {
      // Revertir si falla
      setSettlement(prev => prev.map(item => 
        item.id === debtId ? { ...item, isPaid: false } : item
      ));
      toast.error(error.response?.data?.message || "Error al registrar pago");
    }
  };

  const toggleParticipant = (userId: string) => {
    setExpenseForm((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter((id) => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const selectAllParticipants = () => {
    if (!event) return;
    const allIds = getEventParticipants().map((m) => m.id);
    setExpenseForm((prev) => ({
      ...prev,
      participantIds: prev.participantIds.length === allIds.length ? [] : allIds,
    }));
  };

  // Obtener participantes (excluyendo agasajado si es evento de regalo)
  const getEventParticipants = (): { id: string; name: string; isGuest?: boolean }[] => {
    if (!event || !group) return [];
    
    const participants: { id: string; name: string; isGuest?: boolean }[] = [];
    
    // Agregar miembros del grupo
    group.members?.forEach((member: any) => {
      const memberUser = member.user || member;
      // Excluir al agasajado si es evento de regalo
      if (event.type === "GIFT" && event.giftRecipientId === memberUser.id) return;
      participants.push({ id: memberUser.id, name: memberUser.name });
    });
    
    // Agregar invitados
    guestMembers.forEach((guest) => {
      // Excluir al agasajado si es evento de regalo
      if (event.type === "GIFT" && event.giftRecipientGuestId === guest.id) return;
      participants.push({ id: guest.id, name: guest.name, isGuest: true });
    });
    
    return participants;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
          <Link href="/dashboard" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isGift = event.type === "GIFT";
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href={`/groups/${event.groupId}`}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al grupo
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isGift ? "gradient-primary" : "gradient-accent"
            }`}>
              {isGift ? (
                <Gift className="w-7 h-7 text-white" />
              ) : (
                <UtensilsCrossed className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{event.name}</h1>
                {event.isSettled ? (
                  <span className="badge badge-success flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Liquidado
                  </span>
                ) : (
                  <span className="badge badge-warning flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Activo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-dark-400 text-sm">
                <span>{isGift ? "🎁 Regalo" : "🍖 Juntada"}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(event.date), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              {isGift && (event.giftRecipient || event.giftRecipientGuest) && (
                <p className="text-primary-400 text-sm mt-2 flex items-center gap-1">
                  🎂 Para: <span className="font-medium">{event.giftRecipient?.name || event.giftRecipientGuest?.name}</span>
                  {event.giftRecipientGuest && <span className="text-amber-400 text-xs">(invitado)</span>}
                </p>
              )}
            </div>
          </div>

          {!event.isSettled && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Agregar gasto
              </button>
              {expenses.length > 0 && (
                <button
                  onClick={() => setShowSettleModal(true)}
                  className="btn btn-secondary"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Liquidar
                </button>
              )}
              {(group?.createdBy?.id === user?.id || (group as any)?.createdById === user?.id) && (
                <button
                  onClick={openEditEventModal}
                  className="p-2 text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Editar evento"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleDeleteEvent}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Eliminar evento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Total gastos</p>
                <p className="text-xl font-semibold">${totalExpenses.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Gastos</p>
                <p className="text-xl font-semibold">{expenses.length}</p>
              </div>
            </div>
          </div>

          <div className="card col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Deudas pendientes</p>
                <p className="text-xl font-semibold">
                  {settlement.filter((s: any) => !s.isPaid).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Expenses List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-400" />
              Gastos
            </h2>

            {expenses.length === 0 ? (
              <div className="card text-center py-8">
                <Receipt className="w-10 h-10 mx-auto mb-3 text-dark-500" />
                <p className="text-dark-400 mb-4">No hay gastos registrados</p>
                {!event.isSettled && (
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="btn btn-primary mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar gasto
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    currentUserId={user?.id || ""}
                    isSettled={event.isSettled}
                    onDelete={() => handleDeleteExpense(expense.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Settlement / Debts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary-400" />
              {event.isSettled ? "Pagos" : "Liquidación óptima"}
            </h2>

            {settlement.length === 0 ? (
              <div className="card text-center py-8">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-dark-500" />
                <p className="text-dark-400">No hay deudas pendientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Solo mostrar deudas pendientes (no las pagadas) */}
                {settlement.filter((s: any) => !s.isPaid).map((item: any, idx) => {
                  // Determinar nombres (usuario o invitado)
                  const fromName = item.fromUser?.name || item.fromGuest?.name || "?";
                  const toName = item.toUser?.name || item.toGuest?.name || "?";
                  const isFromGuest = !!item.fromGuestId;
                  const isToGuest = !!item.toGuestId;

                  return (
                    <div
                      key={item.id || idx}
                      className="card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                            isFromGuest ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            {fromName.charAt(0).toUpperCase()}
                          </div>
                          <ArrowRight className="w-4 h-4 text-dark-500" />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                            isToGuest ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {toName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className={`font-medium ${isFromGuest ? "text-amber-400" : ""}`}>
                                {fromName}
                              </span>
                              <span className="text-dark-500"> debe a </span>
                              <span className={`font-medium ${isToGuest ? "text-amber-400" : ""}`}>
                                {toName}
                              </span>
                            </p>
                            <p className="text-lg font-semibold text-primary-400">
                              ${item.amount.toLocaleString("es-AR")}
                            </p>
                            
                            {/* Mostrar alias bancario si yo soy el deudor y el acreedor es un usuario */}
                            {item.fromUserId === user?.id && !isToGuest && creditorAliases[item.toUserId]?.length > 0 && !item.isPaid && (
                              <div className="mt-2 p-2 bg-dark-800/50 rounded-lg border border-dark-600">
                                <p className="text-xs text-dark-400 flex items-center gap-1 mb-1">
                                  <CreditCard className="w-3 h-3" />
                                  Transferir a:
                                </p>
                                {creditorAliases[item.toUserId]
                                  .sort((a, b) => a.priority - b.priority)
                                  .map((alias, aliasIdx) => (
                                    <div key={aliasIdx} className="flex items-center justify-between gap-2 py-1">
                                      <div className="flex-1 min-w-0">
                                        <span className="font-mono text-sm text-primary-300 break-all">
                                          {alias.alias}
                                        </span>
                                        {alias.bankName && (
                                          <span className="text-xs text-dark-500 ml-2">
                                            ({alias.bankName})
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(alias.alias);
                                          toast.success("Alias copiado");
                                        }}
                                        className="p-1.5 hover:bg-dark-700 rounded transition-colors text-dark-400 hover:text-white shrink-0"
                                        title="Copiar alias"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botón para marcar como pagado (solo cuando está liquidado) */}
                        {event.isSettled && (
                          <>
                            {/* Si soy quien recibe el pago (usuario) */}
                            {toName === user?.name && !isToGuest && (
                              <button
                                onClick={() => handleMarkDebtPaid(item.id)}
                                className="btn btn-primary text-sm py-1.5 px-3"
                              >
                                <Check className="w-4 h-4" />
                                Recibido
                              </button>
                            )}
                            {/* Si el acreedor es un invitado, SOLO el creador del grupo puede marcar */}
                            {isToGuest && (group?.createdBy?.id === user?.id || (group as any)?.createdById === user?.id) && (
                              <button
                                onClick={() => handleMarkDebtPaid(item.id)}
                                className="btn btn-primary text-sm py-1.5 px-3"
                                title={`Marcar que ${toName} recibió el pago`}
                              >
                                <Check className="w-4 h-4" />
                                Recibido
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Agregar gasto"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              {isGift ? "¿Qué compraron para el regalo?" : "¿Qué compraste?"}
            </label>
            <input
              type="text"
              className="input"
              placeholder={isGift ? "Ej: Regalo, Torta, Decoración" : "Ej: Carne para el asado"}
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Monto ($)
            </label>
            <input
              type="number"
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
          </div>

          {/* Selector de quién pagó */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              <UserCircle className="w-4 h-4 inline mr-1" />
              ¿Quién pagó?
            </label>
            <select
              className="input"
              value={`${expenseForm.paidByType}:${expenseForm.paidById}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(":");
                setExpenseForm({ 
                  ...expenseForm, 
                  paidByType: type as "user" | "guest",
                  paidById: id 
                });
              }}
            >
              <option value="">Seleccioná quién pagó</option>
              
              {/* Miembros del grupo (excluir al agasajado si es evento de regalo) */}
              {group?.members && group.members.length > 0 && (
                <optgroup label="👤 Miembros">
                  {group.members
                    .filter((member: any) => {
                      const memberUser = member.user || member;
                      // Excluir al agasajado si es un evento de regalo
                      return !(event?.type === "GIFT" && event?.giftRecipientId === memberUser.id);
                    })
                    .map((member: any) => {
                      const memberUser = member.user || member;
                      return (
                        <option key={memberUser.id} value={`user:${memberUser.id}`}>
                          {memberUser.name} {memberUser.id === user?.id ? "(vos)" : ""}
                        </option>
                      );
                    })}
                </optgroup>
              )}
              
              {/* Invitados (excluir al agasajado si es evento de regalo) */}
              {guestMembers.length > 0 && (
                <optgroup label="👥 Invitados">
                  {guestMembers
                    .filter((guest) => {
                      // Excluir al agasajado si es un evento de regalo
                      return !(event?.type === "GIFT" && event?.giftRecipientGuestId === guest.id);
                    })
                    .map((guest) => (
                      <option key={guest.id} value={`guest:${guest.id}`}>
                        {guest.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Toggle para personalizar participantes */}
          <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-dark-600">
            <div>
              <p className="text-sm font-medium">¿Dividir entre todos?</p>
              <p className="text-xs text-dark-500">
                {expenseForm.customParticipants 
                  ? "Seleccioná quiénes participan de este gasto"
                  : isGift 
                    ? "Se divide entre todos (excepto el agasajado 🎁)" 
                    : "Se divide entre todos los participantes"
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!expenseForm.customParticipants) {
                  // Al activar, seleccionar todos por defecto (excepto agasajado)
                  const allUserIds = group?.members
                    ?.filter((m: any) => {
                      const memberId = m.user?.id || m.userId;
                      return !(event?.type === "GIFT" && event?.giftRecipientId === memberId);
                    })
                    .map((m: any) => m.user?.id || m.userId) || [];
                  const allGuestIds = guestMembers
                    .filter(g => !(event?.type === "GIFT" && event?.giftRecipientGuestId === g.id))
                    .map(g => g.id);
                  setExpenseForm({
                    ...expenseForm,
                    customParticipants: true,
                    participantIds: allUserIds,
                    guestParticipantIds: allGuestIds,
                  });
                } else {
                  setExpenseForm({
                    ...expenseForm,
                    customParticipants: false,
                    participantIds: [],
                    guestParticipantIds: [],
                  });
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                expenseForm.customParticipants ? "bg-primary-500" : "bg-dark-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  expenseForm.customParticipants ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Selector de participantes (solo si está activado) */}
          {expenseForm.customParticipants && (
            <div className="space-y-3 p-3 bg-dark-800/30 rounded-lg border border-dark-600 max-h-48 overflow-y-auto">
              {/* Miembros */}
              {group?.members?.filter((m: any) => {
                const memberId = m.user?.id || m.userId;
                return !(event?.type === "GIFT" && event?.giftRecipientId === memberId);
              }).map((member: any) => {
                const memberUser = member.user || member;
                const isSelected = expenseForm.participantIds.includes(memberUser.id);
                return (
                  <label key={memberUser.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        setExpenseForm({
                          ...expenseForm,
                          participantIds: e.target.checked
                            ? [...expenseForm.participantIds, memberUser.id]
                            : expenseForm.participantIds.filter(id => id !== memberUser.id),
                        });
                      }}
                      className="w-4 h-4 rounded border-dark-500 text-primary-500 focus:ring-primary-500 bg-dark-700"
                    />
                    <span className="text-sm">
                      {memberUser.name} {memberUser.id === user?.id ? "(vos)" : ""}
                    </span>
                  </label>
                );
              })}
              
              {/* Invitados */}
              {guestMembers
                .filter(g => !(event?.type === "GIFT" && event?.giftRecipientGuestId === g.id))
                .map((guest) => {
                  const isSelected = expenseForm.guestParticipantIds.includes(guest.id);
                  return (
                    <label key={guest.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          setExpenseForm({
                            ...expenseForm,
                            guestParticipantIds: e.target.checked
                              ? [...expenseForm.guestParticipantIds, guest.id]
                              : expenseForm.guestParticipantIds.filter(id => id !== guest.id),
                          });
                        }}
                        className="w-4 h-4 rounded border-dark-500 text-primary-500 focus:ring-primary-500 bg-dark-700"
                      />
                      <span className="text-sm text-amber-400">
                        {guest.name} <span className="text-xs text-dark-500">(invitado)</span>
                      </span>
                    </label>
                  );
                })}
              
              <p className="text-xs text-dark-500 pt-2 border-t border-dark-600">
                Seleccionados: {expenseForm.participantIds.length + expenseForm.guestParticipantIds.length} participantes
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !expenseForm.description.trim() || !expenseForm.amount || !expenseForm.paidById}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Agregar"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Settle Event Modal */}
      <Modal
        isOpen={showSettleModal}
        onClose={() => setShowSettleModal(false)}
        title="Liquidar evento"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400 text-sm">
              ⚠️ Una vez liquidado, no podrás agregar ni modificar gastos.
            </p>
          </div>

          <p className="text-dark-300">
            ¿Estás seguro de que querés liquidar este evento? Los participantes
            podrán ver quién le debe a quién y marcar los pagos como realizados.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowSettleModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSettleEvent}
              className="btn btn-primary flex-1"
            >
              Liquidar evento
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        title="Editar evento"
        size="sm"
      >
        <form onSubmit={handleEditEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre del evento
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="input flex-1 pr-12"
                placeholder="Ej: Asado de fin de año 🍖"
                value={editEventName}
                onChange={(e) => setEditEventName(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2">
                <EmojiPicker 
                  onEmojiSelect={(emoji) => setEditEventName(prev => prev + emoji)}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditEventModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !editEventName.trim()}
              className="btn btn-primary flex-1"
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
    </div>
  );
}

function ExpenseCard({
  expense,
  currentUserId,
  isSettled,
  onDelete,
}: {
  expense: Expense;
  currentUserId: string;
  isSettled: boolean;
  onDelete: () => void;
}) {
  const isOwner = expense.paidById === currentUserId;
  const paidByName = expense.paidBy?.name || expense.paidByGuest?.name || "Desconocido";
  const isGuest = !!expense.paidByGuestId;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium ${
            isGuest 
              ? "bg-amber-500/20 text-amber-400" 
              : "bg-primary-500/20 text-primary-400"
          }`}>
            {paidByName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-dark-400">
              Pagado por{" "}
              <span className={isGuest ? "text-amber-400" : "text-primary-400"}>
                {paidByName}
              </span>
              {isGuest && " 👤"}
              {isOwner && " (vos)"}
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {format(new Date(expense.createdAt), "d MMM, HH:mm", { locale: es })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-primary-400">
            ${expense.amount.toLocaleString("es-AR")}
          </p>
          {(isOwner || isGuest) && !isSettled && (
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 p-1 mt-1"
              title="Eliminar gasto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

