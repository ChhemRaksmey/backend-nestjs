import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { entities } from '../config/app';

export class DatabaseConfig {
  create(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'nestjs_crud',
      entities: entities,
      synchronize: process.env.DB_SYNC === 'true',
    };
  }
}
