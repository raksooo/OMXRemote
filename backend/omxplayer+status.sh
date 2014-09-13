#!/bin/sh
if [ $# -eq 2 ]
    then
        omxplayer -r -o hdmi "$1" --subtitles "$2" --no-ghost-box
    else
        omxplayer -r -o hdmi "$1" --no-ghost-box
fi
echo "not playing" > www/film/helpfiles/status
