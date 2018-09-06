# eca-draft

Prerequisites:

- Oracle Cloud Account (DevCS, OCIR, OKE)
  - DevCS
  - OCIR
  - OKE - Microservices platform installed

Scenario:

- [Designing an API](tutorials/design.api.md)
- [Define a DevCS Project and add members and issues to a sprint](tutorials/DevCS.md)
- Add a git repository to your project - use this repository as source repository.
  - Create build job to init NodeJS application and package using Docker image and use Main_V1,js as application that is going to be executable in the docker image
  - Push containerized application to Docker Registry
- [Deploy and check the service V1 on Microservices Platform](tutorials/microservices.md#deploy-and-check-the-service-v1-on-microservices-platform)
- Create another build job in the DevCS that uses Main_V2.js as application, package using Docker and push to repository.
- [Deploy the service V2 on Microservices Platform](tutorials/microservices.md#deploy-and-check-the-service-v2-on-microservices-platform)
- [Check that service is still being served fully by V1](tutorials/microservices.md#check-that-service-is-still-being-served-fully-by-v1)
- [Change the Istio rule to define canary deployment and define traffic percentages as 50/50 and check that half of the requests are being served by V1 and half by V2](tutorials/microservices.md#change-the-istio-rule-to-define-canary-deployment-and-define-traffic-percentages-as-5050-and-check-that-half-of-the-requests-are-being-served-by-v1-and-half-by-v2)
- [Change the Istio rule to define canary deployment and define traffic percentages as 0/100 and check that all requests are being served by V2](tutorials/microservices.md#change-the-istio-rule-to-define-canary-deployment-and-define-traffic-100-to-v2-and-check-that-all-requests-are-being-served-by-v2)
- [Creating an API Policy Implementation](tutorials/create.api.md)
- [Deploy API](tutorials/deploy.api.md)

