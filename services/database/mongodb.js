/**
 * @file  create connection of mongooDB
 * @author chopbk
 * @date 04/08/2021
 */
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const AccountSchema = require("./schemas/account.schema");
const ContactInfoSchema = require("./schemas/contact-info.schema");
class MongoDb {
    constructor() {}
    async init() {
        try {
            let username = process.env.MONGODB_USERNAME;
            let password = process.env.MONGODB_PASS;
            let options = {
                poolSize: 10,
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                autoIndex: true, //this is the code I added that solved it all
                keepAlive: true,
                useFindAndModify: false,
                user: username,
                pass: password,
                auth: {
                    authSource: "admin",
                },
            };
            let url = process.env.MONGODB;

            url = process.env.MONGO_URI;
            logger.debug("[mongoLoader] connect to " + url);
            await mongoose
                .connect(url, options)
                .then((data) => console.log(`Connect to ${url} success`))
                .catch((error) => console.log(error.message));
            this.AccountModel = mongoose.model("account", AccountSchema);
            this.ContactInfoModel = mongoose.model(
                "contact_info",
                ContactInfoSchema
            );
        } catch (error) {
            throw error;
        }
        return mongoose.connection;
    }
    getAccountModel() {
        return this.AccountModel;
    }
    getContactInfoModel() {
        return this.ContactInfoModel;
    }
}
module.exports = new MongoDb();
