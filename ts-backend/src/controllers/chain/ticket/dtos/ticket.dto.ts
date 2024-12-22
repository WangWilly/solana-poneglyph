import { IsString, IsNumber } from 'class-validator';

import { AssetV1 } from '@metaplex-foundation/mpl-core';

////////////////////////////////////////////////////////////////////////////////

export class TicketV1BatchCreateReq {
  @IsNumber()
  count: number;
}

////////////////////////////////////////////////////////////////////////////////

export class TicketV1Query {
  @IsString()
  ticketId: string;
}

////////////////////////////////////////////////////////////////////////////////

export class TicketV1Response {
  @IsString()
  address: string;

  @IsString()
  name: string;

  @IsString()
  uri: string;

  //////////////////////////////////////////////////////////////////////////////

  static fromAsset(asset: AssetV1): TicketV1Response {
    return {
      address: asset.key.toString(),
      name: asset.name,
      uri: asset.uri,
    };
  }
}
