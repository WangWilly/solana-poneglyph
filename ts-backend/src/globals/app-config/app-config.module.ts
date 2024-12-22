import { Global, Module } from '@nestjs/common';
import { GlobalAppConfigService } from './app-config.service';

////////////////////////////////////////////////////////////////////////////////

@Global()
@Module({
  providers: [GlobalAppConfigService],
  exports: [GlobalAppConfigService],
})
export class GlobalAppConfigModule {}
