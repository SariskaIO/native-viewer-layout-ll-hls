import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL } from 'react-native-url-polyfill';

export function isURL(str) {
    var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
}

export function isHLSURL(url) {
    const regex = /^(https?|ftp):\/\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+\.m3u8$/;
    return regex.test(url);
  }

export function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
  
    return result;
}

export function extractStreamFromUrl(url) {
    if (!url){
        return;
    }

    if (!isURL(url)) {
        return
    }

    const pathname = new URL(url).pathname;
    const parts  = pathname.split("/");

    if (parts[1] === "play" || parts[1] === "multi" || parts[1] ===  "original") { // handling all type of sariska's HLS URLs.
        return parts[3]
    } else if(parts[1]) {
        return parts[1]
    }
    return null;  
}

export const getToken = async () => {
    let id, name, token;
    try {
        // Check if id and name exist in AsyncStorage
        id = await AsyncStorage.getItem('id');
        name = await AsyncStorage.getItem('name');
        token = await AsyncStorage.getItem("token");
    } catch(e) { 
        console.log(e)
    }

    if (token) {
        return token;
    }

    if (!id || !name) {
        // If id or name doesn't exist, generate random strings
        id = generateRandomString();
        name = generateRandomString();

        // Store generated id and name in AsyncStorage
        await AsyncStorage.setItem('id', id);
        await AsyncStorage.setItem('name', name);
    }

    // Token doesn't exist in AsyncStorage, fetch a new one
    const body = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apiKey: "27fd6f9296c71b4a2f2ad1f533e6b5c075c005bbdeac76923e",
            user: {
                id,
                name,
                email: "nick@gmail.com",
                avatar: "https://test.com/user/profile.jpg",
                moderator: true
            }
        })
    };

    try {
        const response = await fetch("https://api.sariska.io/api/v1/misc/generate-token", body);
        if (response.ok) {
            const json = await response.json();
            const token = json.token;
            await AsyncStorage.setItem("token", token);
            return token;
        } else {
            console.log(response.status);
        }
    } catch (error) {
        console.log('error', error);
    }
};
