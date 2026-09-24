import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseService } from './db/database.service.js';
import { DatabaseModule } from './db/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BorrowModule } from './borrows/borrow.module.js';
import { BookModule } from './books/book.module.js';
import { ReviewModule } from './reviews/review.module.js';
import { UserModule } from './users/user.module.js';
import { SentryModule } from '@sentry/nestjs/setup';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BorrowModule,
    BookModule,
    ReviewModule,
    UserModule,
    SentryModule
  ],
  controllers: [AppController],
  providers: [AppService , DatabaseService, {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter, // Auto-captures unhandled backend crashes
    },],
  exports: [DatabaseService]
})
export class AppModule {}
