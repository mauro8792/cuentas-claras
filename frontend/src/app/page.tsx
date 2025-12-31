"use client";

import Link from "next/link";
import { 
  Users, 
  Gift, 
  UtensilsCrossed, 
  Calculator, 
  Bell, 
  Smartphone,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-40 h-40 bg-primary-400/15 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-32">
          {/* Logo y badge */}
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="badge badge-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> PWA
            </span>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-6 animate-fade-in-up stagger-1">
            Dividí gastos
            <span className="block gradient-text">sin complicaciones</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-dark-300 text-center max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-2">
            La forma más simple de gestionar gastos compartidos con tus amigos. 
            Cumpleaños, asados, viajes... ¡todo bajo control!
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link 
              href="/auth/register" 
              className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/auth/login" 
              className="btn btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Todo lo que necesitás
          </h2>
          <p className="text-dark-400 text-center mb-16 max-w-xl mx-auto">
            Dos modos diseñados para las situaciones más comunes entre amigos
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Modo Regalo */}
            <div className="card group hover:border-primary-500/30 transition-all duration-300">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Modo Regalo 🎁</h3>
              <p className="text-dark-400 mb-6">
                Perfecto para cumpleaños y eventos especiales. El agasajado no ve nada 
                y puede dejar su lista de deseos. ¡Sorpresa garantizada!
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs">✓</span>
                  División automática entre participantes
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs">✓</span>
                  Lista de deseos del cumpleañero
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs">✓</span>
                  Oculto para el agasajado
                </li>
              </ul>
            </div>

            {/* Modo Juntada */}
            <div className="card group hover:border-accent-500/30 transition-all duration-300">
              <div className="w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Modo Juntada 🍖</h3>
              <p className="text-dark-400 mb-6">
                Ideal para asados, cenas o cualquier juntada. Cada uno pone lo que 
                compró y la app calcula quién le debe a quién.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs">✓</span>
                  Liquidación óptima de deudas
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs">✓</span>
                  Compensa deudas cruzadas
                </li>
                <li className="flex items-center gap-3 text-dark-300">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs">✓</span>
                  Marca pagos realizados
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 border-t border-dark-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-dark-700/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <h4 className="font-semibold mb-2">Múltiples grupos</h4>
              <p className="text-sm text-dark-400">
                Creá grupos para cada ocasión: amigos, familia, trabajo
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-dark-700/50 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary-400" />
              </div>
              <h4 className="font-semibold mb-2">Recordatorios</h4>
              <p className="text-sm text-dark-400">
                Notificaciones para que nadie se olvide de pagar
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-dark-700/50 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-400" />
              </div>
              <h4 className="font-semibold mb-2">Instalable</h4>
              <p className="text-sm text-dark-400">
                Instalá la app en tu celular como una app nativa
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-dark-700/50 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary-400" />
              </div>
              <h4 className="font-semibold mb-2">Historial completo</h4>
              <p className="text-sm text-dark-400">
                Consultá todos los gastos y eventos pasados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-700/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">SplitApp</span>
          </div>
          <p className="text-sm text-dark-500">
            © 2024 SplitApp. Hecho con 💚 en Argentina.
          </p>
        </div>
      </footer>
    </main>
  );
}

