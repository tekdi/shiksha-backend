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
               
               git branch: 'main', credentialsId: 'github-1', url: 'https://github.com/tekdi/shiksha-backend.git'
                echo "Clone repository"
            
          }
        }
    
        stage ('Build') {
            
            steps {
                                    
                        sh 'docker build -t shiksha-backend:latest .'
                        sh 'docker rm -f shiksha-backend'
                        sh 'docker rmi backend_main:latest'
                   
                }
            }
         stage ('Deploy') {
            steps {
                dir('/root/shiksha-backend/'){

                        sh 'docker-compose up -d --force-recreate --no-deps'
                        sh 'docker images --no-trunc -aqf "dangling=true" | xargs docker rmi'
                  }
                }
            }

       }
}
