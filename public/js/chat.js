// auto login
$(document).ready(() => {
  if (blockstack.isUserSignedIn()) {
    const profile = blockstack.loadUserData().profile
    console.log(profile);
  } else if (blockstack.isSignInPending()) {
    blockstack.handlePendingSignIn().then(function(userData) {
      window.location = window.location.origin
    })
  }
});

$(function() {
    $("#chat__form").on("submit", function(e) {
      e.preventDefault();
      var message = $("#text-message").val();
      $("#text-message").val("");
      var date = new Date();
      var now =
        date
          .toJSON()
          .slice(0, 10)
          .replace(/-/g, "/") +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes();
      $(".chat").append(
        '<div class="mine messages"><div class="message"><div>' + message + '</div></div><div class="time">' + now + "</div>"
      );
    });
  });
