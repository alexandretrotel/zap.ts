import type { ProductMetadata, RecurringInterval } from "@/zap.config";

export function getBillingDetails(product: ProductMetadata, isYearly: boolean) {
  const billingKey = isYearly ? "yearly" : "monthly";
  const billingOption = product.billingOptions?.[billingKey];

  return {
    price: product.price ?? billingOption?.price ?? 0,
    recurringInterval:
      product.recurringInterval ?? billingOption?.recurringInterval ?? "month",
  };
}

export function getProductsArray(
  products: ProductMetadata[],
  isYearly: boolean,
) {
  return products.flatMap((product) => {
    if (product.billingOptions) {
      const key = isYearly ? "yearly" : "monthly";
      const billing = product.billingOptions[key];

      if (!billing) {
        return [];
      }

      return {
        ...product,
        ...billing,
        slug: `${product.slug}-${key}`,
      };
    }

    if (
      product.recurringInterval === "one-time" ||
      !(product.billingOptions || product.recurringInterval)
    ) {
      return product;
    }

    return [];
  });
}

export function getSortedProducts(
  products: ProductMetadata[],
  isYearly: boolean,
) {
  const productsArray = getProductsArray(products, isYearly);

  const productsWithPrices = productsArray.map((product) => ({
    product,
    price: getBillingDetails(product, isYearly).price,
  }));

  return productsWithPrices
    .sort((a, b) => {
      if (typeof a.price === "string" || typeof b.price === "string") {
        return 0;
      }

      return a.price - b.price;
    })
    .map(({ product }) => product);
}

export function getPriceDisplay(
  price: number | string,
  interval: RecurringInterval,
) {
  let displayPrice: string;
  let intervalText: string;

  if (typeof price === "string") {
    displayPrice = price;
    intervalText = "";
  } else if (interval === "year") {
    displayPrice = `$${(price / 12).toFixed(2)}`;
    intervalText = "/month";
  } else if (interval === "month") {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "/month";
  } else if (interval === "one-time") {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "one-time";
  } else {
    displayPrice = `$${price.toFixed(2)}`;
    intervalText = "";
  }

  return { displayPrice, intervalText };
}
