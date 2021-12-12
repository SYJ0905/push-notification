const publicKey = 'BCvwG-WrMN3ULNHOJvy6SxLXzBQHFmnqt_S9SIPMvoaye7Ynq9NCCT6Vh3WmGBq22PBXDDCLisZU_e_0vWaBa0w';
const privateKey = 'S3Mc_GJEp2D79eJ1mp6EuM1Dtc2Y81zVFI5xqaWXwRo';

const express = require('express');
const webPush = require('web-push');
const app = express();

const tokens = [];

// This serves static files from the specified directory
app.use(express.static(__dirname));

app.post('/add', express.json(), (req, res) => {
  tokens.push(req.body);
  res.end();
});

app.post('/push', (req, res) => {
  webPush.setVapidDetails('mailto:BetaPhoenixSNSD@gmail.com', publicKey, privateKey);

  tokens.forEach(token => {
    const sendData = {
      title: '哈囉，您好',
      body: '這裡是推播訊息',
      icon: 'images/notification-flat.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      // add actions to the notification
      actions: [
        {
          action: 'explore',
          title: 'Go to the site',
          icon: 'images/checkmark.png',
        },
        {
          action: 'close',
          title: 'Close the notification',
          icon: 'images/xmark.png',
        },
      ],
      // add a tag to the notification
      tag: 'id1'
    };
    webPush.sendNotification(token, JSON.stringify(sendData));
  });
  res.end();
});




const server = app.listen(8081, () => {

  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
