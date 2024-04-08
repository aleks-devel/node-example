#!/bin/bash

case $1 in
start)
    tmux new-session -d -s "docker-dev-session" 'bash --init-file <(
      docker network create -d bridge --attachable global-network
      set -a && . ./.env && set +a
      docker compose -p nda -f ./packages/client/docker-compose.dev.yml up -d
      docker compose -p nda -f ./packages/server/docker-compose.dev.yml up -d
      docker compose -p nda -f ./docker-compose.dev.yml up -d
      tmux splitw -h "docker logs --since 1m -f nda-app-server-1"
      docker logs --since 1m -f nda-app-client-1
    )'

    tmux attach-session -t "docker-dev-session"
  ;;
stop)
    docker compose -p amberrie -f ./packages/client/docker-compose.dev.yml down
    docker compose -p amberrie -f ./packages/server/docker-compose.dev.yml down
    docker compose -p amberrie -f ./docker-compose.dev.yml down
  ;;
*)
  echo "Команды: start, stop"
  ;;
esac