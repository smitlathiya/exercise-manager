import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(relativeTime);
dayjs.extend(isoWeek);

export const fromNow = (ts: number): string => dayjs(ts).fromNow();
export const formatDate = (ts: number, fmt = 'MMM D, YYYY'): string =>
  dayjs(ts).format(fmt);
export const formatTime = (ts: number, fmt = 'HH:mm'): string =>
  dayjs(ts).format(fmt);
export const formatDay = (ts: number): string => dayjs(ts).format('ddd');

export const startOfWeek = (): number => dayjs().startOf('isoWeek').valueOf();
export const startOfDay = (): number => dayjs().startOf('day').valueOf();
export const endOfDay = (): number => dayjs().endOf('day').valueOf();

export const dayKey = (ts: number): string => dayjs(ts).format('YYYY-MM-DD');

export { dayjs };
