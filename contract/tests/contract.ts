import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

import { Utils } from "../target/types/utils";

import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

// https://classic.yarnpkg.com/en/package/@metaplex-foundation/mpl-core
import { MPL_CORE_PROGRAM_ID, fetchAsset, fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';


////////////////////////////////////////////////////////////////////////////////

describe("utils", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet1 = anchor.Wallet.local();
  const program = anchor.workspace.utils as Program<Utils>;

  let asset = Keypair.generate();

  it("should create MTL Core and transfer", async () => {
    console.log("Wallet / CoreAssetOwner:", wallet1.publicKey.toBase58());

    let createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
    };
  
    // Ensure the wallet has enough lamports
    const connection = anchor.getProvider().connection;
    const balance = await connection.getBalance(wallet1.publicKey);
    console.log("Balance (sol):", balance / LAMPORTS_PER_SOL);
    if (balance < 3 * LAMPORTS_PER_SOL) {
      console.log("Airdropping SOL to the wallet...");
      await connection.requestAirdrop(wallet1.publicKey, 3 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for airdrop to complete
    }

    try {
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

      const createAssetTx = await program.methods.createTicket(createAssetArgs)
        .accountsPartial(accounts)
        .signers([asset, wallet1.payer])
        .rpc();

      console.log(createAssetTx);
    } catch (error) {
      if (error instanceof anchor.web3.SendTransactionError) {
        console.error("Transaction failed:", error.message);
        console.error("Logs:", error.logs);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }

    ////////////////////////////////////////////////////////////////////////////

    // https://developers.metaplex.com/umi/getting-started
    const umi = createUmi(connection);

    const assetData = await fetchAsset(umi, asset.publicKey.toString());
    console.log("Asset data:", assetData);

    const assetsByOwner = await fetchAssetsByOwner(umi, wallet1.publicKey.toString(), {
      skipDerivePlugins: false,
    })
    console.log("Assets by owner:", assetsByOwner);

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    const wallet2 = Keypair.generate();
    console.log("Wallet2:", wallet2.publicKey.toBase58());

    const transferAccounts = {
      payer: wallet1.publicKey,
      ticketAsset: asset.publicKey,
      newOwner: wallet2.publicKey,
      system_program: SystemProgram.programId,
      mpl_core_program: MPL_CORE_PROGRAM_ID
    };

    try {
      const transferTx = await program.methods.transferTicket({})
        .accountsPartial(transferAccounts)
        .signers([wallet1.payer])
        .rpc();

      console.log(transferTx);
    } catch (error) {
      if (error instanceof anchor.web3.SendTransactionError) {
        console.error("Transaction failed:", error.message);
        console.error("Logs:", error.logs);
      } else {
        console.error("Unexpected error:", error);
      }

      console.log("Logs:", error.getLogs());
      throw error;
    }

    ////////////////////////////////////////////////////////////////////////////

    const assetData2 = await fetchAsset(umi, asset.publicKey.toString());
    console.log("Asset data2:", assetData2);

    const assetsByOwner2 = await fetchAssetsByOwner(umi, wallet2.publicKey.toString(), {
      skipDerivePlugins: false,
    })
    console.log("Assets by owner2:", assetsByOwner2);
  });
});
