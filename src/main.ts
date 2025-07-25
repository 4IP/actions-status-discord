import { endGroup, startGroup } from '@actions/core'
import * as github from '@actions/github'
import axios from 'axios'
import { formatEvent } from './format'
import { getInputs, Inputs, statusOpts } from './input'
import { logDebug, logError, logInfo } from './utils'
import { fitEmbed } from './validate'
import { AxiosError } from 'axios'

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true
}

async function run() {
    try {
        logInfo('Getting inputs...')
        const inputs = getInputs()

        logInfo('Generating payload...')
        const payload = getPayload(inputs)
        startGroup('Dump payload')
        logInfo(JSON.stringify(payload, null, 2))
        endGroup()

        logInfo(`Triggering ${inputs.webhooks.length} webhook${inputs.webhooks.length > 1 ? 's' : ''}...`)
        await Promise.all(inputs.webhooks.map(w => wrapWebhook(w.trim(), payload)))
    } catch (e: unknown) {
        if (e instanceof Error) {
            logError(`Unexpected failure: ${e} (${e.message})`)
        } else {
            logError('Unexpected failure: ' + String(e))
        }
    }
}

async function wrapWebhook(webhook: string, payload: Object): Promise<void> {
    try {
        const response = await axios.post(webhook, payload, {
            timeout: 5000, // Add timeout
            validateStatus: (status) => status < 400 // Consider only 4xx/5xx as errors
        })
        logDebug(`Webhook response: ${response.status}`)
    } catch (e: unknown) {
        if (isAxiosError(e) && e.response) {
            logError(`Webhook response: ${e.response.status}: ${JSON.stringify(e.response.data)}`)
        } else if (e instanceof Error) {
            logError(e.message)
        } else {
            logError(String(e))
        }
    }
}

// function wrapWebhook(webhook: string, payload: Object): Promise<void> {
//     return async function () {
//         try {
//             await axios.post(webhook, payload)
//         } catch (e: unknown) {
//             if (isAxiosError(e) && e.response) {
//                 logError(`Webhook response: ${e.response.status}: ${JSON.stringify(e.response.data)}`)
//             } else if (e instanceof Error) {
//                 logError(e.message)
//             } else {
//                 logError(String(e))
//             }
//         }
//     }()
// }

export function getPayload(inputs: Readonly<Inputs>): Object {
    const ctx = github.context
    const { owner, repo } = ctx.repo
    const { eventName, sha, ref, workflow, actor, payload } = ctx
    const repoURL = `https://github.com/${owner}/${repo}`
    const workflowURL = `${repoURL}/commit/${sha}/checks`

    logDebug(JSON.stringify(payload))

    const eventFieldTitle = `Event - ${eventName}`
    const eventDetail = formatEvent(eventName, payload)

    const status = inputs.status || process.env.INPUT_STATUS || 'success'
    const statusOpt = statusOpts[status as keyof typeof statusOpts]
    if (!statusOpt) {
        throw new Error(`Invalid status: ${status}`)
    }

    let embed: { [key: string]: any } = {
        color: inputs.color || statusOpt.color,
        timestamp: (new Date()).toISOString()
    }

    // title
    if (inputs.title) {
        embed.title = inputs.title
    }

    if (inputs.image) {
        embed.image = {
            url: inputs.image
        }
    }

    if (!inputs.noprefix) {
        embed.title = statusOpt.status + (embed.title ? `: ${embed.title}` : '')
    }

    if (inputs.description) {
        embed.description = inputs.description
    }

    if (!inputs.nocontext) {
        embed.fields = [
            {
                name: 'Repository',
                value: `[${owner}/${repo}](${repoURL})`,
                inline: true
            },
            {
                name: 'Ref',
                value: ref,
                inline: true
            },
            {
                name: eventFieldTitle,
                value: eventDetail || 'No details available',
                inline: false
            },
            {
                name: 'Triggered by',
                value: actor,
                inline: true
            },
            {
                name: 'Workflow',
                value: `[${workflow}](${workflowURL})`,
                inline: true
            }
        ]
    }

    let dscPayload: any = { embeds: [fitEmbed(embed)] }
    logDebug(`embed: ${JSON.stringify(embed)}`)

    if (inputs.username) dscPayload.username = inputs.username
    if (inputs.avatar_url) dscPayload.avatar_url = inputs.avatar_url
    if (inputs.content) dscPayload.content = inputs.content

    return dscPayload
}

run()