const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

app.get('/:symbol', (req, res) => {
    const symbol = req.params.symbol;
    const url = `https://www.gurufocus.com/stock/${symbol}/summary`;

    axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const gfValueWithDollar = $('h2.t-h6 span.t-primary', html).first().text();
            const gfValue = parseFloat(gfValueWithDollar.substring(1));

            const stockPrice = $('div.m-t-xs span.bold.t-body-lg').text().trim().substring(1);
            const cleanStockPrice = parseFloat(stockPrice.replace(/\s/g, ''));
            const upSidePercent = ((gfValue/cleanStockPrice) - 1)*100;
            const piotroskyFScore = parseInt($('td.t-right.t-primary', html).first().text().trim());

            const result = {
                [symbol]: {
                    gfvalue: gfValue,
                    stockprice: cleanStockPrice,
                    piotroskyfscore: piotroskyFScore,
                    upsidepercent: upSidePercent
                }
            };

            res.json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "An error occurred" });
        });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
