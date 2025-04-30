import { Tool } from "langchain/tools"
import { type AgentRuntime, parseJson } from "../.."
import { AGENT_CLIENT_MODE } from "../../constants"

export class PanoraListTool extends Tool {
	name = "panora_aggregator_list"
	description = `this tool can be used to check which tokens are listed, token price, and details in panora - liquidity aggregator on aptos

  if you want to know the APT listed details, the token address needs to be "0x1::aptos_coin::AptosCoin"
  If user prompt doesn't specify if USDT is layerzero, the token address needs to be "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"
  If user prompt doesn't specify if USDC is layerzero, the token address needs to be "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
  If user prompt specifies the token name, a tokenAddress need to be added according to the below mapping.
  
  Popular tokens which are include to get the listed details:
  - APT: "0x1::aptos_coin::AptosCoin"
  - CASH: "0x61ed8b048636516b4eaf4c74250fa4f9440d9c3e163d96aeb863fe658a4bdc67::CASH::CASH"
  - USDT: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b"
  - USDC: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b"
  - MKL: "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::mkl_token::MKL"
  - LSD: "0x53a30a6e5936c0a4c5140daed34de39d17ca7fcae08f947c02e979cef98a3719::coin::LSD"
  - THL: "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL"
  - CELL: "0x2ebb2ccac5e027a87fa0e2e5f656a3a4238d6a48d93ec9b610d570fc0aa0df12"
  - VIBE: "0xeedba439a4ab8987a995cf5cfefebd713000b3365718a29dfbc36bc214445fb8"
  - GUI: "0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002"
  - TOMA: "0x9d0595765a31f8d56e1d2aafc4d6c76f195435696d30dc3f43781d1e6d91e09::asset::TOMA"
  - AMA: "0xd0ab8c2f76cd640455db56ca758a9766a966c88f77920347aac1719edab1df5e"
  - DooDoo: "0x73eb84966be67e4697fc5ae75173ca6c35089e802650f75422ab49a8729704ec::coin::DooDoo"
  - LOON: "0x268d4a7a2ad93274edf6116f9f20ad8455223a7ab5fc73154f687e7dbc3e3ec6::LOON::LOON"
  - USDe: "0xf37a8864fe737eb8ec2c2931047047cbaed1beed3fb0e5b7c5526dafd3b9c2e9"
  - amAPT: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::amapt_token::AmnisApt"
  - stAPT: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt"
  - thAPT: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::ThalaAPT"
  - sthAPT: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::StakedThalaAPT"
  - MOD: "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD"
  - lzUSDC: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC"
  - lzUSDT: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT"
  - lzWETH: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH"
  - whUSDC: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T"
  - aBTC: "0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec::abtc::ABTC"
  - UPTOS: "0x4fbed3f8a3fd8a11081c8b6392152a8b0cb14d70d0414586f0c9b858fcd2d6a7::UPTOS::UPTOS"
  - CHEWY: "0xc26a8eda1c3ab69a157815183ddda88c89d6758ee491dd1647a70af2907ce074::coin::Chewy"
  - MOOMOO: "0xc5fbbcc4637aeebb4e732767abee8a21f2b0776f73b73e16ce13e7d31d6700da::MOOMOO::MOOMOO"
  - EDOG: "0x5e975e7f36f2658d4cf146142899c659464a3e0d90f0f4d5f8b2447173c06ef6::EDOG::EDOG"
  - O: "0x8ea59d57259d0312fa21e0cb9099d359462d9e0050c9139960ff9a2313ce1c9d::coin::T"
  - OBOT: "0x8512b34017e087c3707748869ddc317d83f3fe70ab3a162abdc055c761ca9906::OBOT::OBOT"
  - MGPT: "0x63be1898a424616367e19bbd881f456a78470e123e2770b5b5dcdceb61279c54::movegpt_token::MovegptCoin"
  - DONK: "0xe88ae9670071da40a9a6b1d97aab8f6f1898fdc3b8f1c1038b492dfad738448b::coin::Donk"
  - HAIR: "0x96baeee6d7a4a8cd712144d1225cfcb6c26d0c6fefd463bd77a878e4526c7411::hair_coin::HairCoin"
  - ZIPO: "0x2d4de7378c573dadc2e589892d709ee24f3c26f23b57804f384f4803da2e6f0a::ZIPO::ZIPO"
  - CAKE: "0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT"
  - TruAPT: "0xaef6a8c3182e076db72d64324617114cacf9a52f28325edc10b483f7f05da0e7"
  - BAPTMAN: "0xe9c6ae7a056ba49901fcc19ab3fcff0938f882cfd7f2cc5a72eea362d29f5b8f"
  - lzWBTC: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WBTC"
  - MOVE: "0x27fafcc4e39daac97556af8a803dbb52bcb03f0821898dc845ac54225b9793eb::move_coin::MoveCoin"
  - MOVEPUMP: "0xe234f0e7c05165cc48f5407c3eb542709a8284fb6b9d66068413a2e13ef423bd::MOVEPUMP::MOVEPUMP"
  - whUSDT: "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T"
  - APE: "0xada35ada7e43e2ee1c39633ffccec38b76ce702b4efc2e60b50f63fbe4f710d8::apetos_token::ApetosCoin"
  - BUBBLES: "0xd6a49762f6e4f7401ee79be6f5d4111e70db1408966ba1aa204e6e10c9d437ca::bubbles::BubblesCoin"
  - whWBTC: "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T"
  - ZAAP: "0xdcfa079344261bfde45e7f6281df091743b8d3098bf9e26e1c0212fc5b070621::zaaptos_token::ZaaptosCoin"

  Examples:
  - "Show all tokens listed on Panora"
  - "I want to know if HAIR is listed on Panora"
  - "Show me all the tokens verified by Panora"
  - "Show me all banned tokens on Panora"

  Inputs ( input is a JSON string ):
  tokeAddress: string, eg "0x1::aptos_coin::AptosCoin" or "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT" (required only for token details and token price but not request list)
  panoraUI: boolean,  If set to true, only tokens that are visible on the Panora UI are returned. Set as false to get all tokens in the list. Default is true. (optional)
  panoraTags: string, Possible tags "Native", "Emojicoin", "Meme", "Verified", "Recognized", "Unverified", "Banned", "InternalFA", "Tokens" (optional). eg "Meme" (optional)
  `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string) {
		try {
			const parsedInput = parseJson(input)

			if (AGENT_CLIENT_MODE) {
				return {
					name: this.name,
					args: Object.values(parsedInput)?.length ? Object.values(parsedInput) : [input],
					onchain: true,
				}
			}

			const listData = await this.agent.listWithPanora(
				parsedInput.tokenAddress,
				parsedInput.panoraUI,
				parsedInput.panoraTags
			)

			return JSON.stringify({
				status: "success",
				listData,
			})
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			})
		}
	}
}
