import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // errors on unknown fields
      transform: true, // transforms payloads to DTO instances where possible
    }),
  );
  
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
