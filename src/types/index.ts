import type { AccountAuthenticator } from "@aptos-labs/ts-sdk"

// Twitter tool response types
export interface TwitterResponse {
	success: boolean
	error?: string
	message?: string
}

export interface TwitterPostResponse extends TwitterResponse {
	result?: {
		text: string
		id: string
		username?: string
		timestamp?: number
	}
}

export interface TwitterSearchResponse extends TwitterResponse {
	posts?: Array<{
		text: string
		username: string
		timestamp: number | string
	}>
}

export interface TwitterUserResponse extends TwitterResponse {
	profile?: {
		name: string
		followers: number
		posts: number
	}
}

export type ToolsNameList =
	| "aptos_balance"
	| "aptos_get_wallet_address"
	| "aptos_transfer_token"
	| "aptos_burn_token"
	| "aptos_get_transaction"
	| "aptos_token_details"
	| "aptos_mint_token"
	| "aptos_create_token"
	| "amnis_stake"
	| "amnis_withdraw_stake"
	| "joule_lend_token"
	| "joule_withdraw_token"
	| "joule_borrow_token"
	| "joule_repay_token"
	| "joule_get_pool_details"
	| "joule_get_user_position"
	| "joule_get_user_all_positions"
	| "liquidswap_add_liquidity"
	| "liquidswap_create_pool"
	| "liquidswap_remove_liquidity"
	| "liquidswap_swap"
	| "aries_create_profile"
	| "aries_withdraw"
	| "aries_borrow"
	| "aries_lend"
	| "aries_repay"
	| "thala_add_liquidity"
	| "thala_remove_liquidity"
	| "thala_mint_mod"
	| "thala_redeem_mod"
	| "thala_unstake_token"
	| "thala_stake_token"
	| "panora_aggregator_swap"
	| "openai_create_image"
	| "echo_stake_token"
	| "echo_unstake_token"
	| "echelon_lend_token"
	| "echelon_withdraw_token"
	| "echelon_borrow_token"
	| "echelon_repay_token"
	| "merkle_trade_place_market_order"
	| "merkle_trade_place_limit_order"
	| "merkle_trade_close_position"
	| "merkle_trade_get_position"
	| "twitter_post"
	| "twitter_like"
	| "twitter_retweet"
	| "twitter_search"
	| "twitter_get_user"

export type SignedTransactionResponse = {
	senderAuthenticator?: AccountAuthenticator
	signature?: Uint8Array<ArrayBufferLike>
}
