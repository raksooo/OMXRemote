#!/bin/bash
youtube-dl -i "$1" -o 'downloads/youtube/%(autonumber)s.%(title)s.mp4'
