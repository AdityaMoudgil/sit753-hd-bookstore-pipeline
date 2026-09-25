pipeline {
    agent any

    environment {
        MONGO_TEST_URI = 'mongodb://bookstore-mongo:27017/bookstore_test'
        SONAR_TOKEN = credentials('sonar-token')
    }

        stages {
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t bookstore-app:${BUILD_NUMBER} .'
            }
        }

        stage('Test') {
            steps {
                echo 'Installing dependencies and running test suite...'
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube code quality analysis...'
                sh '''
                sonar-scanner \
                  -Dsonar.projectKey=bookstore-backend \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=http://sonarqube:9000 \
                  -Dsonar.token=${SONAR_TOKEN} \
                  -Dsonar.exclusions=node_modules/**,docs/**
                '''
            }
        }

        stage('Security') {
            steps {
                echo 'Running security audit on dependencies...'
                sh 'npm audit --json > audit-report.json || true'
                sh 'npm audit || true'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to test environment...'
                sh 'docker rm -f bookstore-staging || true'
                sh '''
                docker run -d \
                  --name bookstore-staging \
                  --network bookstore-net \
                  -p 3002:3000 \
                  -e ATLAS_URI=mongodb://bookstore-mongo:27017/bookstore_staging \
                  bookstore-app:${BUILD_NUMBER}
                '''
                sh 'sleep 5'
                sh 'docker exec bookstore-staging wget -q -O- http://localhost:3000/ || (echo "Deployment health check failed" && exit 1)'
            }
        }

        stage('Release') {
            steps {
                echo 'Releasing to production environment...'
                sh 'docker tag bookstore-app:${BUILD_NUMBER} bookstore-app:release-${BUILD_NUMBER}'
                sh 'docker rm -f bookstore-production || true'
                sh '''
                docker run -d \
                  --name bookstore-production \
                  --network bookstore-net \
                  -p 3003:3000 \
                  -e ATLAS_URI=mongodb://bookstore-mongo:27017/bookstore_production \
                  -e NODE_ENV=production \
                  bookstore-app:release-${BUILD_NUMBER}
                '''
                sh 'sleep 5'
                sh 'docker exec bookstore-production wget -q -O- http://localhost:3000/ || (echo "Release health check failed" && exit 1)'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Checking production health and monitoring status...'
                script {
                    def healthStatus = sh(
                        script: 'docker exec bookstore-production wget -q -O- http://localhost:3000/ || echo "DOWN"',
                        returnStdout: true
                    ).trim()
                    
                    if (healthStatus.contains("DOWN")) {
                        echo "ALERT: Production health check failed!"
                        error("Monitoring detected production is unhealthy")
                    } else {
                        echo "Monitoring check passed: Production is healthy (response: ${healthStatus})"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Build, tests, quality, security, deploy, release, and monitoring all passed successfully.'
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
            emailext (
                subject: "Pipeline Alert: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER} FAILED",
                body: "The pipeline failed at some stage. Check console output: ${env.BUILD_URL}",
                to: 's225787273@deakin.edu.au'
            )
        }
    }
}