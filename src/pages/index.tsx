import React, { useState } from "react";
import { ethers } from "ethers";
import SocialLogin from "@biconomy/web3-auth";
import SmartAccount from "@biconomy/smart-account";
import { ChainId } from "@biconomy/core-types";
import "@biconomy/web3-auth/dist/src/style.css";
import dynamic from "next/dynamic";

export default function Home() {
  const AuthDynamic = dynamic(() => import("../pages/auth"), { ssr: false });

  return <AuthDynamic />;
}
