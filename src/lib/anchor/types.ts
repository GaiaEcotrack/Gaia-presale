/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gaia_presale.json`.
 */
export type GaiaPresale = {
  "address": "5aXDAUUjG8HbZ8YXmrPx5kA9U1usqiyKSFhL4eY3bwLS",
  "metadata": {
    "name": "gaiaPresale",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "activateRound",
      "discriminator": [
        179,
        179,
        17,
        42,
        181,
        68,
        23,
        123
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The round to activate."
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "buyer",
          "docs": [
            "The buyer wallet. Must sign and pay rent for new PDAs."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The target round. Must be active and within its time window."
          ],
          "writable": true
        },
        {
          "name": "buyerProfile",
          "docs": [
            "The buyer's profile across all rounds. Created on first purchase."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "purchase",
          "docs": [
            "The individual purchase record. Created for each transaction."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "buyer_profile.purchase_count",
                "account": "buyerProfile"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "docs": [
            "owner must be a supported token program, mint must match payment_mint,",
            "and authority must be the buyer signer."
          ],
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "owner must be a supported token program, mint must match payment_mint,",
            "and authority must match the configured treasury."
          ],
          "writable": true
        },
        {
          "name": "paymentMint",
          "docs": [
            "The payment mint (USDC or USDT). Validated against config."
          ]
        },
        {
          "name": "gaiaMint",
          "docs": [
            "The GAIA token mint. Used to calculate purchased token base units."
          ]
        },
        {
          "name": "statistics",
          "docs": [
            "Global statistics singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  105,
                  115,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "The SPL Token program."
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "The System Program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "buyParams"
            }
          }
        }
      ]
    },
    {
      "name": "claim",
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "buyer",
          "docs": [
            "The buyer wallet. Must sign to authorize the claim."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton. Contains the GAIA vault reference."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The round this purchase belongs to."
          ]
        },
        {
          "name": "buyerProfile",
          "docs": [
            "The buyer's cross-round profile."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  121,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "purchase",
          "docs": [
            "The specific purchase record to claim against."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "purchase.purchase_number",
                "account": "purchase"
              }
            ]
          }
        },
        {
          "name": "gaiaVault",
          "docs": [
            "handler as a supported token account before checking its token balance."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  105,
                  97,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "buyerGaiaAccount",
          "docs": [
            "owner must be a supported token program, mint must match gaia_mint,",
            "and authority must be the buyer signer."
          ],
          "writable": true
        },
        {
          "name": "gaiaMint",
          "docs": [
            "The GAIA token mint. Must match the mint configured in the protocol."
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "The SPL Token program."
          ]
        }
      ],
      "args": []
    },
    {
      "name": "clearLegal",
      "discriminator": [
        202,
        239,
        99,
        83,
        206,
        152,
        29,
        72
      ],
      "accounts": [
        {
          "name": "legalAuthority",
          "docs": [
            "The legal authority wallet. Must sign."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "createRound",
      "discriminator": [
        229,
        218,
        236,
        169,
        231,
        80,
        134,
        112
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton. Validated against admin authority."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The new Round account to initialize. PDA seeded by `[\"round\", &id]`."
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "The System Program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createRoundParams"
            }
          }
        }
      ]
    },
    {
      "name": "endRound",
      "discriminator": [
        54,
        47,
        1,
        200,
        250,
        6,
        144,
        63
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The round to end."
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign and pay rent."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton. PDA seeded by `[\"config\"]`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "statistics",
          "docs": [
            "The global Statistics singleton. PDA seeded by `[\"statistics\"]`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  105,
                  115,
                  116,
                  105,
                  99,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "gaiaMint",
          "docs": [
            "The GAIA token mint, used for validation."
          ]
        },
        {
          "name": "gaiaVault",
          "docs": [
            "The GAIA vault PDA that will hold tokens for claim distribution.",
            "Owned by the program, seeded by `[\"gaia_vault\"]`."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  105,
                  97,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint",
          "docs": [
            "The USDC mint, stored for payment validation."
          ]
        },
        {
          "name": "usdtMint",
          "docs": [
            "The USDT mint, stored for payment validation."
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "The Solana System Program."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "The SPL Token program (or Token-2022)."
          ]
        }
      ],
      "args": [
        {
          "name": "treasury",
          "type": "pubkey"
        },
        {
          "name": "tgeTimestamp",
          "type": "i64"
        },
        {
          "name": "legalAuthority",
          "type": "pubkey"
        },
        {
          "name": "complianceAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "pause",
      "discriminator": [
        211,
        22,
        221,
        251,
        74,
        121,
        193,
        47
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The round to pause."
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "global",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resume",
      "discriminator": [
        1,
        166,
        51,
        170,
        127,
        32,
        141,
        206
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The round to resume."
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "global",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateAdmin",
      "discriminator": [
        161,
        176,
        40,
        213,
        60,
        184,
        179,
        228
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The current admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateRound",
      "discriminator": [
        226,
        164,
        201,
        88,
        147,
        228,
        236,
        165
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "docs": [
            "The Round account to update. Must be in `Upcoming` status."
          ],
          "writable": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateRoundParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateTreasury",
      "discriminator": [
        60,
        16,
        243,
        66,
        96,
        59,
        254,
        131
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newTreasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "verifyBuyer",
      "discriminator": [
        87,
        81,
        22,
        12,
        104,
        254,
        216,
        141
      ],
      "accounts": [
        {
          "name": "complianceAuthority",
          "docs": [
            "The compliance authority wallet. Must sign."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "whitelistEntry",
          "docs": [
            "The whitelist entry PDA to create."
          ],
          "writable": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "The System Program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u8"
        },
        {
          "name": "wallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "The admin wallet. Must sign."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The global Config singleton."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "gaiaVault",
          "docs": [
            "handler as a token account before checking its balance."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  105,
                  97,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "adminGaiaAccount",
          "docs": [
            "owner must be the admin, mint must match gaia_mint."
          ],
          "writable": true
        },
        {
          "name": "gaiaMint",
          "docs": [
            "The GAIA token mint. Must match the mint configured in the protocol."
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "The SPL Token program."
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "buyerProfile",
      "discriminator": [
        69,
        227,
        31,
        30,
        144,
        3,
        90,
        252
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "purchase",
      "discriminator": [
        33,
        203,
        1,
        252,
        231,
        228,
        8,
        67
      ]
    },
    {
      "name": "round",
      "discriminator": [
        87,
        127,
        165,
        51,
        73,
        78,
        116,
        174
      ]
    },
    {
      "name": "statistics",
      "discriminator": [
        51,
        158,
        85,
        113,
        41,
        45,
        37,
        104
      ]
    },
    {
      "name": "whitelistEntry",
      "discriminator": [
        51,
        70,
        173,
        81,
        219,
        192,
        234,
        62
      ]
    }
  ],
  "events": [
    {
      "name": "adminUpdatedEvent",
      "discriminator": [
        87,
        146,
        113,
        247,
        187,
        52,
        223,
        11
      ]
    },
    {
      "name": "buyerVerifiedEvent",
      "discriminator": [
        0,
        212,
        204,
        159,
        159,
        111,
        158,
        233
      ]
    },
    {
      "name": "claimEvent",
      "discriminator": [
        93,
        15,
        70,
        170,
        48,
        140,
        212,
        219
      ]
    },
    {
      "name": "legalClearedEvent",
      "discriminator": [
        1,
        61,
        98,
        153,
        46,
        183,
        145,
        128
      ]
    },
    {
      "name": "pausedEvent",
      "discriminator": [
        43,
        14,
        250,
        236,
        116,
        42,
        177,
        89
      ]
    },
    {
      "name": "purchaseEvent",
      "discriminator": [
        229,
        118,
        246,
        164,
        59,
        65,
        116,
        254
      ]
    },
    {
      "name": "resumeEvent",
      "discriminator": [
        97,
        117,
        183,
        115,
        117,
        224,
        8,
        229
      ]
    },
    {
      "name": "roundActivatedEvent",
      "discriminator": [
        62,
        127,
        248,
        200,
        212,
        143,
        222,
        185
      ]
    },
    {
      "name": "roundCreatedEvent",
      "discriminator": [
        195,
        1,
        181,
        49,
        230,
        214,
        108,
        180
      ]
    },
    {
      "name": "roundEndedEvent",
      "discriminator": [
        225,
        93,
        137,
        158,
        12,
        107,
        81,
        122
      ]
    },
    {
      "name": "treasuryUpdatedEvent",
      "discriminator": [
        140,
        91,
        97,
        30,
        246,
        205,
        211,
        33
      ]
    },
    {
      "name": "withdrawGaiaEvent",
      "discriminator": [
        132,
        95,
        93,
        76,
        124,
        164,
        212,
        32
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "presalePaused",
      "msg": "Presale is paused"
    },
    {
      "code": 6002,
      "name": "roundNotActive",
      "msg": "Round is not active"
    },
    {
      "code": 6003,
      "name": "roundNotStarted",
      "msg": "Round has not started"
    },
    {
      "code": 6004,
      "name": "roundEnded",
      "msg": "Round has ended"
    },
    {
      "code": 6005,
      "name": "roundSoldOut",
      "msg": "Round is sold out"
    },
    {
      "code": 6006,
      "name": "invalidPaymentMint",
      "msg": "Invalid payment mint"
    },
    {
      "code": 6007,
      "name": "invalidRound",
      "msg": "Invalid round"
    },
    {
      "code": 6008,
      "name": "nothingToClaim",
      "msg": "Nothing to claim"
    },
    {
      "code": 6009,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6010,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6011,
      "name": "whitelistRequired",
      "msg": "Whitelist required"
    },
    {
      "code": 6012,
      "name": "alreadyInitialized",
      "msg": "Already initialized"
    },
    {
      "code": 6013,
      "name": "roundAlreadyStarted",
      "msg": "Round already started"
    },
    {
      "code": 6014,
      "name": "invalidTimeRange",
      "msg": "Invalid time range"
    },
    {
      "code": 6015,
      "name": "zeroAmount",
      "msg": "Zero amount not allowed"
    },
    {
      "code": 6016,
      "name": "invalidAuthority",
      "msg": "Invalid authority"
    },
    {
      "code": 6017,
      "name": "invalidPurchaseLimits",
      "msg": "Invalid purchase limits"
    },
    {
      "code": 6018,
      "name": "invalidVestingSchedule",
      "msg": "Invalid vesting schedule"
    },
    {
      "code": 6019,
      "name": "purchaseTooSmall",
      "msg": "Purchase amount below minimum"
    },
    {
      "code": 6020,
      "name": "purchaseTooLarge",
      "msg": "Purchase amount above maximum"
    },
    {
      "code": 6021,
      "name": "walletLimitExceeded",
      "msg": "Wallet purchase limit exceeded"
    },
    {
      "code": 6022,
      "name": "invalidRoundStatus",
      "msg": "Invalid round status for this operation"
    },
    {
      "code": 6023,
      "name": "vaultInsufficientFunds",
      "msg": "GAIA vault insufficient funds"
    },
    {
      "code": 6024,
      "name": "legalNotCleared",
      "msg": "Legal clearance required"
    },
    {
      "code": 6025,
      "name": "notLegalAuthority",
      "msg": "Not legal authority"
    },
    {
      "code": 6026,
      "name": "buyerNotWhitelisted",
      "msg": "Buyer not whitelisted"
    },
    {
      "code": 6027,
      "name": "notComplianceAuthority",
      "msg": "Not compliance authority"
    },
    {
      "code": 6028,
      "name": "buyerAlreadyWhitelisted",
      "msg": "Buyer already whitelisted"
    },
    {
      "code": 6029,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient vault balance"
    }
  ],
  "types": [
    {
      "name": "adminUpdatedEvent",
      "docs": [
        "Emitted when the admin authority is updated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that performed the update."
            ],
            "type": "pubkey"
          },
          {
            "name": "oldAdmin",
            "docs": [
              "The previous admin wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "docs": [
              "The new admin wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the update."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "buyParams",
      "docs": [
        "Parameters for a buy instruction."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paymentAmount",
            "docs": [
              "Amount of USDC/USDT to spend (in smallest units)."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "buyerProfile",
      "docs": [
        "Per-wallet profile that aggregates activity across all rounds.",
        "",
        "One PDA per wallet, created on the first purchase."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet address of the buyer."
            ],
            "type": "pubkey"
          },
          {
            "name": "totalPurchased",
            "docs": [
              "Total GAIA tokens purchased across all rounds."
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "docs": [
              "Total GAIA tokens claimed across all rounds."
            ],
            "type": "u64"
          },
          {
            "name": "totalPaid",
            "docs": [
              "Total USD value paid across all purchases (in micro-USD)."
            ],
            "type": "u64"
          },
          {
            "name": "purchaseCount",
            "docs": [
              "Number of individual Purchase PDAs owned by this wallet."
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this profile was created."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for this buyer profile."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "buyerVerifiedEvent",
      "docs": [
        "Emitted when a buyer is verified for whitelist access."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The compliance authority that verified the buyer."
            ],
            "type": "pubkey"
          },
          {
            "name": "wallet",
            "docs": [
              "The wallet that was verified."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round ID (0 = all rounds)."
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the verification."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "claimEvent",
      "docs": [
        "Emitted when a user claims vested GAIA tokens."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet claiming tokens."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "purchaseNumber",
            "docs": [
              "The purchase number being claimed against."
            ],
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "docs": [
              "The amount of GAIA tokens claimed in this transaction."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the claim."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "config",
      "docs": [
        "Global protocol configuration. Singleton account — one per program deployment.",
        "",
        "Stores admin authority, supported mints, vesting TGE reference,",
        "aggregate counters, and pause state."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin pubkey authorized to manage rounds and protocol settings."
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "The treasury wallet that receives USDC/USDT payments directly."
            ],
            "type": "pubkey"
          },
          {
            "name": "gaiaMint",
            "docs": [
              "The GAIA token mint address."
            ],
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "docs": [
              "The accepted USDC mint address."
            ],
            "type": "pubkey"
          },
          {
            "name": "usdtMint",
            "docs": [
              "The accepted USDT mint address."
            ],
            "type": "pubkey"
          },
          {
            "name": "tgeTimestamp",
            "docs": [
              "Token Generation Event timestamp. All vesting schedules are relative to this."
            ],
            "type": "i64"
          },
          {
            "name": "currentRound",
            "docs": [
              "The current active round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "totalTokensSold",
            "docs": [
              "Cumulative GAIA tokens sold across all rounds."
            ],
            "type": "u64"
          },
          {
            "name": "totalUsdcRaised",
            "docs": [
              "Cumulative USDC raised across all rounds (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "totalUsdtRaised",
            "docs": [
              "Cumulative USDT raised across all rounds (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "paused",
            "docs": [
              "Whether the entire presale is paused."
            ],
            "type": "bool"
          },
          {
            "name": "gaiaVault",
            "docs": [
              "The GAIA vault PDA that holds tokens for claim distribution."
            ],
            "type": "pubkey"
          },
          {
            "name": "legalAuthority",
            "docs": [
              "The legal authority wallet that can clear purchases to begin."
            ],
            "type": "pubkey"
          },
          {
            "name": "legalCleared",
            "docs": [
              "Whether legal clearance has been granted. Required before any purchase."
            ],
            "type": "bool"
          },
          {
            "name": "complianceAuthority",
            "docs": [
              "The compliance authority wallet that can verify buyers for whitelist."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for the Config account."
            ],
            "type": "u8"
          },
          {
            "name": "gaiaVaultBump",
            "docs": [
              "PDA bump for the GAIA vault account."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "createRoundParams",
      "docs": [
        "Parameters for creating a new round."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "Human-readable round name."
            ],
            "type": "string"
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "Price per 1 GAIA token in micro-USD."
            ],
            "type": "u64"
          },
          {
            "name": "tokensAvailable",
            "docs": [
              "Total GAIA tokens available for sale."
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "Unix timestamp when the round opens."
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "Unix timestamp when the round closes."
            ],
            "type": "i64"
          },
          {
            "name": "cliffSeconds",
            "docs": [
              "Seconds after TGE before claims unlock (cliff)."
            ],
            "type": "i64"
          },
          {
            "name": "vestingDurationSeconds",
            "docs": [
              "Total vesting duration in seconds after cliff."
            ],
            "type": "i64"
          },
          {
            "name": "minimumPurchase",
            "docs": [
              "Minimum payment amount per transaction (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "maximumPurchase",
            "docs": [
              "Maximum payment amount per transaction (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "maximumPerWallet",
            "docs": [
              "Maximum total spend per wallet in this round."
            ],
            "type": "u64"
          },
          {
            "name": "whitelistEnabled",
            "docs": [
              "Whether whitelist verification is required."
            ],
            "type": "bool"
          },
          {
            "name": "roundType",
            "docs": [
              "Type of round (seed or public)."
            ],
            "type": {
              "defined": {
                "name": "roundType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "legalClearedEvent",
      "docs": [
        "Emitted when legal clearance is granted to begin purchases."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "legalAuthority",
            "docs": [
              "The legal authority that granted clearance."
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the clearance."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "pausedEvent",
      "docs": [
        "Emitted when a presale round is paused."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that paused the round."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round that was paused (0 = global pause)."
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the pause."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "purchase",
      "docs": [
        "An immutable record of a single token purchase transaction.",
        "",
        "One PDA per purchase, seeded by wallet address and sequential purchase number."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet that made this purchase."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round this purchase belongs to."
            ],
            "type": "u8"
          },
          {
            "name": "purchaseNumber",
            "docs": [
              "Sequential purchase number for this wallet (matches BuyerProfile.purchase_count at creation)."
            ],
            "type": "u64"
          },
          {
            "name": "paymentAmount",
            "docs": [
              "USDC/USDT amount paid in smallest units."
            ],
            "type": "u64"
          },
          {
            "name": "paymentMint",
            "docs": [
              "The payment mint used (USDC or USDT pubkey)."
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "docs": [
              "Amount of GAIA tokens purchased."
            ],
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "docs": [
              "GAIA tokens already claimed from this purchase."
            ],
            "type": "u64"
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "Price per token at time of purchase (micro-USD), stored for historical auditing."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the purchase."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for this purchase account."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "purchaseEvent",
      "docs": [
        "Emitted when a user purchases GAIA tokens in a presale round."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet that made the purchase."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "purchaseNumber",
            "docs": [
              "Sequential purchase number for this wallet."
            ],
            "type": "u64"
          },
          {
            "name": "paymentMint",
            "docs": [
              "The payment mint used (USDC or USDT)."
            ],
            "type": "pubkey"
          },
          {
            "name": "paymentAmount",
            "docs": [
              "The amount of USDC/USDT paid (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "docs": [
              "The amount of GAIA tokens purchased."
            ],
            "type": "u64"
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "The price per token at time of purchase (micro-USD)."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the purchase."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "resumeEvent",
      "docs": [
        "Emitted when a presale round is resumed."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that resumed the round."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round that was resumed (0 = global resume)."
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the resume."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "round",
      "docs": [
        "Represents a single presale round with its parameters and state.",
        "",
        "One PDA per round, seeded by the round `id`."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "Unique round identifier (0–255)."
            ],
            "type": "u8"
          },
          {
            "name": "name",
            "docs": [
              "Human-readable round name."
            ],
            "type": "string"
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "Price per 1 GAIA token in micro-USD (1 USD = 1_000_000)."
            ],
            "type": "u64"
          },
          {
            "name": "tokensAvailable",
            "docs": [
              "Total GAIA tokens available for sale in this round."
            ],
            "type": "u64"
          },
          {
            "name": "tokensSold",
            "docs": [
              "GAIA tokens already sold in this round."
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "Unix timestamp when the round opens for purchases."
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "Unix timestamp when the round closes."
            ],
            "type": "i64"
          },
          {
            "name": "cliffSeconds",
            "docs": [
              "Seconds after TGE before claims are allowed (cliff period)."
            ],
            "type": "i64"
          },
          {
            "name": "vestingDurationSeconds",
            "docs": [
              "Total seconds over which tokens vest after the cliff."
            ],
            "type": "i64"
          },
          {
            "name": "minimumPurchase",
            "docs": [
              "Minimum USDC/USDT payment amount per transaction (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "maximumPurchase",
            "docs": [
              "Maximum USDC/USDT payment amount per single transaction (in smallest units)."
            ],
            "type": "u64"
          },
          {
            "name": "maximumPerWallet",
            "docs": [
              "Maximum total USDC/USDT a single wallet can spend in this round."
            ],
            "type": "u64"
          },
          {
            "name": "whitelistEnabled",
            "docs": [
              "Whether whitelist verification is required to participate."
            ],
            "type": "bool"
          },
          {
            "name": "roundType",
            "docs": [
              "Type of round (seed or public)."
            ],
            "type": {
              "defined": {
                "name": "roundType"
              }
            }
          },
          {
            "name": "status",
            "docs": [
              "Current lifecycle status of the round."
            ],
            "type": {
              "defined": {
                "name": "roundStatus"
              }
            }
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for this round account."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roundActivatedEvent",
      "docs": [
        "Emitted when an upcoming round is activated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that activated the round."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the activation."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "roundCreatedEvent",
      "docs": [
        "Emitted when a new presale round is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "docs": [
              "The round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "name",
            "docs": [
              "Human-readable round name."
            ],
            "type": "string"
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "Price per token in micro-USD."
            ],
            "type": "u64"
          },
          {
            "name": "tokensAvailable",
            "docs": [
              "Total tokens available in this round."
            ],
            "type": "u64"
          },
          {
            "name": "startTime",
            "docs": [
              "Unix timestamp when the round starts."
            ],
            "type": "i64"
          },
          {
            "name": "endTime",
            "docs": [
              "Unix timestamp when the round ends."
            ],
            "type": "i64"
          },
          {
            "name": "roundType",
            "docs": [
              "Type of round (seed or public)."
            ],
            "type": {
              "defined": {
                "name": "roundType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "roundEndedEvent",
      "docs": [
        "Emitted when a round is ended prematurely."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "docs": [
              "The round identifier."
            ],
            "type": "u8"
          },
          {
            "name": "name",
            "docs": [
              "Human-readable round name."
            ],
            "type": "string"
          },
          {
            "name": "tokensSold",
            "docs": [
              "Total GAIA tokens sold in this round."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the end."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "roundStatus",
      "docs": [
        "Lifecycle status of a presale round."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "upcoming"
          },
          {
            "name": "active"
          },
          {
            "name": "paused"
          },
          {
            "name": "ended"
          }
        ]
      }
    },
    {
      "name": "roundType",
      "docs": [
        "Type of presale round (seed vs public)."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "seed"
          },
          {
            "name": "public"
          }
        ]
      }
    },
    {
      "name": "statistics",
      "docs": [
        "Global protocol statistics. Singleton account — one per program deployment.",
        "",
        "Aggregated counters to avoid scanning thousands of accounts from the frontend."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalBuyers",
            "docs": [
              "Total unique wallets that have made at least one purchase."
            ],
            "type": "u64"
          },
          {
            "name": "totalTransactions",
            "docs": [
              "Total number of individual purchase transactions."
            ],
            "type": "u64"
          },
          {
            "name": "totalUsdMicro",
            "docs": [
              "Total USD value raised across all rounds (in micro-USD)."
            ],
            "type": "u64"
          },
          {
            "name": "seedSold",
            "docs": [
              "Total GAIA tokens sold in seed rounds."
            ],
            "type": "u64"
          },
          {
            "name": "publicSold",
            "docs": [
              "Total GAIA tokens sold in public rounds."
            ],
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "docs": [
              "Total GAIA tokens sold across all rounds."
            ],
            "type": "u64"
          },
          {
            "name": "totalTokensClaimed",
            "docs": [
              "Total GAIA tokens claimed by buyers across all rounds."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for the statistics account."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasuryUpdatedEvent",
      "docs": [
        "Emitted when the treasury wallet is updated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that updated the treasury."
            ],
            "type": "pubkey"
          },
          {
            "name": "oldTreasury",
            "docs": [
              "The previous treasury wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "newTreasury",
            "docs": [
              "The new treasury wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the update."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "updateRoundParams",
      "docs": [
        "Parameters for updating a round."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "New round name (optional)."
            ],
            "type": {
              "option": "string"
            }
          },
          {
            "name": "priceMicroUsd",
            "docs": [
              "New price per token in micro-USD (optional)."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "tokensAvailable",
            "docs": [
              "New tokens available (optional)."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "startTime",
            "docs": [
              "New start time (optional)."
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "docs": [
              "New end time (optional)."
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "cliffSeconds",
            "docs": [
              "New cliff seconds (optional)."
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "vestingDurationSeconds",
            "docs": [
              "New vesting duration (optional)."
            ],
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "minimumPurchase",
            "docs": [
              "New minimum purchase (optional)."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maximumPurchase",
            "docs": [
              "New maximum purchase (optional)."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maximumPerWallet",
            "docs": [
              "New maximum per wallet (optional)."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "whitelistEnabled",
            "docs": [
              "New whitelist flag (optional)."
            ],
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "whitelistEntry",
      "docs": [
        "Represents a buyer verified for whitelist access in a specific round."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "docs": [
              "The wallet that was verified."
            ],
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "docs": [
              "The round ID this entry applies to (0 = all rounds)."
            ],
            "type": "u8"
          },
          {
            "name": "authority",
            "docs": [
              "The compliance authority that verified this wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "verifiedAt",
            "docs": [
              "Unix timestamp when the verification was made."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump for this whitelist entry."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "withdrawGaiaEvent",
      "docs": [
        "Emitted when GAIA tokens are withdrawn from the vault by the admin."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "The admin that withdrew tokens."
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of GAIA tokens withdrawn."
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp of the withdrawal."
            ],
            "type": "i64"
          }
        ]
      }
    }
  ]
};
