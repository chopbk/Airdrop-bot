const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const ContactSchema = new Schema(
    {
        env: {
            type: String,
            index: true,
            unique: true,
        },
        website: {
            type: String,
            default: "https://www.creatorchain.network",
        },
        twitter: {
            type: String,
            default: "https://twitter.com/creatorctr",
        },
        twitter_tweet: {
            type: String,
            default:
                "https://twitter.com/CreatorCTR/status/1404698736467484674",
        },
        telegram_channel: {
            type: String,
            default: "https://t.me/creatorplatform",
        },
        telegram_channel_id: {
            type: Number,
            default: -1001343698829,
        },
        telegram_group: {
            type: String,
            default: "https://t.me/creatorplatformglobal",
        },
        telegram_group_id: {
            type: Number,
            default: -1001339320577,
        },
        medium: {
            type: String,
            default: "https://creatorplatfor1.medium.com/",
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);
module.exports = ContactSchema;
//https://t.me/testCreatorChainNetworkGroup
//https://t.me/testCreatorChainNetworkChannel
