#!/bin/bash
docker pull zhangsikai/chatroom;
docker container stop chatroom;
sleep 3;
docker run -d -p 60001:60001 --name chatroom zhangsikai/chatroom;
