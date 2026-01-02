"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { walletService } from "@/services/api";
import { Wallet as WalletType } from "@/types";

export default function JoinWalletPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { user, isLoading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login'>('loading');
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStatus('login');
      return;
    }

    joinWallet();
  }, [user, authLoading, code]);

  const joinWallet = async () => {
    try {
      const joinedWallet = await walletService.joinByInviteCode(code);
      setWallet(joinedWallet);
      setStatus('success');
      toast.success("¡Te uniste a la billetera!");
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || "No se pudo unir a la billetera");
    }
  };

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-dark-400">Uniéndote a la billetera...</p>
        </div>
      </div>
    );
  }

  if (status === 'login') {
    // Guardar código en localStorage para después del login
    if (typeof window !== 'undefined') {
      localStorage.setItem("pendingWalletInvite", code);
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Unirse a billetera</h1>
          <p className="text-dark-400 mb-6">
            Necesitás iniciar sesión para unirte a esta billetera compartida.
          </p>
          <Link 
            href="/auth/login"
            className="btn btn-primary w-full"
          >
            Iniciar sesión
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-dark-500 mt-4">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/register" className="text-violet-400 hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No se pudo unir</h1>
          <p className="text-dark-400 mb-6">{errorMessage}</p>
          <Link href="/wallets" className="btn btn-primary">
            Ir a mis billeteras
          </Link>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Te uniste!</h1>
        <p className="text-dark-400 mb-2">
          Ahora sos parte de la billetera
        </p>
        {wallet && (
          <p className="text-xl font-semibold text-violet-400 mb-6">
            {wallet.name}
          </p>
        )}
        <Link 
          href={wallet ? `/wallets/${wallet.id}` : "/wallets"} 
          className="btn btn-primary w-full"
        >
          Ver billetera
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

