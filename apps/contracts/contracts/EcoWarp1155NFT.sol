// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

error EcoWarp1155NFT__ZeroAddress();
error EcoWarp1155NFT__InvalidAmount();
error EcoWarp1155NFT__InvalidURI();
error EcoWarp1155NFT__InvalidTokenId();

contract EcoWarp1155NFT is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    ERC1155SupplyUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant MARKETPLACE_ROLE =
        0x0ea61da3a8a09ad801432653699f8c1860b1ae9d2ea4a141fadfd63227717bc8;

    struct EcoWarp1155NFTStorage {
        mapping(uint256 => string) _tokenURIs;
    }

    // keccak256(abi.encode(uint256(keccak256("ecowarp.storage.1155NFT")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant EcoWarp1155NFTStorageLocation =
        0xabe61afda60696eaa5ad712ca9f31e4eaf93c33f603381db92c373464e81da00;

    function _getEcoWarp1155NFTStorage()
        private
        pure
        returns (EcoWarp1155NFTStorage storage $)
    {
        assembly {
            $.slot := EcoWarp1155NFTStorageLocation
        }
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin) public initializer {
        __ERC1155_init("");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return _getEcoWarp1155NFTStorage()._tokenURIs[id];
    }

    function mint(
        address account_,
        uint256 id_,
        uint256 amount_,
        string memory uri_
    ) external onlyRole(MARKETPLACE_ROLE) {
        EcoWarp1155NFTStorage storage $ = _getEcoWarp1155NFTStorage();

        if (account_ == address(0)) revert EcoWarp1155NFT__ZeroAddress();
        if (amount_ == 0) revert EcoWarp1155NFT__InvalidAmount();

        if (bytes($._tokenURIs[id_]).length == 0)
            revert EcoWarp1155NFT__InvalidURI();

        if (bytes($._tokenURIs[id_]).length > 0)
            revert EcoWarp1155NFT__InvalidTokenId();

        $._tokenURIs[id_] = uri_;
        _mint(account_, id_, amount_, "");
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(ERC1155Upgradeable, ERC1155SupplyUpgradeable)
        onlyRole(MARKETPLACE_ROLE)
    {
        super._update(from, to, ids, values);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
