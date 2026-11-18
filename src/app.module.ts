import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database.config';
import { ViewLocalsMiddleware } from './middleware/view-locals.middleware';

import { entities, controllers, providers } from './config/app';

@Module({
  imports: [
    TypeOrmModule.forRoot(new DatabaseConfig().create()),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: controllers,
  providers: providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ViewLocalsMiddleware)
      .forRoutes(...controllers);
  }
}
