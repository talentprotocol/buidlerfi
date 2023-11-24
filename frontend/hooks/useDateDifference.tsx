import { differenceInMinutes } from "date-fns";

const today = new Date();

export const useDateDifferenceFromNow = (date?: Date) => {
  if (!date) return "";
  const minutes = differenceInMinutes(today, date);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
};
