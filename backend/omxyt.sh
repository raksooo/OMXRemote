#!/bin/bash
clear
echo "playing" > www/film/helpfiles/status
echo "YouTube" > www/film/helpfiles/nowplaying
omxplayer -r -o hdmi $(youtube-dl -g "$1")
echo "not playing" > www/film/helpfiles/status
