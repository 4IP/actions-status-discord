"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncStr = truncStr;
exports.fitEmbed = fitEmbed;
const constants = __importStar(require("./constants"));
const utils_1 = require("./utils");
function truncStr(msg, length) {
    if (msg.length <= length) {
        return msg;
    }
    (0, utils_1.logDebug)(`String length ${msg.length} exceeds ${length}`);
    return msg.slice(0, length - 3) + '...';
}
function fitEmbed(embed) {
    if (embed.title && embed.title.length > constants.MAX_EMBED_TITLE_LENGTH) {
        (0, utils_1.logDebug)(`embed title must be shorter than ${constants.MAX_EMBED_TITLE_LENGTH}, got ${embed.title.length}`);
        embed.title = truncStr(embed.title, constants.MAX_EMBED_TITLE_LENGTH);
    }
    if (embed.description && embed.description.length > constants.MAX_EMBED_DESCRIPTION_LENGTH) {
        (0, utils_1.logDebug)(`embed description must be shorter than ${constants.MAX_EMBED_DESCRIPTION_LENGTH}, got ${embed.description.length}`);
        embed.description = truncStr(embed.description, constants.MAX_EMBED_DESCRIPTION_LENGTH);
    }
    if (embed.fields) {
        embed.fields = embed.fields.map((field) => {
            if (field.name && field.name.length > constants.MAX_EMBED_FIELD_NAME_LENGTH) {
                (0, utils_1.logDebug)(`embed field name must be shorter than ${constants.MAX_EMBED_FIELD_NAME_LENGTH}, got ${field.name.length}`);
                field.name = truncStr(field.name, constants.MAX_EMBED_FIELD_NAME_LENGTH);
            }
            if (field.value && field.value.length > constants.MAX_EMBED_FIELD_VALUE_LENGTH) {
                (0, utils_1.logDebug)(`embed field value must be shorter than ${constants.MAX_EMBED_FIELD_VALUE_LENGTH}, got ${field.value.length}`);
                field.value = truncStr(field.value, constants.MAX_EMBED_FIELD_VALUE_LENGTH);
            }
            return field;
        });
    }
    return embed;
}
