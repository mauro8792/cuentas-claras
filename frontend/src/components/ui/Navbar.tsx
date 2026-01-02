"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, LogOut, User, Menu, X, Bell, BellOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/hooks/useNotifications";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSupported, permission, isLoading, enableNotifications } = useNotifications();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="glass border-b border-dark-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SplitApp</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {/* Botón de notificaciones */}
            {isSupported && permission !== 'granted' && (
              <button
                onClick={enableNotifications}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors"
                title="Activar notificaciones"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>
            )}
            {permission === 'granted' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-400">
                <Bell className="w-4 h-4" />
              </div>
            )}
            <Link 
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors"
            >
              <User className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-dark-300">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost text-sm"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-dark-700/50 mt-2 pt-4 space-y-3">
            {/* Botón de notificaciones móvil */}
            {isSupported && permission !== 'granted' && (
              <button
                onClick={() => {
                  enableNotifications();
                  setIsMenuOpen(false);
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                <span className="text-sm">Activar notificaciones</span>
              </button>
            )}
            {permission === 'granted' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Notificaciones activas</span>
              </div>
            )}
            <Link 
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/50 hover:bg-dark-700/50"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-dark-300">{user?.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost text-sm w-full justify-start"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

