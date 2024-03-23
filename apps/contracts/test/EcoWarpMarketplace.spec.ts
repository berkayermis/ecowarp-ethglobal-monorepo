import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { parseEther } from "ethers";
import { SignerWithAddress as Signer } from "@nomicfoundation/hardhat-ethers/signers";
import { EcoWarp1155NFT, EcoWarpMarketplace } from "../typechain-types";

describe("EcoWarpMarketplace", function () {
  let ecoWarpNFT: EcoWarp1155NFT;
  let ecoWarpMarketplace: EcoWarpMarketplace;
  let itemListingFee: bigint;
  let saleFee: number;
  let admin: Signer;
  let bob: Signer;
  let alice: Signer;

  async function deployContracts(): Promise<{
    ecoWarpNFT: EcoWarp1155NFT;
    ecoWarpMarketplace: EcoWarpMarketplace;
  }> {
    const ecoWarpNFT = (await upgrades.deployProxy(
      await ethers.getContractFactory("EcoWarp1155NFT", admin),
      [admin.address]
    )) as unknown as EcoWarp1155NFT;

    const ecoWarpMarketplace = (await upgrades.deployProxy(
      await ethers.getContractFactory("EcoWarpMarketplace", admin),
      [itemListingFee, saleFee, admin.address]
    )) as unknown as EcoWarpMarketplace;

    return { ecoWarpNFT, ecoWarpMarketplace };
  }

  beforeEach(async () => {
    [admin, bob, alice] = await ethers.getSigners();
    itemListingFee = parseEther("0.001");
    saleFee = 300;

    ({ ecoWarpNFT, ecoWarpMarketplace } = await loadFixture(deployContracts));
    await ecoWarpMarketplace.connect(admin).setEcoWarpNFT(ecoWarpNFT.target);
    await ecoWarpNFT
      .connect(admin)
      .grantRole(
        await ecoWarpNFT.MARKETPLACE_ROLE(),
        ecoWarpMarketplace.target
      );
  });

  it("should create a new listing and buy successfully", async function () {
    const name = "Test Item";
    const description = "Test Item Description";
    const uri = "ipfs://test";
    const price = parseEther("1");
    const supply = 10;

    let beforeContractBalance = await ethers.provider.getBalance(
      ecoWarpMarketplace.target
    );
    await ecoWarpMarketplace
      .connect(bob)
      .createListing(name, description, uri, price, supply, {
        value: itemListingFee,
      });
    let afterContractBalance = await ethers.provider.getBalance(
      ecoWarpMarketplace.target
    );

    expect(afterContractBalance).to.equal(
      beforeContractBalance + itemListingFee
    );

    const bobAddress = bob.address;
    expect(await ecoWarpMarketplace.itemInfo(0)).to.deep.equal([
      bobAddress,
      name,
      description,
      uri,
      price,
      supply,
      0,
    ]);

    beforeContractBalance = await ethers.provider.getBalance(
      ecoWarpMarketplace.target
    );
    const beforeSellerBalance = await ethers.provider.getBalance(bobAddress);
    await ecoWarpMarketplace
      .connect(alice)
      .buyItem(0, 5, { value: price * 5n });
    afterContractBalance = await ethers.provider.getBalance(
      ecoWarpMarketplace.target
    );
    const afterSellerBalance = await ethers.provider.getBalance(bobAddress);

    expect(afterContractBalance).to.equal(
      beforeContractBalance + (price * 5n * BigInt(saleFee)) / 10000n
    );
    expect(afterSellerBalance).to.equal(
      beforeSellerBalance + price * 5n - (price * 5n * BigInt(saleFee)) / 10000n
    );

    expect(await ecoWarpNFT.balanceOf(alice.address, 0)).to.equal(5);
    expect(await ecoWarpMarketplace.itemInfo(0)).to.deep.equal([
      bobAddress,
      name,
      description,
      uri,
      price,
      supply - 5,
      5,
    ]);
  });
});
