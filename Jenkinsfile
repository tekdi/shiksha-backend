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
    
        stage ('Build&Deploy') {
            
            steps {
                                    
                        sh 'cp -r /shiksha/.env .'
                        sh 'docker-compose up -d --force-recreate --no-deps'
                }
            }

       }
}
