const axios = require("axios");

const accountSid = "AC9de9cb9ae046a09717525d23d1b3eae7";
const authToken = "6ba03c17c8883deeec04ea57d0f96f59";
const twilio = require('twilio')(accountSid, authToken);

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
            from: "whatsapp:+14155238886",
            body: `Your appointment is coming up on ${ask} at to ${bid}`,
            to: "whatsapp:+27608917254"});
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