const listText = require("./list-text");

const main = (info) => {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: listText.step1,
                        url: info.telegram_channel,
                    },
                ],
                [
                    {
                        text: listText.step2,
                        url: info.telegram_group,
                    },
                ],
                [
                    {
                        text: listText.step3,
                        url: info.twitter,
                    },
                ],
                [
                    {
                        text: listText.step4,
                        url: info.twitter_tweet,
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
                        text: listText.enterRetweetLink,
                        callback_data: listText.EVENT_RETWEET,
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
};
const refresh = {
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
};
const answer = {
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
};
const check = {
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
};
const done = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [
            [listText.keyStart, listText.keyAirdrop],
            [listText.keyInfo, listText.keyWallet],
            [listText.keyAirdropInfo, listText.keyHelp],
        ],
    },
    parse_mode: "Markdown",
};
const account_info = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: listText.refresh,
                    callback_data: listText.EVENT_REFRESH_ACCOUNT_INFO,
                },
            ],
        ],
        resize_keyboard: true,
    },
    parse_mode: "Markdown",
};
const first = {
    reply_markup: {
        resize_keyboard: true,
        one_time_keyboard: false,
        keyboard: [
            [listText.keyStart, listText.keyAirdrop],
            [listText.keyHelp],
        ],
    },
    parse_mode: "Markdown",
};
module.exports = {
    main,
    refresh,
    answer,
    check,
    done,
    account_info,
    first,
};
