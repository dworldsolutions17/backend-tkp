import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SeedService } from './database/seed.service';
import { GlobalExceptionFilter } from './common/exceptions/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages: Record<string, string[]> = {};
        errors.forEach(error => {
          messages[error.property] = Object.values(error.constraints || {});
        });
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
          errors: messages,
          timestamp: new Date().toISOString(),
        });
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global response interceptor for success messages
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('The Kidz Planet API')
    .setDescription('E-commerce API for The Kidz Planet')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Seed default admin user
  const seedService = app.get(SeedService);
  await seedService.seedDefaultAdmin();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger API docs: http://localhost:${port}/api`);
}
bootstrap();
