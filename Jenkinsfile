pipeline {
    agent any
        stages {
         stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Checkout'){
            
            steps{
               
            //   git branch: 'main', credentialsId: 'github-1', url: 'https://github.com/tekdi/shiksha-backend.git'
                 checkout scmGit(branches: [[name: '*/prod-oblf']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-backend', url: 'https://github.com/tekdi/shiksha-backend.git']])
                
                echo "========================== ***Repository cloned Successfully*** =========================="
            
          }
        }
    
        stage ('Build&Deploy') {
            
            steps {
                                    
                        sh 'cp -r /home/prasad/backend-oblf/.env .'
                        sh 'docker build -t backend-oblf-dgocean .'
                        sh 'docker-compose up -d --force-recreate --no-deps'
                }
            }

       }
}
