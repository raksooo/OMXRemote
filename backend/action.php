<?php
if (substr($_SERVER['REMOTE_ADDR'], 0, 10) !== "192.168.1.") {
	die("Wrong wifi!");
}

require("time.php");

$actionReturns = Array(	"Left" => "Seek -30",
                        "Right" => "Seek +30",
                        "+" => "Volume up",
                        "-" => "Volume down",
                        "Down" => "Seek -600",
                        "Up" => "Seek +600",
                        "i" => "Previous chapter",
                        "o" => "Next chapter",
                        "s" => "Toggle subtitles",
                        "m" => "Next subtitle stream",
                        "n" => "Previous subtitle stream",
                        "d" => "Subtitle delay -250 ms",
                        "f" => "Subtitle delay +250 ms",
                        "tv on" => "TV powered on",
                        "tv off" => "TV in standby",
                        "tv pi" => "TV pi",
                        "tv vup" => "TV volume up",
                        "tv vod" => "TV volume down",
                        "tv mute" => "TV mute");

$path = $_GET["path"];
$status = file_get_contents("../helpfiles/status");
$playing = trim($status) !== "not playing";

$dir = dir(dirname($_GET['path']));

function changeStatus($newStatus) {
	global $status, $playing;

	$status = $newStatus;
	file_put_contents("../helpfiles/status", $status);
	$playing = $status !== "not playing";
}

function playingCheck() {
	global $playing;

	if (!$playing) {
		echo "Not playing!";
	}
	return $playing;
}

function sendKeys($string, $enter = false) {
	$cmd = "tmux -S ../helpfiles/tmux_film_socket send-keys -t film \"" . $string . "\" " . ($enter ? "C-m" : "");
	return shell_exec($cmd);
}

if ($_GET['action'] === "play") {
	if (!$playing) {
		changeStatus("playing");
		file_put_contents("../helpfiles/nowplaying", $path);
		echo "Playing";
		$cmd = "sh www/film/backend/omxplayer+status.sh " . escapeshellarg($path);
        if (isset($_GET["subtitles"])) {
            $cmd .= " " . escapeshellarg($_GET["subtitles"]);
        }
		sendKeys($cmd, true);
		startTime($path);
	} else if ($status !== "playing") {
        changeStatus("playing");
		echo "Playing";
		sendKeys("p");
		resumeTime();
        } else {
                echo "Already playing!";
        } 
} else if ($_GET['action'] === "pause" && playingCheck()) {
	if ($status !== "paused") {
		changeStatus("paused");
		echo "Paused";
		sendKeys("p");
		pauseTime();
	} else {
		echo "Already pasued!";
	}
} else if ($_GET['action'] === "stop" && playingCheck()) {
	echo "Stopped";
	sendKeys("q", false);
    sendKeys("", true);
} else if ($_GET['action'] !== "pause" && $_GET['action'] !== "stop" && playingCheck()) {
	echo $actionReturns[$_GET['action']];
	sendKeys($_GET['action']);
	switch($_GET['action']) {
		case "Left":
			stepTime(-30);
			break;
		case "Right":
			stepTime(30);
			break;
		case "Down":
			stepTime(-600);
			break;
		case "Up":
			stepTime(600);
			break;
        default:
            exec($_GET['action']);
	}
}
?>
