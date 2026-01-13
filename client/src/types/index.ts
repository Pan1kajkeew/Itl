export type Priority = 'normal' | 'important' | 'urgent';
export type Status = 'ok' | 'broken';
export type TaskStatus = 'pending' | 'in_progress' | 'waiting' | 'completed';

export interface EquipmentItem {
  id: string;
  name: string;
  status: Status;
  count: number;
  deliveryDate: string;
  priority: Priority;
  comment: string;
  photo: string | null;
  lastCheck: string;
  assignedTo: string;
  taskStatus: TaskStatus;
}

export interface Category {
  title: string;
  icon: string;
}

export interface Categories {
  [key: string]: Category;
}

export interface EquipmentData {
  [key: string]: EquipmentItem[];
}

export interface ChangeLogEntry {
  id: number;
  timestamp: string;
  engineer: string;
  action: string;
  details: string;
  store: string;
}

export interface Notification {
  item: string;
  days: number;
  priority: Priority;
}

export interface StatsData {
  total: number;
  ok: number;
  broken: number;
  urgent: number;
  important: number;
  topBroken: [string, number][];
  categoryStats: {
    [key: string]: {
      total: number;
      broken: number;
    };
  };
}
