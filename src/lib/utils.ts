import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付をフォーマット
 */
export function formatDate(input: string | Date): string {
  try {
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * 時刻をフォーマット
 */
export function formatTime(timeStr: string): string {
  try {
    const time = new Date(`2000-01-01 ${timeStr}`);
    return time.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return timeStr;
  }
}

/**
 * 日時をフォーマット
 */
export function formatDateTime(input: string | Date): string {
  try {
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const dateStr = formatDate(date);
    const timeStr = date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} ${timeStr}`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * 価格をフォーマット
 */
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

/**
 * 通貨をフォーマット
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(Math.round(amount));
}
