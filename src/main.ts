import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Permitir chamadas do frontend local (localhost e IP da rede)
  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ];
  // Aceita IPs comuns de redes locais na porta 3001 (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localNetRegex = /^http:\/\/(192\.168|10|172\.(1[6-9]|2[0-9]|3[0-1]))\.[0-9]{1,3}\.[0-9]{1,3}:3001$/;

  app.enableCors({
    origin: (origin, callback) => {
      // Libera chamadas sem origin (ex.: curl, Postman) e origens permitidas
      if (!origin || allowedOrigins.includes(origin) || localNetRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // ✅ Pipes de validação
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Interceptor global para padronizar respostas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ✅ Filter global para tratamento de erros
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
