import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { badwordsCheck } from 'src/commons/badwords/badwords_check';
import { ERROR } from 'src/commons/constants/error';

@Injectable()
export class BadWordsPipe implements PipeTransform<string> {
  async transform(value: any) {
    const valuesToCheck = [
      value?.content,
      value?.name,
      value?.comment,
      value?.review,
      value?.search,
    ];

    if (valuesToCheck.some((item) => item !== undefined && item !== '' && badwordsCheck(item))) {
      throw new BadRequestException(ERROR.SWEAR_WORD);
    }
    return value;
  }
}
