/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { pinata } from "frog/hubs";
import { serveStatic } from "frog/serve-static";
import {
  get_and_encode_wallet_address,
  sign_up,
  cdn_req,
  fetchIPFSHash,
  buyerAction,
} from "@/actions";
import { Address, formatEther, parseEther, zeroAddress } from "viem";
import { extractParamsFromUrl, NumberFormatter } from "@/utils/formatter";
import { generateSecureRandomString } from "@/utils/random";
import {
  CHAIN_ID,
  CONSTANT_ETH_USD_PRICE,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  PINATA_IPFS_GATEWAY,
} from "@/constant";

type UserType = "Seller" | "Buyer" | undefined;

type ProductType = {
  name: string;
  description: string;
  price: string;
  supply: string;
  category: string;
};

interface GraphProduct extends ProductType {
  creator: Address;
  tokenId: string;
  uri: string;
}

type State = {
  UserType: UserType;
  address: Address;
  message: string;
  code: string | undefined;
  readyToFinish: boolean;
  product: ProductType;
  products: Array<GraphProduct>;
  activeProducts: Array<GraphProduct>;
  totalPages: number;
  currentPage: number;
  currentImage: string;
};

const app = new Frog<{ State: State }>({
  assetsPath: "/",
  basePath: "/api",
  hub: pinata(),
  verify: "silent",
  browserLocation: "/:path",
  //secret: process.env.FROG_SECRET, // @todo
  initialState: {
    UserType: undefined,
    address: zeroAddress,
    message: "",
    code: undefined,
    readyToFinish: false,
    products: [],
    totalPages: 0,
    currentPage: 0,
    currentImage: "",
    product: {
      name: "",
      description: "",
      price: "",
      supply: "",
      category: "",
    },
  },
});

app.frame("/", (c) => {
  const { buttonValue, deriveState, frameData } = c;

  return c.res({
    image: "/Onboarding.png",
    imageAspectRatio: "1:1",
    intents: [
      <Button action="/seller" key="s" value="seller">
        I am Seller!
      </Button>,
      <Button action="/buyer" key="b" value="buyer">
        I am Buyer!
      </Button>,
    ],
  });
});

app.frame("/seller", async (c) => {
  const { buttonValue, deriveState, frameData, buttonIndex, inputText } = c;
  console.log(
    "hello seller",
    buttonValue,
    " inputText: ",
    inputText,
    " buttonIndex: ",
    buttonIndex
  );
  let state;

  state = await deriveState(async (previousState) => {
    previousState.UserType = "Seller";
    const { ok, user, unregistered_wallet_address } =
      await get_and_encode_wallet_address(frameData?.fid);
    if (ok) {
      previousState.address = user.wallet_address;
      previousState.message = "User found";
    } else {
      const { ok } = await sign_up(unregistered_wallet_address);
      if (ok) {
        previousState.address = unregistered_wallet_address;
        previousState.message = "User registered";
      } else {
        previousState.message = "User not registered";
      }
    }
  });

  if (buttonValue === "seller" && buttonIndex === 1) {
    const code = await generateSecureRandomString(32);
    state = await deriveState(async (previousState) => {
      previousState.code = code;
    });
  } else if (buttonValue === "continue" && buttonIndex === 2 && inputText) {
    state = await deriveState(async (previousState) => {
      previousState.product.name = inputText;
    });
  } else if (buttonValue === "continue_2" && buttonIndex === 2 && inputText) {
    state = await deriveState(async (previousState) => {
      previousState.product.description = inputText;
    });
  } else if (buttonValue === "continue_3" && buttonIndex === 2 && inputText) {
    state = await deriveState(async (previousState) => {
      previousState.product.price = inputText;
    });
  } else if (buttonValue === "continue_4" && buttonIndex === 2 && inputText) {
    state = await deriveState(async (previousState) => {
      previousState.product.supply = inputText;
    });
  } else if (buttonValue === "continue_5" && buttonIndex === 2 && inputText) {
    state = await deriveState(async (previousState) => {
      previousState.product.category = inputText;
      previousState.readyToFinish = true;
    });
  } else {
    const { extractedCode, wallet_address } = await extractParamsFromUrl(
      buttonValue as string
    );
    if (
      extractedCode !== null &&
      extractedCode === state.code &&
      wallet_address !== null &&
      wallet_address === state.address
    ) {
      const { ok } = await cdn_req(wallet_address, extractedCode);
      if (ok) {
        console.log("ok");
      } else {
        console.log("not ok");
      }
    }
  }

  return c.res({
    image:
      buttonValue === "seller"
        ? "/name.png"
        : buttonValue === "continue"
          ? "/description.png"
          : buttonValue === "continue_2"
            ? "/unit.png"
            : buttonValue === "continue_3"
              ? "/supply.png"
              : buttonValue === "continue_4"
                ? "/category.png"
                : "/finish.png",
    imageAspectRatio: "1:1",
    intents: [
      <Button action="/" key="s-back" value="back">
        👈
      </Button>,
      buttonValue === "seller" ? (
        <TextInput placeholder="Product Name" />
      ) : buttonValue === "continue" ? (
        <TextInput placeholder="Product Description" />
      ) : buttonValue === "continue_2" ? (
        <TextInput placeholder="Unit Price ($)" />
      ) : buttonValue === "continue_3" ? (
        <TextInput placeholder="Supply" />
      ) : buttonValue === "continue_4" ? (
        <TextInput placeholder="Category (art, electronics, books)" />
      ) : null,
      buttonValue === "seller" ? (
        <Button key="continue" value="continue">
          Enter Product Description
        </Button>
      ) : buttonValue === "continue" ? (
        <Button key="continue_2" value="continue_2">
          Enter Unit Price
        </Button>
      ) : buttonValue === "continue_2" ? (
        <Button key="continue_3" value="continue_3">
          Enter Supply
        </Button>
      ) : buttonValue === "continue_3" ? (
        <Button key="continue_4" value="continue_4">
          Select Category
        </Button>
      ) : buttonValue === "continue_4" ? (
        <Button key="continue_5" value="continue_5">
          Continue
        </Button>
      ) : (
        <Button.Redirect
          location={`/?code=${state.code}&wallet_address=${state.address}&name=${encodeURIComponent(state.product.name)}&description=${encodeURIComponent(state.product.description)}&unitPrice=${encodeURIComponent(state.product.price)}&supply=${state.product.supply}&category=${state.product.category}`}
        >
          {"Upload Image 🛍️"}
        </Button.Redirect>
      ),
      state.readyToFinish && (
        <Button.Transaction target="/mint">Mint</Button.Transaction>
      ),
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { previousState, address } = c;
  const product = previousState.product;

  const { ok, hash } = await fetchIPFSHash(address as Address);

  if (!ok) {
    throw new Error("IPFS hash not found");
  }

  return c.contract({
    abi: CONTRACT_ABI,
    chainId: `eip155:${CHAIN_ID}`,
    functionName: "createListing",
    to: CONTRACT_ADDRESS,
    args: [
      product.description,
      PINATA_IPFS_GATEWAY + hash,
      parseEther(String(Number(product.price) / CONSTANT_ETH_USD_PRICE)),
      product.supply,
    ],
    value: parseEther("0.00001"), // @todo
  });
});

app.frame("/buyer", async (c) => {
  const { buttonValue, deriveState, frameData } = c;
  console.log("hello buyer");
  let state;

  state = await deriveState(async (previousState) => {
    previousState.UserType = "Buyer";
    const { ok, user, unregistered_wallet_address } =
      await get_and_encode_wallet_address(frameData?.fid);
    if (ok) {
      previousState.address = user.wallet_address;
      previousState.message = "User found";
      const { ok, products } = await buyerAction(frameData?.fid as number);
      previousState.products = products;
      previousState.totalPages = products.length;
      previousState.activeProducts = products.slice(
        previousState.currentPage,
        previousState.currentPage + 1
      );
      const url =
        PINATA_IPFS_GATEWAY +
        previousState.activeProducts[0]?.uri.split("ipfs://")[1];
      const currentImage = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      previousState.currentImage = currentImage.image;
    } else {
      const { ok } = await sign_up(unregistered_wallet_address);
      if (ok) {
        previousState.address = unregistered_wallet_address;
        previousState.message = "User registered";
      } else {
        previousState.message = "User not registered";
      }
    }
  });

  if (buttonValue === "next") {
    state = await deriveState(async (previousState) => {
      previousState.currentPage += 1;
      previousState.activeProducts = previousState.products.slice(
        previousState.currentPage,
        previousState.currentPage + 1
      );
      const url =
        PINATA_IPFS_GATEWAY +
        previousState.activeProducts[0]?.uri.split("ipfs://")[1];
      const currentImage = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      previousState.currentImage = currentImage.image;
    });
  } else if (buttonValue === "prev") {
    state = await deriveState(async (previousState) => {
      previousState.currentPage -= 1;
      previousState.activeProducts = previousState.products.slice(
        previousState.currentPage,
        previousState.currentPage + 1
      );
      const url =
        PINATA_IPFS_GATEWAY +
        previousState.activeProducts[0]?.uri.split("ipfs://")[1];
      const currentImage = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      previousState.currentImage = currentImage.image;
    });
  }

  return c.res({
    image: `${state.currentImage}`,
    imageAspectRatio: "1:1",
    intents: [
      state.currentPage === 0 ? (
        <Button action="/" key="b-back" value="back">
          👈
        </Button>
      ) : (
        <Button key="prev" value="prev">
          👈
        </Button>
      ),
      ...state.activeProducts.map((product, index) => {
        return (
          <Button.Transaction
            target={`/purchase/${product.tokenId}/${product.price}`}
            key={index}
          >
            Buy with{" "}
            {NumberFormatter({
              value: Number(formatEther(BigInt(product.price))),
              decimalScale: 6,
              thousandSeparator: true,
              convertToUSD: true,
            })}{" "}
          </Button.Transaction>
        );
      }),
      state.currentPage + 1 < state.totalPages && (
        <Button key="next" value="next">
          👉
        </Button>
      ),
    ],
  });
});

app.transaction("/purchase/:tokenId/:price", async (c) => {
  const { previousState, address, buttonValue, buttonIndex, inputText } = c;
  const product = previousState.product;
  const tokenId = c.req.param("tokenId");
  const price = c.req.param("price");

  return c.contract({
    abi: CONTRACT_ABI,
    chainId: `eip155:${CHAIN_ID}`,
    functionName: "buyItem",
    to: CONTRACT_ADDRESS,
    args: [tokenId, 1],
    value: parseEther((parseFloat(price) / CONSTANT_ETH_USD_PRICE).toString()), // @todo
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
