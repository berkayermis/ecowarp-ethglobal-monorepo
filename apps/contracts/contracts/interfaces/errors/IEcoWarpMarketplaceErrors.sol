// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IEcoWarpMarketplaceErrors {
    error EcoWarpMarketplace__ZeroAddress();
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
}
