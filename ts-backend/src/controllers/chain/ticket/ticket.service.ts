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
import {
  Keypair,
  SystemProgram,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
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

    const pkPlain = fs.readFileSync(cfg.SYSTEM_PAYER_KEYPAIR_FILE);
    const pkJsonObj = JSON.parse(pkPlain.toString());
    const seed = Uint8Array.from(pkJsonObj).slice(0, 32);
    this.systemPayer = anchor.web3.Keypair.fromSeed(seed);
  }

  //////////////////////////////////////////////////////////////////////////////

  async createCoreAssetTicket(): Promise<string> {
    const asset = Keypair.generate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [life_helper_pda, _life_helper_seed] =
      PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('mpl-core'),
          asset.publicKey.toBuffer(),
        ],
        this.lifeHelperProgram.programId,
      );

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
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: this.lifeHelperProgram.programId,
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

  createCoreAssetTicketInstruction(
    asset: anchor.web3.Keypair,
  ): Promise<anchor.web3.TransactionInstruction> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [life_helper_pda, _life_helper_seed] =
      PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode('mpl-core'),
          asset.publicKey.toBuffer(),
        ],
        this.lifeHelperProgram.programId,
      );

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
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: this.lifeHelperProgram.programId,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    };

    const instruction = this.utilsProgram.methods
      .createTicketV1(createAssetArgs)
      .accountsPartial(accounts)
      .signers([asset, this.systemPayer])
      .instruction();

    return instruction;
  }

  async batchCreateCoreAssetTicket(count: number): Promise<string[]> {
    const tx = new Transaction();
    const assets: anchor.web3.Keypair[] = [];
    for (let i = 0; i < count; i++) {
      const asset = Keypair.generate();
      tx.add(await this.createCoreAssetTicketInstruction(asset));
      assets.push(asset);
    }
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
