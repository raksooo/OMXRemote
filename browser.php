<?php
$localpath = "/home/" . get_current_user() . "/downloads/";

if (isset($_GET['path']) && $_GET['path']{strlen($_GET['path'])-1} !== "/") {
	$_GET['path'] .= "/";
}
$dir = dir(isset($_GET['path']) ? $_GET['path'] : $localpath);

$files = Array();
while (($file = $dir->read()) !== false) {
    if (is_dir($dir->path . $file) || strstr(mime_content_type($dir->path . $file), "video/")) {
	    $files[] = $file;
    }
}
sort($files, SORT_REGULAR);
?>
<!DOCTYPE html>
<html>
<head>
<title>film.raksooo.se</title>
<?php include("helpfiles/head/head.html"); ?>
<link href="styles/browser.css" type="text/css" rel="stylesheet" />
<?php if (file_exists("download.html")) { ?>
<link href="styles/download.css" type="text/css" rel="stylesheet" />
<script src="scripts/download.js" type="text/javascript"></script>
<?php } ?>
</head>
<body>
	<h1><?=$dir->path?></h1>
<?php
		$nowplaying = trim(str_replace("\ ", " ", file_get_contents("helpfiles/nowplaying")));
		if (dirname($dir->path) === dirname($localpath)) { ?>
                	<div id="nowplaying" onclick="location.href='?path=<?=urlencode($nowplaying)?>';"><strong>Remote/now playing</strong></div>
<?php	} ?>
        <ul>
<?php	if (dirname($dir->path) !== dirname($localpath)) { ?>
                <li class="folder" onclick="location.href='?path=<?=urlencode(dirname($dir->path))?>';">../</li>
<?php	}
	foreach ($files as $file) {
		if ($file !== "." && $file !== "..") {
			echo "<li";
			if (is_dir($dir->path . $file)) {
				echo " class=\"folder\"";
			}
			echo " onclick=\"location.href='?path=" . urlencode($dir->path) . urlencode($file) . "';\">" . $file . "</li>";
		}
	}
?>
        </ul>

<?php
    if (dirname($dir->path) === dirname($localpath) && file_exists("download.html")) {
        include("download.html");
    }
?>
</body>
</html>
