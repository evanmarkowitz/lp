async function startChat() {
  try {
    let jwtRes = await fetch(
      "https://va.idp.liveperson.net/api/account/40912224/signup",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );
    var res = await jwtRes.json();
    let options = {};
    options.headers = { Authorization: "jwt" + res.jwt };
    var lpSocket = new WebSocket(
      "wss://va.msg.liveperson.net/ws_api/account/40912224/messaging/consumer?v=3"
    );

    lpSocket.onopen = function (event) {
      lpSocket.send(
        JSON.stringify({
          id: "0",
          type: "InitConnection",
          headers: [
            {
              type: ".ams.headers.ClientProperties",
              deviceFamily: "DESKTOP",
              os: "WINDOWS",
            },
            {
              type: ".ams.headers.ConsumerAuthentication",
              jwt: res.jwt,
            },
          ],
        })
      );
      lpSocket.send(
        JSON.stringify({
          kind: "req",
          id: 1,
          type: "cm.ConsumerRequestConversation",
        })
      );
    };

    lpSocket.onmessage = function (event) {
      if (JSON.parse(event.data).type === "cm.RequestConversationResponse") {
        let conversationID = JSON.parse(event.data).body.conversationId;
        lpSocket.send(
          JSON.stringify({
            kind: "req",
            id: 2,
            type: "ms.PublishEvent",
            body: {
              dialogId: conversationID,
              event: {
                type: "ContentEvent",
                contentType: "text/plain",
                message: "My first message",
              },
            },
          })
        );
      }
    };
  } catch (error) {
    console.log(error);
  }
}

startChat();
