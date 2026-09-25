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
                sh 'curl -f http://localhost:3002/ || (echo "Deployment health check failed" && exit 1)'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Build, tests, and code quality checks passed successfully.'
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}