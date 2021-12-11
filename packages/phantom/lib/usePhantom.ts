import { useEffect, useState } from 'react';
import { ExtendedWindow } from '../../../src/types';
import { loggerFactory } from '../../../src/utils/logger';

/**
 * React hook for using Phantom crypto wallet
 * https://phantom.app/
 *
 */

export type UsePhantomHook = (props?: { debug?: boolean }) => {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
};

export const usePhantom: UsePhantomHook = ({ debug } = {}) => {
  const logger = loggerFactory(debug);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async (): Promise<void> => {
    try {
      const { solana } = window as ExtendedWindow;

      if (solana) {
        if (solana.isPhantom) {
          logger('Phantom wallet found!');

          /*
           * The solana object gives us a function that will allow us to connect
           * directly with the user's wallet!
           */
          const response = await solana.connect({ onlyIfTrusted: true });
          logger('Connected with Public Key:', response.publicKey.toString());

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window as ExtendedWindow;

    if (solana) {
      const response = await solana.connect();
      logger('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  /*
   * Disconnect from the Phantom wallet
   */
  const disconnectWallet = async () => {
    const { solana } = window as ExtendedWindow;

    if (solana) {
      const response = await solana.disconnect();
      logger('Connected with Public Key:', response);
      setWalletAddress(null);
    }
  };

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    window.addEventListener('load', checkIfWalletIsConnected);
    return () => window.removeEventListener('load', checkIfWalletIsConnected);
  }, []);

  return { walletAddress, connectWallet, disconnectWallet };
};
