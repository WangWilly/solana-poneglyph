/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/utils.json`.
 */
export type Utils = {
  "address": "B28UKH17RsMkqA9n3YbviRMny9yeiBdM7pzjT9LK1JZ",
  "metadata": {
    "name": "utils",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCollection",
      "discriminator": [
        156,
        251,
        92,
        54,
        233,
        2,
        16,
        82
      ],
      "accounts": [
        {
          "name": "collection",
          "writable": true,
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "updateAuthority",
          "writable": true,
          "signer": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createCollectionArgs"
            }
          }
        }
      ]
    },
    {
      "name": "createTicket",
      "discriminator": [
        16,
        178,
        122,
        25,
        213,
        85,
        96,
        129
      ],
      "accounts": [
        {
          "name": "asset",
          "docs": [
            "This is the account that will store the NFT's metadata.",
            "It must be mutable and a signer on the transaction."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "collection",
          "docs": [
            "An optional account representing the collection the asset belongs to.",
            "If provided, it must be a valid BaseCollectionV1 account."
          ],
          "writable": true,
          "optional": true
        },
        {
          "name": "authority",
          "docs": [
            "An optional signer account, likely for additional authorization."
          ],
          "signer": true,
          "optional": true
        },
        {
          "name": "payer",
          "docs": [
            "The account paying for the transaction fees and rent.",
            "Must be mutable and a signer on the transaction."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "docs": [
            "An optional account representing the owner of the asset.",
            "Marked as UncheckedAccount, meaning Anchor won't perform additional checks."
          ],
          "optional": true
        },
        {
          "name": "updateAuthority",
          "docs": [
            "An optional account with authority to update the asset.",
            "Also marked as UncheckedAccount."
          ],
          "optional": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "A reference to the Solana System Program.",
            "Must match the System Program's ID."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "docs": [
            "A reference to the Metaplex Core Program.",
            "Constrained to match the MPL_CORE_ID address."
          ],
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createTicketArgs"
            }
          }
        }
      ]
    },
    {
      "name": "createTicketV1",
      "discriminator": [
        170,
        239,
        208,
        151,
        5,
        237,
        231,
        24
      ],
      "accounts": [
        {
          "name": "asset",
          "writable": true,
          "signer": true
        },
        {
          "name": "collection",
          "writable": true,
          "optional": true
        },
        {
          "name": "authority",
          "signer": true,
          "optional": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "optional": true
        },
        {
          "name": "updateAuthority",
          "optional": true
        },
        {
          "name": "lifeHelperPda",
          "writable": true
        },
        {
          "name": "lifeHelperProgram",
          "address": "6wpG1R1Sc7hJf6ZzAzMuzuhSGCEdmuS6X7vgaBXPnqgc"
        },
        {
          "name": "systemProgram",
          "docs": [
            "Must match the System Program's ID."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "args4CreateTicketV1"
            }
          }
        }
      ]
    },
    {
      "name": "transferTicket",
      "discriminator": [
        191,
        184,
        74,
        239,
        164,
        172,
        188,
        32
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ticketAsset",
          "writable": true
        },
        {
          "name": "newOwner",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "transferTicketArgs"
            }
          }
        }
      ]
    },
    {
      "name": "transferTicketV1",
      "discriminator": [
        103,
        78,
        131,
        224,
        69,
        19,
        162,
        17
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "ticketAsset",
          "writable": true
        },
        {
          "name": "newOwner",
          "writable": true
        },
        {
          "name": "lifeHelperPda",
          "writable": true
        },
        {
          "name": "lifeHelperProgram",
          "address": "6wpG1R1Sc7hJf6ZzAzMuzuhSGCEdmuS6X7vgaBXPnqgc"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "args4TransferTicketV1"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseCollectionV1",
      "discriminator": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    }
  ],
  "types": [
    {
      "name": "args4CreateTicketV1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "transferLimit",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "args4TransferTicketV1",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "baseCollectionV1",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": {
              "defined": {
                "name": "key"
              }
            }
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "numMinted",
            "type": "u32"
          },
          {
            "name": "currentSize",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "createCollectionArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "createTicketArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "key",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "uninitialized"
          },
          {
            "name": "assetV1"
          },
          {
            "name": "hashedAssetV1"
          },
          {
            "name": "pluginHeaderV1"
          },
          {
            "name": "pluginRegistryV1"
          },
          {
            "name": "collectionV1"
          }
        ]
      }
    },
    {
      "name": "transferTicketArgs",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
