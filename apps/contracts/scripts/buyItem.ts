import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { SignerWithAddress as Signer } from "@nomicfoundation/hardhat-ethers/signers";
import { EcoWarpMarketplace } from "../typechain-types";

async function buyItem() {
  const [deployer] = await ethers.getSigners();

  const ecoWarpMarketplace = (await ethers.getContractAt(
    "EcoWarpMarketplace",
    "" // Address of the deployed contract
  )) as EcoWarpMarketplace;

  const tokenId = 0;
  const amount = 1;
  const price = parseEther("0.00001");
  await ecoWarpMarketplace.connect(deployer).buyItem(tokenId, amount, {
    value: price * BigInt(amount),
  });
}

buyItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
