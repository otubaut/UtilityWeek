var BROKER = "cs.eurotech.com";
var PORT = 8088;
var CLIENT_ID = "Dashboard-Broker-" + new Date().getTime();
var connected;

//Load ProtoBuf for Kura payload decoding
var ProtoBuf = dcodeIO.ProtoBuf;
var ByteBuf = dcodeIO.ByteBuffer;

var pbMsg = ProtoBuf.loadProto("package kuradatatypes;option java_package= \"org.eclipse.kura.core.message.protobuf\";option java_outer_classname = \"KuraPayloadProto\";message KuraPayload {message KuraMetric {enum ValueType{DOUBLE = 0;FLOAT = 1;INT64 = 2;INT32 = 3;BOOL = 4;STRING = 5;BYTES = 6;}required string name = 1;required ValueType type = 2;optional double double_value = 3;optional float float_value = 4;optional int64 long_value = 5;optional int32 int_value = 6;optional bool bool_value = 7;optional string string_value = 8;optional bytes bytes_value = 9;}message KuraPosition{required double latitude=1;required double longitude=2;optional double altitude=3;optional double precision=4;optional double heading=5;optional double speed = 6;optional int64 timestamp=7;optional int32 satellites=8;optional int32 status=9;}optional int64 timestamp = 1;optional KuraPosition position  = 2;extensions 3 to 4999;repeated KuraMetric metric=5000;optional bytes body= 5001;}")
.build("kuradatatypes.KuraPayload");

var client = new Paho.MQTT.Client(BROKER, PORT, "", CLIENT_ID);

function doConnect() {
	client.connect({
		onSuccess: onConnected,
		useSSL: false,
		onFailure: function() {
			alert("Unable to make MQTT connection. Reverting to REST API.");
			startRestIntervalPoll();
		}
	});
}

// Reduce the amount of work required to decode all messages when only some are being used.
function manageSubscriptions() {
	if (connected) {
		client.unsubscribe(ACCOUNT + "/+/monnit/#", 2);

		switch (activeView) {
			case "facility" :
				client.subscribe(ACCOUNT + "/+/monnit/#", 2);
				break;
			case "asset" :
				client.subscribe(ACCOUNT + "/+/monnit/#", 2);
				break;

			case "overview" :
				client.subscribe(ACCOUNT + "/+/monnit/#", 2);
				break;
		}
	}
}

client.onConnectionLost = function() {
	connected = false;
	doConnect();
}

client.onMessageArrived = function(message) {
	try {
		//Retrieve the MQTT topic
		var topic = message.destinationName;
		var topicFragments = topic.split('/');

		//Get the payload
		var bytes = message.payloadBytes;

		//if the packet is a GZip buffer, decompress it...
		if(bytes[0]==31 && bytes[1]==139 && bytes[2]==8 && bytes[3]==0){

			//Convert the payload to a Base64 string
			var b64 = _arrayBufferToBase64(bytes);
			//Decompress the payload into a string
			var cdecomp = JXG.decompress(b64);
			//Generate a byte array from the decompressed string
			var bytes = new Uint8Array(cdecomp.length);
			for (var i = 0; i < cdecomp.length; ++i){
				bytes[i]=(cdecomp.charCodeAt(i));
			}
		}
		//Finally decode the packet with Protocol Buffers
		var newMsg = pbMsg.decode(bytes);
		var device = message.destinationName.split('/')[4];
		var payload = parseMetricToJSON(newMsg.getMetric());
		handleMQTTMessage(topic, payload)
	} catch(e) {
		//Do something?
	}
}
function handleMQTTMessage (topic, payload) {
	var topicInfo = topic.split('/');

	switch (topicInfo[2]) {
		case "monnit" :
			var sensorName = topicInfo[3];
			handleMonnitMQTTMessage(sensorName, payload);
			break;
			}
		}



function onConnected() {
	connected = true;
}

function _arrayBufferToBase64( buffer ) {
		 var binary = '';
		 var bytes = new Uint8Array( buffer );
		 var len = bytes.byteLength;
		 for (var i = 0; i < len; i++) {
			  binary += String.fromCharCode( bytes[ i ] );
		 }
		 return window.btoa( binary );
	};

function _base64ToArrayBuffer(base64) {
	 var binary_string =  window.atob(base64);
	 var len = binary_string.length;
	 var bytes = new Uint8Array( len );
	 for (var i = 0; i < len; i++)        {
	     var ascii = binary_string.charCodeAt(i);
	     bytes[i] = ascii;
	 }
	 return bytes.buffer;
}

function publishMessage(topic, metrics, qos) {
	var metricObj = [];
	for(var name in metrics) {
		var m = metrics[name];

		var outMetric = {
			name: name
		}

		switch(m.constructor) {
		case Number:
			outMetric.type = "double";
			break;
		case String:
			outMetric.type = "string";
			break;
		case Boolean:
			outMetric.type = "boolean";
			break;
		}
			outMetric.value = "" + m;


		metricObj.push(outMetric);
	}

	var msg = {
		topic: topic,
		payload: { metrics: { metric: metricObj } }
	}
	$.ajax({
		url: REQ_URL_POST + ".json",
		method: "POST",
		contentType: "application/json",
		data: JSON.stringify(msg),
		beforeSend : function(req) {
		    req.setRequestHeader('Authorization', "Basic " +btoa(USERNAME+":"+PASSWORD))
		}
	})
}

//Returns a JSON object of metrics
function parseMetricToJSON(metrics) {

	if(metrics.constructor != Array) {
		metrics = [metrics];
	}

	var res = {};
	for(var i in metrics) {
		var obj = metrics[i];
		var name = obj.name;
		//Based on kura payload : DOUBLE = 0; FLOAT = 1; INT64 = 2; INT32 = 3; BOOL = 4; STRING = 5; BYTES = 6;
		switch (obj.type) {
			case 0 : var value = obj.double_value; break;
			case 1 : var value = obj.float_value; break;
			case 2 : var value = obj.int_value; break;
			case 3 : var value = obj.int_value; break;
			case 4 : var value = obj.bool_value; break;
			case 5 : var value = obj.string_value; break;
			case 6 : var value = obj.bytes_balue; break;
		}

		res[name] = value;
	}
	return res;
}

function startRestIntervalPoll() {
	setInterval(function(){
				updateAllSensors();
	}, 5000);

	// TODO: ELevatorSErvice publish  / subscribe
}
