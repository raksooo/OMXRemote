<?php
	$timefile = "../helpfiles/time";

	function writeTime($time) {
		global $timefile;

		file_put_contents($timefile, json_encode($time));
	}

	function getTime() {
		global $timefile;

		return json_decode(file_get_contents($timefile), true);
	}

	function getVisualTime() {
		$time = getTime();
		$current = Array();
		$current["time"] = (isset($time["paused"]) ? $time["paused"] : time()) - $time["start"];
		$current["duration"] = $time["duration"];
		return $current;
	}

	function startTime($path) {
		$cmd = "ffmpeg -i '" . $path . "' 2>&1 | grep \"Duration\"| cut -d ' ' -f 4 | sed s/,// | sed 's@\..*@@g' | awk '{ split($1, A, \":\"); split(A[3], B, \".\"); print 3600*A[1] + 60*A[2] + B[1] }'";
		$duration = trim(shell_exec($cmd));
		$time = Array("start" => time(), "duration" => $duration);
		writeTime($time);
	}

	function pauseTime() {
		$time = getTime();
		$time["paused"] = time();
		writeTime($time);
	}

	function resumeTime() {
		$time = getTime();
		$time["start"] += time() - $time["paused"];
		unset($time["paused"]);
		writeTime($time);
	}

	function stepTime($step) {
		$time = getTime();
		$time["start"] -= $step;
		writeTime($time);
	}
?>
