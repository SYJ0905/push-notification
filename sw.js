// 處理 notificationclose event
self.addEventListener('notificationclose', event => {
    const notification = event.notification;
    const primaryKey = notification.data.primaryKey;

    console.log('Closed notification: ' + primaryKey);
});

// 處理 notificationclick event
self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const primaryKey = notification.data.primaryKey;
    const action = event.action;

    if (action === 'close') {
        notification.close();
    } else {
        clients.openWindow('samples/page' + primaryKey + '.html');
        notification.close();
    }

    // 一次關閉所有通知
    self.registration.getNotifications()
        .then(notifications => {
            notifications.forEach(notification => {
                notification.close();
            });
        });

});

self.addEventListener('push', event => {
    const options = event.data.json();
    const title = options.title;
    event.waitUntil(
        clients.matchAll().then(c => {
            console.log(c);
            if (c.length === 0) {
            // 顯示 notification
            self.registration.showNotification(title, options);
            } else {
            // Send a message to the page to update the UI
            console.log('Application is already open!');
            }
        })
    );
});