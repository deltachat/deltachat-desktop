pipeline {
  agent {
    docker {
      image 'deltachat/linux-stretch-node-11:1.1'
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
      environment {
        GH_TOKEN = credentials('github-token')
      }
      steps {
        sh 'npm run dist'
      }
    }
  }
}