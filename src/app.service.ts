import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World Pipeline RUN Successfully form master branch!';
  }
}
