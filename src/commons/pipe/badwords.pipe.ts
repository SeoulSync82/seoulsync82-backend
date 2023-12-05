import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ERROR } from 'src/auth/constants/error';
import { badwordsCheck } from '../badwords/badwords_check';

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
