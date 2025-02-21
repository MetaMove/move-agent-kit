// src/signers/base-signer.ts

import type { Account, AccountAddress, AccountAuthenticator, AnyRawTransaction, Aptos } from "@aptos-labs/ts-sdk"
import type {
	AptosSignMessageInput,
	AptosSignMessageOutput,
	InputTransactionData,
} from "@aptos-labs/wallet-adapter-react"

export abstract class BaseSigner {
	protected constructor(
		protected readonly account: Account,
		protected readonly aptos: Aptos
	) {}

	public getAddress(): AccountAddress {
		return this.account.accountAddress
	}

	//  abstract getAccount(): Account;
	abstract signTransaction(transaction: AnyRawTransaction): Promise<AccountAuthenticator>
	abstract sendTransaction(transaction: InputTransactionData | AnyRawTransaction): Promise<string>
	abstract signMessage(message: AptosSignMessageInput | string): Promise<AptosSignMessageOutput | string>
}
