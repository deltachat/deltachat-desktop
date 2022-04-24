pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
        
                sh '''
                echo 'Build '
                docker-compose  build  build-agent
                '''
            }
                  
            post {
                success {
                    echo 'Success BUILD!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Success Jenkins Build",
                    to: 'adrian.dabrowski199@gmail.com'
                }
            
                failure {
                    echo 'Success BUILD!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Failed Jenkins Build",
                    to: 'adrian.dabrowski199@gmail.com'
                }
            }
        }
        stage('Test') {
            steps {
                sh '''
                echo 'Testing'
                docker-compose  build  test-agent
                docker-compose  up --force-recreate -d test-agent
                '''
            }
               post {
                success {
                    echo 'Success TESTS!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Success Jenkins Tests",
                    to: 'adrian.dabrowski199@gmail.com'
                }
            
                failure {
                    echo 'Failure TESTS!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Failed Jenkins Tests",
                    to: 'adrian.dabrowski199@gmail.com'
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
