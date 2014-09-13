var colors = ["#F5FFF5", "#EDD8D8"];
var cursors = ["default", "pointer"];

var subtitle = null;
function setSub(sub) {
    subtitle = sub;
    document.getElementById("subs").style.display = "none";
}

function action(action) {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET", "backend/action.php?path=" + path + "&action=" + action + (action == "play" && !(subtitle == null || subtitle == "null") ? "&subtitles=" + subtitle : ""), false);
	xmlhttp.send();
	if (xmlhttp.responseText.length > 0) {
		var div = document.getElementById("status");
		div.innerHTML = xmlhttp.responseText;
		div.style.background = colors[0];
		div.style.cursor = cursors[0];
		div.onclick = null;
	}
	getTime();
}

function getStatus() {
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET", "backend/status.php?status&path=" + path, false);       
	xmlhttp.send();
	var status = JSON.parse(xmlhttp.responseText);
	var div = document.getElementById("status");
	div.innerHTML = status["text"];
	div.style.background = colors[status["style"]];
	div.style.cursor = cursors[status["style"]];
	if (!status["status"]) {
		div.onclick = function() {
			location.href = "?path=" + status["href"];
		};
	} else {
		getTime();
	}
}

function getTime() {
	var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var time = JSON.parse(xmlhttp.responseText);
            var range = document.getElementById("time");
            range.setAttribute("max", time["duration"].trim());
            range.value = time["time"];

            if (time["time"] > time["duration"] && autonext.length > 0) {
                location.href = autonext;
            }

            var format_time, format_duration;
            if (time["time"] > 3600) {
                format_time = "h:mm:ss";
            } else {
                format_time = "mm:ss";
            }
            if (time["duration"] > 3600) {
                format_duration = "h:mm:ss";
            } else {
                format_duration = "mm:ss";
            }

            range.previousSibling.previousSibling.innerHTML = moment().startOf('day')
                                                                        .seconds(time["time"])
                                                                        .format(format_time);
            range.nextSibling.nextSibling.innerHTML = moment().startOf('day')
                                                                .seconds(time["duration"])
                                                                .format(format_duration);

        }
    }
	xmlhttp.open("GET", "backend/status.php?time&path=" + path, true);       
	xmlhttp.send();
}
