import { Injectable } from '@nestjs/common';
import * as anchor from '@coral-xyz/anchor';

import { AnchorClientService } from 'src/controllers/chain/commons/anchor-client/anchor-client.service';

import utilsIdl from 'src/contract/idl/utils.json';
import lifeHelperIdl from 'src/contract/idl/life_helper.json';
import { Utils } from 'src/contract/types/utils';
import { LifeHelper } from 'src/contract/types/life_helper';

import { PublicKey, SystemProgram } from '@solana/web3.js';

import { MPL_CORE_PROGRAM_ID } from '@metaplex-foundation/mpl-core';

////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class TicketHelperService {
  private readonly utilsProgram: anchor.Program<Utils>;
  private readonly lifeHelperProgram: anchor.Program<LifeHelper>;

  constructor(private readonly anchorClientService: AnchorClientService) {
    // resolve
    this.utilsProgram = new anchor.Program<Utils>(
      utilsIdl as Utils,
      this.anchorClientService.getProvider(),
    );
    this.lifeHelperProgram = new anchor.Program<LifeHelper>(
      lifeHelperIdl as LifeHelper,
      this.anchorClientService.getProvider(),
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // rpc call

  async createCoreAssetTicket(
    asset: anchor.web3.Keypair,
    payer: anchor.web3.Keypair,
  ): Promise<void> {
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
      payer: payer.publicKey,
      owner: null,
      updateAuthority: null,
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: this.lifeHelperProgram.programId,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [utils_pda, _utils_seed] = PublicKey.findProgramAddressSync(
      [Buffer.from('utils')],
      this.utilsProgram.programId,
    );

    await this.utilsProgram.methods
      .createTicketV1(createAssetArgs)
      .accountsPartial(accounts)
      .signers([asset, payer])
      .rpc();
  }

  //////////////////////////////////////////////////////////////////////////////
  // solana instruction builder
  async createCoreAssetTicketInstruction(
    asset: anchor.web3.Keypair,
    payer: anchor.web3.Keypair,
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
      payer: payer.publicKey,
      owner: null,
      updateAuthority: null,
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: this.lifeHelperProgram.programId,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    };

    const instruction = await this.utilsProgram.methods
      .createTicketV1(createAssetArgs)
      .accountsPartial(accounts)
      .signers([asset, payer])
      .instruction();

    return instruction;
  }
}
