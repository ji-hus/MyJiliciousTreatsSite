import { format } from 'date-fns';
import { BUSINESS_HOURS } from '@/config/constants';

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const getAvailablePickupDates = (date: Date, hasMadeToOrderItems: boolean): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (hasMadeToOrderItems) {
    const currentDay = today.getDay();
    const daysUntilWednesday = (3 - currentDay + 7) % 7;
    const orderDeadline = new Date(today);
    orderDeadline.setDate(today.getDate() + daysUntilWednesday);
    orderDeadline.setHours(18, 0, 0, 0);

    if (today > orderDeadline) {
      orderDeadline.setDate(orderDeadline.getDate() + 7);
    }

    const isThursday = date.getDay() === 4;
    const isFriday = date.getDay() === 5;
    const isSaturday = date.getDay() === 6;
    
    const minPickupDate = new Date(today);
    minPickupDate.setDate(today.getDate() + 1);
    
    return (isThursday || isFriday || isSaturday) && date >= minPickupDate;
  } else {
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;
    const minPickupDate = new Date(today);
    minPickupDate.setDate(today.getDate() + 1);
    
    return isWeekday && date >= minPickupDate;
  }
};

export const getAvailablePickupTimes = (hasMadeToOrderItems: boolean): string[] => {
  if (hasMadeToOrderItems) {
    return [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
      "5:00 PM"
    ];
  } else {
    return [
      "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
      "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
      "5:00 PM"
    ];
  }
};

export const formatPickupMessage = (inStockDate?: Date, inStockTime?: string, madeToOrderDate?: Date, madeToOrderTime?: string): string => {
  let message = '';
  if (inStockDate && inStockTime) {
    message += `We'll see you on ${format(inStockDate, 'MMMM d, yyyy')} at ${inStockTime} for in-stock items`;
  }
  if (madeToOrderDate && madeToOrderTime) {
    if (message) message += ' and ';
    message += `on ${format(madeToOrderDate, 'MMMM d, yyyy')} at ${madeToOrderTime} for made-to-order items`;
  }
  return message;
}; 