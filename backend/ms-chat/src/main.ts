import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:8100',
      'http://127.0.0.1:4200',
      'http://127.0.0.1:8100',
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`MS-Chat running on port ${port}`);
}
bootstrap();
