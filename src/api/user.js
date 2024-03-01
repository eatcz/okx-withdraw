import request from "../server/request";
import CryptoJS from "crypto-js";

// 获取资产
export const balance = (ts, apiKey, secretKey, passPhrase, ccy = '') => request({
    url: `v5/asset/balances${ccy}`,
    method: 'GET',
    headers: {
        'OK-ACCESS-SIGN': CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(ts.toISOString() + 'GET' + `/api/v5/asset/balances${ccy}`, secretKey)),
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-PASSPHRASE': passPhrase,
        'OK-ACCESS-TIMESTAMP': ts.toISOString(),
        'Content-Type': 'application/json'
    }
})

// 提币
export const withdraw = (ts, data, apiKey, secretKey, passPhrase) => {
    console.log(ts)
    return request({
    url: 'v5/asset/withdrawal',
    method: 'POST',
    data,
    headers: {
        'OK-ACCESS-SIGN': CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(ts.toISOString() + 'POST' + `/api/v5/asset/withdrawal` + JSON.stringify(data), secretKey)),
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-PASSPHRASE': passPhrase,
        'OK-ACCESS-TIMESTAMP': ts.toISOString(),
        'Content-Type': 'application/json'
    }
})
} 