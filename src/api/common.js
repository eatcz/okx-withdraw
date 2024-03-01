import request from "../server/request";
import CryptoJS from "crypto-js";

// 获取系统时间
export const systemTime = () => request({
    url: 'v5/public/time',
    method: 'GET',
})

// 获取当前gasfee
export const currentFee = (ts , ccy , apiKey , secretKey , passPhrase) => request({
    url: `v5/asset/currencies?ccy=${ccy}`,
    method: 'GET',
   headers: {
        'OK-ACCESS-SIGN': CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(ts.toISOString() + 'GET' + `/api/v5/asset/currencies?ccy=${ccy}`, secretKey)),
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-PASSPHRASE': passPhrase,
        'OK-ACCESS-TIMESTAMP': ts.toISOString(),
        'Content-Type': 'application/json'
    }
})