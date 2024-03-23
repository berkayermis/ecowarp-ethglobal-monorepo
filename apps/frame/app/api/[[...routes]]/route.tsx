/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { pinata } from "frog/hubs";
import { serveStatic } from "frog/serve-static";
import { get_and_encode_wallet_address, sign_up, cdn_req } from "@/actions";
import { Address, parseEther, zeroAddress } from "viem";
import { extractParamsFromUrl, NumberFormatter } from "@/utils/formatter";
import { generateSecureRandomString } from "@/utils/random";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/constant";

type UserType = "Seller" | "Buyer" | undefined;

type ProductType = {
  name: string;
  description: string;
  unitPrice: string;
  supply: string;
  category: string;
};

type State = {
  UserType: UserType;
  address: Address;
  message: string;
  code: string | undefined;
  readyToFinish: boolean;
  product: ProductType;
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
    product: {
      name: "",
      description: "",
      unitPrice: "",
      supply: "",
      category: "",
    },
  },
});

app.frame("/", (c) => {
  const { buttonValue, deriveState, frameData } = c;

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 35,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 20,
            padding: "0 300px",
            whiteSpace: "pre-wrap",
          }}
        >
          test
        </div>
      </div>
    ),
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
      previousState.product.unitPrice = inputText;
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
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 35,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 20,
            padding: "0 300px",
            whiteSpace: "pre-wrap",
          }}
        >
          {state.message ? state.message : "error"}
        </div>
      </div>
    ),
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
        <TextInput placeholder="Unit Price" />
      ) : buttonValue === "continue_3" ? (
        <TextInput placeholder="Supply" />
      ) : buttonValue === "continue_4" ? (
        <TextInput placeholder="Category (Art, Electronics, Books)" />
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
          location={`/?code=${state.code}&wallet_address=${state.address}&name=${state.product.name}&description=${state.product.description}&unitPrice=${state.product.unitPrice}&supply=${state.product.supply}&category=${state.product.category}`}
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

app.transaction("/mint", (c) => {
  const { previousState } = c;
  const product = previousState.product;

  return c.contract({
    abi: CONTRACT_ABI,
    chainId: "eip155:8453",
    functionName: "createListing",
    to: CONTRACT_ADDRESS,
    args: [product.description, product.description, product.unitPrice],
    value: parseEther(product.unitPrice),
  });
});

app.frame("/buyer", async (c) => {
  const { buttonValue, deriveState, frameData } = c;
  console.log("hello buyer");

  const state = await deriveState(async (previousState) => {
    previousState.UserType = "Buyer";
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

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 35,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 20,
            padding: "0 300px",
            whiteSpace: "pre-wrap",
          }}
        >
          {state.message ? state.message : "error"}
        </div>
      </div>
    ),
    imageAspectRatio: "1:1",
    intents: [
      <Button key="b" value="buyer">
        Hey buyer!
      </Button>,
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
