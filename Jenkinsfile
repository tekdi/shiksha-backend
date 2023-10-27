pipeline {
    agent any
        stages {
        stage('Checkout'){
            steps{
               // git branch: 'main' , url: 'https://github.com/tekdi/shiksha-backend.git'
                echo "Clone repository"
          }
        }
    
        stage ('Build') {
            steps {
                dir('/var/lib/jenkins/workspace/backend/'){
                    
                        sh 'docker rm -f shiksha-backend'
                        sh 'docker rmi backend_main:latest'
                      //  sh 'cd /var/lib/jenkins/workspace/backend/'
                        sh 'docker-compose up -d'
                   }
                }
            }
       }
}
