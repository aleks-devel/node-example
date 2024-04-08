import { SocialProduct } from "@server/admin/social/products/entities/social-product.entity";
import { round } from "@server/common/utils/math-utils";

export function findDIff<O>(obj1: O, obj2: O): Partial<O> | undefined {
  const res: Record<string, any> = {};
  let isDiff = false;

  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      res[key] = obj2[key];
      isDiff = true;
    }
  }

  if (isDiff) {
    return res as Partial<O>;
  } else {
    return undefined;
  }
}

export function getPaymentData(
  quantity: number,
  product: SocialProduct,
  statusId: number | undefined,
): PaymentData {
  const total = quantity * product.getPrice();

  const { valueId, discount } = product.getDiscount(quantity);
  const totalDiscount = round(total * discount, 2);

  const statusDiscount = statusId ? product.getStatusDiscount(statusId) : 0;
  const totalStatusDiscount = round(total * statusDiscount, 2);

  return {
    quantity,
    discount: totalDiscount,
    discountMatrixId: valueId,
    statusDiscount: totalStatusDiscount,
    netPrice: round(total - totalDiscount - totalStatusDiscount, 2),
  };
}

export type PaymentData = {
  quantity: number;
  discount: number;
  discountMatrixId: number | null;
  statusDiscount: number;
  netPrice: number;
};
