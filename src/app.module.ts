import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'nest-vpc.cb6wg4so2z8u.ap-south-1.rds.amazonaws.com',
      port: 3306,
      username: 'admin',
      password: 'Ho8Awy6MBUuT5gofqsEM',
      database: 'testdb',
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    if (this.dataSource.isInitialized) {
      console.log('Connection Successful with RDS MySQL Database');
    }
  }
}