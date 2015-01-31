<?php
	$files = Array();
	$dir = dir(dirname($_GET['path']));
	while (($file = $dir->read()) !== false) {
        if (is_dir($dir->path . "/" . $file) || strstr(mime_content_type($dir->path . "/" . $file), "video/")) {
		    $files[] = $file;
        }
	}
	sort($files, SORT_REGULAR);
	foreach ($files as $n => $file) {
                if ($dir->path . "/" . $file === $_GET['path']) {
			if ($files[$n-1] !== "..") {
				$prev = urlencode($dir->path . "/" . $files[$n-1]);
			}
			if ($n+1 < sizeof($files)) {
				$next = urlencode($dir->path . "/" . $files[$n+1]);
			}
		}
	}
    
    $subtitles = Array();
    $files = scandir($dir->path);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === "srt") {
            $subtitles[] = $dir->path . "/" . $file;
        }
    }
    $subtitles[] = "No subtitles";

    function sendKeys($string, $enter = false) {
        $cmd = "tmux -S helpfiles/tmux_film_socket send-keys -t film \"" . $string . "\" " . ($enter ? "C-m" : "");
        return shell_exec($cmd);
    }

    $status = file_get_contents("helpfiles/status");
    $playing = trim($status) !== "not playing";
    if ($playing && $_GET["path"] !== trim(file_get_contents("helpfiles/nowplaying"))) {
        file_put_contents("helpfiles/status", "not playing");
        sendKeys("q", false);
        sendKeys("", true);
        sleep(1);
    }
?>
<!DOCTYPE html>
<html>
<head>
<title><?=basename($_GET['path'])?></title>
<?php include("helpfiles/head/head.html"); ?>
<link href="styles/control.css" type="text/css" rel="stylesheet" />
<script src="scripts/moment.js" type="text/javascript"></script>
<script type="text/javascript">
var path = "<?=urlencode($_GET['path'])?>";
<?php
    if (isset($_GET["autonext"]) && isset($next)) {
        echo "var autonext = \"?path=" . $next . "&autonext\";";
    }
?>
</script>
<script src="scripts/control.js" type="text/javascript"></script>
</head>
<body onload="getStatus();setInterval(getStatus, 10000);<?php
    if (isset($_GET["autonext"])) {
        echo "action('play');";
    }
?>">

<?php if (sizeof($subtitles) > 1) {?>
    <div id="subs">
        <div class="content">
            <ul>
                <?php foreach ($subtitles as $sub) { ?>
                    <li onclick="setSub('<?=$sub?>')"><?=basename($sub)?></li>
                <?php } ?>
            <ul>
        </div>
    </div>
<?php } ?>

	<div id="control" class="content">
		<h1><?=basename($_GET['path'])?></h1>
<?php		if (isset($prev)) { ?>
			<span id="back"><a href="?path=<?=$prev?>">prev</a></span>
<?php		} ?>
		<span id="back"><a href="/">home</a></span>
<?php		if (isset($next)) { ?>
			<span id="back"><a href="?path=<?=$next?>">next</a></span>
<?php		} ?>
		<ul>
			<li onclick="action('play');">Play</li>
			<li onclick="action('pause');">Pause</li>
			<li onclick="action('stop');">Stop</li>
			<li onclick="action('Left');">&#x25c0;&#x25c0;</li>
			<li onclick="action('Right');">&#x25b6;&#x25b6;</li>
			<li class="nbe" onclick="action('%2B');">+</li>
			<li onclick="action('Down');">&#x25c0;&#x25c0;&#x25c0;</li>
			<li onclick="action('Up');">&#x25b6;&#x25b6;&#x25b6;</li>
			<li class="nbe" onclick="action('%2D');">-</li>
			<!-- <li class="nbe" onclick="action('i');">&#x21e4</li> -->
			<!-- <li class="nbe" onclick="action('o');">&#x21e5</li> -->
			<li class="nbe" onclick="action('s');">_</li>
			<li class="small" onclick="action('n');">&lt;_</li>
			<li class="small" onclick="action('m');">_&gt;</li>
			<li class="small marginbottom" onclick="action('d');">_--</li>
			<li class="small marginbottom" onclick="action('f');">_++</li>
			<li class="small tv" onclick="action('on');">On</li>
			<li class="small tv" onclick="action('off');">Off</li>
			<li class="small tv" onclick="action('pi');">Pi</li>
			<li class="small marginbottom tv" onclick="action('vup');">+</li>
			<li class="small marginbottom tv" onclick="action('vod');">-</li>
			<li class="small marginbottom tv" onclick="action('mute');">Mute</li>
<?php if (isset($next) && !isset($_GET["autonext"])) { ?>
            <li onclick="location.href='?path=<?=$_GET["path"]?>&autonext';">auto</li>
<?php } else if (isset($next)) { ?>
            <li onclick="location.href='?path=<?=$_GET["path"]?>';" style="background: #EDD8D8;">auto</li>
<?php } ?>
			<li id="status"<?php
                if (isset($next)) {
                    echo " style=\"width:60.8%;\"";
                }
            ?>></li>
		</ul>
<?php if ($_GET["path"] != "YouTube") { ?>
		<div id="timeControl">
			<span></span>
			<input type="range" id="time" min="0" disabled="disabled" />
			<span></span>
		</div>
<?php } ?>
	</div>
</body>
</html>
