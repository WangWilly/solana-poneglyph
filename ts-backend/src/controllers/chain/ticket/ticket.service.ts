import * as anchor from '@coral-xyz/anchor';
import { Injectable } from '@nestjs/common';

import utilsIdl from 'src/contract/idl/utils.json';
import lifeHelperIdl from 'src/contract/idl/life_helper.json';
import { Utils } from 'src/contract/types/utils';
import { LifeHelper } from 'src/contract/types/life_helper';

import { AnchorClientService } from 'src/controllers/chain/commons/anchor-client/anchor-client.service';
import { Program } from '@coral-xyz/anchor';

import { plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

import { GlobalAppConfigService } from 'src/globals/app-config/app-config.service';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { AssetV1, MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';

import * as fs from 'fs';

////////////////////////////////////////////////////////////////////////////////

class ConfigSchema {
  @IsString()
  readonly SYSTEM_PAYER_KEYPAIR_FILE: string;
}

////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class TicketService {
  private readonly utilsProgram: Program<Utils>;
  private readonly lifeHelperProgram: Program<LifeHelper>;
  private readonly systemPayer: anchor.web3.Keypair;

  constructor(
    private readonly globalAppConfigService: GlobalAppConfigService,
    private readonly anchorClientService: AnchorClientService,
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
    this.utilsProgram = new Program<Utils>(
      utilsIdl as Utils,
      this.anchorClientService.getProvider(),
    );
    this.lifeHelperProgram = new Program<LifeHelper>(
      lifeHelperIdl as LifeHelper,
      this.anchorClientService.getProvider(),
    );
    // this.systemPayer = anchor.web3.Keypair.fromSecretKey(
    //   Buffer.from(cfg.SYSTEM_PAYER_KEYPAIR_FILE, 'base64'),
    // );
    const pkPlain = fs.readFileSync(cfg.SYSTEM_PAYER_KEYPAIR_FILE);
    const pkJson = JSON.parse(pkPlain.toString());
    const seed = Uint8Array.from(pkJson).slice(0, 32);
    this.systemPayer = anchor.web3.Keypair.fromSeed(seed);
  }

  //////////////////////////////////////////////////////////////////////////////

  async createCoreAssetTicket(): Promise<string> {
    const asset = Keypair.generate();
    const createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
      transferLimit: 10,
    };
    const accounts = {
      asset: asset.publicKey,
      collection: null,
      authority: null,
      payer: this.systemPayer.publicKey,
      owner: null,
      updateAuthority: null,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    };

    await this.utilsProgram.methods
      .createTicketV1(createAssetArgs)
      .accountsPartial(accounts)
      .signers([asset, this.systemPayer])
      .rpc();

    return asset.publicKey.toBase58();
  }

  async getCoreAssetTicket(assetAddress: string): Promise<AssetV1> {
    return this.anchorClientService.getMplCoreAsset(assetAddress);
  }
}
