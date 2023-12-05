import { BADWORDS } from './badwords';

export function badwordsCheck(content: string) {
  return BADWORDS.some((badword) => content.indexOf(badword) > -1);
}
