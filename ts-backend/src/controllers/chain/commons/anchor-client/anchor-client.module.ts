import { Module } from '@nestjs/common';

import { GlobalAppConfigModule } from '../../../../globals/app-config/app-config.module';

import { AnchorClientService } from './anchor-client.service';

////////////////////////////////////////////////////////////////////////////////

@Module({
  imports: [GlobalAppConfigModule],
  providers: [AnchorClientService],
  exports: [AnchorClientService],
})
export class AnchorClientModule {}
