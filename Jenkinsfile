pipeline {
    agent any

    stages {
        stage('SSH to UAT Server and Deploy') {
            steps {
                script {
                    sshagent(credentials: ['Jenkins-agent']){
                        sh """
                            ssh  -o StrictHostKeyChecking=no -l root 143.110.179.209 << 'ENDSSH'
                            cd /home/jenkins
                            git clone -b prod-oblf https://github.com/tekdi/shiksha-backend.git
                            docker build -t backend-oblf-prod .
                            docker-compose up -d --force-recreate --no-deps
                        """
                    }
                }
            
            }
        }
    }
}
