import { Connection, clusterApiUrl, Commitment, ConnectionConfig } from '@solana/web3.js';
import { Idl, IdlTypes, Program, Provider, web3 } from '@project-serum/anchor';

import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import { IdlTypeDef } from '@project-serum/anchor/dist/cjs/idl';
import { ExtendedWindow } from '../../../src/types';
import { loggerFactory } from '../../../src/utils/logger';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

export type UseSolanaHook = (props: {
  idl: Idl;
  programId: string;
  baseAccount: web3.Keypair;
  network?: web3.Cluster;
  connectionConfig?: ConnectionConfig;
  commitment?: Commitment;
  debug?: boolean;
}) => {
  getAccount: () => Promise<TypeDef<IdlTypeDef, IdlTypes<Idl>>>;
  getProvider: () => Provider;
  getProgram: (customProvider?: Provider) => Program<Idl>;
  getOrCreateAccount: () => Promise<TypeDef<IdlTypeDef, IdlTypes<Idl>>>;
  createAccount: () => Promise<string | null>;
};

export const useSolana: UseSolanaHook = ({
  idl,
  programId,
  baseAccount,
  network = 'devnet',
  connectionConfig = {},
  commitment = 'processed',
  debug
}) => {
  const logger = loggerFactory(debug);

  const getProvider = (): Provider => {
    const connection = new Connection(clusterApiUrl(network), connectionConfig || commitment);
    const provider = new Provider(connection, (window as ExtendedWindow).solana, {
      commitment
    });
    return provider;
  };

  const getProgram = (customProvider?: Provider): Program<Idl> => {
    const provider = customProvider || getProvider();
    return new Program(idl as Idl, programId, provider);
  };

  const createAccount = async (): Promise<string | null> => {
    try {
      const provider = getProvider();
      const program = getProgram(provider);

      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [baseAccount]
      });

      logger('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString());
      return baseAccount.publicKey.toString();
    } catch (error) {
      logger('Error creating BaseAccount account:', (error as Error).message);
      return null;
    }
  };

  const getAccount = async (): Promise<TypeDef<IdlTypeDef, IdlTypes<Idl>>> => {
    const program = getProgram();
    return program.account.baseAccount.fetch(baseAccount.publicKey);
  };

  const getOrCreateAccount = async (): Promise<TypeDef<IdlTypeDef, IdlTypes<Idl>>> => {
    const program = getProgram();
    const account = await program.account.baseAccount.fetchNullable(baseAccount.publicKey);

    if (account) {
      return account;
    }

    // If the account dosn't exist create it
    await createAccount();

    return program.account.baseAccount.fetch(baseAccount.publicKey);
  };

  return {
    getAccount,
    getProvider,
    getProgram,
    getOrCreateAccount,
    createAccount
  };
};
