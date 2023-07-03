import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import SocialLogin from '@biconomy/web3-auth';
import SmartAccount from '@biconomy/smart-account';
import { ChainId } from '@biconomy/core-types';

const Auth: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [smartAccount, setSmartAccount] = useState<SmartAccount | null>(null);
  const [interval, enableInterval] = useState(false);
  const sdkRef = useRef<SocialLogin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }

    return () => {
      clearInterval(configureLogin);
    };
  }, [interval]);

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI),
      });
      sdkRef.current = socialLoginSDK;
    }
    if (!sdkRef.current.provider) {
      enableInterval(true);
      sdkRef.current.showWallet();
    } else {
      setupSmartAccount();
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) return;
    setLoading(true);
    sdkRef.current.hideWallet();
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    );
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
      });

      await smartAccount.init();
      setSmartAccount(smartAccount);
      setLoading(false);
    } catch (err) {
      console.log('error setting up smart account... ', err);
    }
  }

  async function logout() {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.');
      return;
    }
    await sdkRef.current.logout();
    sdkRef.current.hideWallet();
    setSmartAccount(null);
    enableInterval(false);
  }

  return (
    <>
      {smartAccount ? (
        <>
          <h3>Smart account address: {smartAccount.address}</h3>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Click to Login</button>
      )}
    </>
  );
};

export default Auth;
