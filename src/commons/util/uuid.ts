import { now } from 'mongoose';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

export const generateUUID = (from?: string): string => {
  const uid = from || uuidv4();
  return uuidv5(uid, uuidv5.DNS).replace(/-/g, '');
};

export const generateShortUUID = (from?: string): string => {
  const uid = generateUUID(from || now().toString());
  return uid.substring(0, 24);
};

export const generateUUID5 = (from?: string): string => {
  const uid = from ? uuidv5(from, uuidv5.DNS) : uuidv5(now().toString(), uuidv5.DNS);
  return uid.replace(/-/g, '');
};
