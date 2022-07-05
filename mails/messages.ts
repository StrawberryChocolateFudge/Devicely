export function disputeResolverEmail(
  orderId: string,
  escrowNr: string,
  escrowState: string,
  shippingStatus: string,
  seller_address: string,
  seller_id: number,
  seller_name: string,
  seller_email: string,
  buyer_address: string,
  buyer_id: string,
  buyer_name: string,
  buyer_email: string
) {
  return `A dispute has been requested for order: ${orderId}, escrow: ${escrowNr}\n
  escrowStatus: ${escrowState} \n
  shippingStatus: ${shippingStatus} \n
  seller_address: ${seller_address} \n
  seller_id: ${seller_id} \n
  seller_name: ${seller_name} \n
  seller_email: ${seller_email} \n
  buyer_address: ${buyer_address} \n
  buyer_id: ${buyer_id} \n
  buyer_name: ${buyer_name} \n
  buyer_email: ${buyer_email} \n
	`;
}

export function disputeRequested(orderId: string, escrowNr: string) {
  return `A dispute has been requested for order: ${orderId}, escrow :${escrowNr}. The support will be in touch with you, shortly.`;
}

export function escrowStateChange(
  orderId: string,
  escrowNr: string,
  escrowState: string
) {
  switch (escrowState) {
    case "Awaiting Payment":
      return `Order : ${orderId}, Escrow ${escrowNr} is ${escrowState}`;
    case "Awaiting Delivery":
      return `Order : ${orderId}, Escrow ${escrowNr} is ${escrowState}`;
    case "Delivered":
      return `Order : ${orderId}, Escrow ${escrowNr} has been marked Delivered`;
    case "Refunded":
      return `Order : ${orderId}, Escrow ${escrowNr} has been Refuned`;
    default:
      break;
  }
}

export function orderStateChange(orderId: string, orderState: string) {
  return `Your Order: ${orderId} has been  marked ${orderState}`;
}
