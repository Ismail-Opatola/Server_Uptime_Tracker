# 06 More Node APIs

## HTTP-2:

- stream web sockets
  - use node to create http3 stream, server and client


## VM
How to run abitrary javascript inside of a machine using node js

## UDP (Datagram)
it s part of the core P stack like the TCP, and the primary difference is you can think of most TCP/HTTP connections as handshakes, one node reaching out to another, you can think of them agreeing on a protocol ad sharing information btween them. UDP is more like one node sending-off information to another in hopes or on the assumption that the receiver migth receive it. UDP is like mailing a letter off to someone an d just asume that they are reading them. Weheras HTTP is more like initiating a phone call between two points and confirming that you're talking to each other. UDP is used often in streaming services, if you're streaming a video, then you've likely encountered UDP.

- build a very simple UDP server and UDP client 