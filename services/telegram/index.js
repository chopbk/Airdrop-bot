const listText = require("../utils/list-text");
const logger = require("../utils/logger");
const { checkTwitter, getIdByUsername } = require("../utils/twitter");
//1932545436:AAG9ee17RzDtKM6_E3u4WzHOTA7On5O2QVI
const TelegramBot = require("node-telegram-bot-api");
const {
    getAccountInfo,
    getIDTwitter,
    createMember,
    updateAccountInfo,
    getStepInputCurrent,
    checkUniqueTwitter,
    getWalletAddress,
    getInfoRef,
    findOrCreate,
    getContactInfo,
    getAllAccountInfo,
    isDone,
    STEP_USERNAME,
    STEP_WALLET,
    STEP_NONE,
    STEP_VERIFY,
    STEP_RETWEET,
} = require("../database/model");

const excludedText = [
    listText.keyRules,
    listText.keyInfo,
    listText.keyWallet,
    listText.keyHelp,
    listText.keyAirdrop,
    listText.keyStart,
    listText.keyAirdropInfo,
    "/start",
    "/airdrop",
    "/admin",
];
const keyboards = require("../utils/keyboard");
class TeleBot {
    constructor() {}
    init = async () => {
        const token = process.env.TOKEN;
        this.bot = new TelegramBot(token, { polling: true });
        let env = process.env.NODE_ENV || "product";
        this.contactInfo = await getContactInfo(env);
        logger.debug(this.contactInfo);
        let me = await this.bot.getMe();
        this.botUsername = me.username;
        this.botFirstName = me.first_name || "";
        this.botLastName = me.last_name || "";
    };
    run = () => {
        // validate enter text username and wallet
        this.bot.onText(/\.*/, this.handleText);
        this.bot.onText(/\/start/, this.handleAirdrop);
        this.bot.onText(/\/airdrop/, this.handleAirdrop);
        // =============== list event keyboard
        this.bot.onText(new RegExp(listText.keyStart), this.handleAirdrop);
        this.bot.onText(new RegExp(listText.keyAirdrop), this.handleAirdrop);
        this.bot.onText(
            new RegExp(listText.keyAirdropInfo),
            this.handleAirdropInfo
        );
        this.bot.onText(
            new RegExp(listText.keyInfo),
            this.handleAccountInfoButton
        );
        this.bot.onText(new RegExp(listText.keyHelp), this.handleHelpContact);
        // this.bot.onText(
        //     new RegExp(listText.keyWallet),
        //     this.handleButtonWallet
        // );
        this.bot.on("polling_error", (error) => logger.error(error.message));
        this.bot.on("callback_query", this.handleCallBackQuerry);
        this.bot.onText(new RegExp("/clear"), this.handleClearCommand);
        this.bot.onText(/\/getFile/, this.handleGetFile);
    };
    checkVerified = async (account, msg) => {
        let res = false;
        if (account.step_input != STEP_NONE) {
            await updateAccountInfo(msg.from.id, { step_input: STEP_NONE });
        }
        switch (account.verify.status) {
            case "new":
                //let go to kyc with captcha
                let { first, second } = account.createCaptcha();
                this.bot.sendMessage(
                    msg.chat.id,
                    listText.captcha(first, second),
                    keyboards.answer
                );
                break;
            case "banned":
                this.bot.sendMessage(msg.chat.id, listText.banned);
                // send message banner
                break;
            case "verified":
                res = true;
                break;
        }
        return res;
    };
    checkAnswerVerified = async (account, msg) => {
        let answer = parseFloat(msg.text);
        let res = false;
        if (account.verify.try_time >= 5) {
            logger.debug(`[checkAnswerVerified] Banned`);
            account.verify.status = "banned";
            this.bot.sendMessage(msg.chat.id, listText.banned);
        } else if (account.verify.captcha !== answer) {
            logger.debug(`[checkAnswerVerified] Wrong answer`);
            account.verify.try_time++;
            this.bot.sendMessage(
                msg.chat.id,
                listText.wrongCaptcha(account.verify.try_time)
            );
        } else {
            logger.debug(`[checkAnswerVerified] Correct Answer`);
            res = true;
            account.verify.status = "verified";
            account.step_input = 0;
        }
        await updateAccountInfo(msg.from.id, { step_input: STEP_NONE });
        await account.save();
        return res;
    };
    checkAccountInfo = async (msg) => {
        if (msg.from.is_bot) {
            return false;
        }
        let ref = msg.text.replace("/start", "").trim();
        if (isNaN(ref)) ref = null;
        // find account exist on Database
        let account = await getAccountInfo(msg.from.id);
        if (!account)
            account = await createMember({
                ...msg.from,
                ref: ref,
                captcha: "",
            });
        let isVerified = await this.checkVerified(account, msg);
        if (!isVerified) return false;

        // if (account.is_done === true) {
        //     logger.debug(`[checkAccountInfo] ${listText.done(msg.from.id)}`);
        //     await this.bot.sendMessage(
        //         msg.chat.id,
        //         listText.done(msg.from.id),
        //         keyboards.done
        //     );
        //     return false;
        // }
        return account;
    };
    isAccountDone = async (account, msg) => {
        if (account.is_done === true) {
            logger.debug(
                `[isAccountDone] ${listText.done(
                    msg.from.id,
                    this.botUsername
                )}`
            );

            await this.bot.sendMessage(
                msg.chat.id,
                listText.done(msg.from.id, this.botUsername),
                keyboards.done
            );
            return true;
        }
        return false;
    };
    handleAirdrop = async (msg) => {
        if (!msg.from.username) {
            await this.bot.sendMessage(
                msg.chat.id,
                listText.addUsername,
                keyboards.first
            );
            return;
        }
        let res = await this.checkAccountInfo(msg);
        if (!res) return;
        // build message for airdrop
        const { button } = await this.buildButtonStep(msg.from.id);
        logger.debug(`[handleAirdrop] button`);
        await this.bot.sendMessage(msg.chat.id, listText.startStep, button);
        // await this.isAccountDone(res, msg);
    };
    handleStart = async (msg) => {
        let res = await this.checkAccountInfo(msg);
        logger.debug(`[handleStart] ${res}`);
        if (!res) return;
        let keyboard = res.is_done ? keyboards.done : keyboards.first;
        logger.debug(keyboard);
        return this.bot.sendMessage(msg.chat.id, listText.welcome, keyboard);
    };
    handleAirdropInfo = async (msg) => {
        let res = await this.checkAccountInfo(msg);
        if (res) {
            await this.isAccountDone(res, msg);
        }
    };
    handleAccountInfoButton = async (msg) => {
        logger.debug(`handleAccountInfoButton ${msg.text}`);
        const info = await this.checkAccountInfo(msg);
        if (!info) return;
        if (info.step_input != STEP_NONE) {
            await updateAccountInfo(msg.from.id, { step_input: STEP_NONE });
        }
        return this.responseAccountInfo(info, msg);
    };
    handleButtonWallet = async (msg) => {
        logger.debug(`handleButtonWallet ${msg.text}`);
        const info = await this.checkAccountInfo(msg);
        if (!info) return;
        const wallet = await getWalletAddress(msg.from.id);
        if (!wallet) {
            await this.bot.sendMessage(msg.chat.id, listText.sendAddress, {
                parse_mode: "Markdown",
            });
            await updateAccountInfo(msg.from.id, { step_input: STEP_WALLET });
            return;
        }
        await this.bot.sendMessage(
            msg.chat.id,
            listText.addressWl(wallet),
            keyboards.done
        );
        await updateAccountInfo(msg.from.id, { step_input: STEP_NONE });
    };
    handleHelpContact = async (msg) => {
        const info = await findOrCreate(msg);
        if (!info) return;
        if (info.is_done === true) {
            return this.bot.sendMessage(
                msg.chat.id,
                listText.desHelp(this.contactInfo),
                keyboards.done
            );
        }
        if (info.step_input != STEP_NONE) {
            await updateAccountInfo(msg.from.id, { step_input: STEP_NONE });
        }
        return this.bot.sendMessage(
            msg.chat.id,
            listText.desHelp(this.contactInfo),
            keyboards.first
        );
    };

    handleClearCommand = async (msg) => {
        this.bot.sendMessage(msg.chat.id, "done", {
            reply_markup: {
                remove_keyboard: true,
            },
            parse_mode: "Markdown",
        });
    };
    handleText = async (msg) => {
        try {
            logger.debug(`handleText ${msg.text}`);
            const step = await getStepInputCurrent(msg.from.id);
            logger.debug(`step ${step}`);
            if (step === STEP_NONE || step === false) {
                if (!excludedText.includes(msg.text))
                    this.bot.deleteMessage(msg.chat.id, msg.message_id);
                return; //return handleStart(msg);
            }
            if (step === STEP_VERIFY) {
                // find user in db
                const account = await getAccountInfo(msg.from.id);
                let res = await this.checkAnswerVerified(account, msg);
                if (res) {
                    await this.bot.sendMessage(
                        msg.chat.id,
                        listText.welcome,
                        keyboards.first
                    );
                }
                return;
                // check verified
                // handle start
            }
            if (step === STEP_USERNAME) {
                let re = new RegExp(`^@[A-Za-z0-9_]{1,15}$`);
                let isTwitterValid = re.test(msg.text);
                if (!isTwitterValid) {
                    logger.debug(`[checkValidTwitter]: ${isTwitterValid}`);
                    return this.bot.sendMessage(
                        msg.chat.id,
                        listText.invalidTwiiter
                    );
                }
                let idTw = msg.text.substr(1);
                //idTw = await getIdByUsername(msg.text.substr(1));
                if (!idTw)
                    return bot.sendMessage(msg.chat.id, listText.notFoundTw);
                const isDuplicate = await checkUniqueTwitter(msg.text);
                logger.debug(
                    `[checkUniqueTwitter]: isDuplicate ${isDuplicate}`
                );
                if (isDuplicate)
                    return this.bot.sendMessage(
                        msg.chat.id,
                        listText.duplicateTw
                    );

                await this.bot.sendMessage(
                    msg.chat.id,
                    listText.accTwOk(msg.text),
                    keyboards.first
                );
                await updateAccountInfo(msg.from.id, {
                    step_input: STEP_NONE,
                    username_twitter: msg.text,
                    id_twitter: idTw,
                });
                return;
            }
            if (step === STEP_RETWEET) {
                // let re = new RegExp(
                //     "^https?://twitter.com/(?:#!/)?(w+)/status(?:es)?/(d+)(?:/.*)?$",
                //     "i"
                // );
                let re = new RegExp(
                    /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?$/,
                    "i"
                );

                let isRetweetLinkValid = re.test(msg.text.trim());
                if (!isRetweetLinkValid) {
                    logger.debug(`[checkValidTwitter]: ${isRetweetLinkValid}`);
                    return this.bot.sendMessage(
                        msg.chat.id,
                        listText.invalidRetweetLink
                    );
                }
                await this.bot.sendMessage(
                    msg.chat.id,
                    listText.linkRetweetOk(msg.text),
                    keyboards.first
                );
                await updateAccountInfo(msg.from.id, {
                    step_input: STEP_NONE,
                    retweet_link: msg.text,
                });
                return;
            }

            if (step === STEP_WALLET) {
                if (!/^(0x){1}[0-9a-fA-F]{40}$/i.test(msg.text)) {
                    return this.bot.sendMessage(
                        msg.chat.id,
                        listText.validWallet
                    );
                }
                await this.bot.sendMessage(
                    msg.chat.id,
                    listText.walletOk(msg.text),
                    keyboards.first
                );
                await updateAccountInfo(msg.from.id, {
                    step_input: STEP_NONE,
                    wallet_address: msg.text,
                });
                return;
            }
        } catch (error) {
            logger.error(error.message);
        }
    };
    handleCallBackQuerry = async (callbackQuery) => {
        try {
            const { id, message, data, from } = callbackQuery;
            logger.debug(`[callbackQuery]: id ${id} data ${data} from ${from}`);
            logger.debug(
                `[callbackQuery]: message ${JSON.stringify(
                    message.text
                )} from ${JSON.stringify(from)}`
            );
            const msg = {
                chat: { id: message.chat.id },
                message_id: message.message_id,
                from,
            };
            const account = await findOrCreate(msg);
            if (!account) return;
            if (data === listText.EVENT_REFRESH_ACCOUNT_INFO) {
                await this.responseAccountInfo(account, msg, id);
                return;
            }
            logger.debug(`[callbackQuery]: message ${account.is_done}`);
            if (account.is_done) {
                this.bot.answerCallbackQuery(id);
                return this.bot.sendMessage(
                    message.chat.id,
                    listText.done(from.id, this.botUsername),
                    keyboards.done
                );
                return;
            }
            if (data === listText.EVENT_AIRDROP) {
                return this.handleAirdrop();
            }
            if (data === listText.EVENT_CHECK_MISSION) {
                logger.debug(
                    `listText.EVENT_CHECK_MISSION ${listText.EVENT_CHECK_MISSION}`
                );
                const result = await this.checkStep(from.id, message);
                if (!result.status) {
                    return this.bot.answerCallbackQuery(id, {
                        text: result.message,
                    });
                }
                await updateAccountInfo(from.id, { is_done: 1 });
                return this.bot.sendMessage(
                    message.chat.id,
                    listText.done(from.id, this.botUsername),
                    keyboards.done
                );
            }
            if (data === listText.EVENT_USERNAME) {
                logger.debug(
                    `listText.EVENT_USERNAME ${listText.EVENT_USERNAME}`
                );
                let answer = listText.enterTw;
                if (!!account && !!account.username_twitter)
                    answer = listText.editTw;
                this.bot.sendMessage(message.chat.id, answer);
                await updateAccountInfo(from.id, { step_input: STEP_USERNAME });
                this.bot.answerCallbackQuery(id, {
                    text: "Enter Your Username Twitter",
                });
                return;
            }
            if (data === listText.EVENT_WALLET) {
                logger.debug(`listText.EVENT_WALLET ${listText.EVENT_WALLET}`);
                if (!!account && !!account.wallet_address) {
                    this.bot.answerCallbackQuery(id, {
                        text: "You have done this",
                    });
                    return;
                }
                this.bot.sendMessage(message.chat.id, listText.sendAddress, {
                    parse_mode: "Markdown",
                });
                await updateAccountInfo(from.id, { step_input: STEP_WALLET });
                this.bot.answerCallbackQuery(id, {
                    text: "Enter Your wallet address",
                });
                return;
            }
            if (data === listText.EVENT_RETWEET) {
                logger.debug(
                    `listText.EVENT_RETWEET ${listText.EVENT_RETWEET}`
                );
                if (!!account && !!account.retweet_link) {
                    this.bot.answerCallbackQuery(id, {
                        text: "You have done this",
                    });
                    return;
                }
                let answer = listText.enterReTwLink;
                this.bot.sendMessage(message.chat.id, answer);
                await updateAccountInfo(from.id, { step_input: STEP_RETWEET });
                this.bot.answerCallbackQuery(id, {
                    text: "Enter your retweet link",
                });
                return;
            }
            if (data === listText.EVENT_ANSWER_VERIFY) {
                logger.debug(
                    `listText.EVENT_ANSWER_VERIFY ${listText.EVENT_ANSWER_VERIFY}`
                );
                await updateAccountInfo(from.id, { step_input: STEP_VERIFY });
                this.bot.answerCallbackQuery(id, { text: listText.answer });
                return;
            }
        } catch (error) {
            logger.error(`[handleCallBackQuerry] ${error.message}`);
        }
    };
    checkFollowChanel = async (userId) => {
        try {
            const result = await this.bot.getChatMember(
                this.contactInfo.telegram_channel_id,
                userId
            );
            if (result.status !== "kicked" && result.status !== "left")
                return { status: true, message: "" };
            return { status: false, message: listText.teleNotFollow };
        } catch (error) {
            return { status: false, message: listText.teleNotFollow };
        }
    };
    checkJoinGr = async (userId) => {
        try {
            const result = await this.bot.getChatMember(
                this.contactInfo.telegram_group_id,
                userId
            );
            if (result.status !== "kicked" && result.status !== "left")
                return { status: true, message: "" };
            return { status: false, message: listText.teleNotJoin };
        } catch (error) {
            return { status: false, message: listText.teleNotJoin };
        }
    };

    checkBindWalletAddress = async (account = {}) => {
        const idTw = account.wallet_address;
        if (!idTw) return { status: false, message: listText.walletNotFound };
        return { status: true, message: "Done mission" };
    };
    checkBindTwitter = async (account = {}) => {
        const idTw = account.id_twitter;
        if (!idTw) return { status: false, message: listText.twNotUser };
        return { status: true, message: "Done mission" };
    };

    checkFollowTwitter = async (account = {}) => {
        const idTw = account.id_twitter;
        if (!idTw) return { status: false, message: listText.twNotUser };
        return { status: true, message: "Done mission" };
    };
    checkRetweetTwitterLink = async (account = {}) => {
        const idTw = account.retweet_link;
        if (!idTw) return { status: false, message: listText.twNotRetweetLink };
        return { status: true, message: "Done mission" };
        return checkTwitter(idTw);
    };
    checkStep = async (userId, msg) => {
        let res;
        try {
            let { button, result } = await this.buildButtonStep(userId);
            res = result;
            logger.debug(`[checkStep] ${result}`);
            await this.bot.editMessageReplyMarkup(button.reply_markup, {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
            });
        } catch (error) {
            logger.error(`[checkStep] ${error.message}`);
        } finally {
            return res;
        }
    };
    buildButtonStep = async (userId) => {
        let account = await getAccountInfo(userId);
        let listStepDone = {
            0: await this.checkFollowChanel(userId),
            1: await this.checkJoinGr(userId),
            2: await this.checkFollowTwitter(account),
            3: await this.checkBindTwitter(account),
            4: await this.checkRetweetTwitterLink(account),
            5: await this.checkRetweetTwitterLink(account),
            6: await this.checkBindWalletAddress(account),
        };
        logger.debug(`[buildButtonStep] `);
        // logger.debug(listStepDone);
        // if (listStepDone[0].status && listStepDone[1].status) {
        //     listStepDone[2] = await this.checkStepTwitter(userId);
        // }

        const tempStep = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: listText.step1,
                            url: this.contactInfo.telegram_channel,
                        },
                    ],
                    [
                        {
                            text: listText.step2,
                            url: this.contactInfo.telegram_group,
                        },
                    ],
                    [
                        {
                            text: listText.step3,
                            url: this.contactInfo.twitter,
                        },
                    ],
                    [
                        {
                            text: listText.enterUser,
                            callback_data: listText.EVENT_USERNAME,
                        },
                    ],
                    [
                        {
                            text: listText.step4,
                            url: this.contactInfo.twitter_tweet,
                        },
                    ],
                    [
                        {
                            text: listText.enterRetweetLink,
                            callback_data: listText.EVENT_RETWEET,
                        },
                    ],
                    [
                        {
                            text: listText.enterWallet,
                            callback_data: listText.EVENT_WALLET,
                        },
                    ],
                    [
                        {
                            text: listText.check,
                            callback_data: listText.EVENT_CHECK_MISSION,
                        },
                    ],
                ],
            },
            parse_mode: "Markdown",
        };
        // if (account.is_done)
        //     tempStep.reply_markup = Object.assign(
        //         tempStep.reply_markup,
        //         keyboards.done.reply_markup
        //     );
        // else
        //     tempStep.reply_markup = Object.assign(
        //         tempStep.reply_markup,
        //         keyboards.first.reply_markup
        //     );

        const result = { status: true, message: "" };
        Object.keys(listStepDone).forEach((step) => {
            if (listStepDone[step].status) {
                tempStep.reply_markup.inline_keyboard[step][0].text += " ✅";
            } else {
                tempStep.reply_markup.inline_keyboard[step][0].text += " ❌";
                if (result.status) {
                    result.status = listStepDone[step].status;
                    result.message = listStepDone[step].message;
                }
            }
        });
        console.log(tempStep.reply_markup.inline_keyboard);
        return { button: tempStep, result };
    };
    responseAccountInfo = async (info, msg, id = false) => {
        try {
            logger.debug(`responseAccountInfo ${msg}`);

            // const listStepDone = {
            //     0: await this.checkFollowChanel(msg.from.id),
            //     1: await this.checkJoinGr(msg.from.id),
            //     2: await this.checkStepTwitter(msg.from.id),
            //     2: { status: true },
            // };
            let taskPoint = 0;
            // Object.keys(listStepDone).forEach((key) => {
            //     if (listStepDone[key].status) taskPoint += 1;
            // });
            const refAccounts = await getInfoRef(msg.from.id);
            let refPoint = refAccounts.length;
            const textWl = listText.textWl(info);
            const infoButton = listText.infoButton(
                info,
                this.botUsername,
                refAccounts,
                textWl
            );
            logger.debug(`responseAccountInfo ${infoButton}`);
            if (id) {
                this.bot
                    .editMessageText(infoButton, {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: keyboards.refresh.reply_markup,
                        parse_mode: "Markdown",
                    })
                    .then(
                        this.bot.answerCallbackQuery(id, {
                            text: "Refresh Done",
                        })
                    )
                    .catch((error) => logger.error(`${error.message}`));

                return;
            }
            await this.bot.sendMessage(
                msg.chat.id,
                infoButton,
                keyboards.account_info
            );
        } catch (error) {
            logger.error(`responseAccountInfo ${error.message}`);
        }
    };
    handleGetFile = async (msg) => {
        const createCsvWriter = require("csv-writer").createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: "out.csv",
            header: [
                { id: "id_telegram", title: "id_telegram" },
                { id: "username_telegram", title: "username_telegram" },
                { id: "first_name", title: "first_name" },
                { id: "last_name", title: "last_name" },
                { id: "username_twitter", title: "username_twitter" },
                { id: "id_twitter", title: "id_twitter" },
                { id: "wallet_address", title: "wallet_address" },
                { id: "ref", title: "ref" },
            ],
        });
        let accountInfos = await getAllAccountInfo();
        let file = await csvWriter.writeRecords(accountInfos);
        console.log(file);

        this.bot.sendDocument(msg.chat.id, "out.csv");
    };
}
module.exports = new TeleBot();
