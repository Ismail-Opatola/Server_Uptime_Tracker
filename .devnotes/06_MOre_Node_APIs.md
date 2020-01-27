# 06 More Node APIs

## HTTP-2:

- stream web sockets
  - use node to create http3 stream, server and client

## VM

How to run abitrary javascript inside of a machine using node js

## UDP (Datagram)

it s part of the core P stack like the TCP, and the primary difference is you can think of most TCP/HTTP connections as handshakes, one node reaching out to another, you can think of them agreeing on a protocol ad sharing information btween them. UDP is more like one node sending-off information to another in hopes or on the assumption that the receiver migth receive it. UDP is like mailing a letter off to someone an d just asume that they are reading them. Weheras HTTP is more like initiating a phone call between two points and confirming that you're talking to each other. UDP is used often in streaming services, if you're streaming a video, then you've likely encountered UDP.

- build a very simple UDP server and UDP client

## TCP (Net)

One of the things node is useful but not commonly used for building low-level networking applications. It exposes the TCP stack to you so you do not need to build http applications if you don't want to, You can drop down to the level of TCP and bind to sockets and write messages back and forth all you want.

- Create a TCP server and client to see how you can go about building a low-level networking application

## TLS/SSL

A subset of the Net module that adds on SSL/TLS encryption to request apis

## REPL

build a simple cli easily with REPL instead of using the readeline module and console log used in our previous cli app

## Async Hooks

Track the lifecycle of asynchronous operations. So as prevoiusly we used performance hooks to be able to log out at what time certain procedures were happening, async hooks lets you automatically know when an async function is initialised, it would htell you right before it gets called, right after it gets called, when it gets distroyed, or if its a promise when the promise get resolved.

If you're trying to debug and figure-out when certain things are happening or you just are unsure some randome lib is calling some other function you can use async hooks to track whether or not a certain function is getting called, when its getting initialised etc.

when you're debugging async-hooks can help you pin-point where and issue migth be.


