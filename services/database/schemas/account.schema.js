const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const AccountSchema = new Schema(
    {
        id_telegram: {
            type: Number,
            index: true,
            unique: true,
        },

        username_telegram: String,
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        email: String,
        first_name: {
            type: String,
            default: "",
        },
        last_name: {
            type: String,
            default: "",
        },
        ref: Number,

        verify: {
            captcha: Number,
            try_time: {
                type: Number,
                default: 0,
            },
            status: {
                type: String,
                enum: ["new", "banned", "verified"],
                default: "new",
            },
        },
        username_twitter: String,
        id_twitter: String,
        retweet_link: String,
        retweet_links: [],
        is_done: {
            type: Boolean,
            default: false,
        },
        wallet_address: String,
        step_input: {
            type: Number,
            default: 0,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
AccountSchema.methods.createCaptcha = function () {
    let account = this;
    let max = 100,
        min = 10;
    let a = Math.round(Math.random() * (max - min + 1) + min);
    let b = Math.round(Math.random() * (max - min + 1) + min);
    account.verify.captcha = a + b;
    account.save().catch((e) => {});
    return {
        first: a,
        second: b,
        total: account.verify.captcha,
    };
};
module.exports = AccountSchema;
