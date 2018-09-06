# Implement API endpoint and complete canary deployment on Microservices using Oracle Developer Cloud Service

## Lab Overview
In this lab you’ll learn how to leverage Oracle Developer Cloud Service to build container packaged application (API endpoint), push to Oracle Cloud Infrastructure Registry finally deploy to Microservices platform using build jobs. The key steps are the following:

1. Create container repository using Oracle Cloud Infrastructure Registry to store container packaged services (V1, V2)
2. Create build job to package service V1 in container and push to container registry
3. Deploy service V1 to Microservices platform and test
4. Create build job to package service V2 in container and push to container registry
5. Deploy service V2 to Microservices platform
6. Check that service is still being served fully by V1
7. Change the Istio rule to define canary deployment and define traffic percentages as 50/50 and check that half of the requests are being served by V1 and half by V2
8. Change the Istio rule to define canary deployment and define traffic percentages as 0/100 and check that all requests are being served by V2

## Prerequisites

- [DevCS project contains application source code repository](DevCS.md)
- Microservices platform running on Oracle Kubernetes Engine
- Access to OCI-OKE console

### 1. Create container repository using Oracle Cloud Infrastructure Registry to store container packaged services

Open your OCI console and from the left navbar choose Developer Services than select Registry(OCIR).

![](images/ocir/01.oci.console.png)

Click Create Repository.

![](images/ocir/02.create.repository.png)

Fill out the following:
-	Repository Name: eca-<compartment-name\>

  For example **eca-c001**
-	Access: Private

Click Submit.

![](images/ocir/03.repository.details.png)

Verify the repository.

![](images/ocir/04.repository.ready.png)

### 2. Create build job to package service V1 in container and push to container registry

Open your DevCS project and from the left navbar choose Build. Click +New Job to create a build job.

![](images/build.jobs/01.build.jobs.png)

Fill out the following:
-	Job Name: build_service_V1
-	Description: build and store service V1
-	Create New: yes
-	Software Template: eca-template

Click Create Job.

![](images/build.jobs/02.build.v1.png)

The build job configuration opens. On the first Source Control tab click Add Source Control and select Git. From the Repository dropdown list select the source code repository for service V1. Check the box to "Automatically perform build on SCM change", this will automate the flow so every time code is changed in your Git repostiory a build will start.

![](images/build.jobs/03.build.v1.git.png)

Change to Builders tab and define the build steps. Add your first step by clicking on Add Builder button. Select Docker Builder than Docker login.

![](images/build.jobs/04.build.v1.docker.login.png)

Fill out the following:
-	Registry Host: phx.ocir.io
-	Username: showitbuildit1/aura
-	Password: Auth token (shared by the instructor)

![](images/build.jobs/05.build.v1.docker.login.details.png)

Click again the Add Builder and select Docker build.

![](images/build.jobs/06.build.v1.docker.build.png)

Fill out the following:
-	Registry Host: <region-code\>.ocir.io
-	Image name: <oci-tenant\>/<repository-name\> (what you created above)
-	Version Tag: 1.0
- Context Root in Workspace: yes
- Dockerfile: Dockerfile_V1

![](images/build.jobs/07.build.v1.docker.build.details.png)

Click again the Add Builder and select Docker push.

![](images/build.jobs/08.build.v1.docker.push.png)

Fill out the following:
-	Registry Host: <region-code\>.ocir.io
-	Image name: <oci-tenant\>/<repository-name\> (what you created above)
-	Version Tag: 1.0

![](images/build.jobs/09.build.v1.docker.push.details.png)

Click Save.

![](images/build.jobs/10.build.v1.save.png)

Click on Build now.

![](images/build.jobs/11.build.v1.start.png)

You don't need to wait for the result if there is no available Executor. You can continue with the following step and get back to verify when the job is completed.

### 3. Deploy service V1 to Microservices platform and test

To deploy service V1 to Microservices you will use Build Job again to avoid `kubectl` installation and configuration to your desktop.

But before move to the Build Job creation you need to collect your OCI and OKE instance details to configure `kubectl` which will be executed in the build environment. You need to have the following information:

- User OCID
- Private pair of your API key (provided by instructor)
- Fingerprint of API key (provided by instructor)
- Tenancy OCID
- Cluster OCID

To get these information login to your [OCI tenant](https://console.us-phoenix-1.oraclecloud.com/) as non-federated user (right side) using your credentials. The tenant name also shared by the instructor.

Click on the user icon on the top right corner and select User Settings.

![](images/build.jobs/12.user.settings.png)

Click link Copy next to OCID label in the User Information area to copy User OCID to clipboard. Note the User OCID. At the bottom of the page select and copy Tenancy OCID to your notes.

![](images/build.jobs/13.user.tenancy.ocid.png)

Now get the Cluster OCID. Open OKE console.

![](images/build.jobs/14.cluster.ocid.png)

Select your compartment and click on your cluster.

![](images/build.jobs/14.cluster.details.png)

Click Copy link next to the Cluster Id label on the Cluster Details area. Note your Cluster OCID.

![](images/build.jobs/14.cluster.ocid.copy.png)

Now you have the necessary details to setup OCIcli within build environment. Switch back to your DevCS project to create the next build job.

In your DevCS project from the left navbar choose Build. Click +New Job to create a build job.

![](images/build.jobs/01.build.jobs.png)

Fill out the following:
-	Job Name: deploy_service_V1
-	Description: deploy service V1
-	Create New: yes
-	Software Template: eca-template

Click Create Job.

![](images/build.jobs/15.deploy.v1.create.png)

The build job configuration appears. On the first Source Control tab click Add Source Control and select Git. From the Repository dropdown list select the source code repository for service V1.

![](images/build.jobs/16.deploy.v1.git.png)

Change to Builders tab and define the build steps. Add your first step by clicking on Add Builder button. Select OCIcli Builder.

![](images/build.jobs/17.deploy.v1.builders.ocicli.png)

Fill out the following:
-	User OCID: <user-ocid\> what you find and noted previously
-	Fingerprint: shared by instructor
-	Tenancy: <tenancy-ocid\> what you find and noted previously
-	Private Key: shared by instructor
- Region: US_Ashburn_1 ("us-ashburn-1")

![](images/build.jobs/18.deploy.v1.builders.ocicli.details.b.png)

The builder step above configures the OCIcli tool. In the next step a script (available in the repository) will download the `kubectl` configuration file. Add Unix Shell Builder.

![](images/build.jobs/19.deploy.v1.builders.shell.png)

Copy the following commands to the script text area. Please replace the <cluster-ocid\> parameter to your Cluster OCID.

    mkdir -p $HOME/.kube

    export ENDPOINT="containerengine.us-phoenix-1.oraclecloud.com"

    ./get-kubeconfig.sh <cluster-ocid> > $HOME/.kube/config

    kubectl get nodes

Add another Unix Shell Builder which will execute the service V1 deployment. Copy the following commands into the script area. Don't forget to replace <compartment-name\> and <auth-token\> properly.

    export COMPARTMENT="<compartment-name>"
    envsubst < kubernetes/ecadraft1.yaml > kubernetes/ecadraft1.final.yaml

    cat kubernetes/ecadraft1.final.yaml

    kubectl create secret docker-registry regcred --docker-server=phx.ocir.io --docker-username=showitbuildit1/aura --docker-password=<auth-token> --docker-email=aura@acme.com; echo 'secret step'

    kubectl apply -f kubernetes/ecadraft1.final.yaml

    sleep 5

    export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')

    export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT
    echo 'GATEWAY_URL'
    echo $GATEWAY_URL

    kubectl apply -f kubernetes/ecadraft-virtual-service-v1.yaml

Click Save and execute the deploy_service_V1 build job.

The step above will also print the GATEWAY_URL (API endpoint) for you. Once the job completed check the log. Click on the log icon and find the GATEWAY_URL value. It has to be a public IP address and port. When you have that execute the following `curl` command to test the application:

    $ curl -HHost:ecadraft.example.com http://<GATEWAY_URL>/tickets
    {"_items":[{"customer":"Krajcik Inc","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...

### Bonus: Define pipelines in Developer Cloud Service

Now that you have two build jobs, one for building and another for deploying the service, you can connect the two into a single flow pipeline. This way you can automate the deployment of new versions whenever a build happens.

1. In Developer Cloud Service, click the build section in the left side menu, and switch to the "Pipelines" tab.
2. Click "New Pipelines" to create a new pipeline and give it a name "DockerFlow"
3. Drag the two jobs into the diagram. Connect them with an arrow so when the build job finishes it auomtatically invokes the deploy job.
4. You can directly run this flow, or set the flow to start auotmatically when one of the jobs starts.

![](/tutorials/DevcsImages/Picture8.png)


### 4. Create build job to package service V2 in container and push to container registry

Create new build job.

Fill out the following:
-	Job Name: build_service_V2
-	Description: build and store service V2
-	Copy existing job: build_service_V1
-	Software Template: eca-template

Click Create.

Click on the new build_service_V2 job to configure. Switch to the Builders tab and modify the followings:

- Version Tag (every location): 1.0 -> 2.0
- Dockerfile: Dockerfile_V1 -> Dockerfile_V2

Click Save than Build Now.

![](images/build.jobs/30.deploy.v2.builders.changes.png)

When the job finished verify the V2 image in your repository.

### 5. Deploy service V2 to Microservices platform

Create new build job.

Fill out the following:
-	Job Name: deploy_service_V2
-	Description: deploy service V2
-	Copy existing job: deploy_service_V1
-	Software Template: eca-template

Click Create.

Click on the new deploy_service_V2 job to configure. Switch to the Builders tab and modify the followings in the last Unix Shell Builder Step:

- ecadraft1.yaml -> ecadraft2.yaml
- ecadraft1.final.yaml -> ecadraft2.final.yaml
- Delete: kubectl apply -f kubernetes/ecadraft-virtual-service-v1.yaml

Click Save than Build Now.

### 6. Check that service is still being served fully by V1

Using the curl command above check multiple times that 100% traffic showing V1:

    $ curl -HHost:ecadraft.example.com http://<GATEWAY_URL>/tickets
    {"_items":[{"customer":"Krajcik Inc","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...

### 7. Change the Istio rule to define canary deployment and define traffic percentages as 50/50 and check that half of the requests are being served by V1 and half by V2

Create new build job.

Fill out the following:
-	Job Name: canary-deploy-50-50
-	Copy existing job: deploy_service_V1
-	Software Template: eca-template

Click Create.

Click on the new canary-deploy-50-50 job to configure. Switch to the Builders tab and modify the the last Unix Shell Builder Step to contain this single command:

    kubectl apply -f kubernetes/ecadraft-virtual-service-50-50.yaml

Click Save than Build Now.

Once the deployment completed check 50% - 50% V1 & V2 content using the curl command:

    $ curl -HHost:ecadraft.example.com http://<GATEWAY_URL>/tickets
    {"_items":[{"customer":"Krajcik Inc","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...
    ...
    $
    $ curl -HHost:ecadraft.example.com http://<GATEWAY_URL>/tickets
    {"_items":[{"customer":"MONAHAN LLC","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...

Please note the V2 provides customer name in uppercase.

### 8. Change the Istio rule to define canary deployment and define traffic percentages as 0/100 and check that all requests are being served by V2

Create new build job.

Fill out the following:
-	Job Name: canary-deploy-v2-100
-	Copy existing job: deploy_service_V1
-	Software Template: eca-template

Click Create.

Click on the new canary-deploy-v2-100 job to configure. Switch to the Builders tab and modify the the last Unix Shell Builder Step to contain this single command:

    kubectl apply -f kubernetes/ecadraft-virtual-service-v2.yaml

Click Save than Build Now.

Once the deployment completed check that all request served by V2 (uppercase customer name) using the curl command:

    $ curl -HHost:ecadraft.example.com http://<GATEWAY_URL>/tickets
    {"_items":[{"customer":"MITCHELL - ROLFSON","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...
    ...
    $
    $ curl http://$GATEWAY_URL/tickets
    {"_items":[{"customer":"MONAHAN LLC","status":"Resolved","product":"Licensed Wooden Salad","_id":"25ccbcc4-a989-4334-a341-fcc18e4efced"...

Please note every requests get the customer name in uppercase.
