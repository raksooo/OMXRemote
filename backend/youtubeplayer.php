<?php
    $cmd = "tmux -S ../helpfiles/tmux_film_socket send-keys -t film \"sh www/film/backend/omxyt.sh " . escapeshellarg($_GET["yt"]) . "\" " . "C-m";
    shell_exec($cmd);
?>
