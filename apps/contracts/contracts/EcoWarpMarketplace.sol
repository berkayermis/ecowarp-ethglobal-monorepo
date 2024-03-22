// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IEcoWarp1155NFT} from "./interfaces/IEcoWarp1155NFT.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

error EcoWarpMarketplace__InvalidSupply();
error EcoWarpMarketplace__InvalidName();
error EcoWarpMarketplace__InvalidDescription();
error EcoWarpMarketplace__InvalidURI();
error EcoWarpMarketplace__SameListingFee();
error EcoWarpMarketplace__InvalidListingFee();
error EcoWarpMarketplace__FailedInnerCall();
error EcoWarpMarketplace__InsufficientBalance();
error EcoWarpMarketplace__InvalidSaleFee();
error EcoWarpMarketplace__InvalidTokenId();
error EcoWarpMarketplace__InsufficientSupply();
error EcoWarpMarketplace__IncorrectPaymentAmount();

contract EcoWarpMarketplace is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    uint256 private constant DENOMINATOR = 10000;

    struct ItemInfo {
        address creator;
        string name;
        string description;
        string uri;
        uint256 price;
        uint256 supply;
    }

    struct EcoWarpMarketplaceStorage {
        IEcoWarp1155NFT _ecoWarpNFT;
        uint256 _tokenId;
        mapping(uint256 => ItemInfo) _itemInfo;
        uint256 _itemListingFee;
        uint256 _saleFee; // in basis points
    }

    // keccak256(abi.encode(uint256(keccak256("ecowarp.storage.marketplace")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant EcoWarpMarketplaceStorageLocation =
        0xabe61afda60696eaa5ad712ca9f31e4eaf93c33f603381db92c373464e81da00;

    function _getEcoWarpMarketplaceStorage()
        private
        pure
        returns (EcoWarpMarketplaceStorage storage $)
    {
        assembly {
            $.slot := EcoWarpMarketplaceStorageLocation
        }
    }

    function initialize(
        uint256 itemListingFee_,
        uint256 saleFee_,
        address defaultAdmin
    ) public initializer {
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();
        $._itemListingFee = itemListingFee_;
        $._saleFee = saleFee_;
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function setItemListingFee(
        uint256 itemListingFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();
        if ($._itemListingFee == itemListingFee)
            revert EcoWarpMarketplace__SameListingFee();
        $._itemListingFee = itemListingFee;
    }

    function setSaleFee(uint256 saleFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();
        if ($._saleFee == saleFee || saleFee > DENOMINATOR)
            revert EcoWarpMarketplace__InvalidSaleFee();
        $._saleFee = saleFee;
    }

    function createItem(
        string memory name_,
        string memory description_,
        string memory uri_,
        uint256 price_,
        uint256 supply_
    ) external payable onlyRole(DEFAULT_ADMIN_ROLE) {
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();
        if (msg.value != $._itemListingFee)
            revert EcoWarpMarketplace__InvalidListingFee();

        if (bytes(name_).length == 0) revert EcoWarpMarketplace__InvalidName();
        if (bytes(description_).length == 0)
            revert EcoWarpMarketplace__InvalidDescription();
        if (bytes(uri_).length == 0) revert EcoWarpMarketplace__InvalidURI();
        if (supply_ == 0) revert EcoWarpMarketplace__InvalidSupply();

        uint256 tokenId = _getAndIncrementTokenId();
        $._itemInfo[tokenId] = ItemInfo({
            creator: msg.sender,
            name: name_,
            description: description_,
            uri: uri_,
            price: price_,
            supply: supply_
        });

        $._ecoWarpNFT.mint(address(this), tokenId, supply_, uri_);
    }

    function buyItem(uint256 tokenId_, uint256 amount_) external payable {
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();
        if (tokenId_ >= $._tokenId) revert EcoWarpMarketplace__InvalidTokenId();

        ItemInfo storage item = $._itemInfo[tokenId_];
        if (item.supply < amount_)
            revert EcoWarpMarketplace__InsufficientSupply();
        if (msg.value != item.price * amount_)
            revert EcoWarpMarketplace__IncorrectPaymentAmount();

        item.supply = item.supply - amount_;

        uint256 sellerAmount = (msg.value * (DENOMINATOR - $._saleFee)) /
            DENOMINATOR;
        _sendValue(item.creator, sellerAmount);

        $._ecoWarpNFT.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId_,
            amount_,
            ""
        );
    }

    function withdraw(
        address recipient_,
        uint256 amount_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (address(this).balance < amount_) {
            revert EcoWarpMarketplace__InsufficientBalance();
        }

        _sendValue(recipient_, amount_);
    }

    function _sendValue(address recipient_, uint256 amount_) private {
        (bool success, ) = payable(recipient_).call{value: amount_}("");
        if (!success) {
            revert EcoWarpMarketplace__FailedInnerCall();
        }
    }

    function _getAndIncrementTokenId() internal returns (uint256) {
        unchecked {
            return ++_getEcoWarpMarketplaceStorage()._tokenId;
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
