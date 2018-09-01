# eca-draft

Prerequisites:

- Oracle Cloud Account (DevCS, OCIR, OKE)
  - DevCS
  - OCIR
  - OKE - Microservices platform installed

Scenario:

- Design an API
  Follow the [Designing an API](tutorials/design.api.md) tutorial, to Design your API
- Implement microservice endpoint ([based on this blueprint](ticketService.apib))
  - [Prepare your DevCS environment and create builder template](tutorials/devcs.setup.md)
  - Create new project in DevCS - use this repository as source repository.
  - Create build job to init NodeJS application and package using Docker image and use Main_V1,js as application that is going to be executable in the docker image
  - Push containerized application to Docker Registry
- [Deploy and check the service V1 on Microservices Platform](tutorials/microservices.md)
- Create another build job in the DevCS that uses Main_V2.js as application, package using Docker and push to repository.
- [Deploy the service V2 on Microservices Platform](tutorials/microservices.md)
- Check that service is still being served fully by V1
- [Change the Istio rule to define canary deployment and define traffic percentages as 50/50 and check that half of the requests are being served by V1 and half by V2](tutorials/microservices.md)
- [Change the Istio rule to define canary deployment and define traffic percentages as 0/100 and check that all requests are being served by V2](tutorials/microservices.md)
- Register the service endpoint endpoint in Apiary

---

To simplify testing for a moment you don't need to setup DevCS. The apps are built and packaged into Docker images already
The two versions of container packaged application available at:
- [peternagy/eca-draft:1.0](https://hub.docker.com/r/peternagy/eca-draft/tags/)
- [peternagy/eca-draft:2.0](https://hub.docker.com/r/peternagy/eca-draft/tags/)

How to test

    $ docker pull peternagy/eca-draft:1.0
    $ docker run -d -p 3000:3000 peternagy/eca-draft:1.0

Invoke service endpoint using cURL (or other REST client tool):

    $ curl -i -X GET 'http://localhost:3000/tickets'
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json
    Date: Thu, 30 Aug 2018 00:07:08 GMT
    Connection: keep-alive
    Content-Length: 3266

    {"_items":[{"customer":"Krajcik Inc","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...
    ...

Stop the version 1.0 container:

    $ docker ps
    CONTAINER ID        IMAGE                     COMMAND                  CREATED             STATUS              PORTS                    NAMES
    21ecaaa5c2cc        peternagy/eca-draft:2.0   "node /pipeline/sour…"   4 seconds ago       Up 3 seconds        0.0.0.0:3000->3000/tcp   ecstatic_mirzakhani
    $ docker stop 21ecaaa5c2cc

Run the version 2.0 container:

    $ docker pull peternagy/eca-draft:2.0
    $ docker run -d -p 3000:3000 peternagy/eca-draft:2.0

    Invoke service endpoint using cURL (or other REST client tool):

    $ curl -i -X GET 'http://localhost:3000/tickets'
    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json
    Date: Thu, 30 Aug 2018 00:17:08 GMT
    Connection: keep-alive
    Content-Length: 3266

    {"_items":[{"customer":"MONAHAN LLC","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...
    ...

Please notify that in case of the second version the customer name is in uppercase.
