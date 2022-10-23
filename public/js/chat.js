(function($){

if (!window.location.origin) {window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');}

var socket = io.connect(window.location.origin);

var chatNameSection = $('.chat-name-section'),
	chatBoxSection = $('.chat-box-section'),
	chatInputSection = $('.chat-input-section'),
	chatSound = new Howl({
		urls: ['/other/notify.ogg','/other/notify.mp3','/other/notify.wav']
	});

var chatNameForm = $('#chatNameForm'),
	chatInputForm = $('#chatInputForm');

var chatBox = $('#chatBox'),
	chatTextBox = $('#chatTextBox'),
	usersBox = $('#usersBox');

var modalPopupBtn = $('#usersOnlineBtn'),
	usersOnlineCounter = modalPopupBtn.find('.badge');



socket.on('nickname taken', function() {
	chatNameSection.find('.form-group').addClass('has-error has-nickname-taken');
});

socket.on('welcome', function(nickname, nicknames) {

	chatNameSection.remove();
	chatBoxSection.show(500);
	chatInputSection.show(500);

	chatBoxSection.find('#user').html('Hello, <span class="text-success">' + nickname + '</span>');

	updateUsers(nicknames);
});

socket.on('user joined', function(nickname, nicknames) {
	var userJoinedMessage = '<p class="text-primary"><em><u>' + nickname + '</u> has joined the chat.</em></p>';

	appendAndScroll(userJoinedMessage);

	updateUsers(nicknames);
});

socket.on('user left', function(nickname, nicknames) {
	var userLeftMessage = '<p class="text-warning"><em>' + nickname + ' has left the chat.</em></p>';

	appendAndScroll(userLeftMessage);

	updateUsers(nicknames);
});

socket.on('incoming', function(data, self) {

	var nickname = self ? 'You' : data.nickname;
	var self = self ? 'self' : '';
	var receivedMessage = '<p class="entry ' + self + '"><b class="text-primary">' + nickname + ' said: </b>' + data.message + '</p>';

	appendAndScroll(receivedMessage);
});



chatNameForm.on('submit', function(e){

	e.preventDefault();

	var chatName = $.trim( chatNameSection.find('#name').val() );

	if(chatName != '') {

		socket.emit('new user', { nickname: sanitize(chatName) });
	} else {
		chatNameSection.find('.form-group').addClass('has-error');
	}
});

chatInputForm.on('submit', function(e){
	e.preventDefault();
	validateAndSend();		
});

chatTextBox.on('keypress', function(e) {
	if (e.which === 13 && e.shiftKey === false &&
		e.altKey === false && e.ctrlKey === false &&

        ('ontouchstart' in window === false || 'msMaxTouchPoints' in window.navigator === false)) {

		chatInputForm.submit();
		return false;
	}
});

chatNameSection.find('#name').on('keypress', function(e) {
	chatNameSection.find('.has-error').removeClass('has-error').removeClass('has-nickname-taken');
});

modalPopupBtn.on('click', function(e) {
	usersBox.modal();
});

function sanitize (input) {
	var input = input.replace(/>/g, '&gt;').replace(/</g,'&lt;').replace('\n','<br/>');
	return input;
}

function appendAndScroll (html) {
	chatBox.append(html);
	chatBox.scrollTop(chatBox[0].scrollHeight);

	chatSound.play();
}

function validateAndSend () {
	var chatMessage = $.trim(chatTextBox.val());

	if(chatMessage != '') {
		socket.emit('outgoing', { message: sanitize(chatMessage) });

		chatTextBox.val('');
	}
};

function updateUsers (nicknames) {

	var users = '<ul class="list-group">';

	for(var i=0; i<nicknames.length; i++) {
		users+= '<li class="list-group-item">' + nicknames[i] + '</li>';
	}

	users+='</ul>';

	usersBox.find('.modal-body').html(users);

	usersOnlineCounter.text(nicknames.length);
}


})(jQuery);