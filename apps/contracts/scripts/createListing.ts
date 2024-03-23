import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { SignerWithAddress as Signer } from "@nomicfoundation/hardhat-ethers/signers";
import { EcoWarpMarketplace } from "../typechain-types";

async function createListing() {
  const [deployer] = await ethers.getSigners();
  const itemListingFee = parseEther("0.00001");
  const ecoWarpMarketplace = (await ethers.getContractAt(
    "EcoWarpMarketplace",
    "" // Address of the deployed contract
  )) as EcoWarpMarketplace;

  const name = "Test Item";
  const description = "Test Item Description";
  const uri = "ipfs://test";
  const price = parseEther("0.00001");
  const supply = 10;
  await ecoWarpMarketplace
    .connect(deployer)
    .createListing(name, description, uri, price, supply, {
      value: itemListingFee,
    });
}

createListing()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
