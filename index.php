<?php 
if (!isset($_GET['path']) || is_dir($_GET['path'])) {
	include("browser.php");
} else if (is_file($_GET['path']) || $_GET['path'] === "YouTube") { 
	include("control.php");
}
?>
