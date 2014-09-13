<?php
	require("time.php");

	function active() {
		$path = $_GET['path'];
		return $path === trim(file_get_contents("../helpfiles/nowplaying"));
	}

	function getTextStatus() {
		switch(trim(file_get_contents("../helpfiles/status"))) {
			case "not playing":
				if (active()) {
					return "Last played";
				} else {
					return "Not playing";
				}
				break;
			case "playing":
				if (active()) {
					return "Playing";
				} else {
					return "Other playing";
				}
				break;
			case "paused":
				if (active()) {
					return "Paused";
				} else {
					return "Other playing";
				}
				break;
		}
	}

	function getStyle() {
		return active() ? "0" : "1";
	}

	function getHref() {
		return urlencode(trim(file_get_contents("../helpfiles/nowplaying")));
	}

	if (isset($_GET["status"])) {
		echo json_encode(Array(	"status" => active(), 
					"text" => getTextStatus(), 
					"style" => getStyle(), 
					"href" => getHref()));
	} else if (isset($_GET["time"])) {
		echo json_encode(getVisualTime());
	}
?>
