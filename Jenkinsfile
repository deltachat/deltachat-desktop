pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                docker-compose up
                docker-compose build
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
