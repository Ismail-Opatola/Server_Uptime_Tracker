# Performance and scalability

## Gaining Performance

Ways to scale the application in order to make it less resource intensive an d able to scale a bit more

we'll be looking into:

- our use of the file system as a data store and whats some scalable alternatives would be
- node's performance hooks module
  - examples on how ypu can use the performance hooks to benchmark your code and time the execution of soe function etc.
- cluster module
  - the cluster module is importatnt if you would like to take advantage of all the cpus available on your machine. By default node runs on one thread which is usesing up jthe resources of one of your cpus. on many machines you have multiple cores available, node by default is not going to take advantage of those cores unless you explicitly tell it to do so. we are going to buil out some examples using cluster, we're going to spread the logic of this application across all the cores available on the machine that we're building on but the method in which we use would be adaptable to any machine no matter how many cores you have avilable
- child processes
  - in many times, especialy as its pertains to performance it would make sense not to perform certain logic in node but to call some other application that can do the work faster e.g some compiled C or c++ binary that you might have living on the machine, for those kind of situations you need to drop down into the shell and then call those binaries yourself. The node child process module allows you to do that. We're going to do some examples with child peocess that let you call some other kind of application living on the machine

All the above shoulmd give you a pretty good overview of how performance tweaking can be performed in node.
