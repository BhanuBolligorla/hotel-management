#!/bin/bash

# Nexus repository details
NEXUS_URL="http://3.236.243.28:8081/repository/maven-releases/"
ARTIFACT_NAME="hotel-management-${BUILD_NUMBER}.zip"
BUILD_DIR="../build"

# Zip the React build
cd $BUILD_DIR
zip -r $ARTIFACT_NAME .

# Upload artifact to Nexus using curl
curl -v -u $NEXUS_USR:$NEXUS_PSW \
     --upload-file $ARTIFACT_NAME \
     $NEXUS_URL$ARTIFACT_NAME

echo "Artifact uploaded to Nexus: $NEXUS_URL$ARTIFACT_NAME"
