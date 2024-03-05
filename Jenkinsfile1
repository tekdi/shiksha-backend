pipeline {
    agent {
        label 'oblf-139.59.50.217'
    }
        stages {
         stage('clean workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Checkout'){
            
            steps{
                checkout scmGit(branches: [[name: '*/prod-oblf']], extensions: [], userRemoteConfigs: [[credentialsId: 'Jenkins-github', url: 'https://github.com/tekdi/shiksha-backend.git']])
                echo "========================== ***Repository cloned Successfully*** =========================="
            
          }
        }
    
        stage ('Build&Deploy') {
            
            steps {
                                    
                        sh 'cp -r /opt/oblf-backend/.env .'
                        sh 'docker build -t backend-oblf-prod .'
                        sh 'docker-compose up -d --force-recreate --no-deps'
                }
            }

       }
}
