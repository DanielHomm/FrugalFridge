"use client";

import { useState } from "react";
import { useHouseholds } from "@/lib/hooks/groceries/useHouseholds";
import { useInventory } from "@/lib/hooks/groceries/useInventory";
import HouseholdSetup from "@/components/groceries/HouseholdSetup";
import AddItemModal from "@/components/groceries/AddItemModal";
import AddPriceModal from "@/components/groceries/AddPriceModal";
import HouseholdSettingsModal from "@/components/groceries/HouseholdSettingsModal";
import toast from "react-hot-toast";
import { Tag, Settings } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";
import MagicAddInput from "@/components/groceries/MagicAddInput";
import InventoryItem from "@/components/groceries/InventoryItem";
import { addShoppingListItem } from "@/lib/data/groceries/shoppingList.api";

export default function InventoryPage() {
    const { t } = useLanguage();
    const { households, isLoading: householdsLoading } = useHouseholds();
    const activeHousehold = households?.[0];

    const { inventory, categories, isLoading: inventoryLoading, addItem, deleteItem } = useInventory(activeHousehold?.id);
    const [activeTab, setActiveTab] = useState("fridge"); // fridge, freezer, pantry
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [activePriceItem, setActivePriceItem] = useState(null);

    if (householdsLoading || inventoryLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!households || households.length === 0) {
        return <HouseholdSetup />;
    }

    const filteredItems = inventory.filter(item => item.location === activeTab);

    // Magic Input Handler
    const handleMagicAdd = async (itemData) => {
        try {
            // Force location to current tab
            await addItem({ ...itemData, location: activeTab });
            toast.success(`${t('added_to')} ${t(activeTab)}`);
        } catch (err) {
            toast.error("Failed to add item");
            console.error(err);
        }
    };

    // Modal Handler (Legacy/Advanced)
    const handleModalAdd = async (itemData) => {
        try {
            await addItem(itemData);
            toast.success("Added to " + itemData.location);
        } catch (err) {
            toast.error("Failed to add item");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Remove this item?")) {
            await deleteItem(id);
            toast.success("Removed");
        }
    };

    const handleAddToCart = async (item) => {
        try {
            await addShoppingListItem({
                householdId: activeHousehold.id,
                name: item.product.name,
                categoryId: item.product.category_id,
                quantity: 1, // Default restocking amount
                unit: item.unit
            });
            // Show specific item name in toast
            toast.success(`${item.product.name} ${t('added_to_list')}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add to list");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 flex flex-col h-[calc(100vh-80px)]">
            <header className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white transition-all">{activeHousehold.name}</h1>
                    <p className="text-sm text-gray-400">{t('nav_inventory')}</p>
                </div>
                <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </header>

            {/* Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
                {['fridge', 'freezer', 'pantry'].map(loc => (
                    <button
                        key={loc}
                        onClick={() => setActiveTab(loc)}
                        className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300
                    ${activeTab === loc
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                    >
                        {t(loc)}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-32 space-y-3 scrollbar-hide">
                {filteredItems.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center text-gray-500 flex flex-col items-center justify-center h-64 border border-dashed border-white/10">
                        <div className="text-4xl mb-4 opacity-50">
                            {activeTab === 'fridge' ? '🥬' : activeTab === 'freezer' ? '🧊' : '🥫'}
                        </div>
                        <p>{t(activeTab)} {t('is_empty')}.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <InventoryItem
                            key={item.id}
                            item={item}
                            onDelete={handleDelete}
                            onAddToCart={handleAddToCart}
                            onAddPrice={(item) => setActivePriceItem(item)}
                        />
                    ))
                )}
            </div>

            {/* Bottom Input */}
            <div className="fixed bottom-[84px] left-0 right-0 p-4 max-w-4xl mx-auto pointer-events-none z-40">
                <div className="pointer-events-auto">
                    <MagicAddInput onAdd={handleMagicAdd} categories={categories} />
                </div>
            </div>

            {showAddModal && (
                <AddItemModal
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleModalAdd}
                />
            )}

            {activePriceItem && (
                <AddPriceModal
                    item={activePriceItem}
                    onClose={() => setActivePriceItem(null)}
                />
            )}

            {showSettingsModal && (
                <HouseholdSettingsModal
                    household={activeHousehold}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}
        </div>
    );
}
