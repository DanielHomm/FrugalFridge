"use client";

import { useAuth } from "../lib/AuthContext";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return <LandingPage />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting_morning");
    if (hour < 18) return t("greeting_afternoon");
    return t("greeting_evening");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {getGreeting()}, <span className="text-emerald-400">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400 mt-1">{t('welcome_msg')}</p>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          href="/groceries/shopping-list"
          title={t('shopping_list') || "Shopping List"}
          icon="🛒"
          description={t('dashboard_shopping_list_desc')}
          colorClass="bg-emerald-500"
        />
        <DashboardCard
          href="/groceries/inventory"
          title={t('inventory') || "Inventory"}
          icon="🏠"
          description={t('dashboard_inventory_desc')}
          colorClass="bg-blue-500"
        />
        <DashboardCard
          href="/groceries/recipes"
          title={t('recipes') || "Recipes"}
          icon="🍳"
          description={t('dashboard_recipes_desc')}
          colorClass="bg-orange-500"
        />
        <DashboardCard
          href="/groceries/planner"
          title={t('meal_planner') || "Meal Planner"}
          icon="📅"
          description={t('dashboard_planner_desc')}
          colorClass="bg-purple-500"
        />
      </div>
    </div>
  );
}

function DashboardCard({ href, title, icon, description, colorClass }) {
  return (
    <Link href={href} className="flex-1 min-w-[300px]">
      <div className={`
        group relative overflow-hidden rounded-3xl p-6 h-48 flex flex-col justify-between
        glass glass-hover transition-all duration-300 border border-white/10
        hover:scale-[1.02]
      `}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-40 ${colorClass}`} />

        <div className="relative z-10">
          <div className="text-4xl mb-4">{icon}</div>
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>

        <div className="relative z-10 flex items-center text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Open <span className="ml-1">→</span>
        </div>
      </div>
    </Link>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 rounded-full" />
        <h1 className="relative text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-6">
          Daily App
        </h1>
      </div>

      <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
        Track your habits, challenge your friends, and master your daily routine.
      </p>

      <div className="flex gap-4 pt-4">
        <Link
          href="/auth"
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1"
        >
          Get Started
        </Link>
        <button className="px-8 py-3 glass rounded-full hover:bg-white/10 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}

