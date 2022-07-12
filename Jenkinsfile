pipeline {
    agent any

    stages {
        stage('Build and push image') {
            tools {
                dockerTool 'docker'
            }

            steps{
                script {
                    docker.withTool('docker') {
                        docker.withRegistry("", 'docker-hub-bot') {
                            def imageName = "squarecookie/grafana-custom-brand:$DOCKER_IMAGE_VERSION_PREFIX.$BUILD_NUMBER"
                            def dockerFileDir = "./"

                            def customImage = docker.build(imageName, dockerFileDir)
                            /* Push the container to the custom Registry */
                            customImage.push()
                            sh "docker rmi $imageName"
                            cleanWs()
                        }
                    }
                }
            }
        }
    }
}
