"use client";

import { useState, useRef, useEffect } from "react";
import { searchCommonItems } from "@/lib/data/groceries/groceries.api";
import { Plus, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function MagicAddInput({ onAdd, categories }) {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);


    const [quantities, setQuantities] = useState({});

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const items = await searchCommonItems(query, language);
                setResults(items);
                // Reset quantities on new search
                setQuantities({});
                setLoading(false);
                setIsOpen(true);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, language]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getName = (item) => {
        if (language === 'de' && item.name_de) return item.name_de;
        return item.name;
    };

    const updateQuantity = (e, itemId, delta) => {
        e.stopPropagation(); // Prevent triggering the row click
        setQuantities(prev => {
            const current = prev[itemId] || 1;
            const next = Math.max(1, current + delta);
            return { ...prev, [itemId]: next };
        });
    };

    const handleQuickAdd = async (item) => {
        // Optimistic UI: Reset immediately
        inputRef.current?.blur();
        setQuery("");
        setIsOpen(false);
        setResults([]);
        setQuantities({});

        const localizedName = getName(item);

        // Find category ID based on name match
        const category = categories.find(c => c.name === item.category_name);
        const qtyToBuy = quantities[item.id] || 1;

        await onAdd({
            name: localizedName,
            categoryId: category?.id,
            unit: item.default_unit || 'units',
            quantity: qtyToBuy,
            commonItemId: item.id
        });
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        await onAdd({
            name: query,
            categoryId: null,
            unit: 'units',
            quantity: 1,
            commonItemId: null
        });

        inputRef.current?.blur();
        setQuery("");
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto" ref={wrapperRef}>
            {/* Results Popup (Above Input) */}
            {isOpen && results.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in-up">
                    <div className="p-2 space-y-1">
                        {results.map(item => {
                            const qty = quantities[item.id] || 1;
                            return (
                                <div
                                    key={item.id}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors rounded-lg group gap-3"
                                >
                                    {/* Main Click Area */}
                                    <button
                                        onClick={() => handleQuickAdd(item)}
                                        className="flex items-center gap-3 flex-1 text-left"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon || '📦'}</span>
                                        <div>
                                            <div className="text-white font-medium">{getName(item)}</div>
                                            <div className="text-xs text-gray-400">
                                                {t(item.category_name) || item.category_name} • {item.default_unit}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                                        <button
                                            onClick={(e) => updateQuantity(e, item.id, -1)}
                                            className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${qty <= 1 ? 'text-gray-600 cursor-default' : 'text-gray-300'}`}
                                            disabled={qty <= 1}
                                        >
                                            <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1" /></svg>
                                        </button>
                                        <span className={`text-sm font-mono w-6 text-center ${qty > 1 ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                                            {qty}
                                        </span>
                                        <button
                                            onClick={(e) => updateQuantity(e, item.id, 1)}
                                            className="p-1.5 rounded-md hover:bg-white/10 text-emerald-400 transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>

                                    {/* Visual 'Add' Confirmation */}
                                    <button
                                        onClick={() => handleQuickAdd(item)}
                                        className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-2 rounded-lg transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleManualAdd} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <div className={`absolute inset-0 bg-emerald-500/20 rounded-2xl blur-lg transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Add item..."
                        className="relative w-full bg-[#1e293b] border border-white/10 text-white placeholder-gray-500 px-5 pl-12 py-4 rounded-2xl shadow-xl focus:outline-none focus:border-emerald-500/50 transition-all focus:shadow-emerald-500/10"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!query.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={24} />
                </button>
            </form>
        </div>
    );
}
