import { Module } from '@nestjs/common';

import { AnchorClientModule } from './commons/anchor-client/anchor-client.module';
import { GlobalAppConfigModule } from 'src/globals/app-config/app-config.module';
import { TicketService } from './ticket/ticket.service';
import { TicketController } from './ticket/ticket.controller';
import { TicketHelperService } from './helpers/ticket-helper.service';

////////////////////////////////////////////////////////////////////////////////

@Module({
  imports: [AnchorClientModule, GlobalAppConfigModule],
  controllers: [TicketController],
  providers: [TicketHelperService, TicketService],
})
export class ChainModule {}
