pipeline {
    agent any

    stages {
        stage('SSH to UAT Server and Deploy') {
            steps {
                script {
                    sshagent(credentials: ['Jenkins-agent']){
                        sh """
                            ssh -tt -o StrictHostKeyChecking=no -l root 143.110.179.209 << 'ENDSSH'
                            
                            cp -r /opt/oblf-backend/.env .
                            docker build -t backend-oblf-prod .
                            docker-compose up -d --force-recreate --no-deps
                        """
                    }
                }
            
            }
        }
    }
}
