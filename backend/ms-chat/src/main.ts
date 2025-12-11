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

  // CORS is handled by:
  // - API Gateway for HTTP requests
  // - Socket.io Gateway for WebSocket connections
  // Do not enable CORS globally here to avoid duplicate headers

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`MS-Chat running on port ${port}`);
}
bootstrap();
