import { Module } from '@nestjs/common';

import { AnchorClientModule } from './commons/anchor-client/anchor-client.module';
import { GlobalAppConfigModule } from 'src/globals/app-config/app-config.module';
import { TicketService } from './ticket/ticket.service';
import { TicketController } from './ticket/ticket.controller';

////////////////////////////////////////////////////////////////////////////////

@Module({
  imports: [AnchorClientModule, GlobalAppConfigModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class ChainModule {}
