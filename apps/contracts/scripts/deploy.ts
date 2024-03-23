import { ethers, upgrades } from "hardhat";
import { parseEther } from "ethers";
import { SignerWithAddress as Signer } from "@nomicfoundation/hardhat-ethers/signers";
import { EcoWarp1155NFT, EcoWarpMarketplace } from "../typechain-types";

async function deploy() {
  const [deployer] = await ethers.getSigners();
  const itemListingFee = parseEther("0.001");
  const saleFee = 300;

  const ecoWarpNFT = (await upgrades.deployProxy(
    await ethers.getContractFactory("EcoWarp1155NFT", deployer),
    [deployer.address]
  )) as unknown as EcoWarp1155NFT;
  console.log("EcoWarp1155NFT deployed to:", ecoWarpNFT.target);

  const ecoWarpMarketplace = (await upgrades.deployProxy(
    await ethers.getContractFactory("EcoWarpMarketplace", deployer),
    [itemListingFee, saleFee, deployer.address]
  )) as unknown as EcoWarpMarketplace;
  console.log("EcoWarpMarketplace deployed to:", ecoWarpMarketplace.target);

  await ecoWarpMarketplace.connect(deployer).setEcoWarpNFT(ecoWarpNFT.target);
  await ecoWarpNFT
    .connect(deployer)
    .grantRole(await ecoWarpNFT.MARKETPLACE_ROLE(), ecoWarpMarketplace.target);
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
