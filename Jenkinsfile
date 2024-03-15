pipeline {
    agent any 
        stages {
        stage('Checkout'){
            steps{
                cleanWs()
                sh 'rm -rf *'
                //checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'githubtoken', url: 'https://github.com/tekdi/onest.network.backend.git']])
                 // checkout scmGit(branches: [[name: '*/dev']], extensions: [], userRemoteConfigs: [[credentialsId: 'ONEST-ID', url: 'https://github.com/tekdi/onest.network.backend.git']])
                  checkout scmGit(branches: [[name: '*/Shiksha-2.0']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-1', url: 'https://github.com/tekdi/shiksha-backend.git']])   
            }
        }
        
        stage ('Build-image') {
            steps {  
                      sh 'docker build -t shiksha-backend-2.0 .' 
                   }
            }
       
       stage ('Deploy') {
            steps {
        
               
                      sh 'docker-compose up -d --force-recreate --no-deps backend' 
                   }
            }
       }
}