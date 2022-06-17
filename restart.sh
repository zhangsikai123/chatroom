#!/bin/bash
docker pull zhangsikai/chatroom;
docker container stop chatroom;
docker container rm chatroom;
docker run -d -p 60001:60001 --name chatroom zhangsikai/chatroom;
