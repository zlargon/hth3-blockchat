const blockchat = {

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

    const me = blockstack.loadUserData().username.split('.')[0];
    return blockstack.putFile(
      `blockchat/${toUser}.json`,
      JSON.stringify({
        sender: me,
        message: message,
        timestamp: Date.now()
      }),
      { encrypt: false }
    )
  },

  // 5. pull messages from someone (promise)
  pull: async (fromUser) => {
    const me = blockstack.loadUserData().username.split('.')[0];
    return blockstack.getFile(
      `blockchat/${me}.json`,
      { decrypt: false,
        username: `${fromUser}.id.blockstack`
      })
      .catch(e => {
        return [];
      })
  }
};
