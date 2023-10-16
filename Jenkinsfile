pipeline {
    agent any
        stages {
        stage('Checkout'){
            steps{
                git branch: 'main' , url: 'https://github.com/tekdi/shiksha-backend.git'   
          }
        }
    
        stage ('Build') {
            steps {
                        sh 'docker rm -f shiksha-backend'
                        sh 'docker rmi backend_main'
                        sh 'cd /var/lib/jenkins/workspace/Backend/'
                        sh 'docker-compose up -d'
                   }
            }
       }
}
