import { registerEnumType } from "@nestjs/graphql";
import { OrderInput } from "@server/admin/common/models/order.input";
import { ProductType } from "@server/admin/social/products/entities/product-type.enum";
import { ChangeAccess } from "@server/admin/common/change-access.enum";
import { HistoryFields } from "@server/admin/suppliers/services/history/models/service-short-history.model";
import { Social } from "@server/db/types/social.enum";
import { TypeToCheck } from "@server/db/types/type-to-check.enum";
import { ProductSuppliersState } from "@server/admin/social/products-suppliers/entities/product-suppliers-state.enum";
import { Difference } from "@server/common/utils/utils";

import { PackageProductType } from "@server/admin/social/models/package-product-type.enum";
import { EditorDataType } from "@server/main-site/editor/entities/editor-data-type.enum";
import { OperationType } from "@server/user/operations/entities/operation-type.enum";

registerEnumType(OrderInput, {
  name: "OrderInput",
});

registerEnumType(ProductType, {
  name: "ProductType",
});

registerEnumType(ChangeAccess, {
  name: "ChangeAccess",
});

registerEnumType(HistoryFields, {
  name: "HistoryFields",
});

registerEnumType(Social, {
  name: "Social",
});

registerEnumType(TypeToCheck, {
  name: "TypeToCheck",
});

registerEnumType(ProductSuppliersState, {
  name: "ProductSuppliersState",
});

registerEnumType(Difference, {
  name: "Difference",
});

registerEnumType(PackageProductType, {
  name: "PackageProductType",
});

registerEnumType(EditorDataType, {
  name: "EditorDataType",
});

registerEnumType(OperationType, {
  name: "OperationType",
});
