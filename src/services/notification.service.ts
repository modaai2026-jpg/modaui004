/**
 * Notification Service - 全系统事件通知中心
 * 实现 EventEmitter 模式，支持实时通知派发
 * 兼容 WebSocket 长连接和本地事件系统
 */

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error' | 'critical';
export type NotificationCategory = 'auth' | 'system' | 'payment' | 'order' | 'agent' | 'audit' | 'config';

export interface Notification {
  id: string;
  timestamp: number;
  level: NotificationLevel;
  category: NotificationCategory;
  title: string;
  message: string;
  details?: Record<string, any>;
  actionUrl?: string;
  read: boolean;
}

type NotificationListener = (notification: Notification) => void;

class NotificationService {
  private listeners: Map<NotificationCategory | 'all', Set<NotificationListener>> = new Map();
  private notificationHistory: Notification[] = [];
  private maxHistorySize = 500;
  private webSocketConnection: WebSocket | null = null;

  constructor() {
    this.initializeListeners();
    this.initializeWebSocket();
  }

  private initializeListeners() {
    const categories: (NotificationCategory | 'all')[] = ['auth', 'system', 'payment', 'order', 'agent', 'audit', 'config', 'all'];
    categories.forEach(cat => this.listeners.set(cat, new Set()));
  }

  private initializeWebSocket() {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

    try {
      this.webSocketConnection = new WebSocket(wsUrl);
      this.webSocketConnection.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          this.dispatch(notification);
        } catch (e) {
          console.error('Failed to parse WebSocket notification:', e);
        }
      };
      this.webSocketConnection.onerror = (error) => {
        console.error('WebSocket connection error:', error);
      };
    } catch (e) {
      console.warn('WebSocket initialization failed, falling back to polling:', e);
    }
  }

  /**
   * 发送通知到全系统
   */
  public notify(
    title: string,
    message: string,
    options: {
      level?: NotificationLevel;
      category?: NotificationCategory;
      details?: Record<string, any>;
      actionUrl?: string;
    } = {}
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: options.level || 'info',
      category: options.category || 'system',
      title,
      message,
      details: options.details,
      actionUrl: options.actionUrl,
      read: false
    };

    this.dispatch(notification);
    return notification;
  }

  /**
   * 内部派发方法
   */
  private dispatch(notification: Notification) {
    // 保存到历史
    this.notificationHistory.unshift(notification);
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory.pop();
    }

    // 通知特定类别的监听器
    const categoryListeners = this.listeners.get(notification.category);
    if (categoryListeners) {
      categoryListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (e) {
          console.error('Error in notification listener:', e);
        }
      });
    }

    // 通知全局监听器
    const allListeners = this.listeners.get('all');
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (e) {
          console.error('Error in global notification listener:', e);
        }
      });
    }
  }

  /**
   * 订阅特定类别的通知
   */
  public subscribe(category: NotificationCategory | 'all', listener: NotificationListener): () => void {
    const categoryListeners = this.listeners.get(category);
    if (categoryListeners) {
      categoryListeners.add(listener);
    }

    // 返回取消订阅函数
    return () => {
      if (categoryListeners) {
        categoryListeners.delete(listener);
      }
    };
  }

  /**
   * 获取通知历史
   */
  public getHistory(limit?: number): Notification[] {
    return limit ? this.notificationHistory.slice(0, limit) : [...this.notificationHistory];
  }

  /**
   * 获取未读通知
   */
  public getUnread(): Notification[] {
    return this.notificationHistory.filter(n => !n.read);
  }

  /**
   * 标记为已读
   */
  public markAsRead(notificationId: string) {
    const notification = this.notificationHistory.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * 清空历史
   */
  public clearHistory() {
    this.notificationHistory = [];
  }
}

export const notificationService = new NotificationService();

