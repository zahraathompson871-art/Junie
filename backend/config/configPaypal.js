import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

const buildEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase();

  if (env === "live") {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

export const paypal = checkoutNodeJssdk;

export const getPaypalClient = () => {
  const environment = buildEnvironment();
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
};
