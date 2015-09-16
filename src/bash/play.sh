#!/bin/sh
if [ $# -eq 2 ]
    then
        echo omxplayer -r -o hdmi "$1" --subtitles "$2" --no-ghost-box
    else
        echo omxplayer -r -o hdmi "$1" --no-ghost-box
fi

echo $(date +"%T") > done.txt
