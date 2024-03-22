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

contract EcoWarpMarketplace is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    struct ItemInfo {
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

    function initialize(address defaultAdmin) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function createItem(
        string memory name_,
        string memory description_,
        string memory uri_,
        uint256 price_,
        uint256 supply_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bytes(name_).length == 0) revert EcoWarpMarketplace__InvalidName();
        if (bytes(description_).length == 0)
            revert EcoWarpMarketplace__InvalidDescription();
        if (bytes(uri_).length == 0) revert EcoWarpMarketplace__InvalidURI();
        if (supply_ == 0) revert EcoWarpMarketplace__InvalidSupply();

        uint256 tokenId = _incrementAndGetTokenId();
        EcoWarpMarketplaceStorage storage $ = _getEcoWarpMarketplaceStorage();

        $._itemInfo[tokenId] = ItemInfo({
            name: name_,
            description: description_,
            uri: uri_,
            price: price_,
            supply: supply_
        });

        $._ecoWarpNFT.mint(address(this), tokenId, supply_, uri_);
    }

    function _incrementAndGetTokenId() internal returns (uint256) {
        unchecked {
            return _getEcoWarpMarketplaceStorage()._tokenId++;
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
