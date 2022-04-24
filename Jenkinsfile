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
            post{
                success{
                    echo "Built successfully!"
                }
                failure{
                   echo "Build failed!"
                }
            }
        }
        stage('Test') {
            steps {

                sh '''
                echo 'Testing'
                docker-compose  build  test-agent
                docker-compose  up --force-recreate -d test-agent
                ''
            }
             post{
                success{
                    echo "Built successfully!"
                }
                failure{
                   echo "Build failed!"
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
