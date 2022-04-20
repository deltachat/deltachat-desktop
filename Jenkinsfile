pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
               echo 'Build..'
               sh 'docker-compose up'
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
