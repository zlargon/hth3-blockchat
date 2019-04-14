const chat = {

  // 1. login
  login: () => {
    blockstack.redirectToSignIn(
      origin,                       // redirectURI
      origin + '/manifest.json',    // manifestURI
      [
        'store_write',              // scopes
        'publish_data'
     ]);
  },

  // 2. get user data (after login)
  getUserData: () => {
    if (blockstack.isUserSignedIn()) {
      return blockstack.loadUserData();
    }
  },

  // 3. logout
  logout: () => {
    blockstack.signUserOut(window.location.href);
  },

  // 4. send message to someone (promise)
  send: async (toUser, message) => {
    if (typeof toUser !== 'string' || toUser.length === 0) {
      console.error('username should be a string');
      return null;
    }

    if (typeof message !== 'string') {
      console.error('message should be a string');
      return null;
    }

    const me = blockstack.loadUserData().username
    const data = await chat.pull(me, toUser);
    data.push({
      sender: me,
      message: message,
      timestamp: +Date.now()
    });
    console.log(data);

    return blockstack.putFile(`chat/${toUser}.json`, JSON.stringify(data), { encrypt: false });
  },

  // 5. pull messages from someone (promise)
  pull: async (fromUser, me = blockstack.loadUserData().username) => {
    return blockstack.getFile(`chat/${me}.json`, { decrypt: false, username: fromUser })
      .then(data => {
        data = JSON.parse(data);
        return Array.isArray(data) ? data : [];
      })
      .catch(e => {
        console.warn(e);
        return [];
      });
  }
};
