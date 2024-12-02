import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

import { Utils } from "../target/types/utils";

import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// https://classic.yarnpkg.com/en/package/@metaplex-foundation/mpl-core
import { MPL_CORE_PROGRAM_ID, fetchAsset, fetchAssetsByOwner, fetchAssetsByCollection, AssetV1 } from "@metaplex-foundation/mpl-core";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { expect } from "chai";

////////////////////////////////////////////////////////////////////////////////

async function errorHandling<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof anchor.web3.SendTransactionError) {
      console.error("Transaction failed:", error.message);
      console.error("Logs:", error.logs);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

function containsAssetV1(array: AssetV1[], item: AssetV1): boolean {
  let res = false;
  array.forEach((element) => {
    let isSame = true;
    isSame = isSame && element.publicKey === item.publicKey;
    isSame = isSame && element.name === item.name;
    isSame = isSame && element.uri === item.uri;
    isSame = isSame && element.owner === item.owner;
    if (isSame) {
      res = true;
    }
  });
  return res;
}

////////////////////////////////////////////////////////////////////////////////

describe("utils", () => {
  /// Setup
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;
  const umi = createUmi(connection); // https://developers.metaplex.com/umi/getting-started

  const program = anchor.workspace.utils as Program<Utils>;

  const wallet1 = anchor.Wallet.local();
  const wallet2 = Keypair.generate();

  beforeEach(async () => {
    // Ensure the wallet has enough lamports
    const balance = await connection.getBalance(wallet1.publicKey);
    // console.log("Balance (sol):", balance / LAMPORTS_PER_SOL);
    if (balance < 3 * LAMPORTS_PER_SOL) {
      await connection.requestAirdrop(wallet1.publicKey, 3 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for airdrop to complete
    }
  });

  it("should create MTL Core and transfer", async () => {
    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    let asset = Keypair.generate();
    let createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
    };
    const accounts = {
      asset: asset.publicKey,
      collection: null,
      authority: null,
      payer: wallet1.publicKey,
      owner: null,
      updateAuthority: null,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    await errorHandling(
      program.methods.createTicket(createAssetArgs)
      .accountsPartial(accounts)
      .signers([asset, wallet1.payer])
      .rpc()
    );

    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
      const assetsByOwner = await fetchAssetsByOwner(umi, wallet1.publicKey.toString(), {
        skipDerivePlugins: false,
      })
      expect(assetsByOwner.length).to.equal(1);
      expect(assetsByOwner[0].publicKey).to.equal(asset.publicKey.toString());
      expect(assetsByOwner[0].name).to.equal(createAssetArgs.name);
      expect(assetsByOwner[0].uri).to.equal(createAssetArgs.uri);
      expect(assetsByOwner[0].owner).to.equal(wallet1.publicKey.toString());
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts = {
      payer: wallet1.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet2.publicKey,
      system_program: SystemProgram.programId,
      mpl_core_program: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    await errorHandling(
      program.methods.transferTicket({})
      .accountsPartial(transferAccounts)
      .signers([wallet1.payer])
      .rpc()
    );

    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet2.publicKey.toString());
      const assetsByOwner = await fetchAssetsByOwner(umi, wallet2.publicKey.toString(), {
        skipDerivePlugins: false,
      })
      expect(assetsByOwner.length).to.equal(1);
      expect(assetsByOwner[0].publicKey).to.equal(asset.publicKey.toString());
      expect(assetsByOwner[0].name).to.equal(createAssetArgs.name);
      expect(assetsByOwner[0].uri).to.equal(createAssetArgs.uri);
      expect(assetsByOwner[0].owner).to.equal(wallet2.publicKey.toString());
    }
  });

  it("shoud batch create MTL Core and bind them into a collection", async () => {
    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    let collection = Keypair.generate();
    let createCollectionArgs = {
      name: 'My Collection',
      uri: 'https://example.com/my-collection.json',
    };
    const collectionAccounts = {
      collection: collection.publicKey,
      payer: wallet1.publicKey,
      updateAuthority: wallet1.publicKey,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }

    let asset1 = Keypair.generate();
    let createAssetArgs1 = {
      name: 'My Asset 1',
      uri: 'https://example.com/my-asset-1.json',
    };
    const accounts = {
      asset: asset1.publicKey,
      collection: collection.publicKey,
      authority: null,
      payer: wallet1.publicKey,
      owner: null,
      updateAuthority: null,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }
    let asset2 = Keypair.generate();
    let createAssetArgs2 = {
      name: 'My Asset 2',
      uri: 'https://example.com/my-asset-2.json',
    };
    const account2 = {
      asset: asset2.publicKey,
      collection: collection.publicKey,
      authority: null,
      payer: wallet1.publicKey,
      owner: null,
      updateAuthority: null,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    await errorHandling(
      program.methods.createCollection(createCollectionArgs)
      .accountsPartial(collectionAccounts)
      .signers([collection, wallet1.payer])
      .rpc()
    );
    await errorHandling(
      program.methods.createTicket(createAssetArgs1)
      .accountsPartial(accounts)
      .signers([asset1, wallet1.payer])
      .rpc()
    );
    await errorHandling(
      program.methods.createTicket(createAssetArgs2)
      .accountsPartial(account2)
      .signers([asset2, wallet1.payer])
      .rpc()
    );

    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    let assetData1: AssetV1;
    {
      const assetData = await fetchAsset(umi, asset1.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs1.name);
      expect(assetData.uri).to.equal(createAssetArgs1.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
      assetData1 = assetData;
    }
    let assetData2: AssetV1
    {
      const assetData = await fetchAsset(umi, asset2.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs2.name);
      expect(assetData.uri).to.equal(createAssetArgs2.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
      assetData2 = assetData;
    }
    {
      const assetsByOwner = await fetchAssetsByOwner(umi, wallet1.publicKey.toString(), {
        skipDerivePlugins: false,
      })
      expect(assetsByOwner.length).to.equal(2);
      expect(containsAssetV1(assetsByOwner, assetData1)).to.be.true;
      expect(containsAssetV1(assetsByOwner, assetData2)).to.be.true;
    }
    {
      const assetsByCollection = await fetchAssetsByCollection(umi, collection.publicKey.toString(), {
        skipDerivePlugins: false,
      })
      expect(assetsByCollection.length).to.equal(2);
      expect(containsAssetV1(assetsByCollection, assetData1)).to.be.true;
      expect(containsAssetV1(assetsByCollection, assetData2)).to.be.true;
    }
  });
});
