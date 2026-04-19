import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    this.s3Client = new S3Client({
      region,
      // Disable automatic checksumming which can cause fetch failures in browsers
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
  }

  async getPresignedUrl(sessionId: string, fileName: string, contentType: string) {
    const key = `original/${sessionId}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return { url, key };
  }

  async getPresignedGetUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async listFiles(sessionId: string) {
    const originalCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `original/${sessionId}/`,
    });

    const compressedCommand = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `compressed/${sessionId}/`,
    });

    const [originals, compressed] = await Promise.all([
      this.s3Client.send(originalCommand),
      this.s3Client.send(compressedCommand),
    ]);

    const originalFiles = await Promise.all(
      (originals.Contents || []).map(async (c) => ({
        key: c.Key as string,
        size: c.Size as number,
        url: await this.getPresignedGetUrl(c.Key as string),
      }))
    );

    const compressedFiles = await Promise.all(
      (compressed.Contents || []).map(async (c) => ({
        key: c.Key as string,
        size: c.Size as number,
        url: await this.getPresignedGetUrl(c.Key as string),
      }))
    );

    return {
      originals: originalFiles,
      compressed: compressedFiles,
    };
  }

  getPublicUrl(key: string) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}
