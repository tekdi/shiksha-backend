pipeline {
    agent any 
        stages {
        stage('Checkout'){
            steps{
                cleanWs()
                sh 'rm -rf *'
                //checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'githubtoken', url: 'https://github.com/tekdi/onest.network.backend.git']])
                  checkout scmGit(branches: [[name: '*/dev']], extensions: [], userRemoteConfigs: [[credentialsId: 'ONEST-ID', url: 'https://github.com/tekdi/onest.network.backend.git']])
          }
        }
        
        stage ('Build-image') {
            steps {  
                      sh 'docker build -t onest-network-backend-p-11 .' 
                   }
            }
       
       stage ('Deploy') {
            steps {
        
               
                      sh 'docker-compose up -d --force-recreate --no-deps backend' 
                   }
            }
       }
}
