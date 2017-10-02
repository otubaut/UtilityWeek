
// EC SessionInformation
USERNAME = null;
PASSWORD = null;
ACCOUNT = null;
restUrl = 'https://api-sandbox.everyware-cloud.com/v2'
currentChildAccount = null;

function ajaxRequest(obj) {
	obj.beforeSend = function(req) {
		req.setRequestHeader('Authorization', "Basic " + btoa(USERNAME + '@' + currentChildAccount + ":" + PASSWORD))
	}

	return $.ajax(obj);
}


function setChildAccount(name) {
	currentChildAccount = name;
	localStorage.setItem("EC_CHILD", currentChildAccount);
}


function interactiveLogin(completedFn) {

	USERNAME = localStorage.getItem("DEMOBOX_EC_USER");
	PASSWORD = localStorage.getItem("DEMOBOX_EC_PASS");
	ACCOUNT = localStorage.getItem("DEMOBOX_EC_ACCOUNT");
	currentChildAccount = localStorage.getItem("DEMOBOX_EC_CHILD");

	function testLogin() {
		box.hide();
		ajaxRequest({
			url: restUrl + "/accounts.json",
			method: "GET",
			dataType: "json"
		}).done(function(resp) {
			box.show();
			boxContainer.remove();
			completedFn();
			localStorage.setItem("DEMOBOX_EC_USER", USERNAME);
			localStorage.setItem("DEMOBOX_EC_PASS", PASSWORD);
			localStorage.setItem("DEMOBOX_EC_ACCOUNT", ACCOUNT);
			localStorage.setItem("DEMOBOX_EC_CHILD", currentChildAccount);
		}).error(function() {
			box.show();
			if(USERNAME && USERNAME != null) {
				alert("Bad credentials");
			}
		});
	}

	var box = $("<section></section>")
	box.addClass("loginBox");

	box.append('<header>Everyware Cloud Login</header><hr>');

	var accountBox = $('<input type="text"></input>');
	box.append('ACCOUNT ')
	box.append(accountBox)
	box.append('<br>')

	var usernameBox = $('<input type="text"></input>');
	box.append('USERNAME ')
	box.append(usernameBox)
	box.append('<br>')

	var passwordBox = $('<input type="PASSWORD"></input>');
	box.append('PASSWORD ')
	box.append(passwordBox)
	box.append('<br>')

	var button = $('<input type="button" value="Login"></input>');
	box.append(button)

	var boxContainer = $('<div class="loginBoxContainer"></div>')
	boxContainer.append('<span class="dummy"></span>');
	boxContainer.append(box);
	$("body").append(boxContainer);

	testLogin();

	accountBox.on('keyup', function() {
		setTimeout(function() {
			usernameBox.val(accountBox.val())
		}, 0);
	});

	button.on('click', function() {
		ACCOUNT = accountBox.val();
		USERNAME = usernameBox.val();
		PASSWORD = passwordBox.val();
		currentChildAccount = ACCOUNT;
		testLogin();
	});

}

function logout() {
	localStorage.removeItem("DEMOBOX_EC_USER");
	localStorage.removeItem("DEMOBOX_EC_PASS");
	localStorage.removeItem("DEMOBOX_EC_ACCOUNT");
	localStorage.removeItem("DEMOBOX_EC_CHILD");
	location.reload();
}
