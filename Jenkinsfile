pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building deltachat desktop communicator...'
                sh 'docker-compose build buildsection'
                sh 'docker-compose logs > build_result.txt'
            }
            post {
                success {
                    echo 'Successfull Build!'
                    script {
                        subject = "Succesfull Build!"
                    }
                }
                failure {
                    echo 'Failed Build!'
                    script {
                        subject = "Failure Build!"
                    }
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Testing deltachat desktop communicator...'
                sh 'docker-compose  build  testsection'
                sh 'docker-compose  up testsection'
                sh 'docker-compose logs > test_result.txt'
            }
            post {
                success {
                    echo "Success Test!"
                    script {
                        subject = "Successfull Test!"
                    }
                }
                failure {
                    echo "Failed Test!"
                    script {
                        subject = "Failed Test!"
                    }
                }
            }
        }
        stage('Deploy') {
            environment {
				CREDENTIALS = credentials('docker_credentials')
			}	
            steps {
                archiveArtifacts(artifacts: '**/*.txt', followSymlinks: false)
                echo 'Deploying deltachat desktop communicator...'
                sh 'docker-compose up -d buildsection'
                sh 'echo $CREDENTIALS_PSW | docker login -u $CREDENTIALS_USR --password-stdin'
                sh 'docker tag build-agent:latest cholewa-p/deltachat'
                sh 'docker push cholewa-p/deltachat'
            }
            post {
                success {
                    echo "Success Deploying!"
                    script {
                        subject = "Successfull Build, Test and Deploy!"
                    }
                }
                failure {
                    echo "Failed Deploying!"
                    script {
                        subject = "Failed Deploy!"
                    }
                }
            }
        }
    }
    post {
        always {
            sh 'docker logout'
            emailext attachLog: true, body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
            subject: "${subject} [${env.BUILD_NUMBER}]", to:'pawel.cholewa@o2.pl'
        }
    }
}