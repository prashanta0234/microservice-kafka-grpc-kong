import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  // Create HTTP app
  const app = await NestFactory.create(AppModule);

  // Create gRPC microservice
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, 'src/proto/common.proto'),
      url: '0.0.0.0:5000',
    },
  });

  await microservice.listen();
  await app.listen(process.env.PORT ?? 3001);

  console.log('Service1 is running on HTTP port 3001 and gRPC port 5000');
}
bootstrap();
