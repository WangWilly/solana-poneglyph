/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/life_helper.json`.
 */
export type LifeHelper = {
  address: '6wpG1R1Sc7hJf6ZzAzMuzuhSGCEdmuS6X7vgaBXPnqgc';
  metadata: {
    name: 'lifeHelper';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'signer';
          signer: true;
        },
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'asset';
        },
        {
          name: 'oracleAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 112, 108, 45, 99, 111, 114, 101];
              },
              {
                kind: 'account';
                path: 'asset';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'args';
          type: {
            defined: {
              name: 'args4Init';
            };
          };
        },
      ];
    },
    {
      name: 'transfer';
      discriminator: [163, 52, 200, 231, 140, 3, 69, 186];
      accounts: [
        {
          name: 'signer';
          signer: true;
        },
        {
          name: 'payer';
          writable: true;
          signer: true;
        },
        {
          name: 'newOwner';
          writable: true;
        },
        {
          name: 'asset';
        },
        {
          name: 'oracleAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 112, 108, 45, 99, 111, 114, 101];
              },
              {
                kind: 'account';
                path: 'asset';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'validation';
      discriminator: [130, 241, 151, 113, 169, 195, 219, 148];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'transferLimitExceeded';
      msg: 'Transfer limit exceeded';
    },
  ];
  types: [
    {
      name: 'args4Init';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'transferLimit';
            type: 'u16';
          },
        ];
      };
    },
    {
      name: 'externalValidationResult';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'approved';
          },
          {
            name: 'rejected';
          },
          {
            name: 'pass';
          },
        ];
      };
    },
    {
      name: 'oracleValidation';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'uninitialized';
          },
          {
            name: 'v1';
            fields: [
              {
                name: 'create';
                type: {
                  defined: {
                    name: 'externalValidationResult';
                  };
                };
              },
              {
                name: 'transfer';
                type: {
                  defined: {
                    name: 'externalValidationResult';
                  };
                };
              },
              {
                name: 'burn';
                type: {
                  defined: {
                    name: 'externalValidationResult';
                  };
                };
              },
              {
                name: 'update';
                type: {
                  defined: {
                    name: 'externalValidationResult';
                  };
                };
              },
            ];
          },
        ];
      };
    },
    {
      name: 'validation';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'validation';
            type: {
              defined: {
                name: 'oracleValidation';
              };
            };
          },
          {
            name: 'transferLimit';
            type: 'u16';
          },
          {
            name: 'currTransfer';
            type: 'u16';
          },
          {
            name: 'from';
            type: 'pubkey';
          },
          {
            name: 'current';
            type: 'pubkey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
};
