const OneSignal = require("onesignal-node");

const sendPush = async (allIDs, deu, eng, url) => {
    const clientApple = new OneSignal.Client(
        process.env.APPLE_APPID,
        process.env.APPLE_API_KEY
    );
    const clientAndroid = new OneSignal.Client(
        process.env.ANDROID_APPID,
        process.env.ANDROID_API_KEY
    );
    const notificationAndroid = {
        contents: {
            en: eng,
            de: deu,
        },
        include_external_user_ids: allIDs,
        app_url: url.includes("puAppOpen://")
            ? url.replace("puAppOpen://", "https://www.pub-up.de/")
            : url,
        ios_badgeType: "SetTo",
        ios_badgeCount: 1,
        android_channel_id: "980cb565-a76d-4560-9479-90ad772ae667",
    };
    const notificationIOS = {
        contents: {
            en: eng,
            de: deu,
        },
        include_external_user_ids: allIDs,
        app_url: url.includes("https://www.pub-up.de/")
            ? url.replace("https://www.pub-up.de/", "puAppOpen://")
            : url,
        ios_badgeType: "SetTo",
        ios_badgeCount: 1,
        ios_sound: "pubupnotification.wav",
    };
    try {
        await clientAndroid.createNotification(notificationAndroid);
        await clientApple.createNotification(notificationIOS);
        return { success: true };
    } catch (e) {
        if (e instanceof OneSignal.HTTPError) {
            console.log("HTTP ERROR", e.statusCode);
            console.log("HTTP ERROR BODY", e.body);
        }
        return { error: true };
    }
};

module.exports = sendPush;
