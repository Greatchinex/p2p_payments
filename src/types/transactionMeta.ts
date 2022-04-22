type fundingMeta = {
  charges: number
  authorization: any
  customer: any
}

type p2pMeta = {
  charges: number
  sender_wallet: string
  receiver_wallet: string
}

export { fundingMeta, p2pMeta }
