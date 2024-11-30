import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Utils } from "../target/types/utils";
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
// https://classic.yarnpkg.com/en/package/@metaplex-foundation/mpl-core
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

////////////////////////////////////////////////////////////////////////////////

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { fetchAsset } from '@metaplex-foundation/mpl-core'

////////////////////////////////////////////////////////////////////////////////

describe("create-core-asset-example", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.utils as Program<Utils>;

  let asset = Keypair.generate();

  it("Create Asset", async () => {
    console.log("Wallet / CoreAssetOwner:", wallet.publicKey.toBase58());

    let createAssetArgs = {
      name: 'My Asset',
      uri: 'https://example.com/my-asset.json',
    };
  
    // Ensure the wallet has enough lamports
    const connection = anchor.getProvider().connection;
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("Balance (sol):", balance / LAMPORTS_PER_SOL);
    if (balance < 3 * LAMPORTS_PER_SOL) {
      console.log("Airdropping SOL to the wallet...");
      await connection.requestAirdrop(wallet.publicKey, 3 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for airdrop to complete
    }

    try {
      const accounts = {
        asset: asset.publicKey,
        collection: null,
        authority: null,
        payer: wallet.publicKey,
        owner: null,
        updateAuthority: null,
        systemProgram: SystemProgram.programId,
        mplCoreProgram: MPL_CORE_PROGRAM_ID
      }

      const createAssetTx = await program.methods.createTicket(createAssetArgs)
        .accountsPartial(accounts)
        .signers([asset, wallet.payer])
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
  });
});
