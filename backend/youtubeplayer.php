<?php
    $cmd = "tmux -S ../helpfiles/tmux_film_socket send-keys -t film \"omxyt " . escapeshellarg($_GET["yt"]) . "\" " . "C-m";
    shell_exec($cmd);
?>
