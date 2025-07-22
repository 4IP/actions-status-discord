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
exports.statusOpts = void 0;
exports.getInputs = getInputs;
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
exports.statusOpts = {
    success: {
        status: 'Success',
        color: 0x28A745
    },
    failure: {
        status: 'Failure',
        color: 0xCB2431
    },
    cancelled: {
        status: 'Cancelled',
        color: 0xDBAB09
    }
};
function getInputs() {
    const webhook = core.getInput('webhook').trim() || process.env.DISCORD_WEBHOOK || '';
    const webhooks = webhook.split('\n').filter(x => x || false);
    webhooks.forEach((w, i) => {
        core.setSecret(w);
        if (w.endsWith('/github')) {
            (0, utils_1.logWarning)(`webhook ${i + 1}/${webhooks.length} has \`/github\` suffix! This may cause errors.`);
        }
    });
    const nodetail = (0, utils_1.stob)(core.getInput('nodetail'));
    const nocontext = nodetail || (0, utils_1.stob)(core.getInput('nocontext'));
    const noprefix = nodetail || (0, utils_1.stob)(core.getInput('noprefix'));
    const status = (core.getInput('status') || process.env.INPUT_STATUS || 'success').toLowerCase();
    if (!(status in exports.statusOpts)) {
        throw new Error(`invalid status value: ${status}`);
    }
    const inputs = {
        webhooks: webhooks,
        status: status,
        description: core.getInput('description').trim(),
        content: core.getInput('content').trim(),
        title: (core.getInput('title') || core.getInput('job')).trim(),
        image: core.getInput('image').trim(),
        color: parseInt(core.getInput('color')),
        username: core.getInput('username').trim(),
        avatar_url: core.getInput('avatar_url').trim(),
        nocontext: nocontext,
        noprefix: noprefix,
        nodetail: nodetail,
        nofail: (0, utils_1.stob)(core.getInput('nofail')),
        job: core.getInput('job').trim()
    };
    if (!inputs.webhooks.length) {
        throw new Error("no webhook is given");
    }
    if (!(inputs.status in exports.statusOpts)) {
        throw new Error(`invalid status value: ${inputs.status}`);
    }
    return inputs;
}
