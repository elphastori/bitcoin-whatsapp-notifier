const axios = require("axios");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilio = require('twilio')(accountSid, authToken);

const fromNumber = process.env.FROM_NUMBER;
const toNumber = process.env.TO_NUMBER;

const express = require('express');
const PORT = process.env.PORT || 5000;

const increment = 1000;
let lastAsk = 0;
let lastBid = 0;

const getBitcoinTicker = async () => {
    try {
        const ticker = await axios.get("https://api.mybitx.com/api/1/ticker?pair=XBTZAR");
        console.log(ticker.data);
        return ticker.data;
    } catch(error) {
        console.error(error);
    }
}

const sendWhatsappUpdate = async (ask, bid) => {
    try {
        const response = await twilio.messages.create({
            from: `whatsapp:+${fromNumber}`,
            body: `Your appointment is coming up on ${ask} at to ${bid}`,
            to: `whatsapp:+${toNumber}`});
        console.log(response);
    } catch(error) {
        console.error(error);
    }
}

const monitorBitcoin = async () => {
    const ticker = await getBitcoinTicker();
    const ask = parseFloat(ticker.ask);
    const bid = parseFloat(ticker.bid);

    if (Math.abs(ask - lastAsk) > increment || Math.abs(bid - lastBid) > increment) {
        if (Math.abs(ask - lastAsk) > increment) {
            lastAsk = ask;
        }

        if (Math.abs(bid - lastBid) > increment) {
            lastBid = bid;
        }

        await sendWhatsappUpdate(ask, bid);
    }
}

setInterval(monitorBitcoin, 60000);

express()
    .get('/', (req, res) => res.send(`Ask: ${lastAsk} Bid: ${lastBid}`))
    .listen(PORT, () => console.log(`Bitcoin WhatsApp Notifier listening on port ${PORT}!`));