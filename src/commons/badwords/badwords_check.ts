import { BADWORDS } from 'src/commons/badwords/badwords';

export function badwordsCheck(content: string) {
  return BADWORDS.some((badword) => content.indexOf(badword) > -1);
}
