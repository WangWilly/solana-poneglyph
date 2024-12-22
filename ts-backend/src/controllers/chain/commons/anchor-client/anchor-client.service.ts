import * as anchor from '@coral-xyz/anchor';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Umi } from '@metaplex-foundation/umi';
import {
  fetchAsset,
  fetchAssetsByOwner,
  fetchAssetsByCollection,
  AssetV1,
  fetchCollection,
} from '@metaplex-foundation/mpl-core';

import { plainToInstance } from 'class-transformer';
import { IsString, IsUrl, validateSync } from 'class-validator';

import { GlobalAppConfigService } from '../../../../globals/app-config/app-config.service';

import { Injectable } from '@nestjs/common';

////////////////////////////////////////////////////////////////////////////////

class ConfigSchema {
  @IsString()
  @IsUrl()
  readonly ANCHOR_PROVIDER_URL: string = 'http://127.0.0.1:8899';
}

////////////////////////////////////////////////////////////////////////////////

@Injectable()
export class AnchorClientService {
  private readonly anchorConnection: anchor.web3.Connection;
  private readonly mplUmi: Umi;
  private readonly anchorProvider: anchor.Provider;

  constructor(private readonly globalAppConfigService: GlobalAppConfigService) {
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
    anchor.setProvider(anchor.AnchorProvider.env());
    this.anchorConnection = anchor.getProvider().connection;
    this.mplUmi = createUmi(this.anchorConnection);
    this.anchorProvider = anchor.getProvider();
  }

  //////////////////////////////////////////////////////////////////////////////

  getProvider(): anchor.Provider {
    return this.anchorProvider;
  }

  //////////////////////////////////////////////////////////////////////////////

  async getAddressLamports(base58Address: string): Promise<number> {
    const publicKey = new anchor.web3.PublicKey(base58Address);
    return this.anchorConnection.getBalance(publicKey);
  }

  //////////////////////////////////////////////////////////////////////////////

  async getMplCoreAsset(base58AssetAddress: string): Promise<AssetV1> {
    return fetchAsset(this.mplUmi, base58AssetAddress);
  }

  async getMplCoreAssetsByOwner(ownerAddress: string): Promise<AssetV1[]> {
    return fetchAssetsByOwner(this.mplUmi, ownerAddress);
  }

  async getMplCoreAssetsByCollection(
    collectionAddress: string,
  ): Promise<AssetV1[]> {
    return fetchAssetsByCollection(this.mplUmi, collectionAddress);
  }

  async getMplCoreCollection(collectionAddress: string) {
    return fetchCollection(this.mplUmi, collectionAddress);
  }
}
