"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Plus, Trash2, Edit2, Save, X, ArrowLeft } from "lucide-react";
import { bankAliasService } from "@/services/api";
import { toast } from "react-hot-toast";

interface BankAlias {
  id: string;
  alias: string;
  bankName?: string;
  priority: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [aliases, setAliases] = useState<BankAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [newAlias, setNewAlias] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newPriority, setNewPriority] = useState(1);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadAliases();
  }, []);

  const loadAliases = async () => {
    try {
      const data = await bankAliasService.getMyAliases();
      setAliases(data);
    } catch (error) {
      console.error("Error loading aliases:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePriorities = () => {
    const usedPriorities = aliases.map(a => a.priority);
    return [1, 2, 3].filter(p => !usedPriorities.includes(p));
  };

  const handleAddAlias = async () => {
    if (!newAlias.trim()) {
      toast.error("Ingresá un alias");
      return;
    }

    try {
      await bankAliasService.create(newAlias, newBankName || undefined, newPriority);
      toast.success("Alias agregado");
      setNewAlias("");
      setNewBankName("");
      setShowAddForm(false);
      loadAliases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar alias");
    }
  };

  const handleUpdateAlias = async (alias: BankAlias) => {
    try {
      await bankAliasService.update(alias.id, {
        alias: alias.alias,
        bankName: alias.bankName,
        priority: alias.priority,
      });
      toast.success("Alias actualizado");
      setEditingId(null);
      loadAliases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar alias");
    }
  };

  const handleDeleteAlias = async (aliasId: string) => {
    if (!confirm("¿Eliminar este alias?")) return;

    try {
      await bankAliasService.delete(aliasId);
      toast.success("Alias eliminado");
      loadAliases();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar alias");
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Principal";
      case 2: return "Secundario";
      case 3: return "Alternativo";
      default: return "";
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-primary-500/20 text-primary-400";
      case 2: return "bg-amber-500/20 text-amber-400";
      case 3: return "bg-dark-500/40 text-dark-400";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>

        {/* User Info */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-dark-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Bank Aliases Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary-400" />
              <h3 className="text-lg font-semibold">Alias Bancarios</h3>
            </div>
            {aliases.length < 3 && !showAddForm && (
              <button
                onClick={() => {
                  const available = getAvailablePriorities();
                  setNewPriority(available[0] || 1);
                  setShowAddForm(true);
                }}
                className="btn btn-primary text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            )}
          </div>

          <p className="text-dark-400 text-sm mb-6">
            Configurá hasta 3 alias para que otros sepan dónde transferirte cuando te deban plata.
          </p>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-dark-800 rounded-lg p-4 mb-4 border border-dark-600">
              <h4 className="font-medium mb-4">Nuevo Alias</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Alias o CBU *
                  </label>
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="ej: mauro.cuenta.mp"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Banco (opcional)
                  </label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="ej: Mercado Pago, Brubank, etc."
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(Number(e.target.value))}
                    className="input w-full"
                  >
                    {getAvailablePriorities().map((p) => (
                      <option key={p} value={p}>
                        {getPriorityLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewAlias("");
                      setNewBankName("");
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleAddAlias} className="btn btn-primary">
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Aliases List */}
          {aliases.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-dark-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tenés alias configurados</p>
              <p className="text-sm mt-1">
                Agregá uno para que te puedan transferir fácilmente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {aliases
                .sort((a, b) => a.priority - b.priority)
                .map((alias) => (
                  <div
                    key={alias.id}
                    className="bg-dark-800 rounded-lg p-4 border border-dark-600"
                  >
                    {editingId === alias.id ? (
                      <EditAliasForm
                        alias={alias}
                        onSave={handleUpdateAlias}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(alias.priority)}`}>
                              {getPriorityLabel(alias.priority)}
                            </span>
                            {alias.bankName && (
                              <span className="text-xs text-dark-400">
                                {alias.bankName}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-lg">{alias.alias}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(alias.id)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlias(alias.id)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditAliasForm({
  alias,
  onSave,
  onCancel,
}: {
  alias: BankAlias;
  onSave: (alias: BankAlias) => void;
  onCancel: () => void;
}) {
  const [editAlias, setEditAlias] = useState(alias.alias);
  const [editBankName, setEditBankName] = useState(alias.bankName || "");

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-dark-400 mb-1">Alias o CBU</label>
        <input
          type="text"
          value={editAlias}
          onChange={(e) => setEditAlias(e.target.value)}
          className="input w-full"
        />
      </div>
      <div>
        <label className="block text-sm text-dark-400 mb-1">Banco</label>
        <input
          type="text"
          value={editBankName}
          onChange={(e) => setEditBankName(e.target.value)}
          className="input w-full"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn btn-secondary text-sm">
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          onClick={() =>
            onSave({ ...alias, alias: editAlias, bankName: editBankName })
          }
          className="btn btn-primary text-sm"
        >
          <Save className="w-4 h-4" />
          Guardar
        </button>
      </div>
    </div>
  );
}

