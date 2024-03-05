pipeline {
    agent any

    stages {
        stage('SSH to UAT Server and Deploy') {
            steps {
                script {
                    sshagent(credentials: ['Jenkins-agent']){
                        sh """
                            sudo ssh -o StrictHostKeyChecking=no -l root 143.110.179.209 << 'ENDSSH'
                            'echo Hello, remote world!'
                            sh 'cp -r /opt/oblf-backend/.env .'
                            sh 'docker build -t backend-oblf-prod .'
                            sh 'docker-compose up -d --force-recreate --no-deps'
                        """
                    }
                }
            
            }
        }
    }
}
