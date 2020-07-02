pipeline {
    agent {
        kubernetes {
            defaultContainer 'jnlp'
            yamlFile 'agent.yaml'
        }
    }

    stages {
        stage('Build and Push') {
            when {
                branch 'master'
            }

            steps {
                container('docker') {
                    sh "docker build -t byond/byondbot:latest . && docker push byond/byondbot:latest"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }

            steps {
                container('kubectl') {
                    sh "echo BUILD_NUMBER=${env.BUILD_NUMBER} > deploy/build-number.env"
                    sh "kubectl apply -k deploy/"
                }
            }
        }
    }
}