pipeline {
    agent any
    stages {
        stage('Build') 
	    {
            steps 
		    {
                echo 'Building deltachat desktop communicator...'
	    
           	}
           
    
        }
        stage('Test') {
            steps {
                echo 'Testing deltachat desktop communicator...'
              
            }
           
        }
        stage('Deploy') {
       	
            steps {

                echo 'Deploying deltachat desktop communicator...'
           }
	}
    post {
        always {
            
            emailext attachLog: true, body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
            subject: "${subject} [${env.BUILD_NUMBER}]", to:'pawel.cholewa@o2.pl'
        }
    }
}
