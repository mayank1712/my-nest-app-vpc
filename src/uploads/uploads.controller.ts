import { Controller, Get, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('presigned-url')
  async getPresignedUrl(
    @Query('sessionId') sessionId: string,
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
  ) {
    return this.uploadsService.getPresignedUrl(sessionId, fileName, contentType);
  }

  @Get('list')
  async listFiles(@Query('sessionId') sessionId: string) {
    return this.uploadsService.listFiles(sessionId);
  }
}
