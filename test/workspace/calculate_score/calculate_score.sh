#!/bin/bash


pause() {
    read -p "Press enter to continue"
}

confirm() {
    read -r -p "Are you sure? [y/N] " response
	case "$response" in
		[yY][eE][sS]|[yY])
			return
			;;
		*)
            exit 0
			;;
	esac
}

echo "Please make sure config.js has been set up."
confirm
echo "download student score"
pause
nodejs downloadcsv.js
nodejs mergeScore.js
echo "balance"
pause
nodejs balance.js
echo "build scale table"
pause
nodejs buildScaleTable.js
nodejs countScale.js
echo "apply scale table"
pause
nodejs applyScale.js
echo "upload score"
pause
nodejs uploadcsv.js
