"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  Gift,
  UtensilsCrossed,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Share2,
  Loader2,
  MoreVertical,
  LogOut,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Registrar locale español
registerLocale("es", es);
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/Navbar";
import { Modal } from "@/components/ui/Modal";
import { EmojiPicker } from "@/components/ui/EmojiPicker";
import { useGroupsStore } from "@/stores/groups.store";
import { eventService, guestService, groupService } from "@/services/api";
import { Event, EventType, User } from "@/types";
import { Pencil } from "lucide-react";

interface GuestMember {
  id: string;
  name: string;
  groupId: string;
  addedBy?: { id: string; name: string };
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const { user } = useAuth();
  const { currentGroup, events, fetchGroupById, fetchGroupEvents, leaveGroup, deleteGroup } = useGroupsStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [guestMembers, setGuestMembers] = useState<GuestMember[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  
  // Form state
  const [eventForm, setEventForm] = useState({
    name: "",
    type: "GATHERING" as EventType,
    date: new Date(),
    giftRecipientId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchGroupById(groupId),
        fetchGroupEvents(groupId),
        loadGuestMembers(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [groupId, fetchGroupById, fetchGroupEvents]);

  const loadGuestMembers = async () => {
    try {
      const guests = await guestService.getByGroupId(groupId);
      setGuestMembers(guests);
    } catch (error) {
      // Silently fail
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await guestService.create(groupId, newGuestName.trim());
      toast.success("¡Participante agregado!");
      setShowAddGuestModal(false);
      setNewGuestName("");
      loadGuestMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar participante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!confirm(`¿Eliminar a ${guestName} del grupo?`)) return;
    try {
      await guestService.delete(groupId, guestId);
      toast.success("Participante eliminado");
      loadGuestMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      // Determinar si el agasajado es un usuario o un invitado
      const recipientId = eventForm.giftRecipientId;
      const isGuestRecipient = recipientId?.startsWith("guest:");
      const giftRecipientId = eventForm.type === "GIFT" && !isGuestRecipient ? recipientId : undefined;
      const giftRecipientGuestId = eventForm.type === "GIFT" && isGuestRecipient ? recipientId.replace("guest:", "") : undefined;
      
      await eventService.create(groupId, {
        name: eventForm.name.trim(),
        type: eventForm.type,
        date: eventForm.date.toISOString(),
        giftRecipientId,
        giftRecipientGuestId,
      });
      toast.success("¡Evento creado!");
      setShowCreateEventModal(false);
      setEventForm({ name: "", type: "GATHERING", date: new Date(), giftRecipientId: "" });
      fetchGroupEvents(groupId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${currentGroup?.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    toast.success("¡Link copiado!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveGroup = async () => {
    if (!confirm("¿Seguro que querés abandonar este grupo?")) return;
    try {
      await leaveGroup(groupId);
      toast.success("Abandonaste el grupo");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al abandonar grupo");
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm("¿Seguro que querés eliminar este grupo? Esta acción no se puede deshacer.")) return;
    try {
      await deleteGroup(groupId);
      toast.success("Grupo eliminado");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar grupo");
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroupName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await groupService.update(groupId, { name: editGroupName.trim() });
      toast.success("¡Grupo actualizado!");
      setShowEditGroupModal(false);
      fetchGroupById(groupId); // Recargar el grupo
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditGroupModal = () => {
    setEditGroupName(currentGroup?.name || "");
    setShowMenuModal(false);
    setShowEditGroupModal(true);
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

  if (!currentGroup) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Grupo no encontrado</h1>
          <Link href="/dashboard" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentGroup.createdById === user?.id;
  const otherMembers = currentGroup.members?.filter((m: any) => m.user?.id !== user?.id) || [];
  const totalParticipants = (currentGroup.members?.length || 0) + guestMembers.length;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Mis grupos
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentGroup.name}</h1>
            <div className="flex items-center gap-4 text-dark-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalParticipants} participante{totalParticipants !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(currentGroup.createdAt), "d MMM yyyy", { locale: es })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyInviteLink}
              className="btn btn-secondary"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              Invitar
            </button>
            <button
              onClick={() => setShowMenuModal(true)}
              className="btn btn-ghost p-2"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-400" />
              Miembros
            </h2>
            <button
              onClick={() => setShowAddGuestModal(true)}
              className="btn btn-ghost text-sm py-1.5 px-3"
            >
              <UserPlus className="w-4 h-4" />
              Agregar participante
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Miembros con cuenta */}
            {currentGroup.members?.map((member: any) => (
              <div
                key={member.id || member.userId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-medium text-sm">
                  {member.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">
                  {member.user?.name}
                  {member.user?.id === user?.id && (
                    <span className="text-dark-500 ml-1">(vos)</span>
                  )}
                  {member.user?.id === currentGroup.createdById && (
                    <span className="text-primary-400 ml-1">★</span>
                  )}
                </span>
              </div>
            ))}
            
            {/* Participantes manuales (sin cuenta) */}
            {guestMembers.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/20 group"
              >
                <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-medium text-sm">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-accent-300">
                  {guest.name}
                  <span className="text-dark-500 ml-1 text-xs">(invitado)</span>
                </span>
                <button
                  onClick={() => handleDeleteGuest(guest.id, guest.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-700/50 rounded transition-all"
                  title="Eliminar"
                >
                  <X className="w-3 h-3 text-dark-400" />
                </button>
              </div>
            ))}
          </div>
          
          {guestMembers.length > 0 && (
            <p className="text-xs text-dark-500 mt-3">
              💡 Los participantes manuales son personas sin cuenta en la app (ej: la abuela)
            </p>
          )}
        </div>

        {/* Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              Eventos
            </h2>
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Nuevo evento
            </button>
          </div>

          {events.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-dark-500" />
              <h3 className="text-lg font-medium mb-2">Sin eventos</h3>
              <p className="text-dark-400 mb-6">
                Creá tu primer evento para empezar a dividir gastos
              </p>
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="btn btn-primary mx-auto"
              >
                <Plus className="w-4 h-4" />
                Crear evento
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        title="Crear nuevo evento"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre del evento
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="input flex-1 pr-12"
                placeholder="Ej: Asado de fin de año 🍖"
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                autoFocus
              />
              <div className="absolute right-2">
                <EmojiPicker 
                  onEmojiSelect={(emoji) => setEventForm({ ...eventForm, name: eventForm.name + emoji })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Tipo de evento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEventForm({ ...eventForm, type: "GATHERING" })}
                className={`p-4 rounded-xl border transition-all ${
                  eventForm.type === "GATHERING"
                    ? "border-accent-500 bg-accent-500/10"
                    : "border-dark-600 hover:border-dark-500"
                }`}
              >
                <UtensilsCrossed className={`w-6 h-6 mx-auto mb-2 ${
                  eventForm.type === "GATHERING" ? "text-accent-400" : "text-dark-400"
                }`} />
                <span className="block text-sm font-medium">Juntada</span>
                <span className="block text-xs text-dark-500">Asado, cena, etc.</span>
              </button>
              <button
                type="button"
                onClick={() => setEventForm({ ...eventForm, type: "GIFT" })}
                className={`p-4 rounded-xl border transition-all ${
                  eventForm.type === "GIFT"
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-dark-600 hover:border-dark-500"
                }`}
              >
                <Gift className={`w-6 h-6 mx-auto mb-2 ${
                  eventForm.type === "GIFT" ? "text-primary-400" : "text-dark-400"
                }`} />
                <span className="block text-sm font-medium">Regalo</span>
                <span className="block text-xs text-dark-500">Cumpleaños, etc.</span>
              </button>
            </div>
          </div>

          {eventForm.type === "GIFT" && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Agasajado (no verá el evento)
              </label>
              <select
                className="input"
                value={eventForm.giftRecipientId}
                onChange={(e) => setEventForm({ ...eventForm, giftRecipientId: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {/* Miembros del grupo (excepto yo) */}
                {currentGroup.members
                  ?.filter((member: any) => member.user?.id !== user?.id)
                  .map((member: any) => (
                    <option key={member.user?.id} value={member.user?.id}>
                      {member.user?.name}
                    </option>
                  ))}
                {/* Invitados (también pueden ser agasajados) */}
                {guestMembers.length > 0 && (
                  <>
                    <option disabled>── Invitados ──</option>
                    {guestMembers.map((guest) => (
                      <option key={`guest-${guest.id}`} value={`guest:${guest.id}`}>
                        {guest.name} (invitado)
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Fecha
            </label>
            <DatePicker
              selected={eventForm.date}
              onChange={(date: Date | null) => date && setEventForm({ ...eventForm, date })}
              dateFormat="dd/MM/yyyy"
              locale="es"
              className="input w-full"
              calendarClassName="datepicker-dark"
              showPopperArrow={false}
              minDate={new Date()}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateEventModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !eventForm.name.trim() || (eventForm.type === "GIFT" && !eventForm.giftRecipientId)}
              className="btn btn-primary flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Crear evento"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Menu Modal */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title="Opciones del grupo"
        size="sm"
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              copyInviteLink();
              setShowMenuModal(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-left"
          >
            <Share2 className="w-5 h-5 text-dark-400" />
            <span>Compartir link de invitación</span>
          </button>
          
          {isOwner && (
            <button
              onClick={openEditGroupModal}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-left"
            >
              <Pencil className="w-5 h-5 text-dark-400" />
              <span>Editar nombre del grupo</span>
            </button>
          )}
          
          {!isOwner && (
            <button
              onClick={() => {
                setShowMenuModal(false);
                handleLeaveGroup();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-left text-amber-400"
            >
              <LogOut className="w-5 h-5" />
              <span>Abandonar grupo</span>
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={() => {
                setShowMenuModal(false);
                handleDeleteGroup();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-700/50 transition-colors text-left text-red-400"
            >
              <Trash2 className="w-5 h-5" />
              <span>Eliminar grupo</span>
            </button>
          )}
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        title="Editar grupo"
        size="sm"
      >
        <form onSubmit={handleEditGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre del grupo
            </label>
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="input flex-1 pr-12"
                placeholder="Ej: Asado de los sábados 🍖"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                autoFocus
              />
              <div className="absolute right-2">
                <EmojiPicker 
                  onEmojiSelect={(emoji) => setEditGroupName(prev => prev + emoji)}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditGroupModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !editGroupName.trim()}
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

      {/* Add Guest Modal */}
      <Modal
        isOpen={showAddGuestModal}
        onClose={() => setShowAddGuestModal(false)}
        title="Agregar participante manual"
        size="sm"
      >
        <form onSubmit={handleAddGuest} className="space-y-4">
          <p className="text-sm text-dark-400">
            Agregá personas que no tienen cuenta en la app (ej: la abuela, tíos, etc.)
          </p>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Abuela María"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddGuestModal(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newGuestName.trim()}
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
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const isGift = event.type === "GIFT";
  
  return (
    <Link href={`/events/${event.id}`}>
      <div className="card group hover:border-primary-500/30 transition-all duration-200 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
            isGift ? "gradient-primary" : "gradient-accent"
          }`}>
            {isGift ? (
              <Gift className="w-6 h-6 text-white" />
            ) : (
              <UtensilsCrossed className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold group-hover:text-primary-400 transition-colors">
                {event.name}
              </h3>
              {event.isSettled ? (
                <span className="badge badge-success flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Liquidado
                </span>
              ) : (
                <span className="badge badge-warning flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Activo
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-dark-400 mt-1">
              <span>{isGift ? "🎁 Regalo" : "🍖 Juntada"}</span>
              <span>{format(new Date(event.date), "d MMM yyyy", { locale: es })}</span>
              {event.expenses?.length > 0 && (
                <span>{event.expenses.length} gastos</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

