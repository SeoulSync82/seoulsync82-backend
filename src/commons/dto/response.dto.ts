import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class ResponseDataDto {
  items: Array<any>;
  last_item?: any;
  last_item_id?: number;
  mockup?: boolean;
  cache?: boolean;
  total?: number;
  constructor(
    items: Array<any>,
    last_item?: any,
    last_item_id?: number,
    mockup?: boolean,
    cache?: boolean,
    total?: number,
  ) {
    this.items = items;
    this.last_item_id = last_item_id ?? 0;
    this.mockup = mockup ? mockup : false;
    this.cache = cache ? cache : false;
  }

  static from(
    array: Array<any>,
    last_item?: any,
    last_item_id?: number,
    mockup?: boolean,
    cache?: boolean,
    total?: number,
  ) {
    return new ResponseDataDto(array, last_item, last_item_id, mockup, cache);
  }

  static fromArray(array: Array<any>, mockup?: boolean, cache?: boolean) {
    return new ResponseDataDto(array, null, null, mockup, cache);
  }

  static fromArrayWithTotal(array: Array<any>, total?: number, mockup?: boolean, cache?: boolean) {
    return new ResponseDataDto(array, total, null, mockup ? mockup : false, cache);
  }
}

export class ResponseDto {
  @Expose()
  @ApiProperty({
    example: '{items:[],last_item_id:0}',
    description: '목록 데이타',
  })
  data: ResponseDataDto;

  @ApiProperty({
    example: 'SUCCESS',
    description: '유저이름',
  })
  status: string;

  @ApiProperty({
    example: 200,
    description: '유저아이디',
  })
  status_code: number;
}

export class DetailResponseDto {
  @Expose()
  @ApiProperty({
    example: '{}',
    description: '데이터',
  })
  data: any;

  constructor(data: any) {
    this.data = { ...data, mockup: data.mockup ? true : false };
  }

  static from(data: any) {
    return new DetailResponseDto(data).data;
  }

  static uuid(data: any) {
    return new DetailResponseDto({ uuid: data.uuid == undefined ? data : data.uuid }).data;
  }

  static notification(data: any, notification?: any) {
    return new DetailResponseDto({ data, notification }).data;
  }
}

export class AffectedResponseDto {
  @Expose()
  @ApiProperty({
    example: '{}',
    description: '데이터',
  })
  data: any;

  constructor(data: any) {
    this.data = { ...data, mockup: data.mockup ? true : false };
  }

  static from(affected: number, mockup?: boolean): DetailResponseDto {
    return new DetailResponseDto({ affected_count: affected, mockup: mockup }).data;
  }
}

export class ResponseTotalDataDto {
  items: Array<any>;
  total?: number;
  last_item?: any;
  last_item_id?: number;
  mockup?: boolean;
  cache?: boolean;

  constructor(
    items: Array<any>,
    total?: number,
    last_item?: any,
    last_item_id?: number,
    mockup?: boolean,
    cache?: boolean,
  ) {
    this.items = items;
    this.total = total ?? 0;
    this.last_item_id = last_item_id ?? 0;
    this.mockup = mockup ? mockup : false;
    this.cache = cache ? cache : false;
  }

  static from(
    array: Array<any>,
    total?: number,
    last_item?: any,
    last_item_id?: number,
    mockup?: boolean,
    cache?: boolean,
  ) {
    return new ResponseTotalDataDto(array, total, last_item, last_item_id, mockup, cache);
  }
}
