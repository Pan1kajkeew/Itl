import React, { useState } from 'react';
import { Categories, EquipmentData, EquipmentItem } from '@/types';
import { EquipmentCard } from './EquipmentCard';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryListProps {
  categories: Categories;
  equipment: EquipmentData;
  onUpdateCategory: (id: string, title: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddItem: (categoryId: string, name: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onUpdateItem: (categoryId: string, itemId: string, field: keyof EquipmentItem, value: any) => void;
  onToggleItemStatus: (categoryId: string, itemId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  equipment,
  onUpdateCategory,
  onDeleteCategory,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onToggleItemStatus
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [newItemName, setNewItemName] = useState<string>('');
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddItem = (categoryId: string) => {
    if (newItemName.trim()) {
      onAddItem(categoryId, newItemName);
      setNewItemName('');
      setAddingToCategory(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {Object.entries(categories).map(([catId, cat]) => {
        const items = equipment[catId] || [];
        const brokenCount = items.filter(i => i.status === 'broken').length;
        const isExpanded = expandedCategories[catId];

        return (
          <div key={catId} className="neo-card rounded-xl overflow-hidden">
            <div 
              className="p-4 bg-white flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleCategory(catId)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{cat.title}</h3>
                  <div className="text-xs font-mono text-gray-500">
                    {items.length} поз. • {brokenCount > 0 ? <span className="text-red-600 font-bold">{brokenCount} сломано</span> : 'Все ОК'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown /> : <ChevronRight />}
              </div>
            </div>

            {isExpanded && (
              <div className="p-3 bg-gray-50 border-t-2 border-black">
                {items.map(item => (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    categoryKey={catId}
                    category={cat}
                    isExpanded={expandedItems[item.id]}
                    onToggleExpand={() => toggleItem(item.id)}
                    onToggleStatus={() => onToggleItemStatus(catId, item.id)}
                    onDelete={() => onDeleteItem(catId, item.id)}
                    onUpdateField={(field, value) => onUpdateItem(catId, item.id, field, value)}
                    onPhotoUpload={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdateItem(catId, item.id, 'photo', reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    onVoiceInput={() => {
                      // Mock voice input for now
                      const text = prompt('Введите комментарий (имитация голоса):');
                      if (text) onUpdateItem(catId, item.id, 'comment', text);
                    }}
                    isListening={false}
                  />
                ))}

                {addingToCategory === catId ? (
                  <div className="mt-3 flex gap-2 animate-in fade-in">
                    <input
                      autoFocus
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Название оборудования..."
                      className="neo-input flex-1 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem(catId)}
                    />
                    <button 
                      onClick={() => handleAddItem(catId)}
                      className="neo-button bg-green-500 text-white px-3"
                    >
                      <Plus />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToCategory(catId)}
                    className="w-full mt-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Добавить оборудование
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
