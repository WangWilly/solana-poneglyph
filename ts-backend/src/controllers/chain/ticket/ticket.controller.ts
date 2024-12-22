import { Controller, Get, Post, Param } from '@nestjs/common';
import { TicketService } from './ticket.service';

import { TicketV1Response } from './dtos/ticket.dto';

////////////////////////////////////////////////////////////////////////////////

@Controller('api/v1/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async createTicket(): Promise<string> {
    return this.ticketService.createCoreAssetTicket();
  }

  @Get(':tid')
  async getTicket(@Param('tid') tid: string): Promise<TicketV1Response> {
    const asset = await this.ticketService.getCoreAssetTicket(tid);

    return TicketV1Response.fromAsset(asset);
  }
}
