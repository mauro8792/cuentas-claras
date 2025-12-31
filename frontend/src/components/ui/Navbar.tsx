"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="md:hidden pb-4 border-t border-dark-700/50 mt-2 pt-4">
            <Link 
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800/50 mb-3 hover:bg-dark-700/50"
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

