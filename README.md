# Workshop Docker and Kubernetes
* REST API with NodeJS
* Database with PostgreSQL
* Build with Docker
* Deploy with Kubernetes
  * Pod
  * Service
  * Deployment and ReplicaSet
  * ConfigMap and Secret
  * Volume and Persistent volume


## Build image with docker compose
```
$docker compose build app
```

## Create containers with docker compose
* app
* db
```
$docker compose up -d
$docker compose ps
NAME                         IMAGE                      COMMAND                  SERVICE   CREATED          STATUS                    PORTS
demo-nodejs-postgres-app-1   demo-nodejs-postgres-app   "docker-entrypoint.s…"   app       52 seconds ago   Up 33 seconds             0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
demo-nodejs-postgres-db-1    postgres:18                "docker-entrypoint.s…"   db        2 minutes ago    Up 38 seconds (healthy)   5432/tcp
```

## Push image to docker hub
```
$docker compose push
```