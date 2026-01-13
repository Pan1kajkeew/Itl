import React, { useState, useEffect, useMemo } from 'react';
import { Package, Send, ChevronDown, ChevronRight, Plus, Trash2, Mic, Camera } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  status: 'ok' | 'broken';
  count: number;
  priority: 'normal' | 'important' | 'urgent';
  comment: string;
  photo: string | null;
  assignedTo: string;
  taskStatus: 'pending' | 'in_progress' | 'waiting' | 'completed';
}

interface Category {
  title: string;
  icon: string;
}

function App() {
  const [storeNumber, setStoreNumber] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [newItemName, setNewItemName] = useState('');
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const categories: Record<string, Category> = {
    cash: { title: 'Кассовое оборудование', icon: '💰' },
    server: { title: 'Серверное оборудование', icon: '🖥️' },
    video: { title: 'Видеонаблюдение', icon: '📹' },
    audio: { title: 'Аудиооборудование', icon: '🔊' },
    kso: { title: 'КСО и СКУД', icon: '🔐' }
  };

  const [equipment, setEquipment] = useState<Record<string, Equipment[]>>({
    cash: [
      { id: 'cash_1', name: 'Кассовый узел', status: 'ok', count: 1, priority: 'normal', comment: '', photo: null, assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_2', name: 'Дисплей покупателя', status: 'ok', count: 1, priority: 'normal', comment: '', photo: null, assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_3', name: 'Монитор кассира', status: 'ok', count: 1, priority: 'normal', comment: '', photo: null, assignedTo: '', taskStatus: 'pending' },
    ],
    server: [
      { id: 'srv_1', name: 'Сервер', status: 'ok', count: 1, priority: 'normal', comment: '', photo: null, assignedTo: '', taskStatus: 'pending' },
      { id: 'srv_2', name: 'Коммутатор', status: 'ok', count: 1, priority: 'normal', comment: '', photo: null, assignedTo: '', taskStatus: 'pending' },
    ],
    video: [],
    audio: [],
    kso: []
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('it_checklist_pro');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.equipment) setEquipment(data.equipment);
        if (data.storeNumber) setStoreNumber(data.storeNumber);
      } catch (e) {
        console.error('Error loading data', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('it_checklist_pro', JSON.stringify({ equipment, storeNumber }));
  }, [equipment, storeNumber]);

  // Calculate stats
  const stats = useMemo(() => {
    let total = 0, ok = 0, broken = 0, urgent = 0;
    Object.values(equipment).forEach((items) => {
      items.forEach((item) => {
        total++;
        if (item.status === 'ok') ok++;
        else broken++;
        if (item.priority === 'urgent' && item.status === 'broken') urgent++;
      });
    });
    return { total, ok, broken, urgent };
  }, [equipment]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatus = (catId: string, itemId: string) => {
    setEquipment(prev => ({
      ...prev,
      [catId]: prev[catId as keyof typeof equipment].map((item: Equipment) =>
        item.id === itemId
          ? { ...item, status: item.status === 'ok' ? 'broken' : 'ok' }
          : item
      )
    }));
  };

  const handleUpdateField = (catId: string, itemId: string, field: keyof Equipment, value: any) => {
    setEquipment(prev => ({
      ...prev,
      [catId]: prev[catId as keyof typeof equipment].map((item: Equipment) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    if (confirm('Удалить позицию?')) {
      setEquipment(prev => ({
        ...prev,
        [catId]: prev[catId as keyof typeof equipment].filter((i: Equipment) => i.id !== itemId)
      }));
    }
  };

  const handleAddItem = (catId: string) => {
    if (newItemName.trim()) {
      const newItem: Equipment = {
        id: `${catId}_${Date.now()}`,
        name: newItemName,
        status: 'ok',
        count: 1,
        priority: 'normal',
        comment: '',
        photo: null,
        assignedTo: '',
        taskStatus: 'pending'
      };
      setEquipment(prev => ({
        ...prev,
        [catId]: [...prev[catId as keyof typeof equipment], newItem]
      }));
      setNewItemName('');
      setAddingToCategory(null);
    }
  };

  const handlePhotoUpload = (catId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateField(catId, itemId, 'photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
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
            v2.0 • Telegram Mini App
          </div>
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
          className="neo-input w-full text-lg font-mono font-bold border-2 border-black p-2"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="neo-card bg-blue-50 p-3 rounded-lg border-2 border-black">
          <div className="text-xs font-bold uppercase text-blue-800 mb-1">Всего</div>
          <div className="text-2xl font-black font-mono">{stats.total}</div>
        </div>

        <div className="neo-card bg-green-50 p-3 rounded-lg border-2 border-black">
          <div className="text-xs font-bold uppercase text-green-800 mb-1">Исправно</div>
          <div className="text-2xl font-black font-mono text-green-600">{stats.ok}</div>
        </div>

        <div className="neo-card bg-red-50 p-3 rounded-lg border-2 border-black">
          <div className="text-xs font-bold uppercase text-red-800 mb-1">Сломано</div>
          <div className="text-2xl font-black font-mono text-red-600">{stats.broken}</div>
        </div>

        <div className="neo-card bg-yellow-50 p-3 rounded-lg border-2 border-black">
          <div className="text-xs font-bold uppercase text-yellow-800 mb-1">Срочно</div>
          <div className="text-2xl font-black font-mono text-yellow-600">{stats.urgent}</div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-4 pb-20">
        {Object.entries(categories).map(([catId, cat]) => {
          const items = equipment[catId as keyof typeof equipment] || [];
          const brokenCount = items.filter(i => i.status === 'broken').length;
          const isExpanded = expandedCategories[catId];

          return (
            <div key={catId} className="neo-card rounded-xl overflow-hidden border-2 border-black">
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
                <div className="p-3 bg-gray-50 border-t-2 border-black space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`neo-card p-3 rounded-lg border-2 border-black bg-white ${item.status === 'broken' ? 'bg-red-50' : ''}`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(catId, item.id); }}
                            className={`font-bold text-lg ${item.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {item.status === 'ok' ? '✓' : '✗'}
                          </button>
                          <div className="flex-1">
                            <div className="font-bold text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{item.count} шт.</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.priority === 'urgent' && item.status === 'broken' && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold">СРОЧНО</span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(catId, item.id); }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {expandedItems[item.id] && (
                        <div className="mt-3 pt-3 border-t-2 border-black space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Приоритет</label>
                              <select
                                value={item.priority}
                                onChange={(e) => handleUpdateField(catId, item.id, 'priority', e.target.value)}
                                className="neo-input w-full text-sm bg-white border-2 border-black p-2"
                              >
                                <option value="normal">Обычный</option>
                                <option value="important">Важный</option>
                                <option value="urgent">Срочный</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Статус</label>
                              <select
                                value={item.taskStatus}
                                onChange={(e) => handleUpdateField(catId, item.id, 'taskStatus', e.target.value)}
                                className="neo-input w-full text-sm bg-white border-2 border-black p-2"
                              >
                                <option value="pending">Ожидает</option>
                                <option value="in_progress">В работе</option>
                                <option value="waiting">Ждет запчасти</option>
                                <option value="completed">Готово</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Ответственный</label>
                            <input
                              type="text"
                              value={item.assignedTo}
                              onChange={(e) => handleUpdateField(catId, item.id, 'assignedTo', e.target.value)}
                              placeholder="ФИО"
                              className="neo-input w-full text-sm border-2 border-black p-2"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Комментарий</label>
                            <textarea
                              value={item.comment}
                              onChange={(e) => handleUpdateField(catId, item.id, 'comment', e.target.value)}
                              className="neo-input w-full text-sm border-2 border-black p-2 min-h-[60px]"
                              placeholder="Описание проблемы..."
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Фото</label>
                            <div className="flex gap-2">
                              <label className="flex-1 neo-button bg-white text-black flex items-center justify-center gap-2 cursor-pointer text-sm border-2 border-black p-2 rounded">
                                <Camera size={16} />
                                {item.photo ? 'Изменить' : 'Добавить'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(catId, item.id, e)}
                                  className="hidden"
                                />
                              </label>
                              {item.photo && (
                                <button
                                  onClick={() => handleUpdateField(catId, item.id, 'photo', null)}
                                  className="neo-button bg-red-500 text-white px-3 border-2 border-black rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            {item.photo && (
                              <div className="mt-2 border-2 border-black rounded overflow-hidden">
                                <img src={item.photo} alt="Fault" className="w-full h-40 object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {addingToCategory === catId ? (
                    <div className="flex gap-2 animate-in fade-in">
                      <input
                        autoFocus
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Название оборудования..."
                        className="neo-input flex-1 text-sm border-2 border-black p-2"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(catId)}
                      />
                      <button
                        onClick={() => handleAddItem(catId)}
                        className="neo-button bg-green-500 text-white px-3 border-2 border-black rounded"
                      >
                        <Plus />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingToCategory(catId)}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}

export default App;
