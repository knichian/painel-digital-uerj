#!/bin/sh

SESSION_NAME='painel-uerj'

tmux new-session -d -s "${SESSION_NAME}"

tmux new-window -t "${SESSION_NAME}" -n 'server'
tmux new-window -t "${SESSION_NAME}" -n 'client'

tmux send-keys -t "${SESSION_NAME}:server" 'cd server && source ${HOME}/.nvm/nvm.sh && nvm install 20 && node index.js' Enter
tmux send-keys -t "${SESSION_NAME}:client" 'cd client &&  source ${HOME}/.nvm/nvm.sh && nvm install 20 && npm run build && npm run preview -- --host' Enter

