import {
  ItemListed as ItemListedEvent,
  ItemSold as ItemSoldEvent,
} from "../generated/EcoWarpMarketplace/EcoWarpMarketplace";
import { ItemListed, ItemSold } from "../generated/schema";

export function handleItemListed(event: ItemListedEvent): void {
  let entity = new ItemListed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.creator = event.params.creator;
  entity.name = event.params.name;
  entity.description = event.params.description;
  entity.category = event.params.category;
  entity.uri = event.params.uri;
  entity.price = event.params.price;
  entity.supply = event.params.supply;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleItemSold(event: ItemSoldEvent): void {
  let entity = new ItemSold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokenId = event.params.tokenId;
  entity.buyer = event.params.buyer;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
