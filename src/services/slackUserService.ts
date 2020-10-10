export interface SlackUser {
    id: string
    name: string
    real_name: string
}

interface SlackUserNotificationOptions {
    isSingle: boolean,
    isParcel: boolean,
    additionalText: string
}

export async function fetchAllSlackUsers(): Promise<SlackUser[]> {
    return await fetch('SLACK-ENDPOINT/api/users', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic AUTH-KEY'
        }
    }).then(result => {
        console.log('fetchAllSlackUsers SUCCESS')
        return result.json() as unknown as SlackUser[]
    }).catch(err => {
        console.log(`fetchAllSlackUsers ERROR: ${err}`)
        return []
    })
}

export function notifySlackUser(slackUserId: string, options: SlackUserNotificationOptions) {
    const { isSingle, isParcel, additionalText } = options
    fetch(`SLACK-ENDPOINT/api/notification/id/${slackUserId}?isSingle=${isSingle}&isParcel=${isParcel}&additionalText=${additionalText}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic AUTH-KEY'
        }
    })
}