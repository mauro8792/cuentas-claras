"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calculator, Users, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth.store";
import { groupService } from "@/services/api";
import { Group } from "@/types";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guardar el código de invitación inmediatamente para usarlo después del login/registro
    if (code) {
      localStorage.setItem("pendingInvite", code);
    }
    checkAuth();
    loadGroupInfo();
  }, [code, checkAuth]);

  const loadGroupInfo = async () => {
    try {
      const data = await groupService.getByInviteCode(code);
      setGroup(data);
    } catch (error: any) {
      setError("Código de invitación inválido o expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Guardar código para después del login
      localStorage.setItem("pendingInvite", code);
      router.push("/auth/login");
      return;
    }

    setIsJoining(true);
    try {
      await groupService.join(code);
      localStorage.removeItem("pendingInvite"); // Limpiar código usado
      toast.success("¡Te uniste al grupo!");
      router.push(`/groups/${group?.id}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        localStorage.removeItem("pendingInvite"); // Limpiar código usado
        toast.error("Ya sos miembro de este grupo");
        router.push(`/groups/${group?.id}`);
      } else {
        toast.error(error.response?.data?.message || "Error al unirse");
      }
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitación inválida</h1>
          <p className="text-dark-400 mb-6">
            {error || "El código de invitación no es válido o ha expirado."}
          </p>
          <Link href="/" className="btn btn-primary mx-auto">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative card max-w-md w-full text-center animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">SplitApp</span>
        </div>

        {/* Group info */}
        <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center">
          <Users className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Te invitaron a un grupo</h1>
        <p className="text-3xl font-bold gradient-text mb-2">{group.name}</p>
        <p className="text-dark-400 mb-8">
          {group.members?.length || 0} miembro{(group.members?.length || 0) !== 1 ? "s" : ""}
        </p>

        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="btn btn-primary w-full py-3 text-lg"
        >
          {isJoining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uniéndote...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              {isAuthenticated ? "Unirme al grupo" : "Iniciar sesión para unirme"}
            </>
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-sm text-dark-500 mt-4">
            ¿No tenés cuenta?{" "}
            <Link
              href="/auth/register"
              className="text-primary-400 hover:text-primary-300"
              onClick={() => localStorage.setItem("pendingInvite", code)}
            >
              Registrate
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

