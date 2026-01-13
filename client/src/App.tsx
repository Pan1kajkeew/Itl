import React, { useState, useEffect, useMemo } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { CategoryList } from '@/components/CategoryList';
import { Stats } from '@/components/Stats';
import { Categories, EquipmentData, EquipmentItem, StatsData } from '@/types';
import { Package, Send, Download, Plus } from 'lucide-react';

// Initial Data
const initialCategories: Categories = {
  cash: { title: 'Кассовое оборудование', icon: '💰' },
  server: { title: 'Серверное оборудование', icon: '🖥️' },
  video: { title: 'Видеонаблюдение', icon: '📹' },
  audio: { title: 'Аудиооборудование', icon: '🔊' },
  kso: { title: 'КСО и СКУД', icon: '🔐' }
};

const initialEquipment: EquipmentData = {
  cash: [
    { id: 'cash_1', name: 'Кассовый узел', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
    { id: 'cash_2', name: 'Дисплей покупателя', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
  ],
  server: [
    { id: 'srv_1', name: 'Сервер', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
  ],
  video: [],
  audio: [],
  kso: []
};

function App() {
  const { tg, user, isReady } = useTelegram();
  const [categories, setCategories] = useState<Categories>(initialCategories);
  const [equipment, setEquipment] = useState<EquipmentData>(initialEquipment);
  const [storeNumber, setStoreNumber] = useState('');

  // Load data from CloudStorage or LocalStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try CloudStorage first if available
        if (tg.CloudStorage) {
          tg.CloudStorage.getItem('it_checklist_data', (err, value) => {
            if (!err && value) {
              const data = JSON.parse(value);
              if (data.equipment) setEquipment(data.equipment);
              if (data.categories) setCategories(data.categories);
              if (data.storeNumber) setStoreNumber(data.storeNumber);
            }
          });
        } else {
          // Fallback to LocalStorage
          const saved = localStorage.getItem('it_checklist_pro');
          if (saved) {
            const data = JSON.parse(saved);
            if (data.equipment) setEquipment(data.equipment);
            if (data.categories) setCategories(data.categories);
            if (data.storeNumber) setStoreNumber(data.storeNumber);
          }
        }
      } catch (e) {
        console.error('Error loading data', e);
      }
    };
    loadData();
  }, [tg]);

  // Save data
  useEffect(() => {
    const data = { equipment, categories, storeNumber };
    const json = JSON.stringify(data);
    
    // Save to LocalStorage
    localStorage.setItem('it_checklist_pro', json);
    
    // Save to CloudStorage
    if (tg.CloudStorage) {
      tg.CloudStorage.setItem('it_checklist_data', json);
    }
  }, [equipment, categories, storeNumber, tg]);

  // Calculate Stats
  const stats = useMemo<StatsData>(() => {
    let total = 0, ok = 0, broken = 0, urgent = 0, important = 0;
    const topBroken: Record<string, number> = {};
    const categoryStats: Record<string, { total: number; broken: number }> = {};

    Object.entries(equipment).forEach(([catId, items]) => {
      categoryStats[catId] = { total: items.length, broken: 0 };
      items.forEach(item => {
        total++;
        if (item.status === 'ok') ok++;
        else {
          broken++;
          categoryStats[catId].broken++;
          topBroken[item.name] = (topBroken[item.name] || 0) + 1;
        }
        if (item.priority === 'urgent') urgent++;
        if (item.priority === 'important') important++;
      });
    });

    return {
      total, ok, broken, urgent, important,
      topBroken: Object.entries(topBroken).sort((a, b) => b[1] - a[1]),
      categoryStats
    };
  }, [equipment]);

  // Handlers
  const handleUpdateItem = (catId: string, itemId: string, field: keyof EquipmentItem, value: any) => {
    setEquipment(prev => ({
      ...prev,
      [catId]: prev[catId].map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleToggleStatus = (catId: string, itemId: string) => {
    setEquipment(prev => ({
      ...prev,
      [catId]: prev[catId].map(item => {
        if (item.id === itemId) {
          const newStatus = item.status === 'ok' ? 'broken' : 'ok';
          // Haptic feedback
          if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
          return { ...item, status: newStatus, lastCheck: new Date().toISOString() };
        }
        return item;
      })
    }));
  };

  const handleAddItem = (catId: string, name: string) => {
    const newItem: EquipmentItem = {
      id: `${catId}_${Date.now()}`,
      name,
      status: 'ok',
      count: 1,
      deliveryDate: '',
      priority: 'normal',
      comment: '',
      photo: null,
      lastCheck: new Date().toISOString(),
      assignedTo: '',
      taskStatus: 'pending'
    };
    
    setEquipment(prev => ({
      ...prev,
      [catId]: [...prev[catId], newItem]
    }));
    
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    if (confirm('Удалить позицию?')) {
      setEquipment(prev => ({
        ...prev,
        [catId]: prev[catId].filter(i => i.id !== itemId)
      }));
      if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
    }
  };

  const handleExportTelegram = () => {
    const report = `
📦 *IT Checklist Report*
🏪 Магазин: ${storeNumber || 'Не указан'}
📅 Дата: ${new Date().toLocaleDateString()}

📊 *Статистика:*
Всего: ${stats.total}
✅ Исправно: ${stats.ok}
❌ Сломано: ${stats.broken}
🚨 Срочно: ${stats.urgent}

📝 *Детали:*
${Object.entries(equipment).map(([catId, items]) => {
  const brokenItems = items.filter(i => i.status === 'broken');
  if (brokenItems.length === 0) return '';
  return `\n*${categories[catId].title}:*\n` + 
    brokenItems.map(i => `• ${i.name} (${i.priority === 'urgent' ? '🚨 ' : ''}${i.comment || 'Нет описания'})`).join('\n');
}).join('')}
    `.trim();

    tg.sendData(JSON.stringify({ type: 'report', text: report }));
    // Also try to open share url
    const url = `https://t.me/share/url?url=${encodeURIComponent(report)}`;
    tg.openTelegramLink(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-sans">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Package className="stroke-[3px]" />
            IT Checklist
          </h1>
          <div className="text-xs font-mono text-gray-500">
            v2.0 • {user?.first_name ? `Engineer: ${user.first_name}` : 'Guest Mode'}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportTelegram}
            className="neo-button bg-blue-500 text-white p-2 rounded-lg"
          >
            <Send size={20} />
          </button>
        </div>
      </header>

      {/* Store Input */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Номер магазина</label>
        <input
          type="text"
          value={storeNumber}
          onChange={(e) => setStoreNumber(e.target.value)}
          placeholder="Например: 1234"
          className="neo-input w-full text-lg font-mono font-bold"
        />
      </div>

      {/* Stats */}
      <Stats stats={stats} />

      {/* Categories */}
      <CategoryList
        categories={categories}
        equipment={equipment}
        onUpdateCategory={() => {}}
        onDeleteCategory={() => {}}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onUpdateItem={handleUpdateItem}
        onToggleItemStatus={handleToggleStatus}
      />

      {/* Floating Action Button (if needed) */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Add global actions here if needed */}
      </div>
    </div>
  );
}

export default App;
