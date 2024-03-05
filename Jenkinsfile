pipeline {
    agent any

    stages {
        stage('SSH to UAT Server and Deploy') {
            steps {
                script {
                    sshagent(credentials: ['Jenkins-agent']){
                        sh """
                            ssh -o StrictHostKeyChecking=no -l root 143.110.179.209 << 'ENDSSH'
                            cd /home/jenkins
                            ./backend-deploy.sh
                        """
                    }
                }
            
            }
        }
    }
}
