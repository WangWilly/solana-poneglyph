import * as anchor from '@coral-xyz/anchor';
import { Injectable } from '@nestjs/common';

import { AnchorClientService } from 'src/controllers/chain/commons/anchor-client/anchor-client.service';

import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

import { GlobalAppConfigService } from 'src/globals/app-config/app-config.service';
import { Keypair, Transaction } from '@solana/web3.js';
import { AssetV1 } from '@metaplex-foundation/mpl-core';

import * as fs from 'fs';
import { TicketHelperService } from 'src/controllers/chain/helpers/ticket-helper.service';

////////////////////////////////////////////////////////////////////////////////

class ConfigSchema {
  @IsString()
  readonly SYSTEM_PAYER_KEYPAIR_FILE: string;
}

////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class TicketService {
  private readonly systemPayer: anchor.web3.Keypair;

  constructor(
    private readonly globalAppConfigService: GlobalAppConfigService,
    private readonly anchorClientService: AnchorClientService,
    private readonly ticketHelperService: TicketHelperService,
  ) {
    // setup config
    const cfg = plainToInstance(
      ConfigSchema,
      this.globalAppConfigService.getUnstructedAppConfig(),
    );
    const errors = validateSync(cfg);
    if (errors.length) {
      throw new Error(errors.toString());
    }

    // resolve
    const pkPlain = fs.readFileSync(cfg.SYSTEM_PAYER_KEYPAIR_FILE);
    const pkJsonObj = JSON.parse(pkPlain.toString());
    const seed = Uint8Array.from(pkJsonObj).slice(0, 32);
    this.systemPayer = anchor.web3.Keypair.fromSeed(seed);
  }

  //////////////////////////////////////////////////////////////////////////////

  async createCoreAssetTicket(): Promise<string> {
    const asset = Keypair.generate();
    await this.ticketHelperService.createCoreAssetTicketInstruction(
      asset,
      this.systemPayer,
    );
    return asset.publicKey.toBase58();
  }

  async batchCreateCoreAssetTicket(count: number): Promise<string[]> {
    const tx = new Transaction();
    const assets: anchor.web3.Keypair[] = [];
    for (let i = 0; i < count; i++) {
      const asset = Keypair.generate();
      tx.add(
        await this.ticketHelperService.createCoreAssetTicketInstruction(
          asset,
          this.systemPayer,
        ),
      );
      assets.push(asset);
    }
    // TODO: https://stackoverflow.com/questions/74242978/typeerror-provider-send-is-not-a-function-in-anchor
    await this.anchorClientService
      .getProvider()
      .sendAll([{ tx, signers: [...assets, this.systemPayer] }]);

    return assets.map((asset) => asset.publicKey.toBase58());
  }

  //////////////////////////////////////////////////////////////////////////////

  async getCoreAssetTicket(assetAddress: string): Promise<AssetV1> {
    return this.anchorClientService.getMplCoreAsset(assetAddress);
  }
}
