import { v4, v5 } from 'uuid';
import { fromString } from 'uuidv4';
import { now } from 'mongoose';

export const generateUUID = (from?: string): string => {
  const uid = from ? fromString(from) : v4();
  return v5('newming.io', uid).replace(/-/g, '');
};

export const generateShortUUID = (from?: string): string => {
  const uid = generateUUID(from ? from : now().toString());
  return uid.substring(0, 24);
};

export const generateUUID5 = (from?: string): string => {
  const uid = from ? v5(from, v5.DNS) : v5(from, v5.DNS);
  return uid.replace(/-/g, '');
};
