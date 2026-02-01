import React from 'react';
import { LayoutGridIcon, ReceiptPlusIcon, ChartPieIcon, GoalIcon } from './icons';

interface MobileNavProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGridIcon },
    { id: 'log', label: 'Log', icon: ReceiptPlusIcon },
    { id: 'budgets', label: 'Budgets', icon: ChartPieIcon },
    { id: 'goals', label: 'Goals', icon: GoalIcon },
]

const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-slate-200 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-50">
            <div className="flex justify-around max-w-xl mx-auto">
                {navItems.map(item => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 text-xs font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

export default MobileNav;