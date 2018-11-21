pipeline {
  agent {
    docker {
      image 'deltachat/debian-stretch-node-11'
    }
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Unit Tests') {
      steps {
        sh 'npm test'
      }
    }
    stage('Integration Tests') {
      steps {
        sh '/usr/bin/xvfb-chromium &'
        sh 'sleep 5'
        sh 'export DISPLAY=:99'
        sh 'npm run test-integration'
      }
    }
    stage('Deploy') {
      when { branch 'master' }
      environment {
        GH_TOKEN = credentials('github-token')
      }
      steps {
        sh 'npm run dist'
      }
    }
  }
  post {
    always {
      sh 'rm -rf node_modules/ dist/'
    }
  }
}