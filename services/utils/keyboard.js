const listText = require("./list-text");
const linkPostTwiiter = process.env.POST_TWEETER;
const linkChanelTele = process.env.LINK_CHANEL;
const linkGroupTele = process.env.LINK_GROUP;
module.exports = {
    main: {
        reply_markup: {
            inline_keyboard: [
                [{ text: listText.step1, url: linkChanelTele }],
                [{ text: listText.step2, url: linkGroupTele }],
                [
                    {
                        text: listText.enterUser,
                        callback_data: listText.EVENT_USERNAME,
                    },
                ],
                [{ text: listText.step3, url: linkPostTwiiter }],
                [
                    {
                        text: listText.check,
                        callback_data: listText.EVENT_CHECK_MISSION,
                    },
                ],
            ],
        },
        parse_mode: "Markdown",
    },
    refresh: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: listText.refresh,
                        callback_data: listText.EVENT_REFRESH_ACCOUNT_INFO,
                    },
                ],
            ],
        },
        parse_mode: "Markdown",
    },
    answer: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: listText.answerButton,
                        callback_data: listText.EVENT_ANSWER_VERIFY,
                    },
                ],
            ],
        },
        parse_mode: "Markdown",
    },
    check: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: listText.check,
                        callback_data: listText.EVENT_CHECK_MISSION,
                    },
                ],
            ],
        },
        parse_mode: "Markdown",
    },
    done: {
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
                [listText.keyStart, listText.keyAirdrop],
                [listText.keyInfo, listText.keyWallet],
                [listText.keyAirdropInfo, listText.keyHelp],
            ],
        },
        parse_mode: "Markdown",
    },
    point: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: listText.refresh,
                        callback_data: listText.EVENT_REFRESH_ACCOUNT_INFO,
                    },
                ],
            ],
        },
        parse_mode: "Markdown",
    },
    first: {
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [
                [listText.keyStart, listText.keyAirdrop],
                [listText.keyHelp],
            ],
        },
        parse_mode: "Markdown",
    },
};
