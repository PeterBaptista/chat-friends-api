import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
