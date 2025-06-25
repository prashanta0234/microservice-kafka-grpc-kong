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
      package: 'product',
      protoPath: join(__dirname, 'src/proto/common.proto'),
      url: '0.0.0.0:5001',
    },
  });

  await microservice.listen();
  await app.listen(process.env.PORT ?? 3000);

  console.log('Service2 is running on HTTP port 3000 and gRPC port 5001');
}
bootstrap();
