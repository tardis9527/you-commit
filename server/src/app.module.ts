import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { KeyModule } from './modules/key/key.module';
import { GenerateModule } from './modules/generate/generate.module';
import { ChannelModule } from './modules/channel/channel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '..', '.env'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize:
          config.get<string>('DB_SYNCHRONIZE', 'false').toLowerCase() ===
          'true',
      }),
    }),
    KeyModule,
    GenerateModule,
    ChannelModule,
  ],
})
export class AppModule {}
