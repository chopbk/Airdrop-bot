const keyWallet = "👛 Wallet";
const keyRules = "📌 Rules";
const check = "🔄 Check";
const refresh = "🔄 Refresh";
const answerButton = "✔️ Answer";
const keyAirdrop = "💰 Airdrop";
const keyInfo = "🟢 Your Info";
const keyHelp = "📨 Contact";
const keyStart = "🎯 Start";
const keyAirdropInfo = "📣 Airdrop Info";
module.exports = {
    welcome: `Welcome to *Creator’s chain Reward Bot*!
    \n*About Creator’s chain*
    \n*Creator’s chain* is based on the Polkadot/Substrate which provides true interoperability,user-driven network governance and customizations that focus on Defi and Smart contracts.
        \n👇Click Button bellow to get Airdrop and Creator Infos`,
    step1: "1. Follow Chanel Creator Announcement",
    step2: "2. Join Group Creator Official [ENG]",
    step3: "3. Follow Creator Twitter",
    step4: "4. Retweet, Like Creator Twitter post",
    enterUser: `5. Click here to enter your twitter account before ${check}`,
    check,
    refresh,
    keyAirdrop,
    keyInfo,
    keyHelp,
    keyStart,
    keyWallet,
    keyRules,
    keyAirdropInfo,
    answerButton,
    wrongCaptcha: (tryTime) =>
        `Wrong anser, please enter the answer again!\n⚠️ Your have try ${tryTime}/5`,
    captcha: (first, second) => `Welcome to *Creator’s chain Reward Bot*!
    \n*About Creator’s chain*
    \n*Creator’s chain* is based on the Polkadot/Substrate which provides true interoperability,user-driven network governance and customizations that focus on Defi and Smart contracts.
        \n➡️ Before we start the airdrop, please prove you are human by answering the question below
        *Please answer ${first} + ${second} = * \n\n👇 *Click Answer button bellow*`,
    answer: `✅ Okey. Now enter the answer!`,
    banned: `\n⚠️ Your have banned by our policy. Please contact admin for help`,
    desHelp: (info) => `All contact information:
\nWebsite: ${info.website}
\nTwitter: ${info.twitter}
\Medium: ${info.medium}
\nTelegram Channel: ${info.telegram_channel}
Chat with us: ${info.telegram_group}`,
    startStep: `📢Our Airdrop rules
    \n👇 Please complete the following tasks, click on *${check}* to check progress
    \n⚠️ We will mannually check the participants, mandatory task must be completed. Unfinished will not get any tokens`,
    validTwiiter:
        "Invalid twitter account please submit your twitter username with @:",
    duplicateTw:
        "Twitter account is already in use. Please enter another account!",
    accTwOk: (acc) => {
        return `*${acc} ✅* \n\nYou have successfully bind your twitter account with CTR Reward Bot.
Press 👇 *${check}* to check completed tasks.`;
    },
    validWallet: "Invalid wallet address, please try again:",
    walletOk: (address) => {
        return `*${address} ✅* \n\nYou have successfully bind your wallet address.
You can check again by click keyboard *${keyWallet}*.
See more information or need help, click keyboard *${keyRules}*.`;
    },
    done: (id) => {
        return `🎉 Congratulations for completing all the tasks.
\n📢 Airdrop rewards will be distributed in June 30th. 1000 Luckly participants will be rewards
\n💵 Set your wallet address to receive rewards at *${keyWallet}*.
\n👏 You can earn 2 Creator tokens for each refferral by inviting other users up to 50 referrals.
\n🔗 Your referral link：https://t.me/test\\_creator\\_chain\\_airdrop\\_bot?start=${id}
\n⚠️ We will mannually check the participants, mandatory task must be completed. Unfinished will not get any tokens
        `;
    },
    enterTw:
        "If you are done step 3, enter twitter username so we can check it out.\nSend you twitter account starting with @:",
    editTw: "You have been bind your twitter account. \nIf your want to change twitter username, send you twitter account starting with @:",
    addressWl: (address) => {
        return `Your wallet ERC-20 address: *${address}*`;
    },
    textWl: (info) => {
        if (!info.wallet_address)
            return `❌(Not found, click *${keyWallet}* to set your wallet)`;
        return `*${info.wallet_address}*`;
    },
    infoButton: (info, taskPoint, refAccounts, textWl) => {
        let refPoint = refAccounts.length;
        let nameAccounts = "";
        refAccounts.forEach(
            (account) => (nameAccounts += `@${account.username_telegram} `)
        );
        return `Hello ${info.first_name} ${info.last_name}
\n💵 ERC-20 Address = ${textWl}
✉️ Twitter = *${info.username_twitter}*
🤝 Your Referral = ${refPoint} ${nameAccounts} 
Referral link = https://t.me/test\\_creator\\_chain\\_airdrop\\_bot?start=${info.id_telegram}
ℹ️ For each person you invite and he/she completed tasks, you will get 2 Creator token.`;
    },
    sendAddress: `*⚠️ Please enter it correctly as you are only allowed to enter once.
\n👛 Send your ERC-20 address:*`,
    twNotFollow: "You haven't followed page twitter",
    twNotReTweet: "You haven't retweet post twitter",
    twNotLike: "You haven't like post twitter",
    twNotUser: "You must enter username twitter",
    teleNotFollow: "You haven't follow chanel telegram",
    teleNotJoin: "You haven't join group telegram",
    notFoundTw: "Not found user twitter, please try again.",
    EVENT_ANSWER_VERIFY: "answer_verify",
    EVENT_CHECK_MISSION: "check_mission",
    EVENT_REFRESH_ACCOUNT_INFO: "refresh_account_info",
    EVENT_USERNAME: "username_twitter",
    EVENT_AIRDROP: "airdrop",
};
