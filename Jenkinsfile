pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
        
                sh '''
                echo 'Build..'
                docker-compose build --no-cache
                docker-compose up
                '''
   
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
