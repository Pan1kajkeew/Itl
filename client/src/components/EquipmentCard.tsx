import React from 'react';
import { EquipmentItem, Category } from '@/types';
import { CheckCircle2, XCircle, Trash2, ChevronDown, ChevronUp, Mic, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentCardProps {
  item: EquipmentItem;
  categoryKey: string;
  category: Category;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onUpdateField: (field: keyof EquipmentItem, value: any) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceInput: () => void;
  isListening: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  item,
  category,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onDelete,
  onUpdateField,
  onPhotoUpload,
  onVoiceInput,
  isListening
}) => {
  return (
    <div 
      className={cn(
        "neo-card mb-3 rounded-lg overflow-hidden",
        item.status === 'broken' ? "bg-red-50 border-red-900" : "bg-white"
      )}
    >
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
            className={cn(
              "transition-transform active:scale-90",
              item.status === 'ok' ? "text-green-600" : "text-red-600"
            )}
          >
            {item.status === 'ok' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
          </button>
          
          <div className="flex-1">
            <div className="font-bold text-sm md:text-base">{item.name}</div>
            <div className="text-xs text-gray-500 font-mono">
              {item.count} шт. • {new Date(item.lastCheck).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.priority === 'urgent' && item.status === 'broken' && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-bold animate-pulse">
              СРОЧНО
            </span>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={18} />
          </button>
          
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 border-t-2 border-black bg-gray-50 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Количество</label>
              <input
                type="number"
                value={item.count}
                onChange={(e) => onUpdateField('count', parseInt(e.target.value) || 0)}
                className="neo-input w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Приоритет</label>
              <select
                value={item.priority}
                onChange={(e) => onUpdateField('priority', e.target.value)}
                className="neo-input w-full text-sm bg-white"
              >
                <option value="normal">Обычный</option>
                <option value="important">Важный</option>
                <option value="urgent">Срочный</option>
              </select>
            </div>
          </div>

          {/* Task Status & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Статус задачи</label>
              <select
                value={item.taskStatus}
                onChange={(e) => onUpdateField('taskStatus', e.target.value)}
                className="neo-input w-full text-sm bg-white"
              >
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="waiting">Ждет запчасти</option>
                <option value="completed">Готово</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Ответственный</label>
              <input
                type="text"
                value={item.assignedTo}
                onChange={(e) => onUpdateField('assignedTo', e.target.value)}
                placeholder="ФИО"
                className="neo-input w-full text-sm"
              />
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase text-gray-500">Комментарий</label>
              <button
                onClick={onVoiceInput}
                className={cn(
                  "text-xs px-2 py-1 rounded flex items-center gap-1 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all",
                  isListening ? "bg-red-500 text-white" : "bg-white text-black"
                )}
              >
                <Mic size={12} />
                {isListening ? 'Слушаю...' : 'Голос'}
              </button>
            </div>
            <textarea
              value={item.comment}
              onChange={(e) => onUpdateField('comment', e.target.value)}
              className="neo-input w-full text-sm min-h-[80px]"
              placeholder="Описание проблемы..."
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Фото</label>
            <div className="flex gap-2">
              <label className="flex-1 neo-button bg-white text-black flex items-center justify-center gap-2 cursor-pointer text-sm">
                <Camera size={16} />
                {item.photo ? 'Изменить' : 'Добавить'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPhotoUpload}
                  className="hidden"
                />
              </label>
              {item.photo && (
                <button
                  onClick={() => onUpdateField('photo', null)}
                  className="neo-button bg-red-500 text-white px-3"
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
  );
};
