#installing node slim for minimal base image
FROM node:23-slim

USER root

RUN apt-get update

RUN apt-get install curl -y
# Declare build argument (used during build)
ARG NODE_ENV=development
# Persist NODE_ENV for runtime
ENV NODE_ENV=${NODE_ENV}
#setting default user as node for container to avoid ROOT user fallback
USER node

#setting working
WORKDIR /opt/abacus-rest-api

#copying the package.json and package-lock.json
COPY --chown=node:node package.json package-lock.json* ./
#clean installing packages based upon the enviroment if the production enviroment then
#install production dependencies

RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm ci; \
    fi && npm cache clean --force
    
COPY --chown=node:node . .

##CMD and ENTRYPOINT is not required as it startup command is depended upon the
##enviroment 