import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

import { Utils } from "../target/types/utils";
import { LifeHelper } from "../target/types/life_helper";

import { Keypair, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// https://classic.yarnpkg.com/en/package/@metaplex-foundation/mpl-core
import { MPL_CORE_PROGRAM_ID, fetchAsset, fetchAssetsByOwner, fetchAssetsByCollection, AssetV1, fetchCollection } from "@metaplex-foundation/mpl-core";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { expect } from "chai";

////////////////////////////////////////////////////////////////////////////////

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

async function errorHandlingTemplate<T>(connection: anchor.web3.Connection, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof anchor.web3.SendTransactionError) {
      console.error("Transaction failed:", error.message);
      console.error("Logs:", error.getLogs(connection));
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

async function expectError<T>(promise: Promise<T>): Promise<boolean> {
  try {
    await promise;
    return false;
  } catch (error) {
    // console.log("Caught error:", error);
    return true;
  }
}

//////////////////////////////////////////////////////////////////////////////

describe("utils", () => {
  /// Setup
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;
  const umi = createUmi(connection); // https://developers.metaplex.com/umi/getting-started
  const errorHandling = (promise: Promise<any>) => errorHandlingTemplate(connection, promise);

  const program = anchor.workspace.utils as Program<Utils>;
  const lifeHelperProg = anchor.workspace.lifeHelper as Program<LifeHelper>;

  const wallet1 = anchor.Wallet.local();
  const wallet2 = Keypair.generate();

  //////////////////////////////////////////////////////////////////////////////

  beforeEach(async () => {
    // Ensure the wallets has enough lamports
    {
      const balance = await connection.getBalance(wallet1.publicKey);
      // console.log("Balance (sol):", balance / LAMPORTS_PER_SOL);
      if (balance < 3 * LAMPORTS_PER_SOL) {
        await connection.requestAirdrop(wallet1.publicKey, 3 * LAMPORTS_PER_SOL);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for airdrop to complete
      }
    }
    {
      const balance = await connection.getBalance(wallet2.publicKey);
      // console.log("Balance (sol):", balance / LAMPORTS_PER_SOL);
      if (balance < 3 * LAMPORTS_PER_SOL) {
        await connection.requestAirdrop(wallet2.publicKey, 3 * LAMPORTS_PER_SOL);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for airdrop to complete
      }
    }
  });

  //////////////////////////////////////////////////////////////////////////////

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
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
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
      const collectionData = await fetchCollection(umi, collection.publicKey.toString());
      // console.log("collectionData:", collectionData);
      expect(collectionData.name).to.equal(createCollectionArgs.name);
      expect(collectionData.uri).to.equal(createCollectionArgs.uri);
      expect(collectionData.updateAuthority).to.equal(wallet1.publicKey.toString());
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

  it("should create MTL Core using V1 and transfer with the limit up to 1 times", async () => {
    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    let asset = Keypair.generate();
    const [life_helper_pda, life_helper_seed] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('mpl-core'),
        asset.publicKey.toBuffer(),
      ],
      lifeHelperProg.programId
    )
    let createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
      transferLimit: 1,
    };
    const accounts = {
      asset: asset.publicKey,
      collection: null,
      authority: null,
      payer: wallet1.publicKey,
      owner: null,
      updateAuthority: null,
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: lifeHelperProg.programId,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    {
      const txSign = await errorHandling(
        program.methods.createTicketV1(createAssetArgs)
        .accountsPartial(accounts)
        .signers([asset, wallet1.payer])
        .rpc()
        );
      // TODO: https://solana.stackexchange.com/questions/10222/how-can-i-check-the-transaction-logs-in-anchor-test
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txSign,
        },
        "confirmed"
      );
      // const createTx = await connection.getTransaction(txSign, {
      //   commitment: 'confirmed',
      // });
      // console.log("createTx:", createTx);
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
      // console.log("assetData:", assetData);
      // console.log("assetData oracle 1:", assetData.oracles[0]);
      
      // const life_helper_account = await lifeHelperProg.account.validation.fetch(life_helper_pda);
      // console.log("life_helper_account:", life_helper_account);
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts = {
      payer: wallet1.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet2.publicKey,
      lifeHelperPda: life_helper_pda,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    {
      const txSign = await errorHandling(
        program.methods.transferTicketV1({})
        .accountsPartial(transferAccounts)
        .signers([wallet1.payer])
        .rpc()
      );
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txSign,
        },
        "confirmed"
      );
    }


    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet2.publicKey.toString());
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts2 = {
      payer: wallet2.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet1.publicKey,
      lifeHelperPda: life_helper_pda,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act & Assert
    {
      const errorHappened = await expectError(
        program.methods.transferTicketV1({})
        .accountsPartial(transferAccounts2)
        .signers([wallet2])
        .rpc()
      );
      expect(errorHappened).to.be.true;
    }
  });

  it("should create MTL Core using V1 and transfer with the limit up to 2 times", async () => {
    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    let asset = Keypair.generate();
    const [life_helper_pda, life_helper_seed] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode('mpl-core'),
        asset.publicKey.toBuffer(),
      ],
      lifeHelperProg.programId
    )
    let createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
      transferLimit: 2,
    };
    const accounts = {
      asset: asset.publicKey,
      collection: null,
      authority: null,
      payer: wallet1.publicKey,
      owner: null,
      updateAuthority: null,
      lifeHelperPda: life_helper_pda,
      lifeHelperProgram: lifeHelperProg.programId,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    {
      console.log("createTicketV1 - 1");
      const txSign = await errorHandling(
        program.methods.createTicketV1(createAssetArgs)
        .accountsPartial(accounts)
        .signers([asset, wallet1.payer])
        .rpc()
        );
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txSign,
        },
        "confirmed"
      );
      const createTx = await connection.getTransaction(txSign, {
        commitment: 'confirmed',
      });
      console.log("createTx:", createTx);
    }
    
    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts = {
      payer: wallet1.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet2.publicKey,
      lifeHelperPda: life_helper_pda,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    {
      console.log("transferTicketV1 - 2");
      const txSign = await errorHandling(
        program.methods.transferTicketV1({})
        .accountsPartial(transferAccounts)
        .signers([wallet1.payer])
        .rpc()
      );
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txSign,
        },
        "confirmed"
      );
      const createTx = await connection.getTransaction(txSign, {
        commitment: 'confirmed',
      });
      console.log("createTx:", createTx);
    }


    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet2.publicKey.toString());
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts2 = {
      payer: wallet2.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet1.publicKey,
      lifeHelperPda: life_helper_pda,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act
    {
      console.log("transferTicketV1 - 3");
      const txSign = await errorHandling(
        program.methods.transferTicketV1({})
        .accountsPartial(transferAccounts2)
        .signers([wallet2])
        .rpc()
      );
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txSign,
        },
        "confirmed"
      );
      const createTx = await connection.getTransaction(txSign, {
        commitment: 'confirmed',
      });
      console.log("createTx:", createTx);
    }


    ////////////////////////////////////////////////////////////////////////////
    /// Assert
    {
      const assetData = await fetchAsset(umi, asset.publicKey.toString());
      expect(assetData.name).to.equal(createAssetArgs.name);
      expect(assetData.uri).to.equal(createAssetArgs.uri);
      expect(assetData.owner).to.equal(wallet1.publicKey.toString());
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Arrange
    const transferAccounts3 = {
      payer: wallet1.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet2.publicKey,
      lifeHelperPda: life_helper_pda,
      systemProgram: SystemProgram.programId,
      mplCoreProgram: MPL_CORE_PROGRAM_ID
    };

    ////////////////////////////////////////////////////////////////////////////
    /// Act & Assert
    {
      console.log("transferTicketV1 - 4");
      const errorHappened = await expectError(
        program.methods.transferTicketV1({})
        .accountsPartial(transferAccounts3)
        .signers([wallet1.payer])
        .rpc()
      );
      expect(errorHappened).to.be.true;
    }
  });
});
