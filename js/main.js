const app = (() => {
  'use strict';

  let isSubscribed = false;
  let swRegistration = null;

  const notifyButton = document.querySelector('.js-notify-btn');
  const pushButton = document.querySelector('.js-push-btn');

  // 檢查 notification 相容性
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
    return;
  }

  // 是否允許 show notifications
  Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
  });

  function displayNotification() {
    // display a Notification
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(reg => {
        fetch('/push', {
          body: JSON.stringify(reg),
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
        });


      });
    }

  }

  function initializeUI() {
    pushButton.addEventListener('click', () => {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });

    swRegistration.pushManager.getSubscription()
      .then(subscription => {
        isSubscribed = (subscription !== null);
        updateSubscriptionOnServer(subscription);
        if (isSubscribed) {
          console.log('User IS subscribed.');
        } else {
          console.log('User is NOT subscribed.');
        }
        updateBtn();
      });

  }

  function subscribeUser() {
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BCvwG-WrMN3ULNHOJvy6SxLXzBQHFmnqt_S9SIPMvoaye7Ynq9NCCT6Vh3WmGBq22PBXDDCLisZU_e_0vWaBa0w',
    })
      .then(subscription => {
        console.log('User is subscribed:', subscription);
        if (subscription) {
          fetch('/add', {
            body: JSON.stringify(subscription),
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
          });
          updateSubscriptionOnServer(subscription);
          isSubscribed = true;
          updateBtn();
        }
      })
      .catch(err => {
        if (Notification.permission === 'denied') {
          console.warn('Permission for notifications was denied');
        } else {
          console.error('Failed to subscribe the user: ', err);
        }
        updateBtn();
      });

  }

  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          return subscription.unsubscribe();
        }
      })
      .catch(err => {
        console.log('Error unsubscribing', err);
      })
      .then(() => {
        updateSubscriptionOnServer(null);
        console.log('User is unsubscribed');
        isSubscribed = false;
        updateBtn();
      });

  }

  function updateSubscriptionOnServer(subscription) {
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const endpointURL = document.querySelector('.js-endpoint-url');
    const subAndEndpoint = document.querySelector('.js-sub-endpoint');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      endpointURL.textContent = subscription.endpoint;
      subAndEndpoint.style.display = 'block';
    } else {
      subAndEndpoint.style.display = 'none';
    }
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  notifyButton.addEventListener('click', () => {
    displayNotification();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Service Worker and Push is supported');

      // 註冊 serviceWorker
      navigator.serviceWorker.register('sw.js')
        .then(swReg => {
          console.log('Service Worker is registered', swReg);

          swRegistration = swReg;

          initializeUI();
        })
        .catch(err => {
          console.error('Service Worker Error', err);
        });
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

})();
