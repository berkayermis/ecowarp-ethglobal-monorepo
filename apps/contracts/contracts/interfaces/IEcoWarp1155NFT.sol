// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IEcoWarp1155NFT {
    function mint(
        address account_,
        uint256 id_,
        uint256 amount_,
        string memory uri_
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) external;
}
