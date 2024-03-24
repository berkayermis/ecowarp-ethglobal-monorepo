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

  const name = "Test Item 1";
  const description = "Test Item Description";
  const category = "Test Category";
  const uri = "ipfs://QmR52X4u7Xy6gEe4mSPpCeGxU9drqo4QbB2eSZRVvmi7to";
  const price = parseEther("0.00001");
  const supply = 10;
  await ecoWarpMarketplace
    .connect(deployer)
    .createListing(name, description, category, uri, price, supply, {
      value: itemListingFee,
    });
}

createListing()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
