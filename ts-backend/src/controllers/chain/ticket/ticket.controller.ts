import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { TicketService } from './ticket.service';

import { TicketV1Response, TicketV1BatchCreateReq } from './dtos/ticket.dto';

////////////////////////////////////////////////////////////////////////////////

@Controller('api/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post('v1')
  async createTicket(): Promise<string> {
    return this.ticketService.createCoreAssetTicket();
  }

  @Post('v1/batch')
  async batchCreateTicket(
    @Body() req: TicketV1BatchCreateReq,
  ): Promise<string[]> {
    return this.ticketService.batchCreateCoreAssetTicket(req.count);
  }

  @Get('v1/:tid')
  async getTicket(@Param('tid') tid: string): Promise<TicketV1Response> {
    const asset = await this.ticketService.getCoreAssetTicket(tid);

    return TicketV1Response.fromAsset(asset);
  }
}
