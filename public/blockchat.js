const blockchat = {

  login: () => {
    blockstack.redirectToSignIn(
      origin,                       // redirectURI
      origin + '/manifest.json',    // manifestURI
      [
        'store_write',              // scopes
        'publish_data'
     ]);
  },

  getUserData: () => {
    if (blockstack.isUserSignedIn()) {
      return blockstack.loadUserData();
    }
  },

  logout: () => {
    blockstack.signUserOut(window.location.href);
  },

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
