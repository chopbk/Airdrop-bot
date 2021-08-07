// const knex = require("knex")(exportConfig());
// function exportConfig() {
//   return require("./knexfile");
// }
const MongoDb = require("./mongodb");
const logger = require("../utils/logger");
const AccountAirdrop = MongoDb.getAccountModel();
const ContactInfoModel = MongoDb.getContactInfoModel();
const STEP_NONE = 0;
const STEP_VERIFY = 1;
const STEP_USERNAME = 2;
const STEP_RETWEET = 3;
const STEP_WALLET = 4;
const STEP_CAPTCHA = 5;

module.exports = {
    getAccountInfo,
    createMember,
    findOrCreate,
    getIDTwitter,
    updateAccountInfo,
    getStepInputCurrent,
    checkUniqueTwitter,
    getWalletAddress,
    getInfoRef,
    isDone,
    getAllAccountInfo,
    getContactInfo,
    STEP_USERNAME,
    STEP_WALLET,
    STEP_CAPTCHA,
    STEP_NONE,
    STEP_RETWEET,
    STEP_VERIFY,
};
async function getAllAccountInfo(id_telegram) {
    return AccountAirdrop.find({ role: "user" });
    // return knex.select().from("members").where("id_telegram", id).first();
}
async function getAccountInfo(id_telegram) {
    return AccountAirdrop.findOne({ id_telegram: id_telegram });
    // return knex.select().from("members").where("id_telegram", id).first();
}

async function createMember(params) {
    let account = new AccountAirdrop({
        id_telegram: params.id,
        username_telegram: params.username,
        first_name: params.first_name,
        last_name: params.last_name,
        ref: params.ref,
        captcha: params.captcha,
        step_input: 0,
    });
    return account.save();
}
async function findOrCreate(msg, ref = "") {
    let account = await getAccountInfo(msg.from.id);
    logger.debug(
        `findOrCreate ${msg.from.id} ${
            !!account ? account.username_telegram : ""
        }`
    );
    if (!account) {
        account = await createMember({ ...msg.from, ref: ref, captcha: "" });
        return false;
    }
    return account;
}
async function updateAccountInfo(id_telegram, obj) {
    logger.debug(
        `[updateAccountInfo] id_telegram ${id_telegram} ${JSON.stringify(obj)}`
    );
    let memmber = await AccountAirdrop.findOneAndUpdate(
        { id_telegram: id_telegram },
        obj
    );
    logger.debug(
        `[updateAccountInfo] Member Update} ${JSON.stringify(memmber)}`
    );
    return;
}

async function getStepInputCurrent(id_telegram) {
    let account = await AccountAirdrop.findOne({ id_telegram: id_telegram });
    if (account) return account.step_input;
    return false;
}
async function isDone(id_telegram) {
    let account = await AccountAirdrop.findOne({
        id_telegram: id_telegram,
        is_done: true,
    });
    if (account) return true;
    return false;
}

async function getIDTwitter(id_telegram) {
    let account = await AccountAirdrop.findOne({ id_telegram: id_telegram });
    if (account && account.id_twitter) return account.id_twitter;
    return false;
}

async function getWalletAddress(id_telegram) {
    let account = await AccountAirdrop.findOne({ id_telegram: id_telegram });
    if (account && account.wallet_address) return account.wallet_address;
    return false;
}

async function checkUniqueTwitter(username_twitter) {
    let account = await AccountAirdrop.findOne({
        username_twitter: username_twitter,
    });
    logger.debug(`[checkUniqueTwitter]: ${account}`);
    if (account) return true;
    else return false;
}

async function getInfoRef(userId) {
    let refAccounts = await AccountAirdrop.find({
        ref: userId,
        is_done: true,
    });
    return refAccounts;
}

async function getContactInfo(env) {
    let contactInfo = await ContactInfoModel.findOne({
        env: env,
    });
    return contactInfo;
}
