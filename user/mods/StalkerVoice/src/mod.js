"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const ICustomisationStorage_1 = require("C:/snapshot/project/obj/models/eft/common/tables/ICustomisationStorage");
class StalkerVoicesPack {
    container;
    database;
    config;
    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        
        // Display Stalker-themed ASCII art logo
        console.log("\n");
        console.log("===============================================================================");
        console.log("                                                                               ");
        console.log("                   (*)  S.T.A.L.K.E.R.  VOICES  (*)                           ");
        console.log("                                                                               ");
        console.log("                   Get out of here, S.T.A.L.K.E.R.!                           ");
        console.log("                                                                               ");
        console.log("===============================================================================");
        console.log("\n");
        
        logger.success("(*) Stalker Voices: Loading voice packs from the Zone...");
        
        this.database = container.resolve("DatabaseServer").getTables();
        const configFiles = node_fs_1.default.readdirSync(node_path_1.default.join(__dirname, "../db/voices"))
            .filter(file => file.endsWith(".json"));
        
        let voicesLoaded = 0;
        
        for (const file of configFiles) {
            const configPath = node_path_1.default.join(__dirname, "../db/voices", file);
            try {
                const configFileContents = node_fs_1.default.readFileSync(configPath, "utf-8");
                const voiceConfig = JSON.parse(configFileContents);
                for (const voiceId in voiceConfig) {
                    const singleVoiceConfig = voiceConfig[voiceId];
                    this.processVoiceConfig(this.database, singleVoiceConfig, voiceId);
                    voicesLoaded++;
                }
            }
            catch (error) {
                logger.error(`(*) Stalker Voices: Error processing file ${file}: ${error}`);
            }
        }
        
        logger.success(`(*) Stalker Voices: Successfully loaded ${voicesLoaded} faction voices!`);
        logger.success("(*) Stalker Voices: All voices are ready for deployment!");
        console.log("\n");
    }
    processVoiceConfig(database, voiceConfig, voiceId) {
        const sideSpecificVoice = voiceConfig.sideSpecificVoice;
        const name = voiceConfig.name;
        this.createAndAddVoice(database, voiceId, name, sideSpecificVoice);
        this.addVoiceToCustomizationStorage(database, voiceId);
        this.handleLocale(database, voiceConfig, voiceId);
    }
    addVoiceToCustomizationStorage(database, voiceId) {
        const customizationStorage = database.templates.customisationStorage;
        const headStorage = {
            "id": voiceId,
            "source": ICustomisationStorage_1.CustomisationSource.DEFAULT,
            "type": ICustomisationStorage_1.CustomisationType.VOICE
        };
        customizationStorage.push(headStorage);
    }
    handleLocale(database, voiceConfig, voiceId) {
        for (const localeID in database.locales.global) {
            try {
                const itemName = `${voiceId} Name`;
                const localeValue = voiceConfig.locales[localeID] || voiceConfig.locales["en"];
                if (localeValue && database.locales.global[localeID]) {
                    database.locales.global[localeID][itemName] = localeValue;
                }
            }
            catch (error) {
                console.error(`Error handling locale for ${localeID}: ${error}`);
            }
        }
    }
    createAndAddVoice(database, voiceId, name, sideSpecificVoice) {
        const newVoice = {
            "_id": voiceId,
            "_name": name,
            "_parent": "5fc100cf95572123ae738483",
            "_type": "Item",
            "_props": {
                "Name": name,
                "ShortName": name,
                "Description": name,
                "Side": sideSpecificVoice ?? ["Usec", "Bear"],
                "Prefab": name
            }
        };
        database.templates.customization[voiceId] = newVoice;
        database.templates.character.push(voiceId);
    }
}
module.exports = { mod: new StalkerVoicesPack() };