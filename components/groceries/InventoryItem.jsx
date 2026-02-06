"use client";

import { useSwipeable } from "react-swipeable";
import { Tag, Trash2, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function InventoryItem({ item, onDelete, onAddToCart, onAddPrice }) {
    const { t } = useLanguage();
    const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();

    const handlers = useSwipeable({
        onSwipedLeft: () => onDelete(item.id),
        onSwipedRight: () => onAddToCart(item),
        preventScrollOnSwipe: true,
        trackMouse: true
    });

    return (
        <div
            {...handlers}
            className="glass glass-hover p-4 rounded-2xl flex items-center justify-between group relative overflow-hidden touch-pan-y"
        >
            {/* Left Swipe Background (Delete) */}
            <div className="absolute inset-y-0 right-0 w-1/2 bg-red-500/20 -z-10 flex items-center justify-end pr-6 opacity-0 group-active:opacity-100 transition-opacity">
                <Trash2 className="text-red-400" />
            </div>

            {/* Right Swipe Background (Add to Cart) */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-500/20 -z-10 flex items-center pl-6 opacity-0 group-active:opacity-100 transition-opacity">
                <ShoppingCart className="text-emerald-400" />
            </div>

            <div className="flex items-center gap-4 relative z-10 flex-1 select-none">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shrink-0">
                    {item.product?.category?.icon || '📦'}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-snug">{item.product?.name}</h3>
                    <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300 whitespace-nowrap">
                            {item.quantity} {item.unit}
                        </span>

                        {/* Tag Button for Price - Only if common item */}
                        {item.product?.common_item_id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddPrice(item);
                                }}
                                className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 transition-colors border border-white/5"
                            >
                                <Tag size={10} />
                                Price
                            </button>
                        )}
                    </div>

                    {item.expiry_date && (
                        <p className={`text-[10px] mt-0.5 ${isExpired ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                            {isExpired ? 'Expired: ' : 'Exp: '}
                            {new Date(item.expiry_date).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Manual Actions (Desktop/Fallback) */}
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity relative z-10">
                <button
                    onClick={() => onAddToCart(item)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                    title="Add to Shopping List"
                >
                    <ShoppingCart size={18} />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
