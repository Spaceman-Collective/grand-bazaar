import { randomBytes } from 'crypto'

export const randomU64 = (): bigint => {
    return BigInt(`0x${randomBytes(8).toString("hex")}`);
}