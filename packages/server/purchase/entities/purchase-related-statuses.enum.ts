export enum PaymentMethods {
  nda = "nda"
}

export enum OrderStatus {
  stillOrdering,
  waitForPayment,
  paymentRejected,
  paid,
  canceled,
  canceledBySupport,
  returned,
  done,
  partial,
}

export enum OrderProductStatus {
  waitForSupplier,
  canceled,
  canceledBySupport,
  returned,
  done,
  partial,
}

export enum OrderProductSupplierStatus {
  waitForSupplier,
  errorOnRequest,
  canceled,
  canceledBySupport,
  partial,
  done,
}

export enum SupplierStatuses {
  canceled = "Canceled",
  pending = "Pending",
  inProgress = "In progress",
  partial = "Partial",
  completed = "Completed",
}
