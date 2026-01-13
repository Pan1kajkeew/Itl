import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Calendar, Package, Send, Trash2, Plus, Edit2, X, ChevronDown, ChevronUp, Search, Filter, BarChart3, Camera, FileText, AlertCircle, Download, Upload, Copy, Clock, TrendingUp, Users, Bell, Mic, Image, QrCode, FileSpreadsheet, History, Zap, RefreshCw } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  status: 'ok' | 'broken';
  count: number;
  deliveryDate: string;
  priority: 'normal' | 'important' | 'urgent';
  comment: string;
  photo: string | null;
  lastCheck: string;
  assignedTo: string;
  taskStatus: 'pending' | 'in_progress' | 'waiting' | 'completed';
}

interface Category {
  title: string;
  icon: string;
}

interface ChangeLog {
  id: number;
  timestamp: string;
  engineer: string;
  action: string;
  details: string;
  store: string;
}

const ITEquipmentChecklist = () => {
  const [storeNumber, setStoreNumber] = useState('');
  const [engineer, setEngineer] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [savedStores, setSavedStores] = useState<Record<string, any>>({});
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ChangeLog[]>([]);
  const [listening, setListening] = useState(false);
  const [activeVoiceItem, setActiveVoiceItem] = useState<string | null>(null);
  const [showMassActions, setShowMassActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦' });
  const [newItem, setNewItem] = useState('');

  const initialCategories: Record<string, Category> = {
    cash: { title: 'Кассовое оборудование', icon: '💰' },
    server: { title: 'Серверное оборудование', icon: '🖥️' },
    video: { title: 'Видеонаблюдение', icon: '📹' },
    audio: { title: 'Аудиооборудование', icon: '🔊' },
    kso: { title: 'КСО и СКУД', icon: '🔐' }
  };

  const initialEquipment: Record<string, Equipment[]> = {
    cash: [
      { id: 'cash_1', name: 'Кассовый узел', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_2', name: 'Дисплей покупателя', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_3', name: 'Монитор кассира', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_4', name: 'Сканер-весы', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_5', name: '2D сканер', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_6', name: 'Системный блок', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_7', name: 'ИБП', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'cash_8', name: 'Аккумулятор для ИБП', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' }
    ],
    server: [
      { id: 'srv_1', name: 'Сервер', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'srv_2', name: 'Коммутатор (Switch)', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'srv_3', name: 'Маршрутизатор (Router)', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' }
    ],
    video: [
      { id: 'vid_1', name: 'Видеорегистратор цифровой', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'vid_2', name: 'IP камера', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' }
    ],
    audio: [
      { id: 'aud_1', name: 'Цифровой усилитель', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'aud_2', name: 'Колонки потолочные', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' }
    ],
    kso: [
      { id: 'kso_1', name: 'КСО', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' },
      { id: 'kso_2', name: 'Контроллер доступа', status: 'ok', count: 1, deliveryDate: '', priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(), assignedTo: '', taskStatus: 'pending' }
    ]
  };

  const [categories, setCategories] = useState<Record<string, Category>>(initialCategories);
  const [equipment, setEquipment] = useState<Record<string, Equipment[]>>(initialEquipment);

  // Загрузка из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('it_checklist_pro');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.equipment) setEquipment(data.equipment);
        if (data.categories) setCategories(data.categories);
        if (data.storeNumber) setStoreNumber(data.storeNumber);
        if (data.engineer) setEngineer(data.engineer);
        if (data.savedStores) setSavedStores(data.savedStores);
        if (data.changeHistory) setChangeHistory(data.changeHistory);
      } catch (e) {}
    }
    checkNotifications();
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    const data = { equipment, categories, storeNumber, engineer, savedStores, changeHistory };
    localStorage.setItem('it_checklist_pro', JSON.stringify(data));
  }, [equipment, categories, storeNumber, engineer, savedStores, changeHistory]);

  // История изменений
  const logChange = (action: string, details: string) => {
    const entry: ChangeLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      engineer: engineer || 'Неизвестно',
      action,
      details,
      store: storeNumber
    };
    setChangeHistory(prev => [entry, ...prev].slice(0, 100));
  };

  // Проверка уведомлений
  const checkNotifications = () => {
    const alerts: any[] = [];
    Object.entries(equipment).forEach(([cat, items]) => {
      items.forEach(item => {
        if (item.status === 'broken' && item.deliveryDate) {
          const daysLeft = Math.ceil((new Date(item.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 3 && daysLeft >= 0) {
            alerts.push({ item: item.name, days: daysLeft, priority: item.priority });
          }
        }
      });
    });
    setNotifications(alerts);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleStatus = (category: string, id: string) => {
    setEquipment(prev => ({
      ...prev,
      [category]: prev[category].map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'ok' ? 'broken' : 'ok';
          logChange(newStatus === 'broken' ? 'Отмечено неисправным' : 'Отмечено исправным', `${item.name} в категории ${categories[category].title}`);
          return { ...item, status: newStatus, lastCheck: new Date().toISOString() };
        }
        return item;
      })
    }));
  };

  const updateField = (category: string, id: string, field: keyof Equipment, value: any) => {
    setEquipment(prev => ({
      ...prev,
      [category]: prev[category].map(item => {
        if (item.id === id) {
          logChange(`Обновлено поле ${field}`, `${item.name}: ${value}`);
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const addItem = (categoryId: string) => {
    if (!newItem.trim()) return;
    const itemId = categoryId + '_' + Date.now();
    setEquipment(prev => ({
      ...prev,
      [categoryId]: [...prev[categoryId], {
        id: itemId, name: newItem, status: 'ok', count: 1, deliveryDate: '',
        priority: 'normal', comment: '', photo: null, lastCheck: new Date().toISOString(),
        assignedTo: '', taskStatus: 'pending'
      }]
    }));
    logChange('Добавлена позиция', `${newItem} в ${categories[categoryId].title}`);
    setNewItem('');
    setShowAddItem(null);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    const item = equipment[categoryId].find(i => i.id === itemId);
    if (item) {
      logChange('Удалена позиция', `${item.name} из ${categories[categoryId].title}`);
      setEquipment(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(item => item.id !== itemId)
      }));
    }
  };

  // Голосовой ввод
  const startVoiceInput = (category: string, itemId: string) => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Голосовой ввод не поддерживается в вашем браузере');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setActiveVoiceItem(itemId);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      updateField(category, itemId, 'comment', transcript);
      setListening(false);
      setActiveVoiceItem(null);
    };

    recognition.onerror = () => {
      setListening(false);
      setActiveVoiceItem(null);
    };

    recognition.start();
  };

  // Фото
  const handlePhotoUpload = (category: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = (event.target as FileReader)?.result;
        updateField(category, itemId, 'photo', result);
        logChange('Добавлено фото', `К позиции ${equipment[category].find(i => i.id === itemId)?.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Экспорт в Telegram
  const exportToTelegram = async () => {
    let message = `🔧 ЗАЯВКА НА ОБОРУДОВАНИЕ\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📍 Магазин: ${storeNumber || 'Не указан'}\n`;
    message += `👷 Инженер: ${engineer || 'Не указан'}\n`;
    message += `📅 Дата: ${new Date(checkDate).toLocaleDateString('ru-RU')}\n\n`;

    const urgent: any[] = [], important: any[] = [], normal: any[] = [];
    Object.entries(equipment).forEach(([category, items]) => {
      items.filter(i => i.status === 'broken').forEach(i => {
        const data = { category: categories[category], item: i };
        if (i.priority === 'urgent') urgent.push(data);
        else if (i.priority === 'important') important.push(data);
        else normal.push(data);
      });
    });

    const addItems = (arr: any[], title: string) => {
      if (arr.length > 0) {
        message += `${title}\n`;
        arr.forEach(({ category, item }) => {
          message += `${category.icon} ${item.name}\n   Кол-во: ${item.count} шт.\n`;
          if (item.deliveryDate) message += `   📦 До: ${new Date(item.deliveryDate).toLocaleDateString('ru-RU')}\n`;
          if (item.comment) message += `   💬 ${item.comment}\n`;
          if (item.assignedTo) message += `   👤 Ответственный: ${item.assignedTo}\n`;
          if (item.taskStatus !== 'pending') message += `   ⚙️ Статус: ${item.taskStatus === 'in_progress' ? 'В работе' : item.taskStatus === 'waiting' ? 'Ожидает' : 'Выполнено'}\n`;
          message += `\n`;
        });
      }
    };

    addItems(urgent, '🚨 СРОЧНО:');
    addItems(important, '⚠️ ВАЖНО:');
    addItems(normal, '📋 ОБЫЧНОЕ:');

    if (urgent.length + important.length + normal.length === 0) {
      message += `✅ Все оборудование исправно\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━\n${new Date().toLocaleString('ru-RU')}`;

    try {
      await navigator.clipboard.writeText(message);
      alert('✅ Отчет скопирован!\n\nОткройте Telegram и вставьте');
    } catch {
      alert('❌ Ошибка копирования');
    }
  };

  // Экспорт в JSON
  const exportToJSON = () => {
    const data = { storeNumber, engineer, checkDate, equipment, categories, changeHistory, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_${storeNumber}_${checkDate}.json`;
    a.click();
  };

  // Экспорт в Excel
  const exportToExcel = () => {
    let csv = 'Категория,Название,Статус,Количество,Дата доставки,Приоритет,Комментарий,Ответственный\n';
    Object.entries(equipment).forEach(([cat, items]) => {
      items.forEach(item => {
        csv += `"${categories[cat].title}","${item.name}","${item.status}","${item.count}","${item.deliveryDate}","${item.priority}","${item.comment}","${item.assignedTo}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist_${storeNumber}_${checkDate}.csv`;
    a.click();
  };

  // Сохранение магазина
  const saveCurrentStore = () => {
    if (!storeNumber) return alert('Укажите номер магазина');
    const storeId = 'store_' + Date.now();
    setSavedStores(prev => ({
      ...prev,
      [storeId]: { storeNumber, engineer, equipment, categories, savedAt: new Date().toISOString() }
    }));
    setCurrentStoreId(storeId);
    logChange('Сохранен магазин', storeNumber);
    alert(`✅ Магазин ${storeNumber} сохранен`);
  };

  // Статистика
  const stats = () => {
    let total = 0, broken = 0, urgent = 0, important = 0;
    const categoryStats: Record<string, any> = {};
    const itemFrequency: Record<string, number> = {};

    Object.entries(equipment).forEach(([cat, items]) => {
      total += items.length;
      categoryStats[cat] = { total: items.length, broken: 0 };

      items.forEach(i => {
        if (i.status === 'broken') {
          broken++;
          categoryStats[cat].broken++;
          itemFrequency[i.name] = (itemFrequency[i.name] || 0) + 1;
          if (i.priority === 'urgent') urgent++;
          if (i.priority === 'important') important++;
        }
      });
    });

    const topBroken = Object.entries(itemFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { total, ok: total - broken, broken, urgent, important, categoryStats, topBroken };
  };

  const filteredEquipment = () => {
    const result: Record<string, Equipment[]> = {};
    Object.entries(equipment).forEach(([category, items]) => {
      let filtered = items;
      if (searchQuery) filtered = filtered.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filterMode === 'broken') filtered = filtered.filter(i => i.status === 'broken');
      else if (filterMode === 'ok') filtered = filtered.filter(i => i.status === 'ok');
      if (filtered.length > 0) result[category] = filtered;
    });
    return result;
  };

  const statsData = stats();
  const filtered = filteredEquipment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Уведомления */}
        {notifications.length > 0 && (
          <div className="bg-orange-100 border-2 border-orange-400 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="text-orange-600" size={20} />
              <h3 className="font-bold text-orange-800">⚠️ Уведомления ({notifications.length})</h3>
            </div>
            <div className="space-y-1">
              {notifications.map((n, i) => (
                <div key={i} className="text-sm text-orange-700">
                  📦 {n.item} - осталось {n.days} дней
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Заголовок */}
        <div className="bg-white rounded-2xl p-4 mb-4 border-4 border-black shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package size={32} className="text-blue-600" />
              <h1 className="text-3xl font-black">IT CHECKLIST PRO</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAnalytics(!showAnalytics)} className="p-2 bg-blue-500 text-white rounded-lg">
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setShowHistory(!showHistory)} className="p-2 bg-purple-500 text-white rounded-lg">
                <History size={20} />
              </button>
            </div>
          </div>

          {/* Форма */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input type="text" placeholder="Номер магазина" value={storeNumber} onChange={(e) => setStoreNumber(e.target.value)} className="border-2 border-black p-2 rounded" />
            <input type="text" placeholder="ФИ инженера" value={engineer} onChange={(e) => setEngineer(e.target.value)} className="border-2 border-black p-2 rounded" />
            <input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} className="border-2 border-black p-2 rounded" />
          </div>

          {/* Кнопки */}
          <div className="flex flex-wrap gap-2">
            <button onClick={exportToTelegram} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded font-bold">
              <Send size={18} /> Telegram
            </button>
            <button onClick={exportToJSON} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded font-bold">
              <Download size={18} /> JSON
            </button>
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded font-bold">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button onClick={saveCurrentStore} className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded font-bold">
              <Copy size={18} /> Сохранить
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-100 border-2 border-black p-3 rounded-lg">
            <div className="text-xs font-bold">ВСЕГО</div>
            <div className="text-2xl font-black">{statsData.total}</div>
          </div>
          <div className="bg-green-100 border-2 border-black p-3 rounded-lg">
            <div className="text-xs font-bold">ИСПРАВНО</div>
            <div className="text-2xl font-black text-green-600">{statsData.ok}</div>
          </div>
          <div className="bg-red-100 border-2 border-black p-3 rounded-lg">
            <div className="text-xs font-bold">СЛОМАНО</div>
            <div className="text-2xl font-black text-red-600">{statsData.broken}</div>
          </div>
          <div className="bg-yellow-100 border-2 border-black p-3 rounded-lg">
            <div className="text-xs font-bold">СРОЧНО</div>
            <div className="text-2xl font-black text-yellow-600">{statsData.urgent}</div>
          </div>
        </div>

        {/* Поиск и фильтр */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2 text-gray-400" size={20} />
            <input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border-2 border-black p-2 pl-8 rounded" />
          </div>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="border-2 border-black p-2 rounded">
            <option value="all">Все</option>
            <option value="ok">Исправные</option>
            <option value="broken">Сломанные</option>
          </select>
        </div>

        {/* Оборудование */}
        <div className="space-y-3">
          {Object.entries(filtered).map(([catId, items]) => (
            <div key={catId} className="bg-white border-4 border-black rounded-xl overflow-hidden">
              <div className="p-4 bg-blue-50 flex items-center justify-between cursor-pointer" onClick={() => toggleCategory(catId)}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categories[catId]?.icon}</span>
                  <div>
                    <h3 className="font-black text-lg">{categories[catId]?.title}</h3>
                    <div className="text-xs text-gray-600">{items.length} позиций</div>
                  </div>
                </div>
                {expandedCategories[catId] ? <ChevronUp /> : <ChevronDown />}
              </div>

              {expandedCategories[catId] && (
                <div className="p-3 space-y-2 border-t-4 border-black">
                  {items.map(item => (
                    <div key={item.id} className={`border-2 border-black p-3 rounded-lg ${item.status === 'broken' ? 'bg-red-50' : 'bg-green-50'}`}>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleItem(item.id)}>
                        <div className="flex items-center gap-2 flex-1">
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(catId, item.id); }} className={`text-2xl font-bold ${item.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                            {item.status === 'ok' ? '✓' : '✗'}
                          </button>
                          <div>
                            <div className="font-bold">{item.name}</div>
                            <div className="text-xs text-gray-600">{item.count} шт.</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.priority === 'urgent' && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold">СРОЧНО</span>}
                          <button onClick={(e) => { e.stopPropagation(); deleteItem(catId, item.id); }} className="text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </div>

                      {expandedItems[item.id] && (
                        <div className="mt-3 pt-3 border-t-2 border-black space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <select value={item.priority} onChange={(e) => updateField(catId, item.id, 'priority', e.target.value)} className="border-2 border-black p-2 rounded text-sm">
                              <option value="normal">Обычный</option>
                              <option value="important">Важный</option>
                              <option value="urgent">Срочный</option>
                            </select>
                            <select value={item.taskStatus} onChange={(e) => updateField(catId, item.id, 'taskStatus', e.target.value)} className="border-2 border-black p-2 rounded text-sm">
                              <option value="pending">Ожидает</option>
                              <option value="in_progress">В работе</option>
                              <option value="waiting">Ждет запчасти</option>
                              <option value="completed">Готово</option>
                            </select>
                          </div>
                          <input type="text" placeholder="Ответственный" value={item.assignedTo} onChange={(e) => updateField(catId, item.id, 'assignedTo', e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" />
                          <input type="date" value={item.deliveryDate} onChange={(e) => updateField(catId, item.id, 'deliveryDate', e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" />
                          <textarea placeholder="Комментарий..." value={item.comment} onChange={(e) => updateField(catId, item.id, 'comment', e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm min-h-12" />
                          <div className="flex gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded cursor-pointer font-bold">
                              <Camera size={18} /> Фото
                              <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(catId, item.id, e)} className="hidden" />
                            </label>
                            <button onClick={() => startVoiceInput(catId, item.id)} className={`flex-1 flex items-center justify-center gap-2 ${listening && activeVoiceItem === item.id ? 'bg-red-500' : 'bg-purple-500'} text-white p-2 rounded font-bold`}>
                              <Mic size={18} /> {listening && activeVoiceItem === item.id ? 'Слушаю...' : 'Голос'}
                            </button>
                          </div>
                          {item.photo && <img src={item.photo} alt="Fault" className="w-full h-32 object-cover rounded border-2 border-black" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* История */}
        {showHistory && (
          <div className="mt-4 bg-white border-4 border-black rounded-xl p-4">
            <h3 className="font-black text-lg mb-3">📋 История изменений</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {changeHistory.map(entry => (
                <div key={entry.id} className="text-xs border-l-4 border-blue-500 pl-2 py-1">
                  <div className="font-bold">{entry.action}</div>
                  <div className="text-gray-600">{entry.details}</div>
                  <div className="text-gray-500">{new Date(entry.timestamp).toLocaleString('ru-RU')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Аналитика */}
        {showAnalytics && (
          <div className="mt-4 bg-white border-4 border-black rounded-xl p-4">
            <h3 className="font-black text-lg mb-3">📊 Аналитика</h3>
            <div className="grid grid-cols-2 gap-3">
              {statsData.topBroken.map(([name, count]) => (
                <div key={name} className="border-2 border-black p-2 rounded">
                  <div className="text-sm font-bold">{name}</div>
                  <div className="text-lg font-black text-red-600">{count} раз</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITEquipmentChecklist;
