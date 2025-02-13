export const tokensList = [
	{
		name: "USDt",
		poolAddress: "0xac00e90cdadec06d81e0d5ce7a3e93d63d563e982dea0ca15bad2b067f42d2be",
		decimals: 6,
		tokenAddress: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
	},
	{
		name: "zUSDT",
		poolAddress: "0x447b3b516546f28e8c4f6825a6287b09161659e7c500c599c29c28a8492844b8",
		decimals: 6,
		tokenAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
	},
	{
		name: "zUSDC",
		poolAddress: "0xa9c51ca3bcd93978d0c4aada7c4cf47c0791caced3cdc4e15f2c8e0797d1f93c",
		decimals: 6,
		tokenAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
	},
	{
		name: "APT",
		poolAddress: "0x761a97787fa8b3ae0cef91ebc2d96e56cc539df5bc88dadabee98ae00363a831",
		decimals: 8,
		tokenAddress: "0x1::aptos_coin::AptosCoin",
	},
	{
		name: "sthAPT",
		poolAddress: "0xed6bf9fe7e3f42c6831ffac91824a545c4b8bfcb40a59b3f4ccfe203cafb7f42",
		decimals: 8,
		tokenAddress: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::StakedThalaAPT",
	},
	{
		name: "MOD",
		poolAddress: "0xef2ae89796725d0eb363326ecb7df159feb949f6d1f400f76deeeebccbac00f1",
		decimals: 8,
		tokenAddress: "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
	},
	{
		name: "THL",
		poolAddress: "0x127ea5b4c450be695e488da1c3bc013e2e93d8cf00270ef90385189844bc9755",
		decimals: 8,
		tokenAddress: "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL",
	},
	{
		name: "wUSDC",
		poolAddress: "0xa76ebfb432982c864783fdb33cdf5a9edb18ac1b950deb8037f5cf8c984da3d2",
		decimals: 6,
		tokenAddress: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
	},
	{
		name: "zWETH",
		poolAddress: "0x548cf587bd918a0005b3372a1d23e64b18ace3c61962f087a21eac52cf228504",
		decimals: 6,
		tokenAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH",
	},
	{
		name: "wWETH",
		poolAddress: "0x114ee519ffa1e8697784bd1a350822cb37601a1476289051b8295165597a4538",
		decimals: 6,
		tokenAddress: "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T",
	},
	{
		name: "CAKE",
		poolAddress: "0x41b039e5518b1a3786ee798d895e0ddf3141fbbc20009284323fa51ea279c819",
		decimals: 8,
		tokenAddress: "0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT",
	},
	{
		name: "stAPT",
		poolAddress: "0xc3c9cc885a52004e0490f6a8291b3bc5854f0e42d931fb124736bd189c9f0f45",
		decimals: 8,
		tokenAddress: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt",
	},
	{
		name: "aBTC",
		poolAddress: "0xacb7262b33a147b47b950a3a26d7699e1a58bcaa475ef636cb0fea53fa0eb872",
		decimals: 10,
		tokenAddress: "0x4e1854f6d332c9525e258fb6e66f84b6af8aba687bbcb832a24768c4e175feec::abtc::ABTC",
	},
	{
		name: "STONE",
		poolAddress: "0x075c39f18c7bc00ac0f81a0f9ab7e319e23790d7d8c3df968d84a23699584bd9",
		decimals: 8,
		tokenAddress:
			"0x543c5660aa4d496687e2068c11765f04607c4f4b639a83233a9333604fb8ce59::stakestone_ether::StakeStoneEther",
	},
	{
		name: "truAPT",
		poolAddress: "0x7bd5be03df0fb3841fed337b8e7a353818b917cce6db28b807b691002a122d73",
		decimals: 8,
		tokenAddress: "0xaef6a8c3182e076db72d64324617114cacf9a52f28325edc10b483f7f05da0e7",
	},
	{
		name: "sBTC",
		poolAddress: "0x754114c656e26498a8c0b20fa24af663fed5e4b24acb471c103daea0f7006b40",
		decimals: 8,
		tokenAddress:
			"0x5dee1d4b13fae338a1e1780f9ad2709a010e824388efd169171a26e3ea9029bb::stakestone_bitcoin::StakeStoneBitcoin",
	},
]

export const getTokenByTokenName = (name: string) => {
	const token = tokensList.find(
		(token) => token.name.toLowerCase() === name.toLowerCase() || token.name.toLowerCase().includes(name.toLowerCase())
	)

	return token
}

export const getTokenByTokenAddress = (address: string) => {
	const token = tokensList.find((token) => token.tokenAddress.toLowerCase() === address.toLowerCase())

	return token
}
