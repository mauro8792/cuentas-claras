"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PiggyBank } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  
  const isGroups = pathname === "/dashboard" || pathname.startsWith("/groups") || pathname.startsWith("/events");
  const isWallets = pathname.startsWith("/wallets");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/50 pb-safe">
      <div className="max-w-lg mx-auto flex">
        <Link 
          href="/dashboard" 
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            isGroups 
              ? 'text-primary-400' 
              : 'text-dark-400 hover:text-dark-300'
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Grupos</span>
          {isGroups && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-400" />
          )}
        </Link>
        
        <Link 
          href="/wallets" 
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors relative ${
            isWallets 
              ? 'text-violet-400' 
              : 'text-dark-400 hover:text-dark-300'
          }`}
        >
          <PiggyBank className="w-6 h-6" />
          <span className="text-xs font-medium">Billeteras</span>
          {isWallets && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-400" />
          )}
        </Link>
      </div>
    </nav>
  );
}

