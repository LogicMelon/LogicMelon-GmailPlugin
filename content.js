InboxSDK.load('2', 'sdk_LogicMelon_919100ed8d').then(function (sdk) {
	// the SDK has been loaded, now do something with it!

	var emailAddress = "Not found";
	var emailSenderName = "Not Found";
	var emailSubject = "No Subject";
	var emailRecipientAddress = "";

	sdk.Compose.registerComposeViewHandler(function (composeView) {
		composeView.on('recipientsChanged', function (event) {
			console.log('Recipients have changed to: ' + event);
		});

		composeView.on('destroy', function (event) {
			console.log('compose view going away, time to clean up');
		});
	});

	sdk.Conversations.registerMessageViewHandler(function (messageView) {
		var emailSender = messageView.getSender();
		emailAddress = emailSender.emailAddress;
		emailSenderName = emailSender.name;
		theEmail = messageView.getBodyElement().innerText;
		
	});

	 sdk.Lists.registerThreadRowViewHandler(function (threadRowView) {
		// Reset email 
		emailAddress = "Not Found";
		 emailSenderName = "Not Found";		
	 }); 

	sdk.Conversations.registerThreadViewHandler(function (threadView) {
		emailSubject = threadView.getSubject();
	}); 

	chrome.runtime.onMessage.addListener(
		function (message, sender, sendResponse) {
			
			switch (message.type) {
				case "getSenderEmail":
					var theSender = { "emailAddress": emailAddress, "emailSender": emailSenderName};
					sendResponse(theSender);
					break;
				case "getEmailText":
					
					sendResponse(theEmail);
					break;
				case "getEmailSubject":
					sendResponse(emailSubject);
					break;
				

				default:
					console.error("Unrecognised message: ", message);
			}
		}
	);

});
