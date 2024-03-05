pipeline {
    agent any

    stages {
        stage('SSH to UAT Server and Deploy') {
            steps {
                script {
                    sshagent(credentials: ['ssh-agent-uat']) {
                        sh """
                         //   ssh -o StrictHostKeyChecking=no -l ubuntu ${UAT_IP} << 'ENDSSH'
                            cd /home/jenkins
                            ./backend-deploy.sh
                        """
                    }
                }
            
            }
        }
    }
}
