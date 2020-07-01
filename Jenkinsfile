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
                    sh "docker build -t stephen001/byondbot:latest . && docker push stephen001/byondbot:latest"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'master'
            }

            steps {
                container('kubectl') {
                    sh "echo ${env.BUILD_NUMBER} > deploy/build-number.env"
                    sh "kubectl apply -k deploy/"
                }
            }
        }
    }
}